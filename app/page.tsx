"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  accessRules,
  exchanges,
  faqs,
  heroStats,
  processSteps,
  siteConfig,
  whyPm4,
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

function ExchangeCard({
  exchange,
  onSubmit,
}: {
  exchange: (typeof exchanges)[number];
  onSubmit: (name: string) => void;
}) {
  const [logoUnavailable, setLogoUnavailable] = useState(false);

  return (
    <article className={`exchange-card ${exchange.featured ? "featured" : ""}`}>
      <div className="exchange-top">
        <div className="exchange-logo">
          {!logoUnavailable ? (
            <img
              src={exchange.logoPath}
              alt={`${exchange.name} Logo`}
              onError={() => setLogoUnavailable(true)}
            />
          ) : (
            <span className="exchange-logo-placeholder" aria-label={`${exchange.name} Logo 占位`}>
              <i /><i /><b>{exchange.logoFallback}</b>
            </span>
          )}
        </div>
        <div className="exchange-name-line">
          <h3>{exchange.name}</h3>
          {exchange.featured && <span className="recommended">推荐</span>}
        </div>
        <span className={`status ${exchange.status === "开放中" ? "active" : ""}`}>
          {exchange.status}
        </span>
      </div>
      <p className="exchange-summary">{exchange.description}</p>
      <div className="rebate-line">
        <small>手续费优惠</small>
        <strong>{exchange.rebateText}</strong>
      </div>
      <dl className="exchange-details">
        <div><dt>新用户支持</dt><dd>{exchange.newUserStatus}</dd></div>
        <div><dt>老用户绑定</dt><dd>{exchange.existingUserStatus}</dd></div>
        <div><dt>指标开通要求</dt><dd>{exchange.indicatorRequirement}</dd></div>
      </dl>
      <div className="exchange-actions">
        {exchange.inviteUrl ? (
          <a
            className={`button exchange-primary ${exchange.featured ? "" : "secondary"}`}
            href={exchange.inviteUrl}
            target="_blank"
            rel="noreferrer"
          >
            立即注册 <ArrowIcon />
          </a>
        ) : (
          <button
            className={`button exchange-primary ${exchange.featured ? "featured-disabled" : "secondary"}`}
            type="button"
            disabled
          >
            注册链接待开放
          </button>
        )}
        <button
          className="button secondary exchange-submit"
          type="button"
          onClick={() => onSubmit(exchange.name)}
        >
          提交 UID <span>→</span>
        </button>
      </div>
    </article>
  );
}

function ApplicationForm({ selectedExchange }: { selectedExchange: string }) {
  const [formState, setFormState] = useState("idle");
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (form: HTMLFormElement) => {
    const data = new FormData(form);
    const nextErrors: FormErrors = {};
    const uid = String(data.get("uid") || "").trim();
    const tvUser = String(data.get("tradingViewUser") || "").trim();
    const contact = String(data.get("contact") || "").trim();
    if (!/^[A-Za-z0-9_-]{4,32}$/.test(uid)) {
      nextErrors.uid = "请输入 4–32 位数字、字母、下划线或短横线。";
    }
    if (!tvUser) nextErrors.tradingViewUser = "请填写 TradingView 用户名。";
    if (!contact) nextErrors.contact = "请填写可联系到你的方式。";
    if (!data.get("agreement")) nextErrors.agreement = "提交前请同意隐私与风险声明。";
    return nextErrors;
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (formState === "loading") return;
    const form = event.currentTarget;
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setFormState("loading");

    if (!siteConfig.enableLiveSubmission) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setFormState("demo-success");
      return;
    }

    try {
      const response = await fetch(siteConfig.formEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      if (!response.ok) throw new Error("提交服务暂时不可用，请稍后重试。");
      setFormState("success");
    } catch (error) {
      setErrors({ form: error instanceof Error ? error.message : "提交失败，请稍后重试。" });
      setFormState("idle");
    }
  };

  if (formState === "success" || formState === "demo-success") {
    const demo = formState === "demo-success";
    return (
      <div className="success-panel" role="status">
        <span className="success-icon">✓</span>
        <p className="eyebrow"><span />{demo ? "演示提交完成" : "资料已提交"}</p>
        <h3>{demo ? "表单验证已通过" : "资料已成功提交"}</h3>
        <p>
          {demo
            ? "当前版本尚未连接后台，资料没有发送或保存。接入审核 API 后即可启用真实提交。"
            : "我们会根据 UID、注册关系及当前活动规则进行审核，结果将通过你填写的联系方式通知。"}
        </p>
        <button className="button secondary" type="button" onClick={() => setFormState("idle")}>
          返回表单
        </button>
      </div>
    );
  }

  return (
    <form className="application-form" onSubmit={submit} noValidate>
      <div className="form-grid">
        <label>
          <span>交易所选择</span>
          <select name="exchange" defaultValue={selectedExchange || "WEEX"}>
            {exchanges.map((exchange) => <option key={exchange.name}>{exchange.name}</option>)}
          </select>
        </label>
        <label>
          <span>交易所 UID</span>
          <input name="uid" placeholder="例如：12345678" aria-describedby="uid-error" />
          {errors.uid && <small className="field-error" id="uid-error">{errors.uid}</small>}
        </label>
        <label>
          <span>TradingView 用户名</span>
          <input name="tradingViewUser" placeholder="你的 TradingView 用户名" />
          {errors.tradingViewUser && <small className="field-error">{errors.tradingViewUser}</small>}
        </label>
        <label>
          <span>Discord 用户名或联系方式</span>
          <input name="contact" placeholder="Discord / Telegram / 邮箱" />
          {errors.contact && <small className="field-error">{errors.contact}</small>}
        </label>
        <label>
          <span>注册时间</span>
          <input name="registeredAt" type="date" />
        </label>
        <label>
          <span>是否通过 PM4 链接注册</span>
          <select name="registeredViaPm4" defaultValue="">
            <option value="" disabled>请选择</option>
            <option value="yes">是</option>
            <option value="no">否 / 不确定</option>
          </select>
        </label>
        <label className="full">
          <span>备注</span>
          <textarea name="notes" rows={4} placeholder="可补充注册关系、账户情况或其他说明" />
        </label>
      </div>
      <label className="check-field">
        <input name="agreement" type="checkbox" />
        <span>我已阅读并同意隐私说明与风险披露，确认资料仅用于注册关系及指标权限审核。</span>
      </label>
      {errors.agreement && <small className="field-error agreement-error">{errors.agreement}</small>}
      {errors.form && <div className="form-error">{errors.form}</div>}
      <div className="form-submit">
        <button className="button" type="submit" disabled={formState === "loading"}>
          {formState === "loading" ? "正在验证…" : "提交审核"} <ArrowIcon />
        </button>
        <p>
          {siteConfig.enableLiveSubmission
            ? "提交后将进入资料审核队列。"
            : "演示环境 · 当前不会发送或保存你的资料"}
        </p>
      </div>
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
                description="各平台规则独立配置。未确认的数据不会显示虚构比例或承诺。"
              />
              <div className="availability"><i /> 当前开放 3 个交易所通道</div>
            </div>
            <div className="exchange-grid">
              {exchanges.map((exchange) => (
                <ExchangeCard key={exchange.name} exchange={exchange} onSubmit={chooseExchange} />
              ))}
            </div>
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
                title="提交开通资料"
                description="请确保 UID、注册关系与联系方式准确。资料只用于资格审核。"
              />
              <div className="security-card">
                <span className="lock-mark">⌁</span>
                <div><strong>信息用途明确</strong><p>仅用于注册关系核验、活动审核与指标权限开通。</p></div>
              </div>
              <p className="api-note">正式上线前请将审核接口连接至安全数据库或受控 Webhook。</p>
            </div>
            <ApplicationForm key={selectedExchange} selectedExchange={selectedExchange} />
          </div>
        </section>

        <section className="section about-section reveal">
          <div className="container about-layout">
            <div className="about-visual">
              <div className="pm-monogram">P<span>M</span>4</div>
              <div className="about-caption"><i /> PROCESS OVER PROMISES</div>
            </div>
            <div className="about-copy">
              <SectionHeading eyebrow="关于 PM4" title="为什么通过 PM4 开通" />
              <p>
                PM4 长期专注于比特币和加密市场交易，通过直播、复盘和实盘挑战记录真实交易过程。
                指标主要用于辅助识别关键支撑和阻力区域，不构成任何投资建议。
              </p>
              <div className="why-grid">
                {whyPm4.map((item) => <div key={item}><span>✓</span>{item}</div>)}
              </div>
            </div>
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
