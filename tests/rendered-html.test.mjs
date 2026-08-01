import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the production PM4 page without starter content", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>PM4交易所返佣与专属指标<\/title>/i);
  assert.match(html, /id="home"/);
  assert.match(html, /id="exchanges"/);
  assert.match(html, /id="indicator-review"/);
  assert.match(html, /id="faq"/);
  assert.match(html, /pm4-indicator-preview\.mp4/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|Building your site/i);
  assert.doesNotMatch(html, /href=["']#["']/i);
});

test("keeps production links, copy flow, and media assets configured", async () => {
  const [page, data] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/site-data.ts", import.meta.url), "utf8"),
  ]);

  assert.match(page, /navigator\.clipboard\.writeText\(reviewText\)/);
  assert.match(page, /target="_blank"/);
  assert.match(page, /rel="noopener noreferrer"/);
  assert.match(page, /href="#indicator-review"/);
  assert.match(data, /https:\/\/discord\.com\/channels\//);
  assert.match(data, /https:\/\/discord\.gg\/D5CPTzQafD/);
  assert.match(data, /https:\/\/t\.me\/as36701/);
  assert.doesNotMatch(page + data, /WEEX|PM4WEEX|weex\.com/i);
  assert.doesNotMatch(page + data, /链接待配置|演示环境|开发提示|测试文字/);

  await Promise.all([
    access(new URL("../public/videos/pm4-indicator-preview.mp4", import.meta.url)),
    access(new URL("../public/icons/discord.svg", import.meta.url)),
    access(new URL("../public/icons/telegram.svg", import.meta.url)),
  ]);
});

test("keeps the hero CTA scroll interruptible and free of repeated anchor alignment", async () => {
  const [page, styles] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.equal((page.match(/href="#indicator-review"/g) ?? []).length >= 2, true);
  assert.equal((page.match(/href="#exchanges"/g) ?? []).length >= 2, true);
  assert.equal((page.match(/alignMobileReviewAnchor/g) ?? []).length, 0);
  assert.match(page, /const scrollToDesktopSection/);
  assert.match(page, /if \(window\.innerWidth < 1024\) return;/);
  assert.match(page, /const scrollToMobileSection/);
  assert.match(page, /target\.scrollIntoView\(\{ behavior: "smooth", block: "start" \}\)/);
  assert.equal((page.match(/scrollToMobileSection\("indicator-review"\)/g) ?? []).length, 1);
  assert.equal((page.match(/scrollToMobileSection\("exchanges"\)/g) ?? []).length, 1);
  assert.equal((page.match(/window\.scrollTo\(/g) ?? []).length, 1);
  assert.equal((page.match(/scrollToDesktopSection\(event, "indicator-review"\)/g) ?? []).length, 1);
  assert.equal((page.match(/scrollToDesktopSection\(event, "exchanges"\)/g) ?? []).length, 1);
  assert.match(styles, /@media \(min-width: 1024px\)[\s\S]*?html\s*\{\s*scroll-behavior: auto;/);
  assert.match(styles, /@media \(max-width: 1023px\)[\s\S]*?\.desktop-hero-action[\s\S]*?\.mobile-hero-action/);
});
