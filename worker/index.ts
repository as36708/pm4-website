/** Cloudflare Worker entry point for the PM4 public site. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";

interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  PM4_ADMIN_SYNC_SECRET?: string;
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

const supportedExchanges = new Set(["Bybit", "Bitget", "BingX", "OKX"]);
const supportedEvents = new Set(["visit", "exchange_click", "transfer_click", "application_submit"]);
const adminDashboardOrigin = "https://pm4-admin-console-v2.chexin1103.chatgpt.site";
let schemaReady: Promise<void> | null = null;

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
  return !origin || origin === new URL(request.url).origin;
}

function dashboardStatsResponse(body: unknown, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      "access-control-allow-credentials": "true",
      "access-control-allow-origin": adminDashboardOrigin,
      "cache-control": "no-store",
      "vary": "origin",
      "x-content-type-options": "nosniff",
    },
  });
}

function dayString(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function startDay(days: number) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - Math.max(0, days - 1));
  return dayString(date);
}

async function ensureSchema(db: D1Database) {
  if (!schemaReady) {
    schemaReady = db.batch([
      db.prepare(`
        CREATE TABLE IF NOT EXISTS front_applications (
          id TEXT PRIMARY KEY NOT NULL,
          exchange TEXT NOT NULL,
          uid TEXT NOT NULL,
          tradingview_username TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          submitted_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        )
      `),
      db.prepare(`
        CREATE INDEX IF NOT EXISTS front_applications_updated_idx
        ON front_applications(updated_at DESC)
      `),
      db.prepare(`
        CREATE TABLE IF NOT EXISTS front_daily_metrics (
          day TEXT NOT NULL,
          event_type TEXT NOT NULL,
          exchange TEXT NOT NULL DEFAULT '',
          event_count INTEGER NOT NULL DEFAULT 0,
          PRIMARY KEY (day, event_type, exchange)
        )
      `),
    ]).then(() => undefined).catch((error) => {
      schemaReady = null;
      throw error;
    });
  }
  return schemaReady;
}

async function incrementMetric(db: D1Database, eventType: string, exchange = "") {
  await db.prepare(`
    INSERT INTO front_daily_metrics (day, event_type, exchange, event_count)
    VALUES (?, ?, ?, 1)
    ON CONFLICT(day, event_type, exchange)
    DO UPDATE SET event_count = event_count + 1
  `).bind(dayString(), eventType, exchange).run();
}

async function handleTrack(request: Request, env: Env) {
  if (request.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);
  if (!isSameOriginRequest(request)) return jsonResponse({ error: "Origin not allowed" }, 403);

  const body = await request.json().catch(() => null) as { eventType?: string; exchange?: string } | null;
  const eventType = body?.eventType?.trim() ?? "";
  const exchange = body?.exchange?.trim() ?? "";
  if (!supportedEvents.has(eventType)) return jsonResponse({ error: "Invalid event type" }, 400);
  if (exchange && !supportedExchanges.has(exchange)) return jsonResponse({ error: "Invalid exchange" }, 400);

  await ensureSchema(env.DB);
  await incrementMetric(env.DB, eventType, exchange);
  return jsonResponse({ tracked: true });
}

async function handleApplication(request: Request, env: Env) {
  if (request.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);
  if (!isSameOriginRequest(request)) return jsonResponse({ error: "Origin not allowed" }, 403);

  const body = await request.json().catch(() => null) as {
    exchange?: string;
    uid?: string;
    tradingViewUser?: string;
  } | null;
  const exchange = body?.exchange?.trim() ?? "";
  const uid = body?.uid?.trim() ?? "";
  const tradingViewUser = body?.tradingViewUser?.trim().replace(/^@/, "") ?? "";
  if (!supportedExchanges.has(exchange)) return jsonResponse({ error: "请选择有效交易所" }, 400);
  if (!/^[A-Za-z0-9_-]{4,32}$/.test(uid)) return jsonResponse({ error: "UID 格式无效" }, 400);
  if (!/^[A-Za-z0-9_.-]{2,64}$/.test(tradingViewUser)) {
    return jsonResponse({ error: "TradingView 用户名格式无效" }, 400);
  }

  await ensureSchema(env.DB);
  const now = new Date().toISOString();
  const id = `${exchange.toLowerCase()}:${uid}`;
  await env.DB.batch([
    env.DB.prepare(`
      INSERT INTO front_applications (
        id, exchange, uid, tradingview_username, status, submitted_at, updated_at
      ) VALUES (?, ?, ?, ?, 'pending', ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        tradingview_username = excluded.tradingview_username,
        status = 'pending',
        updated_at = excluded.updated_at
    `).bind(id, exchange, uid, tradingViewUser, now, now),
    env.DB.prepare(`
      INSERT INTO front_daily_metrics (day, event_type, exchange, event_count)
      VALUES (?, 'application_submit', ?, 1)
      ON CONFLICT(day, event_type, exchange)
      DO UPDATE SET event_count = event_count + 1
    `).bind(dayString(), exchange),
  ]);

  return jsonResponse({ submitted: true, id, submittedAt: now });
}

async function handleAdminData(request: Request, env: Env) {
  if (request.method !== "GET") return jsonResponse({ error: "Method not allowed" }, 405);
  const expected = env.PM4_ADMIN_SYNC_SECRET?.trim() ?? "";
  const provided = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim() ?? "";
  if (!expected || provided !== expected) return jsonResponse({ error: "Unauthorized" }, 401);

  await ensureSchema(env.DB);
  const url = new URL(request.url);
  const requestedDays = Number(url.searchParams.get("days") ?? 7);
  const days = [7, 30, 90].includes(requestedDays) ? requestedDays : 7;
  const [applicationsResult, metricsResult] = await Promise.all([
    env.DB.prepare(`
      SELECT id, exchange, uid, tradingview_username, status, submitted_at, updated_at
      FROM front_applications
      ORDER BY updated_at DESC
      LIMIT 2000
    `).all<{
      id: string;
      exchange: string;
      uid: string;
      tradingview_username: string;
      status: string;
      submitted_at: string;
      updated_at: string;
    }>(),
    env.DB.prepare(`
      SELECT event_type, exchange, SUM(event_count) AS total
      FROM front_daily_metrics
      WHERE day >= ?
      GROUP BY event_type, exchange
    `).bind(startDay(days)).all<{ event_type: string; exchange: string; total: number }>(),
  ]);

  const totals = { visits: 0, exchangeClicks: 0, transferClicks: 0, submissions: 0 };
  const byExchange: Record<string, { clicks: number; transfers: number; submissions: number }> = {};
  for (const row of metricsResult.results ?? []) {
    const count = Number(row.total) || 0;
    if (row.event_type === "visit") totals.visits += count;
    if (row.event_type === "exchange_click") totals.exchangeClicks += count;
    if (row.event_type === "transfer_click") totals.transferClicks += count;
    if (row.event_type === "application_submit") totals.submissions += count;
    if (row.exchange) {
      byExchange[row.exchange] ??= { clicks: 0, transfers: 0, submissions: 0 };
      if (row.event_type === "exchange_click") byExchange[row.exchange].clicks += count;
      if (row.event_type === "transfer_click") byExchange[row.exchange].transfers += count;
      if (row.event_type === "application_submit") byExchange[row.exchange].submissions += count;
    }
  }

  return jsonResponse({
    applications: (applicationsResult.results ?? []).map((row) => ({
      id: row.id,
      exchange: row.exchange,
      uid: row.uid,
      tradingViewUser: row.tradingview_username,
      status: row.status,
      submittedAt: row.submitted_at,
      updatedAt: row.updated_at,
    })),
    metrics: {
      days,
      ...totals,
      conversionRate: totals.visits ? Number(((totals.submissions / totals.visits) * 100).toFixed(1)) : 0,
      byExchange,
    },
  });
}

async function handleDashboardStats(request: Request, env: Env) {
  if (request.method !== "GET") return dashboardStatsResponse({ error: "Method not allowed" }, 405);
  if (request.headers.get("origin") !== adminDashboardOrigin) {
    return dashboardStatsResponse({ error: "Origin not allowed" }, 403);
  }
  if (!request.headers.get("oai-authenticated-user-id") || !request.headers.get("oai-authenticated-user-email")) {
    return dashboardStatsResponse({ error: "Unauthorized" }, 401);
  }

  await ensureSchema(env.DB);
  const requestedDays = Number(new URL(request.url).searchParams.get("days") ?? 7);
  const days = [7, 30, 90].includes(requestedDays) ? requestedDays : 7;
  const metricsResult = await env.DB.prepare(`
    SELECT event_type, exchange, SUM(event_count) AS total
    FROM front_daily_metrics
    WHERE day >= ?
    GROUP BY event_type, exchange
  `).bind(startDay(days)).all<{ event_type: string; exchange: string; total: number }>();
  const totals = { visits: 0, exchangeClicks: 0, transferClicks: 0, submissions: 0 };
  const byExchange: Record<string, { clicks: number; transfers: number; submissions: number }> = {};
  for (const row of metricsResult.results ?? []) {
    const count = Number(row.total) || 0;
    if (row.event_type === "visit") totals.visits += count;
    if (row.event_type === "exchange_click") totals.exchangeClicks += count;
    if (row.event_type === "transfer_click") totals.transferClicks += count;
    if (row.event_type === "application_submit") totals.submissions += count;
    if (row.exchange) {
      byExchange[row.exchange] ??= { clicks: 0, transfers: 0, submissions: 0 };
      if (row.event_type === "exchange_click") byExchange[row.exchange].clicks += count;
      if (row.event_type === "transfer_click") byExchange[row.exchange].transfers += count;
      if (row.event_type === "application_submit") byExchange[row.exchange].submissions += count;
    }
  }

  return dashboardStatsResponse({
    metrics: {
      days,
      ...totals,
      conversionRate: totals.visits ? Number(((totals.submissions / totals.visits) * 100).toFixed(1)) : 0,
      byExchange,
    },
  });
}

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    try {
      if (url.pathname === "/api/track") return await handleTrack(request, env);
      if (url.pathname === "/api/applications") return await handleApplication(request, env);
      if (url.pathname === "/api/dashboard-stats") return await handleDashboardStats(request, env);
      if (url.pathname === "/api/admin-data") return await handleAdminData(request, env);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Request failed";
      return jsonResponse({ error: message }, 500);
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
