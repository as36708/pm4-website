/** Cloudflare Worker entry point for the PM4 public website. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";

interface Env {
  ASSETS: Fetcher;
  PM4_ADMIN_INGEST_URL?: string;
  PM4_ADMIN_INGEST_SECRET?: string;
  PM4_ADMIN_SITES_BYPASS_TOKEN?: string;
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

const supportedExchanges = new Set(["Bybit", "Bitget", "BingX", "Gate"]);
const maximumRequestBytes = 2_048;
const maximumEventBytes = 1_024;
const expectedAdminOrigin = "https://pm4-rebate-admin.chexin1103.chatgpt.site";

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
  return Boolean(origin && origin === new URL(request.url).origin);
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
      body: JSON.stringify({ action: "track", eventType, exchange }),
    });
    const payload = await response.json().catch(() => null) as { tracked?: boolean } | null;
    if (!response.ok || !payload?.tracked) {
      return jsonResponse({ code: "FRONTEND_STATS_FAILED", error: "网站统计暂时不可用" }, 503);
    }
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
  } | null;
  if (!body) return jsonResponse({ error: "请求数据格式无效" }, 400);

  const exchange = typeof body.exchange === "string" ? body.exchange.trim() : "";
  const uid = typeof body.uid === "string" ? body.uid.trim() : "";
  const tradingViewUser = typeof body.tradingViewUser === "string"
    ? body.tradingViewUser.trim().replace(/^@/, "")
    : "";

  if (!supportedExchanges.has(exchange)) return jsonResponse({ error: "请选择有效交易所" }, 400);
  if (!/^\d{4,32}$/.test(uid)) return jsonResponse({ error: "UID 格式无效" }, 400);
  if (!/^[A-Za-z0-9_.-]{2,64}$/.test(tradingViewUser)) {
    return jsonResponse({ error: "TradingView 用户名格式无效" }, 400);
  }

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

  try {
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
        sourceKey,
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
      return handleIndicatorApplication(request, env);
    }

    if (url.pathname === "/api/frontend-events") {
      return handleFrontendEvent(request, env);
    }

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
    }

    return handler.fetch(request, env, ctx);
  },
};

export default worker;
