"use client";

import { type MouseEvent, useEffect, useState } from "react";
import SplitText from "./components/SplitText";
import {
  exchanges,
  siteConfig,
} from "./site-data";

type FormErrors = Record<string, string>;

const liveRebateRows = [
  {
    nickname: "林浩然",
    id: "alex***88",
    exchange: "Bitget",
    logo: "/exchanges/bitget.svg",
    amount: "11.38 USDT",
    time: "今日 16:02",
  },
  {
    nickname: "陳子豪",
    id: "river***27",
    exchange: "Bybit",
    logo: "/exchanges/bybit.svg",
    amount: "13.81 USDT",
    time: "今日 15:56",
  },
  {
    nickname: "王若琳",
    id: "noah***91",
    exchange: "BingX",
    logo: "/exchanges/bingx.svg",
    amount: "32.61 USDT",
    time: "今日 15:26",
  },
  {
    nickname: "林芷晴",
    id: "luna***03",
    exchange: "Bitget",
    logo: "/exchanges/bitget.svg",
    amount: "7.87 USDT",
    time: "今日 14:56",
  },
  {
    nickname: "周宇辰",
    id: "ethan***16",
    exchange: "Bybit",
    logo: "/exchanges/bybit.svg",
    amount: "5.99 USDT",
    time: "今日 13:50",
  },
  {
    nickname: "張偉倫",
    id: "mason***42",
    exchange: "BingX",
    logo: "/exchanges/bingx.svg",
    amount: "18.26 USDT",
    time: "今日 13:18",
  },
  {
    nickname: "李静怡",
    id: "claire***75",
    exchange: "Bitget",
    logo: "/exchanges/bitget.svg",
    amount: "9.64 USDT",
    time: "今日 12:42",
  },
  {
    nickname: "黃雅雯",
    id: "owen***64",
    exchange: "Bybit",
    logo: "/exchanges/bybit.svg",
    amount: "24.17 USDT",
    time: "今日 12:08",
  },
];

function trackFrontEvent(eventType: "visit" | "exchange_click" | "transfer_click", exchange = "") {
  void fetch("/api/track", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ eventType, exchange }),
    keepalive: true,
  }).catch(() => undefined);
}

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
          <span className="brand-logo" aria-hidden="true">
            <img src="/images/pm4-logo-horizontal.png" alt="" />
          </span>
        </a>
        <nav className={menuOpen ? "nav-links open" : "nav-links"} aria-label="主要导航">
          {siteConfig.nav.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>
              {item.label}
            </a>
          ))}
        </nav>
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

function ExchangePlatformCard({
  exchange,
  onTransfer,
}: {
  exchange: (typeof exchanges)[number];
  onTransfer: (name: string) => void;
}) {
  const transferContent = (
    <span>身份转移</span>
  );

  return (
    <article className="exchange-platform-card reveal" role="listitem">
      <div className="exchange-card-primary">
        <div className="exchange-card-logo">
          <img src={exchange.logo} alt={`${exchange.name} Logo`} />
        </div>
        <div className="exchange-card-identity">
          <h3>{exchange.name}</h3>
          <p>
            <span>最高返佣</span>
            <strong>{exchange.rebate}</strong>
          </p>
        </div>
      </div>

      <div className="exchange-card-rates" aria-label={`${exchange.name} 交易费率`}>
        <div>
          <span>挂单费率</span>
          <strong>{exchange.makerFee}</strong>
        </div>
        <div>
          <span>吃单费率</span>
          <strong>{exchange.takerFee}</strong>
        </div>
      </div>

      <div className="exchange-card-actions">
        {exchange.registerUrl ? (
          <a
            className="exchange-card-register"
            href={exchange.registerUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackFrontEvent("exchange_click", exchange.name)}
          >
            <span>立即注册</span>
          </a>
        ) : (
          <button className="exchange-card-register" type="button" disabled>
            <span>暂未开放</span>
          </button>
        )}

        {exchange.transferUrl?.startsWith("http") ? (
          <a
            className="exchange-card-transfer"
            href={exchange.transferUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackFrontEvent("transfer_click", exchange.name)}
          >
            {transferContent}
          </a>
        ) : (
          <button
            className="exchange-card-transfer"
            type="button"
            disabled={!exchange.transferUrl}
            onClick={() => {
              if (exchange.transferUrl === "#support") {
                trackFrontEvent("transfer_click", exchange.name);
                window.dispatchEvent(new Event("pm4:open-support"));
                return;
              }
              if (exchange.transferUrl) onTransfer(exchange.name);
            }}
          >
            {transferContent}
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
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          exchange,
          uid: uid.trim(),
          tradingViewUser: tradingViewUser.trim(),
        }),
      });
      const result = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) throw new Error(result.error || "提交失败，请稍后重试。");
    } catch (error) {
      setMessageTone("error");
      setMessage(error instanceof Error ? error.message : "提交失败，请稍后重试。");
      setIsSubmitting(false);
      return;
    }

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
      setHasCopied(true);
      setMessageTone("warning");
      setMessage("申请已提交到后台，但复制失败。请检查浏览器剪贴板权限后重试。");
    } finally {
      setIsSubmitting(false);
    }
  };

  const reviewPreview = `${siteConfig.copyTemplateTitle}

交易所：${exchange || "—"}
交易所 UID：${uid.trim() || "—"}
TradingView 用户名：${tradingViewUser.trim() || "—"}`;

  return (
    <form className="application-form" onSubmit={(event) => event.preventDefault()} noValidate>
      <div className="application-form-heading">
        <span>完成注册后</span>
        <h3>提交交易所 UID 与 TradingView 用户名</h3>
        <p className="application-form-copy">提交以下信息，完成审核后即可申请 PM4 专属指标使用权限。</p>
      </div>
      <div className="form-grid">
        <label>
          <span>交易所选择</span>
          <select
            className={!exchange ? "is-placeholder" : undefined}
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
        <button
          className="button copy-review-button review-zelect-action review-zelect-primary"
          type="button"
          onClick={copyReviewInfo}
          disabled={isSubmitting}
        >
          <span className="review-button-text-wrapper">
            <span className="review-roll-text">
              <span>
                <span className="copy-icon" aria-hidden="true"><i /><i /></span>
                {isSubmitting ? "正在提交" : copyButtonCopied ? "已提交并复制" : "提交并复制审核信息"}
              </span>
              <span aria-hidden="true">
                <span className="copy-icon"><i /><i /></span>
                {isSubmitting ? "正在提交" : copyButtonCopied ? "已提交并复制" : "提交并复制审核信息"}
              </span>
            </span>
          </span>
          <span className="review-button-overlay" aria-hidden="true" />
        </button>
        <a
          className="button discord-review-button review-zelect-action review-zelect-secondary"
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
          <span className="review-button-text-wrapper">
            <span className="review-roll-text">
              <span>前往 Discord 审核 <b aria-hidden="true">↗</b></span>
              <span aria-hidden="true">前往 Discord 审核 <b>↗</b></span>
            </span>
          </span>
          <span className="review-button-overlay" aria-hidden="true" />
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
    const toggleSupportPanel = () => setOpen((current) => !current);
    window.addEventListener("pm4:open-support", toggleSupportPanel);
    return () => window.removeEventListener("pm4:open-support", toggleSupportPanel);
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
  const [selectedExchange, setSelectedExchange] = useState("");

  useEffect(() => {
    const key = `pm4-visit-${new Date().toISOString().slice(0, 10)}`;
    if (window.sessionStorage.getItem(key)) return;
    window.sessionStorage.setItem(key, "1");
    trackFrontEvent("visit");
  }, []);

  useEffect(() => {
    const revealElements = document.querySelectorAll<HTMLElement>(".reveal");

    if (window.innerWidth <= 700 || !("IntersectionObserver" in window)) {
      revealElements.forEach((element) => element.classList.add("visible"));
      return;
    }

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
    document.documentElement.classList.add("reveal-ready");
    revealElements.forEach((element) => reveal.observe(element));
    return () => {
      reveal.disconnect();
      document.documentElement.classList.remove("reveal-ready");
    };
  }, []);

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 1101px)");
    const exchangeSection = document.getElementById("exchanges");
    const cards = Array.from(
      document.querySelectorAll<HTMLElement>(".exchange-card-list .exchange-platform-card"),
    );
    let frame = 0;

    const updateActiveCard = () => {
      frame = 0;
      cards.forEach((card) => card.classList.remove("is-scroll-active"));

      if (!desktopQuery.matches || !exchangeSection || cards.length === 0) return;

      const sectionRect = exchangeSection.getBoundingClientRect();
      if (sectionRect.bottom <= 80 || sectionRect.top >= window.innerHeight) return;

      const focusLine = window.innerHeight * 0.62;
      const visibleCards = cards.filter((card) => {
        const rect = card.getBoundingClientRect();
        return rect.bottom > 80 && rect.top < window.innerHeight;
      });

      const activeCard = visibleCards.reduce<HTMLElement | null>((closest, card) => {
        if (!closest) return card;
        const cardCenter = card.getBoundingClientRect().top + card.offsetHeight / 2;
        const closestCenter = closest.getBoundingClientRect().top + closest.offsetHeight / 2;
        return Math.abs(cardCenter - focusLine) < Math.abs(closestCenter - focusLine) ? card : closest;
      }, null);

      activeCard?.classList.add("is-scroll-active");
    };

    const scheduleUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateActiveCard);
    };

    scheduleUpdate();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    desktopQuery.addEventListener("change", scheduleUpdate);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      desktopQuery.removeEventListener("change", scheduleUpdate);
      cards.forEach((card) => card.classList.remove("is-scroll-active"));
    };
  }, []);

  useEffect(() => {
    if (menuOpen) return;

    const releaseScroll = (element: HTMLElement) => {
      element.style.removeProperty("overflow");
      element.style.removeProperty("overflow-y");
      element.style.removeProperty("position");
      element.style.removeProperty("inset");
      element.style.removeProperty("top");
      element.style.removeProperty("width");
    };

    releaseScroll(document.body);
    releaseScroll(document.documentElement);
  }, [menuOpen]);

  const chooseExchange = (name: string) => {
    trackFrontEvent("transfer_click", name);
    setSelectedExchange(name);
    requestAnimationFrame(() => document.querySelector("#indicator-review")?.scrollIntoView({ behavior: "smooth" }));
  };

  const scrollToDesktopSection = (
    event: MouseEvent<HTMLAnchorElement>,
    sectionId: "exchanges" | "indicator-review",
  ) => {
    if (window.innerWidth < 1024) return;

    event.preventDefault();

    const target = document.getElementById(sectionId);
    if (!target) return;

    const headerOffset = 84;
    const targetTop = Math.max(
      0,
      target.getBoundingClientRect().top + window.scrollY - headerOffset,
    );

    window.scrollTo({
      top: targetTop,
      behavior: "smooth",
    });
  };

  const scrollToMobileSection = (sectionId: "exchanges" | "indicator-review") => {
    if (window.innerWidth >= 1024) return;

    const target = document.getElementById(sectionId);
    if (!target) return;

    if (menuOpen) setMenuOpen(false);

    for (const element of [document.body, document.documentElement]) {
      element.style.removeProperty("overflow");
      element.style.removeProperty("overflow-y");
      element.style.removeProperty("position");
      element.style.removeProperty("inset");
      element.style.removeProperty("top");
      element.style.removeProperty("width");
    }

    target.scrollIntoView({ behavior: "smooth", block: "start" });
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
                    delay={9}
                    duration={0.48}
                    ease="power3.out"
                    splitType="chars"
                    from={{ opacity: 0, y: 36 }}
                    to={{ opacity: 1, y: 0 }}
                    threshold={0.12}
                    rootMargin="-70px"
                    textAlign="left"
                  />
                </span>
                <span className="hero-title-line hero-title-gradient">免费获得专属指标</span>
                <span className="hero-title-line hero-title-third">让交易更简单</span>
              </h1>
              <SplitText
                tag="p"
                text="通过 PM4 专属链接注册合作交易所，最高可享 33% 手续费返佣；满足当前活动审核条件后，还可免费开通 TradingView 支撑阻力位指标。"
                className="hero-lead"
                delay={4}
                duration={0.42}
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
                  className="button premium-cta desktop-hero-action"
                  href="#indicator-review"
                  onClick={(event) => scrollToDesktopSection(event, "indicator-review")}
                >
                  <span className="zelect-button-text-wrapper">
                    <span className="zelect-roll-text">
                      <span className="zelect-button-v1">领取专属指标</span>
                      <span className="zelect-button-v2" aria-hidden="true">领取专属指标</span>
                    </span>
                  </span>
                  <span className="zelect-button-overlay" aria-hidden="true" />
                </a>
                <button
                  className="button premium-cta mobile-hero-action"
                  type="button"
                  onClick={() => scrollToMobileSection("indicator-review")}
                >
                  <span>领取专属指标</span>
                  <span className="premium-cta__arrow" aria-hidden="true">→</span>
                  <ArrowIcon />
                </button>
                <a
                  className="button secondary desktop-hero-action"
                  href="#exchanges"
                  onClick={(event) => scrollToDesktopSection(event, "exchanges")}
                >
                  <span className="zelect-button-text-wrapper">
                    <span className="zelect-roll-text">
                      <span className="zelect-button-v1">查看手续费返佣</span>
                      <span className="zelect-button-v2" aria-hidden="true">查看手续费返佣</span>
                    </span>
                  </span>
                  <span className="zelect-button-overlay" aria-hidden="true" />
                </a>
                <button
                  className="button secondary mobile-hero-action"
                  type="button"
                  onClick={() => scrollToMobileSection("exchanges")}
                >
                  查看手续费返佣 <span>↓</span>
                </button>
              </div>
              <p className="trust-line">
                <span>无需购买指标</span><i /> <span>提交 UID 审核</span><i /> <span>权限定期更新</span>
              </p>
            </div>
            <div className="hero-visual">
              <div className="terminal-label"><i /> PM4 INDICATOR · LIVE PREVIEW</div>
              <div className="hero-interface-backplate" aria-hidden="true">
                <div className="hero-interface-backplate__head">
                  <span>TradingView</span>
                  <i>ONLINE</i>
                </div>
                <div className="hero-interface-backplate__summary">
                  <strong>PM4 Indicator</strong>
                  <span>实时行情分析</span>
                </div>
                <div className="hero-interface-backplate__lines">
                  <span /><span /><span />
                </div>
                <div className="hero-interface-backplate__rows">
                  <p><i /> 支撑位 <b>ACTIVE</b></p>
                  <p><i /> 阻力位 <b>ACTIVE</b></p>
                  <p><i /> 趋势信号 <b>LIVE</b></p>
                </div>
              </div>
              <div className="hero-video-frame">
                <video
                  className="hero-preview-video"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  poster="/images/indicator-preview-poster.jpg"
                  onClick={(event) => {
                    if (event.currentTarget.paused) {
                      void event.currentTarget.play().catch(() => undefined);
                    }
                  }}
                  aria-label="PM4 专属指标演示视频"
                >
                  <source src="/videos/pm4-indicator-preview.mp4" type="video/mp4" />
                </video>
              </div>
            </div>
          </div>
        </section>

        <section className="section exchange-section reveal" id="exchanges">
          <div className="container">
            <div className="split-heading exchange-heading-pc">
              <div className="section-heading">
                <p className="eyebrow"><span />支持交易所</p>
                <h2>
                  <span className="exchange-heading-line">
                    注册合作交易所，<span className="exchange-heading-highlight">即可享受手续费返佣</span>
                  </span>
                  <span className="exchange-heading-line">
                    完成审核后，申请 TradingView 支撑阻力位指标
                  </span>
                </h2>
              </div>
            </div>
            <div className="live-rebate-board" aria-labelledby="live-rebate-title">
              <div className="live-rebate-title-row">
                <div>
                  <p><span aria-hidden="true" />实时返佣记录</p>
                  <h3 id="live-rebate-title">
                    返佣正在<span>实时到账</span>
                  </h3>
                </div>
                <span className="live-rebate-status"><i aria-hidden="true" />实时更新</span>
              </div>
              <div className="live-rebate-table" role="table" aria-label="近期手续费返佣到账记录">
                <div className="live-rebate-head" role="row">
                  <span role="columnheader">用户昵称</span>
                  <span role="columnheader">返佣金额</span>
                  <span role="columnheader">返佣时间</span>
                  <span role="columnheader">状态</span>
                </div>
                <div className="live-rebate-viewport">
                  <div className="live-rebate-body">
                    {[0, 1].map((copy) => (
                      <div
                        className="live-rebate-group"
                        role={copy === 0 ? "rowgroup" : "presentation"}
                        aria-hidden={copy === 1 ? "true" : undefined}
                        key={copy}
                      >
                        {liveRebateRows.map((row) => (
                          <div className="live-rebate-row" role="row" key={`${copy}-${row.id}`}>
                            <div className="live-rebate-user" role="cell">
                              <span className="live-rebate-logo">
                                <img src={row.logo} alt="" aria-hidden="true" />
                              </span>
                              <span>
                                <strong>{row.nickname}</strong>
                                <small>{row.id} · {row.exchange}</small>
                              </span>
                            </div>
                            <strong className="live-rebate-amount" role="cell">{row.amount}</strong>
                            <time role="cell">{row.time}</time>
                            <span className="live-rebate-paid" role="cell">
                              <i aria-hidden="true">✓</i>已到账
                            </span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <p className="live-rebate-note">记录持续滚动 · 实际到账时间与金额以交易所结算为准</p>
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
            <div className="exchange-card-list" role="list" aria-label="交易所返佣与费率">
              {[...exchanges]
                .sort((a, b) => a.desktopOrder - b.desktopOrder)
                .map((exchange) => (
                  <ExchangePlatformCard
                    key={exchange.name}
                    exchange={exchange}
                    onTransfer={chooseExchange}
                  />
                ))}
            </div>
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
        </section>

        <section className="section submit-section reveal" id="submit">
          <div className="container submit-layout" id="indicator-review">
            <div className="submit-intro">
              <SectionHeading
                eyebrow="资料审核"
                title="提交指标审核资料"
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
            <a href="#risk">风险披露</a>
            <button
              className="footer-support-cta"
              type="button"
              aria-label="打开客服入口"
              onClick={() => window.dispatchEvent(new Event("pm4:open-support"))}
            >
              <span className="footer-support-text-wrapper">
                <span className="zelect-roll-text">
                  <span>联系客服</span>
                  <span aria-hidden="true">联系客服</span>
                </span>
              </span>
              <span className="footer-support-overlay" aria-hidden="true" />
              <span className="footer-support-gradient" aria-hidden="true" />
            </button>
          </nav>
        </div>
      </footer>
      <SupportWidget />
    </>
  );
}
