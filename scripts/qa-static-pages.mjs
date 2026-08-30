import { spawn } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
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
      message.error ? waiter.reject(new Error(message.error.message)) : waiter.resolve(message.result);
      return;
    }
    if (message.method === "Runtime.exceptionThrown") errors.push(message.params.exceptionDetails?.text || "Runtime exception");
    if (message.method === "Log.entryAdded" && message.params.entry.level === "error") errors.push(message.params.entry.text);
  });
  await send("Runtime.enable");
  await send("Page.enable");
  await send("Log.enable");

  await navigate("http://localhost:3001/", 1280, 900);
  const home = await evaluate(`(() => ({
    title: document.title,
    h1: document.querySelector('h1')?.textContent.trim(),
    video: document.querySelector('video source')?.getAttribute('src'),
    overflow: document.documentElement.scrollWidth > innerWidth,
    ex: window.EX,
    og: document.querySelector('meta[property="og:url"]')?.content
  }))()`);
  assert(home.title === "PM4 · 交易所返佣与 TradingView 指标", "首页标题不正确");
  assert(home.video === "/media/market-panel.mp4", "首页视频未替换");
  assert(!home.overflow, "首页桌面端出现横向滚动");
  assert(home.ex.Bybit.mv === "/transfer-bybit.html" && home.ex.OKX.mv === "/transfer-okx.html", "转移页路径错误");
  assert(home.ex.Gate.mv === "" && home.ex.Bitget.mv === "", "Gate 或 Bitget 被填入了假转移地址");
  const downgrade = await evaluate(`(() => { showEx('Gate'); const item=document.querySelector('#opt-mv'); return {pointer:getComputedStyle(item).pointerEvents, text:document.querySelector('#d2x').textContent}; })()`);
  assert(downgrade.pointer === "none" && downgrade.text.includes("还没做"), "Gate 降级卡没有正确禁用");
  await screenshot("home-desktop.png");
  await navigate("http://localhost:3001/", 390, 844);
  assert(!(await evaluate("document.documentElement.scrollWidth > innerWidth")), "首页手机宽度出现横向滚动");
  await navigate("http://localhost:3001/", 768, 1024);
  assert(!(await evaluate("document.documentElement.scrollWidth > innerWidth")), "首页平板宽度出现横向滚动");

  await navigate("http://localhost:3001/transfer-okx.html", 1280, 900);
  assert(!(await evaluate("document.documentElement.scrollWidth > innerWidth")), "OKX 桌面端出现横向滚动");
  const okxLinks = await evaluate(`(() => ({
    eligibility: [...document.querySelectorAll('a')].find(a => a.textContent.includes('前往 Discord 领取申请入口'))?.href,
    hashCount: [...document.querySelectorAll('a')].filter(a => a.getAttribute('href') === '#').length,
    copyCount: [...document.querySelectorAll('button')].filter(b => b.textContent.includes('复制')).length
  }))()`);
  assert(okxLinks.eligibility === "https://discord.gg/vAASV36A9p", "OKX 开工单链接错误");
  assert(okxLinks.hashCount === 1, "OKX 保留按钮之外还有空链接");
  assert(okxLinks.copyCount === 3, "OKX 复制按钮数量不是 3");
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
  assert(copiedValues[2] === "I would like to change my referrer to PPMM44 to receive trading fee rebates.", "英文理由复制失败");
  await screenshot("okx-desktop.png");
  await navigate("http://localhost:3001/transfer-okx.html", 390, 844);
  assert(!(await evaluate("document.documentElement.scrollWidth > innerWidth")), "OKX 手机宽度出现横向滚动");

  await navigate("http://localhost:3001/transfer-bybit.html", 1280, 900);
  const bybit = await evaluate(`(() => ({
    register: [...document.querySelectorAll('a')].find(a => a.textContent.includes('通过 PM4 链接注册'))?.href,
    identity: [...document.querySelectorAll('a')].find(a => a.textContent.includes('前往身份认证页'))?.href,
    overflow: document.documentElement.scrollWidth > innerWidth
  }))()`);
  assert(bybit.register === "https://partner.bybit.com/b/PPMM44", "Bybit 注册链接错误");
  assert(bybit.identity === "https://www.bybit.com/user/accounts/auth/personal", "Bybit 身份认证链接错误");
  assert(!bybit.overflow, "Bybit 桌面端出现横向滚动");
  await screenshot("bybit-desktop.png");
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
