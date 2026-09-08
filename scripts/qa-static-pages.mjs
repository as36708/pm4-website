import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const chromePath = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
].find(existsSync);
if (!chromePath) throw new Error("未找到可用于验收的 Chrome 或 Edge");
const debugPort = 9333;
const profilePath = await mkdtemp(path.join(os.tmpdir(), "pm4-chrome-qa-"));
const artifactDir = path.resolve("artifacts", "static-qa");
await mkdir(artifactDir, { recursive: true });

const chrome = spawn(chromePath, [
  "--headless=new",
  "--disable-gpu",
  "--no-first-run",
  "--no-default-browser-check",
  `--remote-debugging-port=${debugPort}`,
  `--user-data-dir=${profilePath}`,
  "about:blank",
], { stdio: ["ignore", "ignore", "pipe"], windowsHide: true });

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function waitForDebugger() {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${debugPort}/json/version`);
      if (response.ok) return;
    } catch {}
    await delay(100);
  }
  throw new Error("Chrome 调试端口未启动");
}

let socket;
let nextId = 1;
const pending = new Map();
const errors = [];

function send(method, params = {}) {
  const id = nextId++;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
}

async function evaluate(expression, awaitPromise = false) {
  const response = await send("Runtime.evaluate", { expression, awaitPromise, returnByValue: true, userGesture: true });
  if (response.exceptionDetails) throw new Error(response.exceptionDetails.text || "页面脚本执行失败");
  return response.result?.value;
}

async function navigate(url, width, height) {
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width < 600 });
  await send("Page.navigate", { url });
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (await evaluate("document.readyState" ) === "complete") break;
    await delay(80);
  }
  await delay(250);
}

async function screenshot(name) {
  const result = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  await writeFile(path.join(artifactDir, name), Buffer.from(result.data, "base64"));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

try {
  await waitForDebugger();
  const targetResponse = await fetch(`http://127.0.0.1:${debugPort}/json/new?http://localhost:3001/`, { method: "PUT" });
  const target = await targetResponse.json();
  socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });
  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.id) {
      const waiter = pending.get(message.id);
      if (!waiter) return;
      pending.delete(message.id);
      if (message.error) waiter.reject(new Error(message.error.message));
      else waiter.resolve(message.result);
      return;
    }
    if (message.method === "Runtime.exceptionThrown") errors.push(message.params.exceptionDetails?.text || "Runtime exception");
    if (message.method === "Log.entryAdded" && message.params.entry.level === "error") errors.push(message.params.entry.text);
  });
  await send("Runtime.enable");
  await send("Page.enable");
  await send("Log.enable");
  await send("Network.enable");
  await send("Network.setCacheDisabled", { cacheDisabled: true });

  await navigate("http://localhost:3001/", 1280, 900);
  const home = await evaluate(`(() => ({
    title: document.title,
    h1: document.querySelector('h1')?.textContent.trim(),
    video: document.querySelector('video')?.getAttribute('src'),
    overflow: document.documentElement.scrollWidth > innerWidth,
    ex: window.EX,
    og: document.querySelector('meta[property="og:url"]')?.content
  }))()`);
  assert(home.title === "PM4 · 交易所返佣与 TradingView 指标", "首页标题不正确");
  assert(home.video === "/media/market-panel.mp4", "首页视频未替换");
  assert(!home.overflow, "首页桌面端出现横向滚动");
  assert(home.ex.Bybit.mv === "/transfer-bybit.html", "Bybit 转移页路径错误");
  assert(home.ex.OKX.mv === "/transfer-okx" && home.ex.OKX.mvTitle === "在 OKX 确认资格", "OKX 步骤页链接错误");
  assert(home.ex.Gate.mv === "https://discord.gg/vAASV36A9p" && home.ex.Bitget.mv === "https://discord.gg/vAASV36A9p", "Gate 或 Bitget 工单链接错误");
  const homeSupport = await evaluate("(() => { const button=document.querySelector('.pm4-support-trigger'); const panel=document.querySelector('.pm4-support-panel'); return {button:button?.textContent.trim(),expanded:button?.getAttribute('aria-expanded'),hidden:panel?.hidden}; })()");
  assert(homeSupport.button === "客服" && homeSupport.expanded === "false" && homeSupport.hidden, "首页客服按钮初始状态错误");
  const gateFallback = await evaluate(`(() => { showEx('Gate'); const item=document.querySelector('#opt-mv'); return {pointer:getComputedStyle(item).pointerEvents}; })()`);
  assert(gateFallback.pointer !== "none", "Gate Discord 工单入口不可点击");
  await evaluate("document.querySelector('#ovl').classList.remove('on')");
  await screenshot("v0.2.4-home-desktop-closed.png");
  const homeSupportOpen = await evaluate("(() => { document.querySelector('.pm4-support-trigger').click(); const button=document.querySelector('.pm4-support-trigger'); const panel=document.querySelector('.pm4-support-panel'); const links=[...panel.querySelectorAll('a')].map(a => ({label:a.textContent.trim(),href:a.href,target:a.target,rel:a.rel})); return {expanded:button.getAttribute('aria-expanded'),hidden:panel.hidden,links}; })()");
  assert(homeSupportOpen.expanded === "true" && !homeSupportOpen.hidden, "首页客服面板未展开");
  assert(homeSupportOpen.links[0].href === "https://discord.gg/zb8mmuWdEs" && homeSupportOpen.links[1].href === "https://t.me/tianshijin10", "客服链接错误");
  assert(homeSupportOpen.links.every(link => link.target === "_blank" && link.rel.includes("noopener") && link.rel.includes("noreferrer")), "客服链接安全属性错误");
  await screenshot("v0.2.4-home-desktop-open.png");
  await evaluate("document.querySelector('.pm4-support-trigger').click()");
  assert(await evaluate("document.querySelector('.pm4-support-panel').hidden"), "再次点击客服按钮未收起");
  await evaluate("document.querySelector('.pm4-support-trigger').click()");
  await evaluate("document.body.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}))");
  assert(await evaluate("document.querySelector('.pm4-support-panel').hidden"), "点击面板外未收起");
  await navigate("http://localhost:3001/", 390, 844);
  assert(!(await evaluate("document.documentElement.scrollWidth > innerWidth")), "首页手机宽度出现横向滚动");
  await navigate("http://localhost:3001/", 768, 1024);
  assert(!(await evaluate("document.documentElement.scrollWidth > innerWidth")), "首页平板宽度出现横向滚动");

  await navigate("http://localhost:3001/transfer-okx.html", 1280, 900);
  assert(!(await evaluate("document.documentElement.scrollWidth > innerWidth")), "OKX 桌面端出现横向滚动");
  const okxLinks = await evaluate(`(() => ({
    eligibility: [...document.querySelectorAll('a')].find(a => a.textContent.includes('前往 Discord 领取申请入口'))?.href,
    application: [...document.querySelectorAll('a')].find(a => a.textContent.includes('打开 OKX 申请页'))?.href,
    hashCount: [...document.querySelectorAll('a')].filter(a => a.getAttribute('href') === '#').length,
    copyCount: [...document.querySelectorAll('button')].filter(b => b.textContent.includes('复制')).length
  }))()`);
  assert(okxLinks.eligibility === "https://discord.gg/vAASV36A9p", "OKX 开工单链接错误");
  assert(okxLinks.application === "https://oyidl.co/ul/J6l2R5", "OKX 申请页链接错误");
  assert(okxLinks.hashCount === 1, "OKX 保留按钮之外还有空链接");
  assert(okxLinks.copyCount === 2, "OKX 复制按钮数量不是 2");
  await send("Browser.grantPermissions", { origin: "http://localhost:3001", permissions: ["clipboardReadWrite", "clipboardSanitizedWrite"] });
  const copiedValues = await evaluate(`(async () => {
    const result=[];
    for (const button of [...document.querySelectorAll('button.cbtn')]) {
      button.click(); await new Promise(r => setTimeout(r, 80)); result.push(await navigator.clipboard.readText());
    }
    return result;
  })()`, true);
  assert(copiedValues[0] === "PPMM44", "推荐码复制失败");
  assert(copiedValues[1].includes("PM4") && copiedValues[1].includes("返佣"), "中文理由复制失败");
  await navigate("http://localhost:3001/transfer-okx.html", 390, 844);
  assert(!(await evaluate("document.documentElement.scrollWidth > innerWidth")), "OKX 手机宽度出现横向滚动");
  const mobileSupport = await evaluate("(() => { const button=document.querySelector('.pm4-support-trigger'); const rect=button.getBoundingClientRect(); return {width:rect.width,height:rect.height,right:innerWidth-rect.right,bottom:innerHeight-rect.bottom,paddingBottom:parseFloat(getComputedStyle(document.body).paddingBottom)}; })()");
  assert(mobileSupport.width >= 48 && mobileSupport.width <= 56 && mobileSupport.height >= 48 && mobileSupport.height <= 56, "手机客服按钮尺寸不合规");
  assert(mobileSupport.right >= 15 && mobileSupport.bottom >= 15, "手机客服按钮安全边距不足");
  assert(mobileSupport.paddingBottom >= 88, "手机页面底部未给客服按钮留出空间");
  await screenshot("v0.2.4-okx-mobile-closed.png");
  await evaluate("document.querySelector('.pm4-support-trigger').click()");
  assert(!(await evaluate("document.querySelector('.pm4-support-panel').hidden")), "OKX 手机客服面板未展开");
  await screenshot("v0.2.4-okx-mobile-open.png");

  await navigate("http://localhost:3001/transfer-bybit.html", 1280, 900);
  const bybit = await evaluate(`(() => ({
    register: [...document.querySelectorAll('a')].find(a => a.textContent.includes('通过 PM4 链接注册'))?.href,
    identity: [...document.querySelectorAll('a')].find(a => a.textContent.includes('前往身份认证页'))?.href,
    overflow: document.documentElement.scrollWidth > innerWidth
  }))()`);
  assert(bybit.register === "https://partner.bybit.com/b/PPMM44", "Bybit 注册链接错误");
  assert(bybit.identity === "https://www.bybit.com/user/accounts/auth/personal", "Bybit 身份认证链接错误");
  assert(!bybit.overflow, "Bybit 桌面端出现横向滚动");
  await navigate("http://localhost:3001/transfer-bybit.html", 390, 844);
  assert(!(await evaluate("document.documentElement.scrollWidth > innerWidth")), "Bybit 手机宽度出现横向滚动");

  assert(errors.length === 0, `浏览器控制台错误: ${errors.join(" | ")}`);
  console.log(JSON.stringify({ passed: true, home, okxLinks, copiedValues, bybit, screenshots: artifactDir }, null, 2));
} finally {
  try { socket?.close(); } catch {}
  chrome.kill();
  await Promise.race([
    new Promise((resolve) => chrome.once("exit", resolve)),
    delay(1500),
  ]);
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try { await rm(profilePath, { recursive: true, force: true }); break; }
    catch { await delay(250); }
  }
}
