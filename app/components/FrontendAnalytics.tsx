"use client";

import { useEffect } from "react";

type FrontendEventType = "visit" | "exchange_click" | "transfer_click";

async function sendFrontendEvent(eventType: FrontendEventType, exchange = "") {
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

export default function FrontendAnalytics() {
  useEffect(() => {
    if (navigator.doNotTrack === "1" || window.doNotTrack === "1") return;

    const day = new Date().toISOString().slice(0, 10);
    const visitKey = "pm4-visit-day";
    let alreadyTracked = false;
    try {
      alreadyTracked = window.localStorage.getItem(visitKey) === day;
      if (!alreadyTracked) window.localStorage.setItem(visitKey, day);
    } catch {
      // Privacy modes can disable storage; the request can still be counted.
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

    const handleClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const trackedElement = event.target.closest<HTMLElement>("[data-pm4-event]");
      if (!trackedElement) return;
      const eventType = trackedElement.dataset.pm4Event;
      const exchange = trackedElement.dataset.pm4Exchange ?? "";
      if (eventType !== "exchange_click" && eventType !== "transfer_click") return;
      void sendFrontendEvent(eventType, exchange);
    };

    document.addEventListener("click", handleClick, { passive: true });
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return null;
}
