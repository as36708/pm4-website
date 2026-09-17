import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const html = await readFile(new URL("../public/index.html", import.meta.url), "utf8");
const analytics = await readFile(new URL("../public/pm4-frontend-analytics.js", import.meta.url), "utf8");
const support = await readFile(new URL("../public/pm4-support.js", import.meta.url), "utf8");
const homeActions = html.slice(html.indexOf("var EX=window.PM4_SITE_CONFIG.EX;"), html.indexOf("</script>", html.indexOf("var EX=window.PM4_SITE_CONFIG.EX;")));
const flush = () => new Promise(setImmediate);

function browser({ storage = new Map(), dnt, windowDnt, storageDisabled = false, ok = true, networkError = false } = {}) {
  const calls = [], opened = [];
  const nodes = new Map();
  const document = {
    readyState: "loading",
    addEventListener() {},
    getElementById(id) {
      if (!nodes.has(id)) nodes.set(id, { style: {}, classList: { add() {} }, textContent: "" });
      return nodes.get(id);
    },
  };
  const window = { doNotTrack: windowDnt, open: (...args) => opened.push(args),
    localStorage: {
      getItem(key) { if (storageDisabled) throw Error("disabled"); return storage.get(key) ?? null; },
      setItem(key, value) { if (storageDisabled) throw Error("disabled"); storage.set(key, value); },
      removeItem(key) { if (storageDisabled) throw Error("disabled"); storage.delete(key); },
    },
  };
  const context = vm.createContext({ window, document, navigator: { doNotTrack: dnt }, location: { href: "" },
    fetch: async (url, init) => { calls.push({ url, ...JSON.parse(JSON.stringify(init)) }); if (networkError) throw Error("offline"); return { ok }; },
  });
  vm.runInContext(support, context);
  vm.runInContext(analytics, context);
  vm.runInContext(homeActions, context);
  return { context, calls, opened, storage, click(exchange, action) { context.showEx(exchange); context.go(action); } };
}
const payloads = (b) => b.calls.map(call => JSON.parse(call.body));

test("static homepage loads analytics exactly once before its navigation handlers", () => {
  assert.equal((html.match(/src="\/pm4-frontend-analytics\.js"/g) ?? []).length, 1);
  assert(html.indexOf('src="/pm4-frontend-analytics.js"') < html.indexOf("function go(k)"));
});

test("opening homepage then Gate registration sends exactly visit and exchange_click with unchanged fields", async () => {
  const b = browser(); b.click("Gate", "reg"); await flush();
  assert.deepEqual(payloads(b), [{ eventType: "visit", exchange: "" }, { eventType: "exchange_click", exchange: "Gate" }]);
  for (const call of b.calls) {
    assert.equal(call.url, "/api/frontend-events"); assert.equal(call.method, "POST");
    assert.equal(call.credentials, "same-origin"); assert.equal(call.keepalive, true);
    assert.deepEqual(call.headers, { "content-type": "application/json" });
  }
  assert.equal(b.opened.length, 1);
  assert.equal(b.opened[0][0], b.context.EX.Gate.reg);
});

test("all four exchange registration and transfer actions retain destination and exchange fields", async () => {
  for (const exchange of ["Bybit", "Gate", "Bitget", "OKX"]) {
    const b = browser(); b.click(exchange, "reg"); b.click(exchange, "mv"); await flush();
    assert.deepEqual(payloads(b), [{ eventType: "visit", exchange: "" }, { eventType: "exchange_click", exchange }, { eventType: "transfer_click", exchange }]);
    const destination = b.context.EX[exchange].mv;
    if (/^https?:/.test(destination)) assert.equal(b.opened.at(-1)[0], destination);
    else assert.equal(b.context.location.href, destination);
  }
});

test("opening exchange chooser or a missing destination does not count as a link click", async () => {
  const b = browser(); b.context.showEx("Gate"); b.context.go("missing"); await flush();
  assert.deepEqual(payloads(b), [{ eventType: "visit", exchange: "" }]);
});

test("same-day reload preserves daily visit suppression but still sends clicks", async () => {
  const storage = new Map(); const first = browser({ storage }); await flush();
  const next = browser({ storage }); next.click("Gate", "reg"); await flush();
  assert.equal(first.calls.length, 1);
  assert.deepEqual(payloads(next), [{ eventType: "exchange_click", exchange: "Gate" }]);
});

test("next UTC day sends a new visit", async () => {
  const b = browser({ storage: new Map([["pm4-visit-day", "2000-01-01"]]) }); await flush();
  assert.deepEqual(payloads(b), [{ eventType: "visit", exchange: "" }]);
});

test("navigator and window DNT suppress all analytics without blocking navigation", async () => {
  for (const option of [{ dnt: "1" }, { windowDnt: "1" }]) {
    const b = browser(option); b.click("Gate", "reg"); await flush();
    assert.equal(b.calls.length, 0); assert.equal(b.opened.length, 1);
  }
});

test("disabled storage still sends one visit and a click", async () => {
  const b = browser({ storageDisabled: true }); b.click("Bybit", "reg"); await flush();
  assert.equal(b.calls.length, 2);
});

test("HTTP or network failure clears only the failed visit marker and keeps links working", async () => {
  for (const option of [{ ok: false }, { networkError: true }]) {
    const b = browser(option); b.click("Gate", "reg"); await flush();
    assert.equal(b.storage.has("pm4-visit-day"), false); assert.equal(b.opened.length, 1);
  }
});

test("loading the static adapter twice does not send a duplicate visit", async () => {
  const b = browser(); vm.runInContext(analytics, b.context); await flush(); assert.equal(b.calls.length, 1);
});

test("other static pages do not acquire the homepage adapter", async () => {
  for (const page of ["transfer-bybit.html", "transfer-okx.html"]) {
    const body = await readFile(new URL("../public/" + page, import.meta.url), "utf8");
    assert.doesNotMatch(body, /pm4-frontend-analytics\.js/);
  }
});
