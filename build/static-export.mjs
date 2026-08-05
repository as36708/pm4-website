import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const clientDir = path.join(root, "dist", "client");
const serverDir = path.join(root, "dist", "server");
const assetsDir = path.join(clientDir, "assets");
const cssFile = fs.readdirSync(assetsDir).find((file) => /^index-.*\.css$/.test(file));

if (!cssFile) throw new Error("Built CSS asset not found");

const marketRows = [
  ["C", "#6a8cff", "CXMTUSDT", "8.171", "+7.73%"],
  ["M", "#ff94c6", "MINIMAXUSDT", "33.23", "+12.79%"],
  ["Z", "#e7e7e7", "ZHIPUUSDT", "125.92", "+5.86%"],
  ["B", "#f7a600", "BTCUSDT", "63,501.2", "+0.01%"],
].map(([letter, color, symbol, price, change]) => `
  <button class="market-row demo-action" data-message="${symbol} market selected">
    <span class="market-symbol"><span class="coin" style="background:${color}">${letter}</span><b>${symbol}</b></span>
    <span class="market-price">${price}</span><span class="positive">${change}</span>
  </button>`).join("");

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Bybit Front Three — UI Concept</title>
  <meta name="description" content="A high-fidelity, non-transactional recreation of the first three Bybit homepage sections for interface study." />
  <meta property="og:title" content="Your crypto journey, simplified." />
  <meta property="og:description" content="A high-fidelity crypto exchange homepage UI concept." />
  <meta property="og:image" content="__ORIGIN__/og.png" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:image" content="__ORIGIN__/og.png" />
  <link rel="icon" href="/favicon.svg" />
  <link rel="stylesheet" href="/assets/${cssFile}" />
</head>
<body>
<main class="site-shell">
  <header class="topbar">
    <button class="brand demo-action" data-message="Back to the top"><span class="brand-mark"><i></i></span><span>BYBIT</span></button>
    <nav class="nav" aria-label="Primary navigation">
      ${["Buy Crypto","Markets","Trade","TradFi","Tools","Finance","More"].map((item) => `<button class="demo-action" data-message="${item} is a demo navigation item">${item}<span class="chevron">⌄</span></button>`).join("")}
      <button class="rwa demo-action" data-message="RWA demo selected">◈ RWA</button>
    </nav>
    <div class="header-actions">
      <button class="search demo-action" aria-label="Search" data-message="Search is ready for product integration">⌕</button>
      <button class="deposit-small demo-action" data-message="Demo only — no real deposit will be created">Deposit</button>
      <button class="round-action demo-action" aria-label="Account" data-message="Demo account panel">●</button>
      <button class="round-action demo-action" aria-label="Notifications" data-message="No new demo notifications">◌</button>
      <button class="menu-button" aria-label="Toggle navigation" aria-expanded="false"><span></span><span></span><span></span></button>
    </div>
  </header>

  <section class="hero" aria-labelledby="hero-title">
    <div class="hero-lines hero-lines-left" aria-hidden="true"></div><div class="hero-lines hero-lines-right" aria-hidden="true"></div>
    <div class="hero-copy">
      <p class="kicker"><span></span> THE NEXT ERA OF TRADING</p>
      <h1 id="hero-title">Your crypto journey,<br />simplified.</h1>
      <p class="hero-sub">Explore markets, discover opportunities and manage every move from one intelligent platform.</p>
      <button class="primary-cta demo-action" data-message="Demo only — deposit flow is not connected">Deposit Now <span>↗</span></button>
      <p class="concept-note">UI concept · no real trading or deposits</p>
    </div>

    <div class="market-terminal" aria-label="Market overview">
      <div class="terminal-top">
        <article class="trend-card panel">
          <div class="panel-label"><span class="flame">◆</span> Trending</div>
          <div class="asset-name"><span class="token gold-token">₮</span> XAUT/USDT</div>
          <div class="trend-price"><strong>4,044.9</strong><span>-0.42%</span></div>
          <div class="mini-chart" aria-label="Illustrative price trend"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
          <div class="chart-labels"><span>APR</span><span>MAY</span><span>JUN</span><span>JUL</span><span>AUG</span></div>
        </article>
        <article class="cfd-card panel">
          <div class="panel-label">CFD</div>
          <div class="cfd-row"><span class="flag">🇪🇺</span><span class="cfd-name"><b>EURUSD+</b><small>Euro vs US Dollar</small></span><span class="cfd-value"><b>1.15069</b><small class="negative">-0.01%</small></span></div>
          <div class="cfd-row"><span class="flag">🇦🇺</span><span class="cfd-name"><b>AUDNZD+</b><small>Australian Dollar vs NZ Dollar</small></span><span class="cfd-value"><b>1.19273</b><small class="positive">+0.04%</small></span></div>
          <div class="cfd-row"><span class="flag">£</span><span class="cfd-name"><b>GBPUSD</b><small>Great Britain Pound vs US Dollar</small></span><span class="cfd-value"><b>1.34268</b><small class="negative">-0.05%</small></span></div>
        </article>
      </div>
      <article class="market-list panel">
        <div class="market-tabs" role="tablist"><button data-tab="coins">Hot Coins</button><button class="active" data-tab="derivatives">Hot Derivatives</button><button class="view-all demo-action" data-message="All markets demo">View all</button></div>
        <div class="market-rows">${marketRows}</div>
      </article>
    </div>
  </section>

  <section class="campaigns" aria-label="Featured campaigns">
    <div class="campaign-heading"><div><span>02</span><p>Featured campaigns</p></div><div class="campaign-controls"><button aria-label="Previous">←</button><button aria-label="Next">→</button></div></div>
    <div class="campaign-grid">
      <button class="campaign-card demo-action" data-message="Gold Rush campaign selected"><span class="campaign-art gold">X</span><span class="campaign-text"><small>GOLD RUSH</small><strong>Rewards up to $10K in XAUT</strong></span><span class="campaign-arrow">↗</span></button>
      <button class="campaign-card demo-action" data-message="TradFi campaign selected"><span class="campaign-art silver">S</span><span class="campaign-text"><small>TRADFI</small><strong>Join Stock Earnings Season to share $1M</strong></span><span class="campaign-arrow">↗</span></button>
      <button class="campaign-card demo-action" data-message="Token Buzz campaign selected"><span class="campaign-art blue">C</span><span class="campaign-text"><small>TOKEN BUZZ</small><strong>Trade CXMT and win up to $100K</strong></span><span class="campaign-arrow">↗</span></button>
    </div>
  </section>

  <section class="spotx" aria-labelledby="spotx-title">
    <div class="spotx-heading"><p>SPOT X</p><h2 id="spotx-title">Never miss a Spot listing —<br />and a chance to earn.</h2><span>Share rewarding prize pools from our newest token events.</span></div>
    <div class="spot-grid">
      <button class="spot-card demo-action" data-message="GRVT event selected"><span class="spot-number">01</span><span class="spot-type">Token Splash</span><strong>Share 2,500,000 GRVT</strong><span class="spot-token" style="background:#e9ff63;color:#111">G</span><span class="spot-symbol">GRVT</span><span class="spot-link">View event <b>↗</b></span></button>
      <button class="spot-card demo-action" data-message="BSB event selected"><span class="spot-number">02</span><span class="spot-type">Token Splash</span><strong>Share 2,000,000 BSB</strong><span class="spot-token" style="background:#7b5cff;color:#fff">B</span><span class="spot-symbol">BSB</span><span class="spot-link">View event <b>↗</b></span></button>
      <button class="spot-card demo-action" data-message="MNT event selected"><span class="spot-number">03</span><span class="spot-type">Puzzle Hunt</span><strong>Share 200,000 USDT</strong><span class="spot-token" style="background:#ff9e2b;color:#111">M</span><span class="spot-symbol">MNT</span><span class="spot-link">View event <b>↗</b></span></button>
    </div>
    <button class="primary-cta spot-cta demo-action" data-message="Spot X explorer demo">Explore Spot X <span>↗</span></button>
  </section>

  <aside class="floating-tools" aria-label="Quick tools"><button class="demo-action" data-message="Quick tools opened">⌘</button><button class="demo-action" data-message="Support demo opened">◔</button></aside>
  <div class="toast" role="status" hidden></div>
</main>
<script>
  const nav = document.querySelector('.nav');
  const menu = document.querySelector('.menu-button');
  menu?.addEventListener('click', () => { const open = nav.classList.toggle('nav-open'); menu.setAttribute('aria-expanded', String(open)); });
  const toast = document.querySelector('.toast'); let toastTimer;
  function showToast(message) { toast.textContent = message; toast.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.hidden = true, 2400); }
  document.querySelectorAll('.demo-action').forEach((button) => button.addEventListener('click', () => { if (button.classList.contains('brand')) window.scrollTo({top:0,behavior:'smooth'}); showToast(button.dataset.message || 'Demo action'); }));
  const datasets = {
    derivatives: [['C','#6a8cff','CXMTUSDT','8.171','+7.73%'],['M','#ff94c6','MINIMAXUSDT','33.23','+12.79%'],['Z','#e7e7e7','ZHIPUUSDT','125.92','+5.86%'],['B','#f7a600','BTCUSDT','63,501.2','+0.01%']],
    coins: [['B','#f7a600','BTCUSDT','63,501.2','+0.82%'],['E','#7385ff','ETHUSDT','3,488.91','+1.41%'],['S','#b8a2ff','SOLUSDT','147.28','-0.36%'],['X','#d5a634','XAUTUSDT','4,044.9','-0.42%']]
  };
  document.querySelectorAll('[data-tab]').forEach((tab) => tab.addEventListener('click', () => {
    document.querySelectorAll('[data-tab]').forEach((item) => item.classList.toggle('active', item === tab));
    document.querySelector('.market-rows').innerHTML = datasets[tab.dataset.tab].map(([letter,color,symbol,price,change]) => '<button class="market-row"><span class="market-symbol"><span class="coin" style="background:'+color+'">'+letter+'</span><b>'+symbol+'</b></span><span class="market-price">'+price+'</span><span class="'+(change.startsWith('+')?'positive':'negative')+'">'+change+'</span></button>').join('');
  }));
  const campaignData = [
    ['gold','X','GOLD RUSH','Rewards up to $10K in XAUT'],['silver','S','TRADFI','Join Stock Earnings Season to share $1M'],['blue','C','TOKEN BUZZ','Trade CXMT and win up to $100K'],['orange','%','CASHBACK','$3,000,000 prize pool event'],['violet','D','DUAL ASSET','Bigger rewards, smarter yield']
  ]; let campaignIndex = 0;
  function renderCampaigns() { document.querySelector('.campaign-grid').innerHTML = Array.from({length:3},(_,offset)=>campaignData[(campaignIndex+offset)%campaignData.length]).map(([tone,art,eyebrow,title]) => '<button class="campaign-card"><span class="campaign-art '+tone+'">'+art+'</span><span class="campaign-text"><small>'+eyebrow+'</small><strong>'+title+'</strong></span><span class="campaign-arrow">↗</span></button>').join(''); }
  const controls = document.querySelectorAll('.campaign-controls button'); controls[0]?.addEventListener('click',()=>{campaignIndex=(campaignIndex-1+campaignData.length)%campaignData.length;renderCampaigns();}); controls[1]?.addEventListener('click',()=>{campaignIndex=(campaignIndex+1)%campaignData.length;renderCampaigns();});
</script>
</body>
</html>`;

fs.writeFileSync(path.join(clientDir, "index.html"), html);
fs.rmSync(serverDir, { recursive: true, force: true });
fs.mkdirSync(serverDir, { recursive: true });

fs.writeFileSync(path.join(serverDir, "index.js"), `export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/" || url.pathname === "/index.html") {
      const assetUrl = new URL("/index.html", url);
      const response = await env.ASSETS.fetch(new Request(assetUrl, request));
      const html = (await response.text()).replaceAll("__ORIGIN__", url.origin);
      return new Response(html, { status: response.status, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=300" } });
    }
    return env.ASSETS.fetch(request);
  }
};\n`);

fs.writeFileSync(path.join(serverDir, "wrangler.json"), JSON.stringify({
  name: "bybit-front-three-concept",
  main: "index.js",
  compatibility_date: "2026-08-04",
  compatibility_flags: [],
  assets: { directory: "../client", binding: "ASSETS" },
  no_bundle: true,
}));

console.log("Static Sites deployment output prepared.");
