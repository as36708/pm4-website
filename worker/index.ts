/** Cloudflare Worker entry point for the PM4 public website. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";

interface Env {
  ASSETS: Fetcher;
  PM4_ADMIN_INGEST_URL?: string;
  PM4_ADMIN_INGEST_SECRET?: string;
  PM4_ADMIN_SITES_BYPASS_TOKEN?: string;
  APPLICATION_RATE_LIMITER?: {
    limit(options: { key: string }): Promise<{ success: boolean }>;
  };
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

const supportedExchanges = new Set(["Bybit", "Bitget", "BingX", "Gate", "OKX"]);
const maximumRequestBytes = 2_048;
const maximumEventBytes = 1_024;
const expectedAdminOrigin = "https://pm4-rebate-admin.chexin1103.chatgpt.site";
const privacyPolicyVersion = "2026-08-28";
const recentEventKeys = new Map<string, number>();
const maximumRecentEventKeys = 2_000;

function jsonResponse(body: unknown, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
    },
  });
}

function isSameOriginRequest(request: Request) {
  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");
  return Boolean(
    origin &&
    origin === new URL(request.url).origin &&
    (!fetchSite || fetchSite === "same-origin"),
  );
}

function configuredAdminUrl(value: string | undefined) {
  const raw = value?.trim() ?? "";
  if (!raw) return null;
  try {
    const url = new URL(raw);
    const isExpectedEndpoint = url.origin === expectedAdminOrigin &&
      url.pathname === "/api/frontend-ingest" &&
      !url.username &&
      !url.password &&
      !url.search &&
      !url.hash;
    return isExpectedEndpoint ? url.toString() : null;
  } catch {
    return null;
  }
}

async function anonymousSourceKey(request: Request, secret: string) {
  const forwardedAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
  const clientAddress = request.headers.get("cf-connecting-ip")?.trim() || forwardedAddress;
  if (!clientAddress || clientAddress.length > 128) return null;
  const day = new Date().toISOString().slice(0, 10);
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`${secret}:${day}:${clientAddress}`),
  );
  return Array.from(new Uint8Array(digest).slice(0, 16))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

async function anonymousEventKey(sourceKey: string, eventType: string, exchange: string) {
  const now = new Date();
  const bucket = eventType === "visit"
    ? now.toISOString().slice(0, 10)
    : now.toISOString().slice(0, 16);
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`${sourceKey}:${eventType}:${exchange}:${bucket}`),
  );
  return Array.from(new Uint8Array(digest).slice(0, 24))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

function wasRecentlySeen(eventKey: string) {
  const now = Date.now();
  const previous = recentEventKeys.get(eventKey);
  return Boolean(previous && now - previous < 65_000);
}

function rememberEvent(eventKey: string) {
  const now = Date.now();
  if (recentEventKeys.size >= maximumRecentEventKeys) {
    for (const [key, timestamp] of recentEventKeys) {
      if (now - timestamp > 120_000 || recentEventKeys.size >= maximumRecentEventKeys) recentEventKeys.delete(key);
      if (recentEventKeys.size < maximumRecentEventKeys) break;
    }
  }
  recentEventKeys.set(eventKey, now);
}

function withSecurityHeaders(response: Response, request: Request) {
  const headers = new Headers(response.headers);
  const isHttps = new URL(request.url).protocol === "https:";
  const directives = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "media-src 'self'",
    "connect-src 'self'",
    isHttps ? "upgrade-insecure-requests" : "",
  ].filter(Boolean).join("; ");

  // Preserve stricter response-specific policies (for example the image
  // optimizer's `script-src 'none'; sandbox`) instead of weakening them.
  if (!headers.has("content-security-policy")) headers.set("content-security-policy", directives);
  headers.set("cross-origin-opener-policy", "same-origin");
  headers.set("permissions-policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=()");
  headers.set("referrer-policy", "strict-origin-when-cross-origin");
  headers.set("x-content-type-options", "nosniff");
  headers.set("x-frame-options", "DENY");
  if (isHttps) headers.set("strict-transport-security", "max-age=31536000");
  if (headers.get("content-type")?.toLowerCase().includes("text/html")) {
    headers.set("cache-control", "public, max-age=0, s-maxage=300, stale-while-revalidate=86400");
  }
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

async function handleFrontendEvent(request: Request, env: Env) {
  if (request.method !== "POST") return jsonResponse({ error: "只支持 POST 请求" }, 405);
  if (!isSameOriginRequest(request)) return jsonResponse({ error: "请求来源无效" }, 403);
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return jsonResponse({ error: "请求格式无效" }, 415);
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > maximumEventBytes) {
    return jsonResponse({ error: "统计内容过大" }, 413);
  }
  const requestText = await request.text();
  if (new TextEncoder().encode(requestText).byteLength > maximumEventBytes) {
    return jsonResponse({ error: "统计内容过大" }, 413);
  }
  const body = (() => {
    try {
      return JSON.parse(requestText);
    } catch {
      return null;
    }
  })() as { eventType?: unknown; exchange?: unknown } | null;
  if (!body) return jsonResponse({ error: "请求数据格式无效" }, 400);

  const eventType = typeof body.eventType === "string" ? body.eventType.trim() : "";
  const exchange = typeof body.exchange === "string" ? body.exchange.trim() : "";
  if (!new Set(["visit", "exchange_click", "transfer_click"]).has(eventType)) {
    return jsonResponse({ error: "统计事件无效" }, 400);
  }
  if (eventType === "visit" && exchange) return jsonResponse({ error: "访问统计不应包含交易所" }, 400);
  if (eventType !== "visit" && !supportedExchanges.has(exchange)) {
    return jsonResponse({ error: "交易所无效" }, 400);
  }

  const adminUrl = configuredAdminUrl(env.PM4_ADMIN_INGEST_URL);
  const ingestSecret = env.PM4_ADMIN_INGEST_SECRET?.trim() ?? "";
  const sitesBypassToken = env.PM4_ADMIN_SITES_BYPASS_TOKEN?.trim() ?? "";
  if (!adminUrl || !ingestSecret || !sitesBypassToken) {
    return jsonResponse({ code: "FRONTEND_STATS_NOT_CONFIGURED", error: "网站统计正在配置" }, 503);
  }

  const sourceKey = await anonymousSourceKey(request, ingestSecret);
  if (!sourceKey) return jsonResponse({ code: "FRONTEND_SOURCE_UNAVAILABLE", error: "暂时无法确认访问来源" }, 503);
  const eventKey = await anonymousEventKey(sourceKey, eventType, exchange);
  if (wasRecentlySeen(eventKey)) return jsonResponse({ tracked: true, duplicate: true });

  try {
    const response = await fetch(adminUrl, {
      method: "POST",
      cache: "no-store",
      signal: AbortSignal.timeout(5_000),
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ingestSecret}`,
        "content-type": "application/json",
        "OAI-Sites-Authorization": `Bearer ${sitesBypassToken}`,
      },
      body: JSON.stringify({ action: "track", eventType, exchange, sourceKey, eventKey }),
    });
    const payload = await response.json().catch(() => null) as { tracked?: boolean } | null;
    if (!response.ok || !payload?.tracked) {
      return jsonResponse({ code: "FRONTEND_STATS_FAILED", error: "网站统计暂时不可用" }, 503);
    }
    rememberEvent(eventKey);
    return jsonResponse({ tracked: true });
  } catch {
    return jsonResponse({ code: "FRONTEND_STATS_FAILED", error: "网站统计暂时不可用" }, 503);
  }
}

async function handleIndicatorApplication(request: Request, env: Env) {
  if (request.method !== "POST") return jsonResponse({ error: "只支持 POST 请求" }, 405);
  if (!isSameOriginRequest(request)) return jsonResponse({ error: "请求来源无效" }, 403);
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return jsonResponse({ error: "请求格式无效" }, 415);
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > maximumRequestBytes) {
    return jsonResponse({ error: "提交内容过大" }, 413);
  }

  const requestText = await request.text();
  if (new TextEncoder().encode(requestText).byteLength > maximumRequestBytes) {
    return jsonResponse({ error: "提交内容过大" }, 413);
  }
  const body = (() => {
    try {
      return JSON.parse(requestText);
    } catch {
      return null;
    }
  })() as {
    exchange?: unknown;
    uid?: unknown;
    tradingViewUser?: unknown;
    discordUser?: unknown;
    acceptedPrivacy?: unknown;
    website?: unknown;
  } | null;
  if (!body) return jsonResponse({ error: "请求数据格式无效" }, 400);

  const exchange = typeof body.exchange === "string" ? body.exchange.trim() : "";
  const uid = typeof body.uid === "string" ? body.uid.trim() : "";
  const tradingViewUser = typeof body.tradingViewUser === "string"
    ? body.tradingViewUser.trim().replace(/^@/, "")
    : "";
  const discordUser = typeof body.discordUser === "string" ? body.discordUser.trim() : "";
  const acceptedPrivacy = body.acceptedPrivacy === true;
  const website = typeof body.website === "string" ? body.website.trim() : "";

  if (website) {
    return jsonResponse({ submitted: true, duplicate: true, submittedAt: new Date().toISOString() });
  }

  if (!supportedExchanges.has(exchange)) return jsonResponse({ error: "请选择有效交易所" }, 400);
  if (!/^\d{4,32}$/.test(uid)) return jsonResponse({ error: "UID 格式无效" }, 400);
  if (!/^[A-Za-z0-9_.-]{2,64}$/.test(tradingViewUser)) {
    return jsonResponse({ error: "TradingView 用户名格式无效" }, 400);
  }
  if (!discordUser) return jsonResponse({ error: "请输入 Discord 用户名" }, 400);
  if (discordUser.length > 64 || /[\u0000-\u001f\u007f]/.test(discordUser)) {
    return jsonResponse({ error: "Discord 用户名格式无效" }, 400);
  }
  if (!acceptedPrivacy) return jsonResponse({ error: "请先同意隐私政策与服务条款" }, 400);

  const adminUrl = configuredAdminUrl(env.PM4_ADMIN_INGEST_URL);
  const ingestSecret = env.PM4_ADMIN_INGEST_SECRET?.trim() ?? "";
  const sitesBypassToken = env.PM4_ADMIN_SITES_BYPASS_TOKEN?.trim() ?? "";
  if (!adminUrl || !ingestSecret || !sitesBypassToken) {
    return jsonResponse({
      code: "APPLICATION_SYNC_NOT_CONFIGURED",
      error: "网站资料提交正在配置，请先使用 Discord 审核频道提交",
    }, 503);
  }
  const sourceKey = await anonymousSourceKey(request, ingestSecret);
  if (!sourceKey) {
    return jsonResponse({
      code: "APPLICATION_SOURCE_UNAVAILABLE",
      error: "暂时无法确认提交来源，请稍后重试或使用 Discord 审核频道提交",
    }, 503);
  }

  const applicationRateLimiter = env.APPLICATION_RATE_LIMITER;
  if (!applicationRateLimiter) {
    return jsonResponse({
      code: "APPLICATION_RATE_LIMIT_NOT_CONFIGURED",
      error: "网站资料提交限流正在配置，请稍后重试或使用 Discord 审核频道提交",
    }, 503);
  }
  try {
    const { success } = await applicationRateLimiter.limit({ key: sourceKey });
    if (!success) {
      return jsonResponse({
        code: "RATE_LIMITED",
        error: "提交次数过多，请稍后再试或到 Discord 审核频道联系管理员",
      }, 429);
    }
  } catch {
    return jsonResponse({
      code: "APPLICATION_RATE_LIMIT_UNAVAILABLE",
      error: "网站资料提交限流暂时不可用，请稍后重试或使用 Discord 审核频道提交",
    }, 503);
  }

  try {
    const consentedAt = new Date().toISOString();
    const response = await fetch(adminUrl, {
      method: "POST",
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ingestSecret}`,
        "content-type": "application/json",
        "OAI-Sites-Authorization": `Bearer ${sitesBypassToken}`,
      },
      body: JSON.stringify({
        action: "application",
        exchange,
        uid,
        tradingViewUser,
        discordUser,
        sourceKey,
        consentAccepted: true,
        consentedAt,
        policyVersion: privacyPolicyVersion,
      }),
    });
    const payload = await response.json().catch(() => null) as {
      submitted?: boolean;
      duplicate?: boolean;
      submittedAt?: string;
      code?: string;
    } | null;

    if (response.status === 409) {
      return jsonResponse({
        code: payload?.code ?? "APPLICATION_CONFLICT",
        error: "该 UID 已有不同资料，请到 Discord 审核频道联系管理员核对",
      }, 409);
    }
    if (response.status === 429) {
      return jsonResponse({
        code: "RATE_LIMITED",
        error: "提交次数过多，请稍后再试或到 Discord 审核频道联系管理员",
      }, 429);
    }
    if (!response.ok || !payload?.submitted) {
      return jsonResponse({
        code: "APPLICATION_SYNC_FAILED",
        error: "资料暂时未进入后台，请稍后重试或使用 Discord 审核频道提交",
      }, 503);
    }

    return jsonResponse({
      submitted: true,
      duplicate: Boolean(payload.duplicate),
      uid,
      submittedAt: payload.submittedAt ?? new Date().toISOString(),
    });
  } catch {
    return jsonResponse({
      code: "APPLICATION_SYNC_FAILED",
      error: "资料暂时未进入后台，请稍后重试或使用 Discord 审核频道提交",
    }, 503);
  }
}

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/indicator-applications") {
      return withSecurityHeaders(await handleIndicatorApplication(request, env), request);
    }

    if (url.pathname === "/api/frontend-events") {
      return withSecurityHeaders(await handleFrontendEvent(request, env), request);
    }

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      const optimized = await handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
      return withSecurityHeaders(optimized, request);
    }

    return withSecurityHeaders(await handler.fetch(request, env, ctx), request);
  },
};

export default worker;
