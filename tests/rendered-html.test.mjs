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
  assert.match(html, /https:\/\/partner\.bybit\.com\/b\/PPMM44/);
  assert.match(html, /https:\/\/partner\.bitget\.com\/bg\/r1ky845p/);
  assert.match(html, /https:\/\/iciclebridge\.com\/zh-tc\/invite\/GHO8MG87/);
  assert.match(html, /https:\/\/www\.gateport\.biz\/zh\/share\/VFLEAAPBAQ/);
  assert.match(html, /<tr\b[^>]*>[\s\S]*?\bGate\b[\s\S]*?65%[\s\S]*?0\.02%[\s\S]*?0\.05%[\s\S]*?<\/tr>/i);
});

test("server-renders the Discord review destination", async () => {
  const response = await render("/review");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /前往审核频道粘贴提交/);
  assert.match(html, /https:\/\/discord\.com\/channels\/942442247209779230\/1296106331543175219/);
  assert.match(html, /https:\/\/discord\.gg\/D5CPTzQafD/);
});

test("keeps the responsive flow and production assets intact", async () => {
  const [page, review, css, layout, packageJson, links] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/ReviewSection.tsx", import.meta.url), "utf8"),
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
  assert.match(review, /fetch\("\/api\/indicator-applications"/);
  assert.match(review, /className="review-primary"[^>]*[\s\S]*?提交审核资料[\s\S]*?<\/button>/);
  assert.match(review, /disabled=\{submitting\}/);
  assert.doesNotMatch(review, /PM4_ADMIN_INGEST_SECRET|PM4_ADMIN_SITES_BYPASS_TOKEN/);
  assert.doesNotMatch(review, /提交并复制审核信息/);

  assert.match(css, /overflow-x:\s*clip/);
  assert.match(css, /font-size:\s*clamp\(34px,10vw,38px\)/);
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
    }, {
      action: "application",
      exchange: "Bybit",
      uid: "579533336",
      tradingViewUser: "pm4_test_user",
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
      body: JSON.stringify({ exchange: "Bybit", uid: "579533336", tradingViewUser: "pm4_test" }),
    },
  );
  assert.equal(missingOrigin.status, 403);

  const invalidUid = await render(
    "/api/indicator-applications",
    {},
    {
      method: "POST",
      headers: { origin: "http://localhost", "content-type": "application/json" },
      body: JSON.stringify({ exchange: "Bybit", uid: "not-a-uid", tradingViewUser: "pm4_test" }),
    },
  );
  assert.equal(invalidUid.status, 400);

  const unconfigured = await render(
    "/api/indicator-applications",
    {},
    {
      method: "POST",
      headers: { origin: "http://localhost", "content-type": "application/json" },
      body: JSON.stringify({ exchange: "Bybit", uid: "579533336", tradingViewUser: "pm4_test" }),
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
        body: JSON.stringify({ exchange: "Bybit", uid: "579533336", tradingViewUser: "pm4_test" }),
      },
    );
    assert.equal(rateLimited.status, 429);
    assert.equal((await rateLimited.json()).code, "RATE_LIMITED");
  } finally {
    globalThis.fetch = originalFetch;
  }
});
