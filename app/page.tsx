"use client";

import { useEffect, useState } from "react";
import SplitText from "./components/SplitText";
import {
  accessRules,
  desktopAccessRules,
  desktopFaqs,
  exchanges,
  faqs,
  heroStats,
  processSteps,
  siteConfig,
} from "./site-data";

type FormErrors = Record<string, string>;

function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  animateText = false,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  animateText?: boolean;
}) {
  return (
    <div className={`section-heading ${align === "center" ? "center" : ""}`}>
      <p className="eyebrow"><span />{eyebrow}</p>
      {animateText ? (
        <SplitText
          tag="h2"
          text={title}
          delay={34}
          duration={0.68}
          ease="power3.out"
          splitType="chars"
          from={{ opacity: 0, y: 32 }}
          to={{ opacity: 1, y: 0 }}
          threshold={0.12}
          rootMargin="-70px"
          textAlign={align}
        />
      ) : (
        <h2>{title}</h2>
      )}
      {description && (
        animateText ? (
          <SplitText
            tag="p"
            text={description}
            className="section-copy"
            delay={10}
            duration={0.5}
            ease="power3.out"
            splitType="words"
            from={{ opacity: 0, y: 14 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0.12}
            rootMargin="-60px"
            textAlign={align}
          />
        ) : (
          <p className="section-copy">{description}</p>
        )
      )}
    </div>
  );
}

function ArrowIcon() {
  return <span className="arrow-icon" aria-hidden="true">↗</span>;
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

function PhoneExchangeRow({
  exchange,
  onTransfer,
}: {
  exchange: (typeof exchanges)[number];
  onTransfer: (name: string) => void;
}) {
  return (
    <article
      className={`exchange-table-row phone-exchange-only ${exchange.desktopFeatured ? "featured" : ""}`}
      role="row"
    >
      <div className="exchange-cell exchange-main" role="cell">
        <div className="exchange-logo">
          <img src={exchange.logo} alt={`${exchange.name} Logo`} />
        </div>
        <div className="exchange-identity">
          <div className="exchange-name-line">
            <h3>{exchange.name}</h3>
            {exchange.desktopFeatured && <span className="recommended">首推</span>}
          </div>
        </div>
      </div>

      <div className="exchange-cell exchange-rebate" role="cell">
        <span className="exchange-mobile-label">手续费返佣</span>
        <strong>{exchange.rebate}</strong>
      </div>

      <div className="exchange-cell exchange-fee-cell" role="cell">
        <span className="exchange-mobile-label">挂单费率</span>
        <strong>{exchange.makerFee}</strong>
      </div>

      <div className="exchange-cell exchange-fee-cell" role="cell">
        <span className="exchange-mobile-label">吃单费率</span>
        <strong>{exchange.takerFee}</strong>
      </div>

      <div className="exchange-cell exchange-actions-cell" role="cell">
        <span className="exchange-mobile-label">操作</span>
        <div className="exchange-actions">
          {exchange.registerUrl ? (
          <a
            className="button exchange-register"
            href={exchange.registerUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            立即注册
          </a>
        ) : (
            <button className="button exchange-register" type="button" disabled>
              暂未开放
            </button>
        )}
          {exchange.transferUrl?.startsWith("http") ? (
            <a
              className="button exchange-transfer"
              href={exchange.transferUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              身份转移
            </a>
          ) : exchange.transferUrl ? (
            <button
              className="button exchange-transfer"
              type="button"
              onClick={() => {
                if (exchange.transferUrl === "#support") {
                  window.dispatchEvent(new Event("pm4:open-support"));
                  return;
                }
                onTransfer(exchange.name);
              }}
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
      className={`exchange-table-row mobile-exchange-only tablet-exchange-only ${exchange.featured ? "featured" : ""}`}
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
              rel="noopener noreferrer"
            >
              立即注册
            </a>
          ) : (
            <button className="button exchange-register" type="button" disabled>
              暂未开放
            </button>
          )}
          {exchange.transferUrl?.startsWith("http") ? (
            <a
              className="button exchange-transfer"
              href={exchange.transferUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              身份转移
            </a>
          ) : exchange.transferUrl ? (
            <button
              className="button exchange-transfer"
              type="button"
              onClick={() => {
                if (exchange.transferUrl === "#support") {
                  window.dispatchEvent(new Event("pm4:open-support"));
                  return;
                }
                onTransfer(exchange.name);
              }}
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

function DesktopExchangeRow({
  exchange,
  onTransfer,
}: {
  exchange: (typeof exchanges)[number];
  onTransfer: (name: string) => void;
}) {
  return (
    <article
      className={`exchange-table-row desktop-exchange-row desktop-exchange-only reveal ${exchange.desktopFeatured ? "featured" : ""}`}
      role="row"
    >
      <div className="exchange-cell desktop-exchange-main" role="cell">
        <div className="exchange-logo">
          <img src={exchange.logo} alt={`${exchange.name} Logo`} />
        </div>
        <h3>{exchange.name}</h3>
      </div>

      <div className="exchange-cell desktop-exchange-rebate" role="cell">
        <strong>
          <span>{exchange.rebate.replace("%", "")}</span>
          <small>%</small>
        </strong>
      </div>

      <div className="exchange-cell desktop-exchange-fee" role="cell">
        <strong>{exchange.makerFee}</strong>
      </div>

      <div className="exchange-cell desktop-exchange-fee" role="cell">
        <strong>{exchange.takerFee}</strong>
      </div>

      <div className="exchange-cell desktop-exchange-action" role="cell">
        {exchange.registerUrl ? (
          <a
            className="button exchange-register"
            href={exchange.registerUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            立即注册
          </a>
        ) : (
          <button className="button exchange-register" type="button" disabled>
            立即注册
          </button>
        )}
      </div>

      <div className="exchange-cell desktop-exchange-action" role="cell">
        {exchange.transferUrl?.startsWith("http") ? (
          <a
            className="button exchange-transfer"
            href={exchange.transferUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            身份转移
          </a>
        ) : (
          <button
            className="button exchange-transfer"
            type="button"
            disabled={!exchange.transferUrl}
            onClick={() => {
              if (exchange.transferUrl === "#support") {
                window.dispatchEvent(new Event("pm4:open-support"));
                return;
              }
              if (exchange.transferUrl) onTransfer(exchange.name);
            }}
          >
            身份转移
          </button>
        )}
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

  const reviewPreview = `${siteConfig.copyTemplateTitle}

交易所：${exchange || "—"}
交易所 UID：${uid.trim() || "—"}
TradingView 用户名：${tradingViewUser.trim() || "—"}`;

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

      <div className="review-preview" aria-live="polite">
        <strong>审核信息预览</strong>
        <pre>{reviewPreview}</pre>
      </div>

      <div className="review-actions">
        <button className="button copy-review-button" type="button" onClick={copyReviewInfo}>
          <span className="copy-icon" aria-hidden="true"><i /><i /></span>
          {copyButtonCopied ? "已复制" : "复制审核信息"}
        </button>
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
      </div>
      {message && <p className={`review-message ${messageTone}`} role="status">{message}</p>}
    </form>
  );
}

function SupportWidget() {
  const [open, setOpen] = useState(false);
  const [discordHelpOpen, setDiscordHelpOpen] = useState(false);
  const supportLinks = [
    {
      key: "discord",
      label: "Discord 联系",
      icon: "",
      iconSrc: "/icons/discord.svg?v=2",
      href: siteConfig.contacts.discord as string | null,
    },
    {
      key: "telegram",
      label: "Telegram 联系",
      icon: "",
      iconSrc: "/icons/telegram.svg",
      href: siteConfig.contacts.telegram as string | null,
    },
    {
      key: "email",
      label: "邮箱咨询",
      icon: "@",
      iconSrc: null,
      href: siteConfig.contacts.email as string | null,
    },
  ];

  useEffect(() => {
    const showSupportPanel = () => setOpen(true);
    window.addEventListener("pm4:open-support", showSupportPanel);
    return () => window.removeEventListener("pm4:open-support", showSupportPanel);
  }, []);

  useEffect(() => {
    if (!discordHelpOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDiscordHelpOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [discordHelpOpen]);

  return (
    <>
      <div className={`support-widget ${open ? "open" : ""}`}>
        <div className="support-panel desktop-support-panel">
          <strong>联系 PM4 助理</strong>
          <p>提交问题后，PM4 助理会尽快回复。</p>
          <div className="support-links">
            {supportLinks.filter((item) => Boolean(item.href)).map((item) => (
              item.key === "discord" ? (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setDiscordHelpOpen(true);
                  }}
                >
                  <span aria-hidden="true">
                    {item.iconSrc ? <img src={item.iconSrc} alt="" /> : item.icon}
                  </span>
                  <em>{item.label}</em>
                </button>
              ) : item.href ? (
                <a href={item.href} key={item.key} target="_blank" rel="noopener noreferrer">
                  <span aria-hidden="true">
                    {item.iconSrc ? <img src={item.iconSrc} alt="" /> : item.icon}
                  </span>
                  <em>{item.label}</em>
                </a>
              ) : null
            ))}
          </div>
        </div>
        <div className="support-panel mobile-support-panel tablet-support-panel">
          <strong>联系 PM4 助理</strong>
          {supportLinks.filter((item) => Boolean(item.href)).map((item) => (
            <a
              key={item.key}
              href={item.href as string}
              target="_blank"
              rel="noopener noreferrer"
            >
              {item.label}
            </a>
          ))}
        </div>
        <div className="support-panel phone-support-panel">
          <strong>联系 PM4 助理</strong>
          <p>提交问题后，PM4 助理会尽快回复。</p>
          <div className="support-links">
            {supportLinks.filter((item) => Boolean(item.href)).map((item) => (
              item.key === "discord" ? (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setDiscordHelpOpen(true);
                  }}
                >
                  <span aria-hidden="true">
                    {item.iconSrc ? <img src={item.iconSrc} alt="" /> : item.icon}
                  </span>
                  <em>{item.label}</em>
                </button>
              ) : item.href ? (
                <a href={item.href} key={item.key} target="_blank" rel="noopener noreferrer">
                  <span aria-hidden="true">
                    {item.iconSrc ? <img src={item.iconSrc} alt="" /> : item.icon}
                  </span>
                  <em>{item.label}</em>
                </a>
              ) : null
            ))}
          </div>
        </div>
        <button
          className="support-button"
          type="button"
          aria-label={open ? "关闭客服入口" : "打开客服入口"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          <span className="support-chat-icon desktop-support-icon" aria-hidden="true" />
          <span className="support-question mobile-support-icon" aria-hidden="true">?</span>
          <span className="support-chat-icon phone-support-icon" aria-hidden="true" />
          <em className="desktop-support-label">联系助理</em>
          <em className="mobile-support-label">客服</em>
          <em className="phone-support-label">联系助理</em>
        </button>
      </div>

      {discordHelpOpen && (
        <div
          className="discord-help-modal"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setDiscordHelpOpen(false);
          }}
        >
          <div
            className="discord-help-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="discord-help-title"
          >
            <button
              className="discord-help-close"
              type="button"
              aria-label="关闭 Discord 联系说明"
              onClick={() => setDiscordHelpOpen(false)}
            >
              ×
            </button>
            <span className="discord-help-icon" aria-hidden="true">
              <img src="/icons/discord.svg?v=2" alt="" />
            </span>
            <h3 id="discord-help-title">Discord 联系</h3>
            <p>请在「联系助理」频道留言，或点击 PM4 助理头像发送私信。</p>
            <a
              className="discord-help-action"
              href={siteConfig.discordReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              前往 Discord <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      )}
    </>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedExchange, setSelectedExchange] = useState("Bybit");

  useEffect(() => {
    if (window.innerWidth <= 700) return;

    const reveal = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        } else if (entry.target.classList.contains("desktop-exchange-row")) {
          entry.target.classList.remove("visible");
        }
      }),
      { threshold: 0.12 },
    );
    document.querySelectorAll(".reveal").forEach((element) => reveal.observe(element));
    return () => reveal.disconnect();
  }, []);

  const chooseExchange = (name: string) => {
    setSelectedExchange(name);
    requestAnimationFrame(() => document.querySelector("#indicator-review")?.scrollIntoView({ behavior: "smooth" }));
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
                <span className="hero-title-line">
                  <SplitText
                    tag="span"
                    text="降低交易成本"
                    className="hero-split-segment"
                    delay={34}
                    duration={0.7}
                    ease="power3.out"
                    splitType="chars"
                    from={{ opacity: 0, y: 36 }}
                    to={{ opacity: 1, y: 0 }}
                    threshold={0.12}
                    rootMargin="-70px"
                    textAlign="left"
                  />
                </span>
                <span className="hero-title-line hero-title-second">
                  <SplitText
                    tag="span"
                    text="免费获得"
                    className="hero-split-segment hero-title-accent"
                    delay={34}
                    duration={0.7}
                    ease="power3.out"
                    splitType="chars"
                    from={{ opacity: 0, y: 36 }}
                    to={{ opacity: 1, y: 0 }}
                    threshold={0.12}
                    rootMargin="-70px"
                    textAlign="left"
                  />
                  <SplitText
                    tag="span"
                    text="专属指标"
                    className="hero-split-segment"
                    delay={34}
                    duration={0.7}
                    ease="power3.out"
                    splitType="chars"
                    from={{ opacity: 0, y: 36 }}
                    to={{ opacity: 1, y: 0 }}
                    threshold={0.12}
                    rootMargin="-70px"
                    textAlign="left"
                  />
                </span>
              </h1>
              <SplitText
                tag="p"
                text="通过 PM4 专属链接注册合作交易所，最高可享 33% 手续费返佣；满足当前活动审核条件后，还可免费开通 TradingView 支撑阻力位指标。"
                className="hero-lead"
                delay={9}
                duration={0.5}
                ease="power3.out"
                splitType="words"
                from={{ opacity: 0, y: 14 }}
                to={{ opacity: 1, y: 0 }}
                threshold={0.12}
                rootMargin="-60px"
                textAlign="left"
              />
              <div className="hero-actions">
                <a
                  className="button premium-cta"
                  href="#indicator-review"
                >
                  <span>领取专属指标</span>
                  <span className="premium-cta__arrow" aria-hidden="true">→</span>
                  <ArrowIcon />
                </a>
                <a
                  className="button secondary"
                  href="#exchanges"
                >
                  查看手续费返佣 <span>↓</span>
                </a>
              </div>
              <p className="trust-line">
                <span>无需购买指标</span><i /> <span>提交 UID 审核</span><i /> <span>权限定期更新</span>
              </p>
            </div>
            <div className="hero-visual">
              <div className="terminal-label"><i /> PM4 INDICATOR · LIVE PREVIEW</div>
              <div className="hero-video-frame">
                <video
                  className="hero-preview-video"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  aria-label="PM4 专属指标演示视频"
                >
                  <source src="/videos/pm4-indicator-preview.mp4" type="video/mp4" />
                </video>
              </div>
            </div>
          </div>
          <div className="container stats-grid">
            {heroStats.map((stat, index) => (
              <div className="stat" key={stat.label}>
                {index === 0 ? (
                  <>
                    <strong className="desktop-stat-copy">交易返佣</strong>
                    <span className="desktop-stat-copy">降低每笔交易成本</span>
                    <strong className="mobile-stat-copy">{stat.value}</strong>
                    <span className="mobile-stat-copy">{stat.label}</span>
                    <strong className="phone-stat-copy">交易返佣</strong>
                    <span className="phone-stat-copy">降低每笔交易成本</span>
                  </>
                ) : (
                  <>
                    <strong className={stat.tone === "accent" ? "accent-text" : ""}>{stat.value}</strong>
                    <span>{stat.label}</span>
                  </>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="section process-section reveal" id="process">
          <div className="container">
            <SectionHeading
              eyebrow="开通流程"
              title="四步免费开通"
              description="完成注册、KYC、入金与资料审核后，即可申请开通指标权限。"
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
                指标开通需要完成注册、KYC、入金及资料审核。不同交易所的最低入金要求和活动规则可能不同，请以对应交易所页面的最新说明为准。
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
                animateText
              />
              <div className="exchange-heading-side">
                <div className="exchange-heading-actions">
                  <a className="exchange-review-cta" href="#indicator-review">
                    <span>已经注册？提交指标审核</span>
                    <span className="exchange-review-arrow" aria-hidden="true">→</span>
                  </a>
                  <a
                    className="exchange-discord-cta"
                    href={siteConfig.discordCommunityUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img src="/icons/discord.svg" alt="" aria-hidden="true" />
                    <span>加入 Discord</span>
                    <span className="exchange-discord-arrow" aria-hidden="true">↗</span>
                  </a>
                </div>
                <p className="exchange-review-help">
                  完成注册或身份转移后，在此提交 UID 与 TradingView 用户名。
                </p>
              </div>
            </div>
            <div
              className="exchange-marquee desktop-exchange-only"
              role="note"
              aria-label="Bybit 返佣 33%，其他平台返佣 30%，支持身份转移，完成审核可领取 PM4 指标，每 7 天审核续期"
            >
              <div className="exchange-marquee-track" aria-hidden="true">
                {[0, 1].map((copy) => (
                  <div className="exchange-marquee-group" key={copy}>
                    <span>Bybit 返佣 <strong>33%</strong></span>
                    <i>·</i>
                    <span>其他平台返佣 <strong>30%</strong></span>
                    <i>·</i>
                    <span>支持身份转移</span>
                    <i>·</i>
                    <span>完成审核可领取 PM4 指标</span>
                    <i>·</i>
                    <span>每 7 天审核续期</span>
                    <i>·</i>
                  </div>
                ))}
              </div>
            </div>
            <div className="exchange-table" role="table" aria-label="交易所返佣与指标资格">
              <div className="exchange-table-head desktop-exchange-head desktop-exchange-only" role="row">
                <span role="columnheader">交易所</span>
                <span role="columnheader">手续费返佣</span>
                <span role="columnheader">挂单费率</span>
                <span role="columnheader">吃单费率</span>
                <span role="columnheader">立即注册</span>
                <span role="columnheader">身份转移</span>
              </div>
              {[...exchanges]
                .sort((a, b) => a.desktopOrder - b.desktopOrder)
                .map((exchange) => (
                  <DesktopExchangeRow
                    key={`desktop-${exchange.name}`}
                    exchange={exchange}
                    onTransfer={chooseExchange}
                  />
                ))}
              <div className="exchange-table-head mobile-exchange-only" role="row">
                <span role="columnheader">交易所</span>
                <span role="columnheader">返佣比例</span>
                <span role="columnheader">新用户</span>
                <span role="columnheader">老用户</span>
                <span role="columnheader">指标资格</span>
                <span role="columnheader">操作</span>
              </div>
              {exchanges.map((exchange) => (
                <ExchangeRow key={`tablet-${exchange.name}`} exchange={exchange} onTransfer={chooseExchange} />
              ))}
              {[...exchanges]
                .sort((a, b) => a.desktopOrder - b.desktopOrder)
                .map((exchange) => (
                  <PhoneExchangeRow key={`phone-${exchange.name}`} exchange={exchange} onTransfer={chooseExchange} />
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
            <ol className="rules-list desktop-rules-list desktop-rules-only">
              {desktopAccessRules.map((rule, index) => (
                <li key={rule}><span>{String(index + 1).padStart(2, "0")}</span><p>{rule}</p></li>
              ))}
            </ol>
            <ol className="rules-list mobile-rules-only">
              {accessRules.map((rule, index) => (
                <li key={rule}><span>{String(index + 1).padStart(2, "0")}</span><p>{rule}</p></li>
              ))}
            </ol>
            <ol className="rules-list phone-rules-only">
              {desktopAccessRules.map((rule, index) => (
                <li key={rule}><span>{String(index + 1).padStart(2, "0")}</span><p>{rule}</p></li>
              ))}
            </ol>
          </div>
        </section>

        <section className="section submit-section reveal" id="submit">
          <div className="container submit-layout" id="indicator-review">
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
                  <li>
                    <span>1</span>
                    <p>
                      <span className="desktop-submit-copy">选择交易所并填写 UID</span>
                      <span className="mobile-submit-copy">填写交易所、UID 和 TradingView 用户名</span>
                      <span className="phone-submit-copy">选择交易所并填写 UID</span>
                    </p>
                  </li>
                  <li>
                    <span>2</span>
                    <p>
                      <span className="desktop-submit-copy">填写 TradingView 用户名</span>
                      <span className="mobile-submit-copy">点击复制审核信息</span>
                      <span className="phone-submit-copy">填写 TradingView 用户名</span>
                    </p>
                  </li>
                  <li>
                    <span>3</span>
                    <p>
                      <span className="desktop-submit-copy">复制审核信息</span>
                      <span className="mobile-submit-copy">前往 Discord 指定频道</span>
                      <span className="phone-submit-copy">复制审核信息</span>
                    </p>
                  </li>
                  <li>
                    <span>4</span>
                    <p>
                      <span className="desktop-submit-copy">前往 Discord 粘贴提交</span>
                      <span className="mobile-submit-copy">粘贴信息并等待审核结果</span>
                      <span className="phone-submit-copy">前往 Discord 粘贴提交</span>
                    </p>
                  </li>
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
            <div className="faq-list desktop-faq-list desktop-faq-only">
              {desktopFaqs.map((faq, index) => (
                <details key={faq.question} open={index === 0}>
                  <summary>{faq.question}<span>+</span></summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </div>
            <div className="faq-list mobile-faq-only">
              {faqs.map((faq, index) => (
                <details key={faq.question} open={index === 0}>
                  <summary>{faq.question}<span>+</span></summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
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
            <a href="#risk">风险披露</a><button type="button" onClick={() => document.querySelector(".support-button")?.dispatchEvent(new MouseEvent("click", { bubbles: true }))}>联系我们</button>
          </nav>
        </div>
      </footer>
      <SupportWidget />
    </>
  );
}
