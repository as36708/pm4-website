import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const script = await readFile(new URL("../public/pm4-join.js", import.meta.url), "utf8");
const html = await readFile(new URL("../public/index.html", import.meta.url), "utf8");
const exchanges = ["Bybit", "Gate", "Bitget", "OKX"];
function chooser(search) {
  const handlers = new Map(), selected = [];
  let opened = 0, closed = 0;
  const dialog = { showModal() { opened++; }, close() { closed++; }, querySelectorAll() {
    return exchanges.map(exchange => ({ dataset: { joinExchange: exchange }, addEventListener(event, handler) {
      assert.equal(event, "click"); handlers.set(exchange, handler);
    } }));
  } };
  vm.runInNewContext(script, { URLSearchParams, window: { location: { search }, showEx: exchange => selected.push(exchange) },
    document: { getElementById(id) { assert.equal(id, "pm4-join-dialog"); return dialog; } } });
  return { handlers, selected, opened: () => opened, closed: () => closed };
}

test("ordinary homepage and unrelated parameters do not open the registration chooser", () => {
  for (const search of ["", "?join=0", "?join=", "?other=1"]) {
    const c = chooser(search); assert.equal(c.opened(), 0); assert.equal(c.handlers.size, 0);
  }
});

test("join entry opens once and each exchange reuses the existing registration dialog", () => {
  for (const exchange of exchanges) {
    const c = chooser("?join=1"); assert.equal(c.opened(), 1); c.handlers.get(exchange)();
    assert.equal(c.closed(), 1); assert.deepEqual(c.selected, [exchange]);
  }
});

test("chooser markup has all four native buttons and loads after the existing homepage handlers", () => {
  for (const exchange of exchanges) assert(html.includes(`data-join-exchange="${exchange}"`));
  assert.match(html, /<dialog[^>]+aria-labelledby="pm4-join-title"/);
  assert.match(html, /<form method="dialog">/);
  assert(html.indexOf('src="/pm4-join.js"') > html.indexOf("function showEx(n)"));
  assert.equal((html.match(/src="\/pm4-frontend-analytics\.js"/g) ?? []).length, 1);
});

test("join redirect uses the same-origin static homepage without rendering or emitting events", async () => {
  const { default: worker } = await import("../dist/server/index.js");
  for (const path of ["/join", "/join/", "/join?next=https://untrusted.example"]) {
    for (const method of ["GET", "HEAD"]) {
      const response = await worker.fetch(new Request("https://cpm4.com" + path, { method }), {}, {});
      assert.equal(response.status, 302);
      assert.equal(response.headers.get("location"), "https://cpm4.com/?join=1");
      assert.equal(response.headers.get("cache-control"), "no-store");
      assert.equal(await response.text(), "");
    }
  }
});

test("join entry rejects non-navigation methods", async () => {
  const { default: worker } = await import("../dist/server/index.js");
  const response = await worker.fetch(new Request("https://cpm4.com/join", { method: "POST" }), {}, {});
  assert.equal(response.status, 405); assert.equal(response.headers.get("allow"), "GET, HEAD");
});
