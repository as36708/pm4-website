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
  assert.match(html, /<html lang="zh-CN">/i);
  assert.match(html, /PM4 指标返佣与审核/);
  assert.match(html, /一次注册/);
  assert.match(html, /选择交易所注册/);
  assert.match(html, /已注册，提交审核/);
  assert.match(html, /注册交易所，完成任务领指标/);
  assert.match(html, /选择合作交易所/);
  assert.match(html, /提交指标审核资料/);
  assert.match(html, /market-panel\.mp4/);
  assert.match(html, /market-panel-poster\.jpg/);
  assert.match(html, /src="\/logos\/bybit\.png"/);
  assert.match(html, /src="\/logos\/bitget\.png"/);
  assert.match(html, /src="\/logos\/bingx\.png"/);
  assert.doesNotMatch(html, /_vinext\/image\?[^"']*logos%2F(?:bybit|bitget|bingx)/i);
  assert.match(html, /https:\/\/partner\.bybit\.com\/b\/PPMM44/);
  assert.match(html, /https:\/\/partner\.bitget\.com\/bg\/r1ky845p/);
  assert.match(html, /https:\/\/iciclebridge\.com\/zh-tc\/invite\/GHO8MG87/);
  assert.match(html, /https:\/\/www\.gateport\.biz\/zh\/share\/VFLEAAPBAQ/);
  assert.match(html, /<tr\b[^>]*>[\s\S]*?\bBybit\b[\s\S]*?0\.02%[\s\S]*?0\.055%[\s\S]*?<\/tr>/i);
  assert.match(html, /<tr\b[^>]*>[\s\S]*?\bBitget\b[\s\S]*?0\.02%[\s\S]*?0\.06%[\s\S]*?<\/tr>/i);
  assert.match(html, /<tr\b[^>]*>[\s\S]*?\bBingX\b[\s\S]*?0\.02%[\s\S]*?0\.05%[\s\S]*?<\/tr>/i);
  assert.match(html, /<tr\b[^>]*>[\s\S]*?\bGate\b[\s\S]*?最高 65%[\s\S]*?0\.02%[\s\S]*?0\.05%[\s\S]*?<\/tr>/i);
  assert.doesNotMatch(html, /基准|分级费率/);
  assert.match(html, /合约 Maker Fee/);
  assert.match(html, /合约 Taker Fee/);
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
  assert.match(html, /提交审核资料并前往 UID 审核/);
  assert.match(html, /首次使用 Discord？先加入服务器/);
  assert.match(html, /https:\/\/discord\.gg\/vAASV36A9p/);
});

test("keeps the responsive flow and production assets intact", async () => {
  const [page, review, analytics, css, layout, packageJson, links] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/ReviewSection.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/FrontendAnalytics.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../app/links.ts", import.meta.url), "utf8"),
  ]);

  assert.match(page, /STEP 01 · REGISTER/);
  assert.match(page, /STEP 02 · VERIFY/);
  assert.match(page, /STEP 03 · ACTIVATE/);
  assert.match(page, /hero-quick-primary[\s\S]{0,300}选择交易所注册/);
  assert.match(page, /hero-quick-secondary[\s\S]{0,300}已注册，提交审核/);
  assert.doesNotMatch(page, /<span className="chevron">⌄<\/span>/);
  assert.match(page, /scope="col"/);
  assert.match(page, /data-label="返佣权益"/);
  assert.doesNotMatch(page, /任务要求/);
  assert.match(review, /id="review"/);
  assert.match(review, /className="review-discord-help"[^>]*href=\{EXTERNAL_LINKS\.discordInvite\}/);
  assert.match(review, /fetch\("\/api\/indicator-applications"/);
  assert.match(review, /window\.location\.assign\(EXTERNAL_LINKS\.discordReview\)/);
  assert.match(links, /https:\/\/discord\.com\/channels\/942442247209779230\/1296106331543175219/);
  assert.match(review, /className="review-actions"[\s\S]*?className="review-copy"[\s\S]*?复制审核信息[\s\S]*?className="review-primary"/);
  assert.match(review, /className="review-side-column"[\s\S]*?className="review-steps"[\s\S]*?className="discord-template"/);
  assert.doesNotMatch(review, /<details className="discord-template"/);
  assert.match(review, /className="review-primary"[^>]*[\s\S]*?提交审核资料并前往 UID 审核[\s\S]*?<\/button>/);
  assert.match(review, /disabled=\{submitting\}/);
  assert.match(review, /acceptedPrivacy/);
  assert.match(review, /review-honeypot/);
  assert.match(review, /Discord 用户名 <b>\*<\/b>/);
  assert.match(review, /nextErrors\.discord = "请输入 Discord 用户名。"/);
  assert.match(review, /ref=\{discordRef\}[\s\S]*?required[\s\S]*?aria-invalid=\{Boolean\(errors\.discord\)\}/);
  assert.match(review, /复制审核信息/);
  assert.doesNotMatch(review, /PM4_ADMIN_INGEST_SECRET|PM4_ADMIN_SITES_BYPASS_TOKEN/);
  assert.doesNotMatch(review, /提交并复制审核信息/);
  assert.match(page, /data-pm4-event="exchange_click"/);
  assert.match(page, /data-pm4-event="transfer_click"/);
  assert.match(page, /sizes="34px" unoptimized/);
  assert.match(analytics, /fetch\("\/api\/frontend-events"/);
  assert.match(analytics, /pm4-visit-day/);
  assert.match(analytics, /window\.localStorage/);
  assert.doesNotMatch(analytics, /PM4_ADMIN_INGEST_SECRET|PM4_ADMIN_SITES_BYPASS_TOKEN/);

  assert.match(css, /overflow-x:\s*clip/);
  assert.match(css, /font-size:\s*clamp\(34px,10vw,38px\)/);
  assert.match(css, /\.hero-copy\s*\{[^}]*text-align:\s*center/);
  assert.match(css, /\.hero h1\s*\{[^}]*text-align:\s*center/);
  assert.match(css, /\.nav\s*\{[^}]*grid-template-columns:\s*repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(css, /\.nav-open\s*\{[^}]*display:\s*grid/);
  assert.match(css, /\.exchange-table tbody tr > td\.exchange-name-cell\s*\{[^}]*width:\s*auto/);
  assert.match(css, /\.exchange-table \.exchange-name\s*\{[^}]*justify-content:\s*center/);
  assert.match(css, /\.exchange-table \.exchange-actions\s*\{[^}]*grid-template-columns:\s*repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(css, /\.review-card-heading\s*\{[^}]*text-align:\s*center/);
  assert.match(css, /position:\s*sticky/);
  assert.match(css, /\.exchange-table tbody tr\s*\{[^}]*grid-template-columns:\s*1fr 1fr/);
  assert.doesNotMatch(css, /\.campaign-card:nth-child\([^)]*\)\s*\{\s*display:\s*none/);

  const mobileCardRule = css.indexOf(".exchange-table-scroll { overflow: visible");
  assert.notEqual(mobileCardRule, -1, "mobile exchange cards should disable horizontal table scrolling");
  const mobileCardBreakpoint = css.lastIndexOf("@media", mobileCardRule);
  assert.notEqual(mobileCardBreakpoint, -1, "mobile exchange card rules should be inside a media query");
  assert.match(
    css.slice(mobileCardBreakpoint, mobileCardRule),
    /max-width:\s*960px/,
    "exchange table card layout should cover viewports up to 960px",
  );

  assert.match(layout, /PM4 指标返佣与审核/);
  assert.match(layout, /<html lang="zh-CN">/);
  assert.match(layout, /<FrontendAnalytics \/>/);
  assert.match(layout, /metadataBase: siteOrigin/);
  assert.doesNotMatch(layout, /headers\(\)|x-forwarded-host/);
  assert.match(packageJson, /"build": "vinext build"/);
  assert.doesNotMatch(packageJson, /static-export/);
  assert.match(links, /https:\/\/www\.bybit\.com\/zh-TW\/help-center\/article\/How-to-Transfer-Your-Identity-to-Another-Account/);
  assert.match(links, /https:\/\/t\.me\/as36701/);
  assert.match(page, /setSupportOpen\(true\)/);

  await Promise.all([
    access(new URL("../public/media/market-panel.mp4", import.meta.url)),
    access(new URL("../public/media/market-panel-poster.jpg", import.meta.url)),
    access(new URL("../public/logos/bybit.png", import.meta.url)),
    access(new URL("../public/logos/bitget.png", import.meta.url)),
    access(new URL("../public/logos/bingx.png", import.meta.url)),
    access(new URL("../public/logos/gate.svg", import.meta.url)),
  ]);
});

test("publishes privacy, terms, robots, sitemap, and a useful 404", async () => {
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
  assert.match(await sitemap.text(), /https:\/\/cpm4\.com\/privacy/);
  assert.equal(missing.status, 404);
  assert.match(await missing.text(), /页面不存在/);
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

test("forwards a validated indicator application without exposing server secrets", async () => {
  const originalFetch = globalThis.fetch;
  let forwarded = null;
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
    }, {
      action: "application",
      exchange: "Bybit",
      uid: "579533336",
      tradingViewUser: "pm4_test_user",
      discordUser: "pm4-discord",
    });
    assert.match(forwardedBody.sourceKey, /^[a-f0-9]{32}$/);
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

  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => Response.json({ code: "RATE_LIMITED" }, { status: 429 });
  try {
    const rateLimited = await render(
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
    assert.equal(rateLimited.status, 429);
    assert.equal((await rateLimited.json()).code, "RATE_LIMITED");
  } finally {
    globalThis.fetch = originalFetch;
  }
});
