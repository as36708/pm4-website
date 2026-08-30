import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render(pathname = "/", env = {}, requestInit = {}) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      ...requestInit,
      headers: { accept: "text/html", ...requestInit.headers },
    }),
    {
      ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
      ...env,
    },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the complete PM4 landing page", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<html lang="zh-CN"/i);
  assert.match(html, /交易所返佣与 TradingView 指标/);
  assert.match(html, /一次注册，返佣指标/);
  assert.match(html, /选交易所注册/);
  assert.match(html, /已注册？去 Discord 绑定/);
  assert.match(html, /注册 → 绑定 → 自动开通/);
  assert.match(html, /选择您的交易所/);
  assert.match(html, /三档会员，交易量说话/);
  assert.match(html, /近一年交易量 50 万 USDT/);
  assert.match(html, /付费 4999 U/);
  assert.match(html, /常见问题/);
  assert.match(html, /提交表单人工处理/);
  assert.match(html, /market-panel\.mp4/);
  assert.match(html, /market-panel-poster\.jpg/);
  assert.match(html, /\/logos\/bybit\.svg/);
  assert.match(html, /\/logos\/okx\.svg/);
  assert.match(html, /\/logos\/gate\.svg/);
  assert.match(html, /\/logos\/bitget\.svg/);
  assert.match(html, /\bBybit\b[\s\S]*?\bOKX\b[\s\S]*?\bGate\b[\s\S]*?\bBitget\b/i);
  assert.doesNotMatch(html, /\bBingX\b/);
  assert.match(html, /Maker[\s\S]{0,40}0\.02%/);
  assert.match(html, /Taker[\s\S]{0,40}0\.055%/);
  assert.match(html, /id="main-content"/);
  assert.match(html, /跳到主要内容/);
  assert.match(html, /application\/ld\+json/);
  assert.equal(response.headers.get("x-frame-options"), "DENY");
  assert.match(response.headers.get("content-security-policy") ?? "", /frame-ancestors 'none'/);
});

test("server-renders the Discord review destination", async () => {
  const response = await render("/review");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /绑定交易所账号/);
  assert.match(html, /加入 Discord，现在绑定/);
  assert.match(html, /四步完成自动绑定/);
  assert.match(html, /三档会员权益/);
  assert.match(html, /永远不会索取密码、验证码、API 密钥、私钥、助记词/);
  assert.match(html, /https:\/\/discord\.gg\/vAASV36A9p/);
  assert.doesNotMatch(html, /<form\b/i);
});

test("server-renders all transfer routes and the manual fallback form", async () => {
  const [bybit, okx, gate, bitget, manual] = await Promise.all([
    render("/transfer/bybit"),
    render("/transfer/okx"),
    render("/transfer/gate"),
    render("/transfer/bitget"),
    render("/review/manual"),
  ]);
  for (const response of [bybit, okx, gate, bitget, manual]) assert.equal(response.status, 200);
  assert.match(await bybit.text(), /Bybit[^<]*<b>推荐人变更指南/);
  assert.match(await okx.text(), /OKX[^<]*<b>推荐人变更指南/);
  assert.match(await gate.text(), /联系 PM4 客服/);
  assert.match(await bitget.text(), /联系 PM4 客服/);
  const manualHtml = await manual.text();
  assert.match(manualHtml, /提交交易所 UID/);
  assert.match(manualHtml, /<form\b/i);
});

test("keeps the responsive redesign and production assets intact", async () => {
  const [home, review, analytics, css, layout, packageJson, links, transfer, sitemap] = await Promise.all([
    readFile(new URL("../app/components/HomeLanding.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/ReviewSection.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/FrontendAnalytics.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/home.module.css", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../app/links.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/transfer/TransferExperience.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/sitemap.ts", import.meta.url), "utf8"),
  ]);

  assert.match(home, /一次注册，返佣指标/);
  assert.match(home, /选交易所注册/);
  assert.match(home, /已注册？去 Discord 绑定/);
  assert.match(home, /id="exchanges"/);
  assert.match(home, /id="membership"/);
  assert.match(home, /id="faq"/);
  assert.match(home, /data-pm4-event="exchange_click"/);
  assert.match(home, /data-pm4-event="transfer_click"/);
  assert.match(home, /\/transfer\/\$\{selectedExchange\.id\}/);
  assert.match(home, /解锁 Gate VIP10 体验卡/);
  assert.match(home, /普通用户[\s\S]{0,200}0\.02% \/ 0\.05%/);
  assert.match(home, /VIP10 体验[\s\S]{0,200}0\.01% \/ 0\.03%/);
  assert.match(home, /近一年交易量 50 万 USDT/);
  assert.match(home, /付费 4999 U/);
  assert.match(home, /\/review\/manual/);
  assert.match(home, /https:\/\/t\.me\/tianshijin10|EXTERNAL_LINKS\.telegramContact/);
  assert.doesNotMatch(home, /BingX/);

  assert.match(transfer, /PPMM44/);
  assert.match(transfer, /前往 Discord 开工单/);
  assert.match(transfer, /Bybit <b>推荐人变更指南/);
  assert.match(transfer, /180 天内不能再转/);
  assert.match(transfer, /旧号发起身份转移/);
  assert.match(transfer, /\/guide\/bybit-step-02\.png/);
  assert.match(transfer, /\/guide\/bybit-step-03\.png/);
  assert.match(transfer, /\/guide\/bybit-step-04\.png/);
  assert.match(transfer, /\/guide\/bybit-step-05\.png/);
  assert.match(transfer, /\/guide\/okx-step-02\.png/);
  assert.match(transfer, /\/guide\/okx-step-04\.png/);
  assert.match(transfer, /I would like to change my referrer to PPMM44 to receive trading fee rebates\./);
  assert.match(transfer, /公开推荐人变更指南尚未配置/);
  assert.match(transfer, /永远不会索取密码、验证码、API 密钥、私钥或助记词/);

  assert.match(review, /fetch\("\/api\/indicator-applications"/);
  assert.match(review, /acceptedPrivacy/);
  assert.match(review, /Discord 用户名 <b>\*<\/b>/);
  assert.doesNotMatch(review, /PM4_ADMIN_INGEST_SECRET|PM4_ADMIN_SITES_BYPASS_TOKEN/);
  assert.match(analytics, /fetch\("\/api\/frontend-events"/);
  assert.match(analytics, /window\.localStorage/);

  assert.match(css, /overflow-x:\s*clip/);
  assert.match(css, /grid-template-columns:\s*repeat\(4/);
  assert.match(css, /@media \(max-width:\s*980px\)/);
  assert.match(css, /@media \(max-width:\s*760px\)/);
  assert.match(css, /@media \(max-width:\s*540px\)/);
  assert.match(css, /position:\s*fixed/);
  assert.match(css, /position:\s*sticky/);

  assert.match(layout, /localFont/);
  assert.match(layout, /geist-latin\.woff2/);
  assert.match(layout, /--font-geist/);
  assert.match(layout, /<html lang="zh-CN" className=\{geist\.variable\}>/);
  assert.match(layout, /<FrontendAnalytics \/>/);
  assert.match(packageJson, /"build": "vinext build"/);
  assert.match(links, /https:\/\/www\.bybit\.com\/zh-TW\/help-center\/article\/How-to-Transfer-Your-Identity-to-Another-Account/);
  assert.match(links, /https:\/\/t\.me\/tianshijin10/);
  assert.match(sitemap, /transfer\/bybit/);
  assert.match(sitemap, /transfer\/okx/);
  assert.match(sitemap, /review\/manual/);

  await Promise.all([
    access(new URL("../public/media/market-panel.mp4", import.meta.url)),
    access(new URL("../public/media/market-panel-poster.jpg", import.meta.url)),
    access(new URL("../public/logos/bybit.svg", import.meta.url)),
    access(new URL("../public/logos/bitget.svg", import.meta.url)),
    access(new URL("../public/logos/okx.svg", import.meta.url)),
    access(new URL("../public/logos/gate.svg", import.meta.url)),
    access(new URL("../public/guide/bybit-step-02.png", import.meta.url)),
    access(new URL("../public/guide/bybit-step-03.png", import.meta.url)),
    access(new URL("../public/guide/bybit-step-04.png", import.meta.url)),
    access(new URL("../public/guide/bybit-step-05.png", import.meta.url)),
    access(new URL("../public/guide/okx-step-02.png", import.meta.url)),
    access(new URL("../public/guide/okx-step-04.png", import.meta.url)),
  ]);
});

test("keeps existing extensionless legal routes, robots, sitemap, and a useful 404 healthy", async () => {
  const [privacy, terms, robots, sitemap, missing] = await Promise.all([
    render("/privacy"),
    render("/terms"),
    render("/robots.txt"),
    render("/sitemap.xml"),
    render("/missing-page"),
  ]);
  assert.equal(privacy.status, 200);
  assert.match(await privacy.text(), /查询、更正与删除/);
  assert.equal(terms.status, 200);
  assert.match(await terms.text(), /交易风险/);
  assert.equal(robots.status, 200);
  assert.match(await robots.text(), /Sitemap: https:\/\/cpm4\.com\/sitemap\.xml/);
  assert.equal(sitemap.status, 200);
  const sitemapXml = await sitemap.text();
  assert.match(sitemapXml, /https:\/\/cpm4\.com\/privacy/);
  assert.doesNotMatch(sitemapXml, /\/privacy\.html|\/terms\.html/);
  assert.equal(missing.status, 404);
  assert.match(await missing.text(), /页面不存在/);
});

test("builds the Cloudflare application rate limit binding", async () => {
  const wranglerConfig = JSON.parse(await readFile(new URL("../dist/server/wrangler.json", import.meta.url), "utf8"));
  assert.deepEqual(wranglerConfig.ratelimits, [
    {
      name: "APPLICATION_RATE_LIMITER",
      namespace_id: "2026082801",
      simple: { limit: 5, period: 60 },
    },
  ]);
});

test("forwards privacy-preserving visit and exchange events", async () => {
  const originalFetch = globalThis.fetch;
  const forwarded = [];
  globalThis.fetch = async (input, init) => {
    forwarded.push({ input: String(input), init });
    return Response.json({ tracked: true });
  };
  const env = {
    PM4_ADMIN_INGEST_URL: "https://pm4-rebate-admin.chexin1103.chatgpt.site/api/frontend-ingest",
    PM4_ADMIN_INGEST_SECRET: "test-ingest-secret",
    PM4_ADMIN_SITES_BYPASS_TOKEN: "test-sites-token",
  };

  try {
    const visit = await render(
      "/api/frontend-events",
      env,
      {
        method: "POST",
        headers: { origin: "http://localhost", "cf-connecting-ip": "203.0.113.4", "content-type": "application/json" },
        body: JSON.stringify({ eventType: "visit", exchange: "" }),
      },
    );
    assert.equal(visit.status, 200);
    assert.deepEqual(await visit.json(), { tracked: true });

    const exchangeClick = await render(
      "/api/frontend-events",
      env,
      {
        method: "POST",
        headers: { origin: "http://localhost", "cf-connecting-ip": "203.0.113.4", "content-type": "application/json" },
        body: JSON.stringify({ eventType: "exchange_click", exchange: "Bybit" }),
      },
    );
    assert.equal(exchangeClick.status, 200);

    assert.equal(forwarded.length, 2);
    const forwardedBodies = forwarded.map(({ init }) => JSON.parse(init.body));
    assert.deepEqual(forwardedBodies.map(({ action, eventType, exchange }) => ({ action, eventType, exchange })), [
      { action: "track", eventType: "visit", exchange: "" },
      { action: "track", eventType: "exchange_click", exchange: "Bybit" },
    ]);
    for (const body of forwardedBodies) {
      assert.match(body.sourceKey, /^[a-f0-9]{32}$/);
      assert.match(body.eventKey, /^[a-f0-9]{48}$/);
    }
    for (const request of forwarded) {
      assert.equal(request.input, "https://pm4-rebate-admin.chexin1103.chatgpt.site/api/frontend-ingest");
      const headers = new Headers(request.init.headers);
      assert.equal(headers.get("authorization"), "Bearer test-ingest-secret");
      assert.equal(headers.get("oai-sites-authorization"), "Bearer test-sites-token");
    }
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("rejects unsafe or unconfigured frontend events", async () => {
  const missingOrigin = await render(
    "/api/frontend-events",
    {},
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ eventType: "visit", exchange: "" }),
    },
  );
  assert.equal(missingOrigin.status, 403);

  const invalidExchange = await render(
    "/api/frontend-events",
    {},
    {
      method: "POST",
      headers: { origin: "http://localhost", "content-type": "application/json" },
      body: JSON.stringify({ eventType: "exchange_click", exchange: "Unknown" }),
    },
  );
  assert.equal(invalidExchange.status, 400);

  const unconfigured = await render(
    "/api/frontend-events",
    {},
    {
      method: "POST",
      headers: { origin: "http://localhost", "content-type": "application/json" },
      body: JSON.stringify({ eventType: "visit", exchange: "" }),
    },
  );
  assert.equal(unconfigured.status, 503);
  assert.equal((await unconfigured.json()).code, "FRONTEND_STATS_NOT_CONFIGURED");
});

test("forwards a rate-limited indicator application with its consent record", async () => {
  const originalFetch = globalThis.fetch;
  let forwarded = null;
  let rateLimitKey = null;
  globalThis.fetch = async (input, init) => {
    forwarded = { input: String(input), init };
    return Response.json({ submitted: true, duplicate: false, submittedAt: "2026-08-10T00:00:00.000Z" });
  };

  try {
    const response = await render(
      "/api/indicator-applications",
      {
        PM4_ADMIN_INGEST_URL: "https://pm4-rebate-admin.chexin1103.chatgpt.site/api/frontend-ingest",
        PM4_ADMIN_INGEST_SECRET: "test-ingest-secret",
        PM4_ADMIN_SITES_BYPASS_TOKEN: "test-sites-token",
        APPLICATION_RATE_LIMITER: {
          limit: async ({ key }) => {
            rateLimitKey = key;
            return { success: true };
          },
        },
      },
      {
        method: "POST",
        headers: {
          origin: "http://localhost",
          "cf-connecting-ip": "203.0.113.7",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          exchange: "Bybit",
          uid: "579533336",
          tradingViewUser: "pm4_test_user",
          discordUser: "pm4-discord",
          acceptedPrivacy: true,
          website: "",
        }),
      },
    );

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      submitted: true,
      duplicate: false,
      uid: "579533336",
      submittedAt: "2026-08-10T00:00:00.000Z",
    });
    assert.equal(forwarded.input, "https://pm4-rebate-admin.chexin1103.chatgpt.site/api/frontend-ingest");
    const forwardedHeaders = new Headers(forwarded.init.headers);
    assert.equal(forwardedHeaders.get("authorization"), "Bearer test-ingest-secret");
    assert.equal(forwardedHeaders.get("oai-sites-authorization"), "Bearer test-sites-token");
    const forwardedBody = JSON.parse(forwarded.init.body);
    assert.deepEqual({
      action: forwardedBody.action,
      exchange: forwardedBody.exchange,
      uid: forwardedBody.uid,
      tradingViewUser: forwardedBody.tradingViewUser,
      discordUser: forwardedBody.discordUser,
      consentAccepted: forwardedBody.consentAccepted,
      policyVersion: forwardedBody.policyVersion,
    }, {
      action: "application",
      exchange: "Bybit",
      uid: "579533336",
      tradingViewUser: "pm4_test_user",
      discordUser: "pm4-discord",
      consentAccepted: true,
      policyVersion: "2026-08-28",
    });
    assert.match(forwardedBody.sourceKey, /^[a-f0-9]{32}$/);
    assert.equal(rateLimitKey, forwardedBody.sourceKey);
    assert.match(forwardedBody.consentedAt, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    assert.doesNotMatch(forwarded.init.body, /203\.0\.113\.7/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("rejects unsafe or unconfigured public application submissions", async () => {
  const missingOrigin = await render(
    "/api/indicator-applications",
    {},
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ exchange: "Bybit", uid: "579533336", tradingViewUser: "pm4_test", acceptedPrivacy: true }),
    },
  );
  assert.equal(missingOrigin.status, 403);

  const missingConsent = await render(
    "/api/indicator-applications",
    {},
    {
      method: "POST",
      headers: { origin: "http://localhost", "content-type": "application/json" },
      body: JSON.stringify({ exchange: "Bybit", uid: "579533336", tradingViewUser: "pm4_test" }),
    },
  );
  assert.equal(missingConsent.status, 400);

  const missingDiscord = await render(
    "/api/indicator-applications",
    {},
    {
      method: "POST",
      headers: { origin: "http://localhost", "content-type": "application/json" },
      body: JSON.stringify({ exchange: "Bybit", uid: "579533336", tradingViewUser: "pm4_test", acceptedPrivacy: true }),
    },
  );
  assert.equal(missingDiscord.status, 400);
  assert.equal((await missingDiscord.json()).error, "请输入 Discord 用户名");

  const honeypot = await render(
    "/api/indicator-applications",
    {},
    {
      method: "POST",
      headers: { origin: "http://localhost", "content-type": "application/json" },
      body: JSON.stringify({ website: "spam.example" }),
    },
  );
  assert.equal(honeypot.status, 200);
  assert.equal((await honeypot.json()).duplicate, true);

  const invalidUid = await render(
    "/api/indicator-applications",
    {},
    {
      method: "POST",
      headers: { origin: "http://localhost", "content-type": "application/json" },
      body: JSON.stringify({ exchange: "Bybit", uid: "not-a-uid", tradingViewUser: "pm4_test", acceptedPrivacy: true }),
    },
  );
  assert.equal(invalidUid.status, 400);

  const unconfigured = await render(
    "/api/indicator-applications",
    {},
    {
      method: "POST",
      headers: { origin: "http://localhost", "content-type": "application/json" },
      body: JSON.stringify({ exchange: "Bybit", uid: "579533336", tradingViewUser: "pm4_test", discordUser: "pm4-discord", acceptedPrivacy: true }),
    },
  );
  assert.equal(unconfigured.status, 503);
  assert.equal((await unconfigured.json()).code, "APPLICATION_SYNC_NOT_CONFIGURED");

  const missingRateLimitBinding = await render(
    "/api/indicator-applications",
    {
      PM4_ADMIN_INGEST_URL: "https://pm4-rebate-admin.chexin1103.chatgpt.site/api/frontend-ingest",
      PM4_ADMIN_INGEST_SECRET: "test-ingest-secret",
      PM4_ADMIN_SITES_BYPASS_TOKEN: "test-sites-token",
    },
    {
      method: "POST",
      headers: {
        origin: "http://localhost",
        "cf-connecting-ip": "203.0.113.8",
        "content-type": "application/json",
      },
      body: JSON.stringify({ exchange: "Bybit", uid: "579533336", tradingViewUser: "pm4_test", discordUser: "pm4-discord", acceptedPrivacy: true }),
    },
  );
  assert.equal(missingRateLimitBinding.status, 503);
  assert.equal((await missingRateLimitBinding.json()).code, "APPLICATION_RATE_LIMIT_NOT_CONFIGURED");

  const originalFetch = globalThis.fetch;
  let forwardedRequests = 0;
  globalThis.fetch = async () => {
    forwardedRequests += 1;
    return Response.json({ code: "RATE_LIMITED" }, { status: 429 });
  };
  try {
    const locallyRateLimited = await render(
      "/api/indicator-applications",
      {
        PM4_ADMIN_INGEST_URL: "https://pm4-rebate-admin.chexin1103.chatgpt.site/api/frontend-ingest",
        PM4_ADMIN_INGEST_SECRET: "test-ingest-secret",
        PM4_ADMIN_SITES_BYPASS_TOKEN: "test-sites-token",
        APPLICATION_RATE_LIMITER: { limit: async () => ({ success: false }) },
      },
      {
        method: "POST",
        headers: {
          origin: "http://localhost",
          "cf-connecting-ip": "203.0.113.8",
          "content-type": "application/json",
        },
        body: JSON.stringify({ exchange: "Bybit", uid: "579533336", tradingViewUser: "pm4_test", discordUser: "pm4-discord", acceptedPrivacy: true }),
      },
    );
    assert.equal(locallyRateLimited.status, 429);
    assert.equal((await locallyRateLimited.json()).code, "RATE_LIMITED");
    assert.equal(forwardedRequests, 0);

    const upstreamRateLimited = await render(
      "/api/indicator-applications",
      {
        PM4_ADMIN_INGEST_URL: "https://pm4-rebate-admin.chexin1103.chatgpt.site/api/frontend-ingest",
        PM4_ADMIN_INGEST_SECRET: "test-ingest-secret",
        PM4_ADMIN_SITES_BYPASS_TOKEN: "test-sites-token",
        APPLICATION_RATE_LIMITER: { limit: async () => ({ success: true }) },
      },
      {
        method: "POST",
        headers: {
          origin: "http://localhost",
          "cf-connecting-ip": "203.0.113.8",
          "content-type": "application/json",
        },
        body: JSON.stringify({ exchange: "Bybit", uid: "579533336", tradingViewUser: "pm4_test", discordUser: "pm4-discord", acceptedPrivacy: true }),
      },
    );
    assert.equal(upstreamRateLimited.status, 429);
    assert.equal((await upstreamRateLimited.json()).code, "RATE_LIMITED");
    assert.equal(forwardedRequests, 1);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("packages the approved static redesign at the exact production paths", async () => {
  const [home, okx, bybit] = await Promise.all([
    readFile(new URL("../public/index.html", import.meta.url), "utf8"),
    readFile(new URL("../public/transfer-okx.html", import.meta.url), "utf8"),
    readFile(new URL("../public/transfer-bybit.html", import.meta.url), "utf8"),
  ]);

  assert.match(home, /Bybit\s*:\{reg:'https:\/\/partner\.bybit\.com\/b\/PPMM44', mv:'\/transfer-bybit\.html'\}/);
  assert.match(home, /Gate\s*:\{reg:'https:\/\/www\.gateport\.biz\/zh\/share\/VFLEAAPBAQ', mv:''\}/);
  assert.match(home, /Bitget:\{reg:'https:\/\/partner\.bitget\.com\/bg\/r1ky845p', mv:''\}/);
  assert.match(home, /OKX\s*:\{reg:'https:\/\/www\.topzhjdgxcb\.com\/join\/PPMM44', mv:'\/transfer-okx\.html'\}/);
  assert.match(home, /<video[\s\S]*\/media\/market-panel\.mp4/);
  assert.match(home, /<meta property="og:url" content="https:\/\/cpm4\.com\/">/);
  assert.match(home, /https:\/\/cpm4\.com\/og-cover\.png/);
  assert.match(home, /<!--\s*<a href="\/privacy\.html">隐私政策<\/a><a href="\/terms\.html">服务条款与风险说明<\/a>\s*-->/);

  assert.match(okx, /href="https:\/\/discord\.gg\/vAASV36A9p"[^>]*>前往 Discord 开工单/);
  assert.doesNotMatch(okx, /oyidl\.co|J6l2R5/);
  assert.match(okx, /复制推荐码/);
  assert.match(okx, /复制中文理由/);
  assert.match(okx, /复制英文理由/);
  assert.match(okx, /navigator\.clipboard/);
  assert.match(bybit, /href="https:\/\/partner\.bybit\.com\/b\/PPMM44"/);
  assert.match(bybit, /href="https:\/\/www\.bybit\.com\/user\/accounts\/auth\/personal"/);

  const hashLinkCount = [home, okx, bybit].reduce((total, html) => total + (html.match(/href="#"/g)?.length ?? 0), 0);
  assert.equal(hashLinkCount, 1);
  assert.match(okx, /href="#">没看到输入框\?查看注销后重新注册指南/);
  for (const html of [home, okx, bybit]) {
    assert.match(html, /\/geist-latin\.woff2/);
    assert.doesNotMatch(html, /fonts\.googleapis\.com/);
  }

  await Promise.all([
    access(new URL("../public/og-cover.png", import.meta.url)),
    access(new URL("../public/geist-latin.woff2", import.meta.url)),
    access(new URL("../public/media/market-panel.mp4", import.meta.url)),
  ]);
  await assert.rejects(access(new URL("../public/privacy.html", import.meta.url)));
  await assert.rejects(access(new URL("../public/terms.html", import.meta.url)));
});
