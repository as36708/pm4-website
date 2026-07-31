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
  assert.doesNotMatch(page + data, /链接待配置|演示环境|开发提示|测试文字/);

  await Promise.all([
    access(new URL("../public/videos/pm4-indicator-preview.mp4", import.meta.url)),
    access(new URL("../public/icons/discord.svg", import.meta.url)),
    access(new URL("../public/icons/telegram.svg", import.meta.url)),
  ]);
});
