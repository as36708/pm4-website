import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const workerPromise = import("../dist/server/index.js");
const oldUrl = "https://pm4-rebate-admin.chexin1103.chatgpt.site/api/frontend-ingest";
const newUrl = "https://admin.cpm4.com/api/frontend-ingest";
// Synthetic fixtures only. The two differently named bindings must contain the same value.
const backendEnv = { PM4_FRONTEND_INGEST_SECRET: "synthetic-ingest-shared-value" };
const frontendEnv = {
  PM4_ADMIN_INGEST_URL: newUrl,
  PM4_ADMIN_INGEST_SECRET: backendEnv.PM4_FRONTEND_INGEST_SECRET,
  APPLICATION_RATE_LIMITER: { limit: async () => ({ success: true }) },
};
const routes = ["/api/track", "/api/frontend-events", "/api/applications", "/api/indicator-applications"];
const isTrack = (route) => route === "/api/track" || route === "/api/frontend-events";
let address = 20;

function request(route, { method = "POST", origin = "https://cpm4.com", ip = "192.0.2." + address++ } = {}) {
  return new Request("https://cpm4.com" + route, {
    method,
    headers: { origin, "content-type": "application/json", "cf-connecting-ip": ip },
    ...(method === "POST" ? { body: JSON.stringify(isTrack(route)
      ? { eventType: "exchange_click", exchange: "Gate" }
      : { exchange: "Gate", uid: "99990001", tradingViewUser: "synthetic_test",
        discordUser: "synthetic_test", acceptedPrivacy: true, website: "" }) } : {}),
  });
}

async function invoke(route, env = frontendEnv, options = {}) {
  const { default: worker } = await workerPromise;
  return worker.fetch(request(route, options), env, { waitUntil() {}, passThroughOnException() {} });
}

async function withUpstream(stub, run) {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = stub;
  try { await run(); } finally { globalThis.fetch = originalFetch; }
}

function success(route) {
  return isTrack(route) ? { tracked: true } : {
    submitted: true, duplicate: false, submittedAt: "2026-09-13T00:00:00.000Z",
  };
}

for (const [destination, url] of [["old", oldUrl], ["new", newUrl]]) {
  for (const token of ["synthetic-sites-token", undefined]) {
    test(destination + " URL / " + (token ? "with" : "without") + " Sites token", async (t) => {
      for (const route of routes) await t.test(route, async () => {
        let calls = 0;
        await withUpstream(async (target, options) => {
          calls++;
          assert.equal(target, url);
          assert.equal(options.method, "POST");
          assert.equal(options.redirect, "manual");
          const headers = new Headers(options.headers);
          assert.equal(headers.get("authorization"), "Bearer " + backendEnv.PM4_FRONTEND_INGEST_SECRET);
          assert.equal(headers.get("OAI-Sites-Authorization"), token ? "Bearer " + token : null);
          const body = JSON.parse(options.body);
          assert.equal(body.action, isTrack(route) ? "track" : "application");
          assert.match(body.sourceKey, /^[0-9a-f]{32}$/);
          if (isTrack(route)) assert.match(body.eventKey, /^[0-9a-f]{48}$/);
          else {
            assert.equal(body.consentAccepted, true);
            assert.equal(body.policyVersion, "2026-08-28");
          }
          return Response.json(success(route));
        }, async () => {
          const response = await invoke(route, { ...frontendEnv,
            PM4_ADMIN_INGEST_URL: url, PM4_ADMIN_SITES_BYPASS_TOKEN: token });
          assert.equal(response.status, 200);
          assert.equal((await response.json())[isTrack(route) ? "tracked" : "submitted"], true);
          assert.equal(calls, 1);
        });
      });
    });
  }
}

test("configured HTTPS destination is authoritative; whitespace-only token is omitted", async () => {
  for (const route of routes) await withUpstream(async (target, options) => {
    assert.equal(target, "https://configured-backend.example/api/frontend-ingest");
    assert.equal(new Headers(options.headers).has("OAI-Sites-Authorization"), false);
    return Response.json(success(route));
  }, async () => {
    assert.equal((await invoke(route, { ...frontendEnv,
      PM4_ADMIN_INGEST_URL: "  https://configured-backend.example/api/frontend-ingest  ",
      PM4_ADMIN_SITES_BYPASS_TOKEN: "  " })).status, 200);
  });
});

test("missing or invalid URL and missing secret fail explicitly without upstream calls", async () => {
  let calls = 0;
  await withUpstream(async () => { calls++; throw new Error("Unexpected upstream call"); }, async () => {
    const invalidUrls = [undefined, "", " ", "http://admin.cpm4.com/api/frontend-ingest",
      "/api/frontend-ingest", "not-a-url", "https://admin.cpm4.com/wrong",
      "https://user:pass@admin.cpm4.com/api/frontend-ingest",
      newUrl + "?extra=1", newUrl + "#fragment"];
    for (const route of routes) {
      for (const url of invalidUrls) {
        const response = await invoke(route, { ...frontendEnv, PM4_ADMIN_INGEST_URL: url });
        assert.equal(response.status, 503);
        const payload = await response.json();
        assert.equal(payload.configurationError, url?.trim() ? "PM4_ADMIN_INGEST_URL_INVALID" : "PM4_ADMIN_INGEST_URL_MISSING");
        assert.match(payload.error, /PM4_ADMIN_INGEST_URL/);
      }
      const response = await invoke(route, { ...frontendEnv, PM4_ADMIN_INGEST_SECRET: " " });
      assert.equal(response.status, 503);
      assert.equal((await response.json()).configurationError, "PM4_ADMIN_INGEST_SECRET_MISSING");
    }
    assert.equal(calls, 0);
  });
});

test("wrong method and Origin are rejected before forwarding on every route", async () => {
  let calls = 0;
  await withUpstream(async () => { calls++; throw new Error("Unexpected upstream call"); }, async () => {
    for (const route of routes) {
      assert.equal((await invoke(route, frontendEnv, { method: "GET" })).status, 405);
      assert.equal((await invoke(route, frontendEnv, { origin: "https://wrong.example" })).status, 403);
    }
    assert.equal(calls, 0);
  });
});

test("upstream redirect or denial is not followed or reported as success", async () => {
  for (const status of [302, 307, 401]) {
    for (const route of routes) {
      let calls = 0;
      await withUpstream(async (_target, options) => {
        calls++;
        assert.equal(options.redirect, "manual");
        return Response.json(success(route), { status, headers: { location: "https://untrusted.example" } });
      }, async () => {
        const response = await invoke(route);
        assert.equal(response.status, 503);
        assert.equal((await response.json()).code, isTrack(route) ? "FRONTEND_STATS_FAILED" : "APPLICATION_SYNC_FAILED");
        assert.equal(calls, 1);
      });
    }
  }
});

test("track alias shares the existing event deduplication behavior", async () => {
  let calls = 0;
  await withUpstream(async () => { calls++; return Response.json({ tracked: true }); }, async () => {
    const options = { ip: "198.51.100.22" };
    assert.equal((await invoke("/api/track", frontendEnv, options)).status, 200);
    const repeated = await invoke("/api/frontend-events", frontendEnv, options);
    assert.equal(repeated.status, 200);
    assert.equal((await repeated.json()).duplicate, true);
    assert.equal(calls, 1);
  });
});

test("production build preserves dashboard variables and does not supply an ingest URL", async () => {
  const config = JSON.parse(await readFile(new URL("../dist/server/wrangler.json", import.meta.url), "utf8"));
  assert.equal(config.keep_vars, true);
  assert.equal(config.vars?.PM4_ADMIN_INGEST_URL, undefined);
});
