// The asset-served homepage does not mount the React layout/FrontendAnalytics.
// Keep this adapter's payload, privacy and daily-visit behavior aligned with it.
(function connectStaticHomeAnalytics() {
  "use strict";
  if (window.PM4FrontendAnalytics) return;
  if (navigator.doNotTrack === "1" || window.doNotTrack === "1") return;

  async function sendFrontendEvent(eventType, exchange = "") {
    try {
      const response = await fetch("/api/frontend-events", {
        method: "POST",
        credentials: "same-origin",
        keepalive: true,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ eventType, exchange }),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  window.PM4FrontendAnalytics = Object.freeze({ track: sendFrontendEvent });
  const day = new Date().toISOString().slice(0, 10);
  const visitKey = "pm4-visit-day";
  let alreadyTracked = false;
  try {
    alreadyTracked = window.localStorage.getItem(visitKey) === day;
    if (!alreadyTracked) window.localStorage.setItem(visitKey, day);
  } catch {
    // Match FrontendAnalytics: disabled storage does not disable analytics.
  }
  if (!alreadyTracked) {
    void sendFrontendEvent("visit").then((tracked) => {
      if (tracked) return;
      try {
        if (window.localStorage.getItem(visitKey) === day) window.localStorage.removeItem(visitKey);
      } catch {
        // Nothing to clean up when storage is unavailable.
      }
    });
  }
})();
