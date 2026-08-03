const allowedExchanges = new Set(["Bybit", "Bitget", "BingX", "OKX"]);
const allowedEvents = new Set(["visit", "exchange_click", "transfer_click"]);

function json(response, status, body) {
  response.status(status);
  response.setHeader("content-type", "application/json; charset=utf-8");
  response.setHeader("cache-control", "no-store");
  response.setHeader("x-content-type-options", "nosniff");
  response.end(JSON.stringify(body));
}

function requestBody(request) {
  if (request.body && typeof request.body === "object") return Promise.resolve(request.body);
  return new Promise((resolve, reject) => {
    let raw = "";
    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 16_384) reject(new Error("Request is too large"));
    });
    request.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
    request.on("error", reject);
  });
}

export default async function handler(request, response) {
  if (request.method !== "POST") return json(response, 405, { error: "Method not allowed" });
  const configuredOrigin = process.env.PM4_PUBLIC_ORIGIN || "https://pm4-website.vercel.app";
  const origin = request.headers.origin || "";
  const currentDeploymentOrigin = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "";
  if (origin && origin !== configuredOrigin && origin !== currentDeploymentOrigin) {
    return json(response, 403, { error: "Origin not allowed" });
  }

  const adminUrl = process.env.PM4_ADMIN_INGEST_URL;
  const ingestSecret = process.env.PM4_FRONTEND_INGEST_SECRET;
  const sitesBypassToken = process.env.PM4_ADMIN_SITES_BYPASS_TOKEN;
  if (!adminUrl || !ingestSecret || !sitesBypassToken) {
    return json(response, 503, { error: "前台提交服务尚未配置" });
  }

  try {
    const body = await requestBody(request);
    const pathname = new URL(request.url, configuredOrigin).pathname;
    let payload;
    if (pathname.endsWith("/track")) {
      const eventType = typeof body.eventType === "string" ? body.eventType.trim() : "";
      const exchange = typeof body.exchange === "string" ? body.exchange.trim() : "";
      if (!allowedEvents.has(eventType)) return json(response, 400, { error: "Invalid event type" });
      if (exchange && !allowedExchanges.has(exchange)) return json(response, 400, { error: "Invalid exchange" });
      payload = { action: "track", eventType, exchange };
    } else {
      const exchange = typeof body.exchange === "string" ? body.exchange.trim() : "";
      const uid = typeof body.uid === "string" ? body.uid.trim() : "";
      const tradingViewUser = typeof body.tradingViewUser === "string"
        ? body.tradingViewUser.trim().replace(/^@/, "")
        : "";
      if (!allowedExchanges.has(exchange)) return json(response, 400, { error: "请选择有效交易所" });
      if (!/^[A-Za-z0-9_-]{4,32}$/.test(uid)) return json(response, 400, { error: "UID 格式无效" });
      if (!/^[A-Za-z0-9_.-]{2,64}$/.test(tradingViewUser)) {
        return json(response, 400, { error: "TradingView 用户名格式无效" });
      }
      payload = { action: "application", exchange, uid, tradingViewUser };
    }

    const upstream = await fetch(adminUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${ingestSecret}`,
        "OAI-Sites-Authorization": `Bearer ${sitesBypassToken}`,
      },
      body: JSON.stringify(payload),
    });
    const result = await upstream.json().catch(() => ({ error: "后台返回了无效响应" }));
    return json(response, upstream.status, result);
  } catch (error) {
    return json(response, 500, { error: error instanceof Error ? error.message : "提交失败" });
  }
}
