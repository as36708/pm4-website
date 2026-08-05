import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
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
  assert.match(review, /className="review-primary"[^>]*>[\s\S]*?复制审核信息[\s\S]*?<\/button>/);
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
