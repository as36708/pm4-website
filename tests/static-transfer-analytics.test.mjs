import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const analytics = await readFile(new URL("../public/pm4-frontend-analytics.js", import.meta.url), "utf8");
const pages = await Promise.all([
  ["transfer-bybit.html", "https://partner.bybit.com/b/PPMM44", "Bybit"],
  ["transfer-okx.html", "https://oyidl.co/ul/J6l2R5", "OKX"],
].map(async ([file, href, exchange]) => {
  const html = await readFile(new URL("../public/" + file, import.meta.url), "utf8");
  const anchor = [...html.matchAll(/<a\b[^>]*>/g)].map(match => match[0]).find(tag => tag.includes(`href="${href}"`));
  assert(anchor);
  const handler = anchor.match(/onclick="([^"]*)"/)?.[1];
  assert(handler, `${file} target link must be tracked`);
  return { file, href, exchange, html, anchor, handler };
}));

function browser({ storage = new Map(), dnt, windowDnt, ok = true, load = true } = {}) {
  const calls = [];
  const window = { doNotTrack: windowDnt, localStorage: {
    getItem: key => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: key => storage.delete(key),
  } };
  const context = vm.createContext({ window, navigator: { doNotTrack: dnt }, fetch: async (url, init) => {
    calls.push({ url, ...init, payload: JSON.parse(init.body) }); return { ok };
  } });
  if (load) vm.runInContext(analytics, context);
  return { calls, storage, click: page => vm.runInContext(`(function(){${page.handler}})()`, context) };
}
const flush = () => new Promise(setImmediate);
const payloads = b => b.calls.map(call => call.payload);

for (const page of pages) {
  test(`${page.file}: direct visit and approved exchange link send exactly the existing fields`, async () => {
    const b = browser(); assert.equal(b.click(page), undefined); await flush();
    assert.deepEqual(payloads(b), [{ eventType: "visit", exchange: "" }, { eventType: "exchange_click", exchange: page.exchange }]);
    for (const call of b.calls) {
      assert.equal(call.url, "/api/frontend-events"); assert.equal(call.method, "POST");
      assert.equal(call.keepalive, true); assert.equal(call.credentials, "same-origin");
      assert.equal(call.headers["content-type"], "application/json");
    }
    assert.match(page.anchor, /target="_blank"/); assert.match(page.anchor, /rel="noopener"/);
    assert.equal((page.html.match(/PM4FrontendAnalytics\.track/g) ?? []).length, 1, "other links remain untracked");
    assert.doesNotMatch(page.handler, /preventDefault|return false|transfer_click|application_submit/);
  });

  test(`${page.file}: existing daily visit marker suppresses only visit`, async () => {
    const b = browser({ storage: new Map([["pm4-visit-day", new Date().toISOString().slice(0, 10)]]) });
    b.click(page); await flush();
    assert.deepEqual(payloads(b), [{ eventType: "exchange_click", exchange: page.exchange }]);
  });

  test(`${page.file}: both DNT sources suppress visit and click without cancelling navigation`, async () => {
    for (const option of [{ dnt: "1" }, { windowDnt: "1" }]) {
      const b = browser(option); assert.equal(b.click(page), undefined); await flush(); assert.equal(b.calls.length, 0);
    }
  });

  test(`${page.file}: unavailable analytics leaves link navigation intact`, () => {
    const b = browser({ load: false }); assert.equal(b.click(page), undefined); assert.equal(b.calls.length, 0);
  });
}

test("transfer pages share one daily visit marker instead of adding per-page visits", async () => {
  const storage = new Map();
  const first = browser({ storage }); first.click(pages[0]); await flush();
  const second = browser({ storage }); second.click(pages[1]); await flush();
  assert.deepEqual([...payloads(first), ...payloads(second)], [
    { eventType: "visit", exchange: "" },
    { eventType: "exchange_click", exchange: "Bybit" },
    { eventType: "exchange_click", exchange: "OKX" },
  ]);
});
