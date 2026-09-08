(function (global) {
  "use strict";

  var PM4_SITE_CONFIG = Object.freeze({
    EX: Object.freeze({
      Bybit: Object.freeze({ reg: "https://partner.bybit.com/b/PPMM44", mv: "/transfer-bybit.html" }),
      Gate: Object.freeze({ reg: "https://www.gateport.biz/zh/share/VFLEAAPBAQ", mv: "https://discord.gg/vAASV36A9p" }),
      Bitget: Object.freeze({ reg: "https://partner.bitget.com/bg/r1ky845p", mv: "https://discord.gg/vAASV36A9p" }),
      OKX: Object.freeze({ reg: "https://www.topzhjdgxcb.com/join/PPMM44", mv: "/transfer-okx", mvTitle: "在 OKX 确认资格" }),
      SUPPORT: Object.freeze({
        discord: "https://discord.gg/zb8mmuWdEs",
        telegram: "https://t.me/tianshijin10",
      }),
    }),
  });

  global.PM4_SITE_CONFIG = PM4_SITE_CONFIG;

  var STYLE_ID = "pm4-support-widget-style";
  var CHAT_ICON = '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5.5 5.5h13a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-7l-4.5 3v-3H5.5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2Z"/><path d="M8 10h8M8 13.5h5"/></svg>';
  var DISCORD_ICON = '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M8.2 7.2a14 14 0 0 1 7.6 0l.7 1.3c1.7.6 2.9 1.4 3.5 2.1-.3 4.2-2.1 7.1-5.4 8.2l-1.1-1.5c.7-.2 1.3-.5 1.9-.9-2.3 1-4.5 1-6.8 0 .6.4 1.2.7 1.9.9l-1.1 1.5C6.1 17.7 4.3 14.8 4 10.6c.6-.7 1.8-1.5 3.5-2.1l.7-1.3Z"/><path d="M9.1 12.8h.1M14.8 12.8h.1"/></svg>';
  var TELEGRAM_ICON = '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="m3.5 11 16.8-6.4-3.1 14.8-5-4-2.7 2.7.4-4.3 7.8-6.1-9.6 5.1L3.5 11Z"/></svg>';

  function addStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = [
      ".pm4-support-widget{position:fixed;right:max(16px,env(safe-area-inset-right));bottom:calc(16px + env(safe-area-inset-bottom));z-index:9999;display:flex;flex-direction:column;align-items:flex-end;gap:10px;font-family:Geist,var(--font-geist),'Noto Sans SC','Microsoft YaHei',sans-serif;color:#f7f7f5}",
      ".pm4-support-widget *{box-sizing:border-box}",
      ".pm4-support-trigger{width:54px;height:54px;padding:0;display:grid;place-items:center;align-content:center;gap:1px;border:1px solid rgba(255,255,255,.22);border-radius:50%;background:#f4f4f2;color:#111214;box-shadow:0 14px 38px rgba(0,0,0,.42);cursor:pointer;font:inherit;font-size:11px;font-weight:800;line-height:1}",
      ".pm4-support-trigger svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}",
      ".pm4-support-trigger:hover,.pm4-support-trigger:focus-visible{transform:translateY(-2px);background:#fff;box-shadow:0 18px 48px rgba(0,0,0,.52);outline:2px solid rgba(255,255,255,.72);outline-offset:3px}",
      ".pm4-support-panel{width:244px;padding:10px;border:1px solid rgba(255,255,255,.16);border-radius:16px;background:rgba(20,21,23,.97);box-shadow:0 22px 64px rgba(0,0,0,.58);backdrop-filter:blur(16px)}",
      ".pm4-support-panel[hidden]{display:none}",
      ".pm4-support-title{margin:2px 4px 9px;color:#9da1a8;font-size:12px;font-weight:650;letter-spacing:.04em}",
      ".pm4-support-link{min-height:52px;padding:0 12px;display:flex;align-items:center;gap:11px;border:1px solid transparent;border-radius:11px;color:#f5f5f3!important;text-decoration:none!important;font-size:14px;font-weight:750}",
      ".pm4-support-link+ .pm4-support-link{margin-top:4px}",
      ".pm4-support-link:hover,.pm4-support-link:focus-visible{border-color:rgba(255,255,255,.17);background:#2a2c30;outline:none}",
      ".pm4-support-link svg{width:21px;height:21px;flex:0 0 21px;fill:none;stroke:currentColor;stroke-width:1.55;stroke-linecap:round;stroke-linejoin:round}",
      ".pm4-support-link span{margin-left:auto;color:#8f949c;font-size:15px}",
      "@media(max-width:720px){html.pm4-support-mounted body{padding-bottom:calc(92px + env(safe-area-inset-bottom))}.pm4-support-panel{width:min(244px,calc(100vw - 32px))}}",
      "@media(prefers-reduced-motion:reduce){.pm4-support-widget *{transition:none!important}}",
    ].join("");
    document.head.appendChild(style);
  }

  function initialize(root, index) {
    if (root.getAttribute("data-pm4-support-ready") === "true") return;
    root.setAttribute("data-pm4-support-ready", "true");
    root.classList.add("pm4-support-widget");

    var panelId = "pm4-support-panel-" + index;
    var links = PM4_SITE_CONFIG.EX.SUPPORT;
    root.innerHTML =
      '<div class="pm4-support-panel" id="' + panelId + '" role="menu" aria-label="客服渠道" hidden>' +
        '<p class="pm4-support-title">选择客服渠道</p>' +
        '<a class="pm4-support-link" role="menuitem" href="' + links.discord + '" target="_blank" rel="noopener noreferrer">' + DISCORD_ICON + 'Discord<span aria-hidden="true">↗</span></a>' +
        '<a class="pm4-support-link" role="menuitem" href="' + links.telegram + '" target="_blank" rel="noopener noreferrer">' + TELEGRAM_ICON + 'Telegram<span aria-hidden="true">↗</span></a>' +
      '</div>' +
      '<button class="pm4-support-trigger" type="button" aria-label="打开客服" aria-haspopup="menu" aria-expanded="false" aria-controls="' + panelId + '">' +
        CHAT_ICON + '<span>客服</span>' +
      '</button>';

    var panel = root.querySelector(".pm4-support-panel");
    var trigger = root.querySelector(".pm4-support-trigger");

    function closePanel(restoreFocus) {
      panel.hidden = true;
      trigger.setAttribute("aria-expanded", "false");
      trigger.setAttribute("aria-label", "打开客服");
      if (restoreFocus) trigger.focus();
    }

    function openPanel() {
      panel.hidden = false;
      trigger.setAttribute("aria-expanded", "true");
      trigger.setAttribute("aria-label", "关闭客服");
      var firstLink = panel.querySelector("a");
      if (firstLink) firstLink.focus();
    }

    trigger.addEventListener("click", function () {
      if (panel.hidden) openPanel();
      else closePanel(false);
    });
    panel.addEventListener("click", function (event) {
      if (event.target.closest("a")) closePanel(false);
    });
    document.addEventListener("pointerdown", function (event) {
      if (!panel.hidden && !root.contains(event.target)) closePanel(false);
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !panel.hidden) closePanel(true);
    });
  }

  function mountSupportWidgets() {
    addStyles();
    document.documentElement.classList.add("pm4-support-mounted");
    document.querySelectorAll("[data-pm4-support]").forEach(initialize);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountSupportWidgets, { once: true });
  } else {
    mountSupportWidgets();
  }
})(window);
