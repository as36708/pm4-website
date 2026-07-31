"use client";

import { useEffect, useMemo, useState } from "react";
import {
  accessRules,
  exchanges,
  faqs,
  heroStats,
  processSteps,
  siteConfig,
} from "./site-data";

type FormErrors = Record<string, string>;

const candles = [
  [67, 6, 1, -10, 27],
  [62, 7, 1, -8, 24],
  [65, 4, 0, -9, 23],
  [59, 6, 1, -12, 29],
  [55, 5, 1, -8, 22],
  [50, 7, 1, -11, 27],
  [53, 4, 0, -8, 20],
  [47, 6, 1, -13, 30],
  [43, 5, 1, -9, 23],
  [38, 7, 1, -11, 29],
  [41, 4, 0, -8, 21],
  [35, 6, 1, -10, 26],
  [32, 5, 1, -12, 28],
  [28, 7, 1, -9, 25],
  [31, 4, 0, -8, 21],
  [26, 6, 1, -11, 28],
  [29, 5, 0, -9, 24],
  [34, 7, 0, -12, 30],
  [39, 5, 0, -8, 22],
  [37, 4, 1, -7, 19],
  [43, 8, 0, -13, 32],
  [47, 6, 0, -10, 26],
  [51, 5, 0, -9, 23],
  [48, 4, 1, -8, 20],
  [56, 7, 0, -11, 28],
] as const;

function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={`section-heading ${align === "center" ? "center" : ""}`}>
      <p className="eyebrow"><span />{eyebrow}</p>
      <h2>{title}</h2>
      {description && <p className="section-copy">{description}</p>}
    </div>
  );
}

function ArrowIcon() {
  return <span className="arrow-icon" aria-hidden="true">↗</span>;
}

function TradingChart({ mode = "support" }: { mode?: string }) {
  return (
    <div className={`trading-chart chart-${mode}`} aria-label="PM4 指标图表预览">
      <div className="chart-head">
        <div className="symbol">
          <span className="coin-mark">₿</span>
          <div><strong>BTC / USDT</strong><small>PERPETUAL · 4H</small></div>
        </div>
        <div className="live-price"><small>当前参考</small><strong>67,428.3</strong></div>
      </div>
      <div className="chart-stage">
        <div className="chart-grid" />
        <div className="zone zone-resistance"><span>阻力区域</span></div>
        <div className="zone zone-support"><span>支撑区域</span></div>
        <div className="current-price-line"><span>67,428.3</span></div>
        {mode === "breakout" && <div className="breakout-mark">突破确认</div>}
        {mode === "multi" && <div className="multi-badge">1H · 4H · 1D</div>}
        <div className="candles" aria-hidden="true">
          {candles.map((candle, index) => {
            const [top, height, up, wickOffset, wickHeight] = candle;
            return (
              <span
                className={`candle ${up ? "up" : "down"}`}
                key={index}
                style={{
                  "--x": `${2.5 + index * 3.65}%`,
                  "--top": `${top}%`,
                  "--height": `${height}%`,
                  "--wick-offset": `${wickOffset}px`,
                  "--wick-height": `${wickHeight}px`,
                } as React.CSSProperties}
              />
            );
          })}
        </div>
        <div className="price-axis">
          <span>69,800</span><span>69,200</span><span>68,600</span><span>68,000</span><span>67,400</span><span>66,800</span>
        </div>
        <div className="time-axis">
          <span>09:00</span><span>12:00</span><span>15:00</span><span>18:00</span><span>21:00</span>
        </div>
      </div>
      <div className="chart-foot">
        <span><i className="legend-dot red" /> PM4 阻力</span>
        <span><i className="legend-dot green" /> PM4 支撑</span>
        <span className="chart-status">MARKET OPEN</span>
      </div>
    </div>
  );
}

function Header({
  menuOpen,
  setMenuOpen,
}: {
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
}) {
  return (
    <header className="site-header">
      <div className="container nav-wrap">
        <a className="brand" href="#home" aria-label="PM4 首页">
          <span className="brand-signal"><i /><i /><i /></span>
          <span>PM4</span>
        </a>
        <nav className={menuOpen ? "nav-links open" : "nav-links"} aria-label="主要导航">
          {siteConfig.nav.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>
              {item.label}
            </a>
          ))}
        </nav>
        <a className="button button-small header-cta" href="#exchanges">
          立即免费开通 <ArrowIcon />
        </a>
        <button
          className="menu-toggle"
          type="button"
          aria-label={menuOpen ? "关闭菜单" : "打开菜单"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span /><span />
        </button>
      </div>
    </header>
  );
}

function ExchangeRow({
  exchange,
  onTransfer,
}: {
  exchange: (typeof exchanges)[number];
  onTransfer: (name: string) => void;
}) {
  const statusTone = (status: string) => {
    if (status === "支持") return "success";
    if (status === "需确认" || status === "可申请") return "warning";
    if (status === "暂未开放") return "muted";
    return "info";
  };

  return (
    <article
      className={`exchange-table-row ${exchange.featured ? "featured" : ""}`}
      role="row"
    >
      <div className="exchange-cell exchange-main" role="cell">
        <div className="exchange-logo">
          <img src={exchange.logo} alt={`${exchange.name} Logo`} />
        </div>
        <div className="exchange-identity">
          <div className="exchange-name-line">
            <h3>{exchange.name}</h3>
            {exchange.featured && <span className="recommended">推荐</span>}
          </div>
          <p>{exchange.description}</p>
        </div>
      </div>

      <div className="exchange-cell exchange-rebate" role="cell">
        <span className="exchange-mobile-label">返佣比例</span>
        <strong>{exchange.rebate}</strong>
        <small>具体以平台结算规则为准</small>
      </div>

      <div className="exchange-cell exchange-status-cell" role="cell">
        <span className="exchange-mobile-label">新用户</span>
        <span className={`exchange-badge ${statusTone(exchange.newUserStatus)}`}>
          {exchange.newUserStatus}
        </span>
      </div>

      <div className="exchange-cell exchange-status-cell" role="cell">
        <span className="exchange-mobile-label">老用户</span>
        <span className={`exchange-badge ${statusTone(exchange.existingUserStatus)}`}>
          {exchange.existingUserStatus}
        </span>
      </div>

      <div className="exchange-cell exchange-status-cell" role="cell">
        <span className="exchange-mobile-label">指标资格</span>
        <span className="exchange-badge info">{exchange.indicatorStatus}</span>
      </div>

      <div className="exchange-cell exchange-actions-cell" role="cell">
        <span className="exchange-mobile-label">操作</span>
        <div className="exchange-actions">
          {exchange.registerUrl ? (
          <a
            className="button exchange-register"
            href={exchange.registerUrl}
            target="_blank"
            rel="noreferrer"
          >
            立即注册
          </a>
        ) : (
            <button className="button exchange-register" type="button" disabled>
              暂未开放
            </button>
        )}
          {exchange.transferUrl ? (
            <button
              className="button exchange-transfer"
              type="button"
              onClick={() => onTransfer(exchange.name)}
            >
              身份转移
            </button>
          ) : (
            <button className="button exchange-transfer" type="button" disabled>
              身份转移
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function ApplicationForm({ selectedExchange }: { selectedExchange: string }) {
  const [exchange, setExchange] = useState(selectedExchange || "");
  const [uid, setUid] = useState("");
  const [tradingViewUser, setTradingViewUser] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [copyButtonCopied, setCopyButtonCopied] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  const [discordPrompted, setDiscordPrompted] = useState(false);
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"success" | "warning" | "error">("success");

  const validate = () => {
    const nextErrors: FormErrors = {};
    if (!exchange) nextErrors.exchange = "请选择交易所。";
    if (!/^[A-Za-z0-9_-]{4,32}$/.test(uid)) {
      nextErrors.uid = "请输入 4–32 位数字、字母、下划线或短横线。";
    }
    if (!tradingViewUser.trim()) nextErrors.tradingViewUser = "请填写 TradingView 用户名。";
    setErrors(nextErrors);
    return nextErrors;
  };

  const clearError = (field: string) => {
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const copyReviewInfo = async () => {
    const nextErrors = validate();
    if (Object.keys(nextErrors).length) return;

    const reviewText = `${siteConfig.copyTemplateTitle}

交易所：${exchange}
交易所 UID：${uid.trim()}
TradingView 用户名：${tradingViewUser.trim()}

申请内容：交易所身份确认及 PM4 专属指标权限开通`;

    try {
      await navigator.clipboard.writeText(reviewText);
      setHasCopied(true);
      setCopyButtonCopied(true);
      setDiscordPrompted(false);
      setMessageTone("success");
      setMessage(siteConfig.copySuccessMessage);
      window.setTimeout(() => setCopyButtonCopied(false), 2000);
    } catch {
      setMessageTone("error");
      setMessage("复制失败，请检查浏览器剪贴板权限后重试。");
    }
  };

  const discordConfigured = /^https?:\/\//.test(siteConfig.discordReviewUrl);

  return (
    <form className="application-form" onSubmit={(event) => event.preventDefault()} noValidate>
      <div className="form-grid">
        <label>
          <span>交易所选择</span>
          <select
            name="exchange"
            value={exchange}
            onChange={(event) => {
              setExchange(event.target.value);
              setHasCopied(false);
              clearError("exchange");
            }}
            aria-invalid={Boolean(errors.exchange)}
            aria-describedby="exchange-error"
          >
            <option value="" disabled>请选择交易所</option>
            {exchanges.map((item) => <option key={item.name}>{item.name}</option>)}
          </select>
          {errors.exchange && <small className="field-error" id="exchange-error">{errors.exchange}</small>}
        </label>
        <label>
          <span>交易所 UID <b>*</b></span>
          <input
            name="uid"
            value={uid}
            placeholder="例如：12345678"
            onChange={(event) => {
              setUid(event.target.value);
              setHasCopied(false);
              clearError("uid");
            }}
            aria-invalid={Boolean(errors.uid)}
            aria-describedby="uid-error"
          />
          {errors.uid && <small className="field-error" id="uid-error">{errors.uid}</small>}
        </label>
        <label className="full">
          <span>TradingView 用户名 <b>*</b></span>
          <input
            name="tradingViewUser"
            value={tradingViewUser}
            placeholder="例如：PM4example"
            onChange={(event) => {
              setTradingViewUser(event.target.value);
              setHasCopied(false);
              clearError("tradingViewUser");
            }}
            aria-invalid={Boolean(errors.tradingViewUser)}
            aria-describedby="tradingview-error"
          />
          {errors.tradingViewUser && (
            <small className="field-error" id="tradingview-error">{errors.tradingViewUser}</small>
          )}
        </label>
      </div>

      <div className="review-actions">
        <button className="button copy-review-button" type="button" onClick={copyReviewInfo}>
          <span className="copy-icon" aria-hidden="true"><i /><i /></span>
          {copyButtonCopied ? "已复制" : "复制审核信息"}
        </button>
        {discordConfigured ? (
          <a
            className="button discord-review-button"
            href={siteConfig.discordReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(event) => {
              if (!hasCopied && !discordPrompted) {
                event.preventDefault();
                setDiscordPrompted(true);
                setMessageTone("warning");
                setMessage("请先填写资料并复制审核信息，再前往 Discord 提交。");
              }
            }}
          >
            前往 Discord 审核 <span aria-hidden="true">↗</span>
          </a>
        ) : (
          <button className="button discord-review-button" type="button" disabled>
            Discord 链接待配置
          </button>
        )}
      </div>
      {message && <p className={`review-message ${messageTone}`} role="status">{message}</p>}
    </form>
  );
}

function SupportWidget() {
  const [open, setOpen] = useState(false);
  const configured = useMemo(
    () => Object.entries(siteConfig.contacts).filter(([, value]) => Boolean(value)),
    [],
  );
  return (
    <div className={`support-widget ${open ? "open" : ""}`}>
      <div className="support-panel">
        <strong>联系 PM4</strong>
        {configured.length ? (
          configured.map(([key, value]) => <a key={key} href={String(value)}>{key}</a>)
        ) : (
          <p>客服渠道正在配置中，请稍后查看。</p>
        )}
      </div>
      <button
        className="support-button"
        type="button"
        aria-label="打开客服入口"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <span>?</span><em>客服</em>
      </button>
    </div>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedExchange, setSelectedExchange] = useState("WEEX");

  useEffect(() => {
    const reveal = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("visible");
      }),
      { threshold: 0.12 },
    );
    document.querySelectorAll(".reveal").forEach((element) => reveal.observe(element));
    return () => reveal.disconnect();
  }, []);

  const chooseExchange = (name: string) => {
    setSelectedExchange(name);
    requestAnimationFrame(() => document.querySelector("#submit")?.scrollIntoView({ behavior: "smooth" }));
  };

  return (
    <>
      <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <main>
        <section className="hero" id="home">
          <div className="hero-glow" />
          <div className="container hero-grid">
            <div className="hero-copy">
              <p className="eyebrow"><span /> PM4 专属交易工具</p>
              <h1>
                <span className="hero-title-line">降低交易成本</span>
                <span className="hero-title-line hero-title-second">
                  <em>免费获得</em><span>专属指标</span>
                </span>
              </h1>
              <p className="hero-lead">
                通过 PM4 专属链接注册合作交易所，在享受手续费优惠的同时，
                满足审核条件即可免费开通 TradingView 支撑阻力位指标。
              </p>
              <div className="hero-actions">
                <a className="button" href="#exchanges">选择交易所 <ArrowIcon /></a>
                <a className="button secondary" href="#process">查看开通流程 <span>↓</span></a>
              </div>
              <p className="trust-line">
                <span>无需购买指标</span><i /> <span>提交 UID 审核</span><i /> <span>权限定期更新</span>
              </p>
            </div>
            <div className="hero-visual">
              <div className="terminal-label"><i /> PM4 INDICATOR · LIVE PREVIEW</div>
              <TradingChart />
              <div className="signal-card signal-two">
                <span>关键区域</span><strong>67,120 — 67,480</strong>
              </div>
            </div>
          </div>
          <div className="container stats-grid">
            {heroStats.map((stat) => (
              <div className="stat" key={stat.label}>
                <strong className={stat.tone === "accent" ? "accent-text" : ""}>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="section process-section reveal" id="process">
          <div className="container">
            <SectionHeading
              eyebrow="开通流程"
              title="三步免费开通"
              description="从注册到获得指标权限，每一步都清楚可追踪。"
            />
            <div className="process-grid">
              {processSteps.map((item, index) => (
                <article className="process-card" key={item.step}>
                  <div className="step-number">{item.step}</div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  {index < processSteps.length - 1 && <span className="step-line" />}
                </article>
              ))}
            </div>
            <p className="section-note">
              <span className="section-note-icon" aria-hidden="true">i</span>
              <span>
                新注册用户可根据当前活动规则获得体验权限，具体开通条件与审核标准以对应交易所页面的最新说明为准。
              </span>
            </p>
          </div>
        </section>

        <section className="section exchange-section reveal" id="exchanges">
          <div className="container">
            <div className="split-heading">
              <SectionHeading
                eyebrow="支持交易所"
                title="选择你使用的交易所"
                description="不同平台的返佣比例、身份转移规则和指标审核条件可能不同，请根据你的账户情况选择。"
              />
              <div className="availability"><i /> 当前开放 4 个申请通道</div>
            </div>
            <div className="exchange-table" role="table" aria-label="交易所返佣与指标资格">
              <div className="exchange-table-head" role="row">
                <span role="columnheader">交易所</span>
                <span role="columnheader">返佣比例</span>
                <span role="columnheader">新用户</span>
                <span role="columnheader">老用户</span>
                <span role="columnheader">指标资格</span>
                <span role="columnheader">操作</span>
              </div>
              {exchanges.map((exchange) => (
                <ExchangeRow key={exchange.name} exchange={exchange} onTransfer={chooseExchange} />
              ))}
            </div>
            <p className="exchange-disclaimer">
              <span aria-hidden="true">i</span>
              点击「立即注册」将离开本网站，前往对应交易所完成注册。PM4 不保管你的账户及资金信息。
            </p>
          </div>
        </section>

        <section className="section rules-section reveal">
          <div className="container rules-layout">
            <div className="rules-intro">
              <SectionHeading
                eyebrow="审核规则"
                title="指标开通与续期规则"
                description="权限按固定周期审核，达到当前活动要求后自动延续。"
              />
              <div className="rule-alert">
                不同交易所的活动规则、交易量要求和体验期限可能不同，请以对应交易所页面显示的最新规则为准。
              </div>
            </div>
            <ol className="rules-list">
              {accessRules.map((rule, index) => (
                <li key={rule}><span>{String(index + 1).padStart(2, "0")}</span><p>{rule}</p></li>
              ))}
            </ol>
          </div>
        </section>

        <section className="section submit-section reveal" id="submit">
          <div className="container submit-layout">
            <div className="submit-intro">
              <SectionHeading
                eyebrow="资料审核"
                title="提交指标审核资料"
                description="填写交易所 UID 和 TradingView 用户名，复制审核信息后前往 Discord 留言申请。"
              />
              <div className="review-steps-card">
                <div className="review-steps-title">
                  <span aria-hidden="true">≡</span>
                  <strong>审核步骤</strong>
                </div>
                <ol>
                  <li><span>1</span><p>填写交易所、UID 和 TradingView 用户名</p></li>
                  <li><span>2</span><p>点击复制审核信息</p></li>
                  <li><span>3</span><p>前往 Discord 指定频道</p></li>
                  <li><span>4</span><p>粘贴信息并等待审核结果</p></li>
                </ol>
                <p className="sensitive-warning">
                  <span aria-hidden="true">!</span>
                  请勿在 Discord 提交交易所密码、验证码、API 密钥或其他敏感信息。
                </p>
              </div>
            </div>
            <ApplicationForm key={selectedExchange} selectedExchange={selectedExchange} />
          </div>
        </section>

        <section className="section faq-section reveal" id="faq">
          <div className="container faq-layout">
            <SectionHeading
              eyebrow="常见问题"
              title="开始之前，你可能想知道"
              description="简明说明注册、审核、权限与风险问题。"
            />
            <div className="faq-list">
              {faqs.map((faq, index) => (
                <details key={faq.question} open={index === 0}>
                  <summary>{faq.question}<span>+</span></summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="final-cta">
          <div className="container final-cta-inner">
            <p className="eyebrow"><span /> READY TO START</p>
            <h2>选择合适的交易所<br />开始你的 <em>PM4</em> 开通流程</h2>
            <div className="hero-actions">
              <a className="button" href="#exchanges">选择交易所 <ArrowIcon /></a>
              <a className="button secondary" href="#submit">已有账户，提交 UID</a>
            </div>
          </div>
        </section>
      </main>

      <footer id="risk">
        <div className="container footer-top">
          <a className="brand" href="#home">
            <span className="brand-signal"><i /><i /><i /></span><span>PM4</span>
          </a>
          <p>
            本网站提供的内容、工具和指标仅用于教育及信息参考，不构成投资建议、交易建议或收益承诺。
            数字资产及合约交易具有较高风险，可能导致部分或全部本金损失。历史表现不代表未来结果，
            请根据自身风险承受能力独立判断。
          </p>
        </div>
        <div className="container footer-bottom">
          <span>© {new Date().getFullYear()} PM4. All rights reserved.</span>
          <nav aria-label="页脚导航">
            <a href="#risk">隐私政策</a><a href="#risk">服务条款</a>
            <a href="#risk">风险披露</a><button type="button" onClick={() => document.querySelector(".support-button")?.dispatchEvent(new MouseEvent("click", { bubbles: true }))}>联系我们</button>
          </nav>
        </div>
      </footer>
      <SupportWidget />
    </>
  );
}
