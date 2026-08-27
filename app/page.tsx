"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import ReviewSection from "./components/ReviewSection";
import { EXTERNAL_LINKS } from "./links";

const campaigns = [
  { eyebrow: "STEP 01 · REGISTER", title: "通过专属链接注册交易所", art: "1", tone: "gold" },
  { eyebrow: "STEP 02 · VERIFY", title: "完成 KYC、入金与活动任务", art: "2", tone: "silver" },
  { eyebrow: "STEP 03 · ACTIVATE", title: "提交 UID / TV / Discord 用户名，审核后开通指标", art: "3", tone: "blue" },
];

type ExchangeRow = {
  name: string;
  symbol: string;
  logo?: string;
  color: string;
  rebateBenefit: string;
  kyc: string;
  makerFee: string;
  takerFee: string;
  indicator: string;
  reviewTime: string;
  registerUrl?: string;
  transferUrl?: string;
};

const exchangeRows: ExchangeRow[] = [
  { name: "Bybit", symbol: "B", logo: "/logos/bybit.png", color: "#f7a600", rebateBenefit: "33%", kyc: "需要", makerFee: "0.02%", takerFee: "0.055%", indicator: "专属指标", reviewTime: "预计24小时", registerUrl: EXTERNAL_LINKS.bybitRegister, transferUrl: EXTERNAL_LINKS.bybitIdentityTransfer },
  { name: "OKX", symbol: "OKX", color: "#000000", rebateBenefit: "20%", kyc: "需要", makerFee: "0.02%", takerFee: "0.05%", indicator: "专属指标", reviewTime: "预计24小时", registerUrl: EXTERNAL_LINKS.okxRegister },
  { name: "Bitget", symbol: "G", logo: "/logos/bitget.png", color: "#20d5d2", rebateBenefit: "30%", kyc: "需要", makerFee: "0.02%", takerFee: "0.06%", indicator: "专属指标", reviewTime: "预计24小时", registerUrl: EXTERNAL_LINKS.bitgetRegister },
  { name: "Gate", symbol: "G", logo: "/logos/gate.svg", color: "#0068ff", rebateBenefit: "最高 65%", kyc: "需要", makerFee: "0.02%", takerFee: "0.05%", indicator: "专属指标", reviewTime: "预计24小时", registerUrl: EXTERNAL_LINKS.gateRegister },
  { name: "BingX", symbol: "X", logo: "/logos/bingx.png", color: "#2f6df6", rebateBenefit: "30%", kyc: "需要", makerFee: "0.02%", takerFee: "0.05%", indicator: "专属指标", reviewTime: "预计24小时", registerUrl: EXTERNAL_LINKS.bingxRegister },
];

const OKX_ELIGIBILITY_URL = "https://oyidl.co/ul/J6l2R5";
const OKX_TRANSFER_URL = "https://www.okx.com/zh-hans/bind-channel?shortCode=J6l2R5";
const OKX_CHANGE_REASON = "I would like to change my referrer using referral code PPMM44 to receive trading fee rebates.";
type OkxTransferView = "eligibility" | "eligible" | "ineligible";

const organizationJsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "PM4",
  url: "https://cpm4.com",
  logo: "https://cpm4.com/favicon.svg",
  sameAs: [EXTERNAL_LINKS.discordInvite, EXTERNAL_LINKS.telegramContact],
}).replace(/</g, "\\u003c");

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [okxTransferOpen, setOkxTransferOpen] = useState(false);
  const [okxTransferView, setOkxTransferView] = useState<OkxTransferView>("eligibility");
  const [okxReasonCopied, setOkxReasonCopied] = useState(false);
  const [supportContext, setSupportContext] = useState("身份转移、活动条件或返佣未到账");
  const [videoPaused, setVideoPaused] = useState(false);
  const supportDialogRef = useRef<HTMLElement>(null);
  const supportCloseRef = useRef<HTMLButtonElement>(null);
  const supportReturnFocusRef = useRef<HTMLElement | null>(null);
  const okxTransferDialogRef = useRef<HTMLElement>(null);
  const okxTransferReturnFocusRef = useRef<HTMLElement | null>(null);
  const okxTransferEligibilityHeadingRef = useRef<HTMLHeadingElement>(null);
  const okxTransferBackRef = useRef<HTMLButtonElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  function scrollToSection(selector: "#claim" | "#process" | "#exchanges" | "#eligibility" | "#review" | "#rebate-note") {
    setMenuOpen(false);
    document.querySelector(selector)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function openSupport(context = "身份转移、活动条件或返佣未到账") {
    const activeElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    supportReturnFocusRef.current = okxTransferOpen ? okxTransferReturnFocusRef.current : activeElement;
    setSupportContext(context);
    setMenuOpen(false);
    setOkxTransferOpen(false);
    setSupportOpen(true);
  }

  function closeSupport() {
    setSupportOpen(false);
  }

  function openOkxTransfer() {
    okxTransferReturnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setOkxTransferView("eligibility");
    setOkxReasonCopied(false);
    setMenuOpen(false);
    setOkxTransferOpen(true);
  }

  function closeOkxTransfer() {
    setOkxTransferOpen(false);
  }

  async function copyOkxChangeReason() {
    await navigator.clipboard.writeText(OKX_CHANGE_REASON);
    setOkxReasonCopied(true);
    window.setTimeout(() => setOkxReasonCopied(false), 1800);
  }

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPlayback = () => {
      if (motionPreference.matches) {
        video.pause();
        setVideoPaused(true);
      } else {
        void video.play().then(() => setVideoPaused(false)).catch(() => setVideoPaused(true));
      }
    };
    syncPlayback();
    motionPreference.addEventListener("change", syncPlayback);
    return () => motionPreference.removeEventListener("change", syncPlayback);
  }, []);

  function toggleVideo() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) void video.play().then(() => setVideoPaused(false)).catch(() => setVideoPaused(true));
    else {
      video.pause();
      setVideoPaused(true);
    }
  }

  useEffect(() => {
    if (!supportOpen) return;
    const dialog = supportDialogRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    supportCloseRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeSupport();
        return;
      }
      if (event.key !== "Tab" || !dialog) return;
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>("button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex='-1'])"));
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      supportReturnFocusRef.current?.focus();
    };
  }, [supportOpen]);

  useEffect(() => {
    if (!okxTransferOpen) return;
    const dialog = okxTransferDialogRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeOkxTransfer();
        return;
      }
      if (event.key !== "Tab" || !dialog) return;
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>("button:not([disabled]), a[href], [tabindex]:not([tabindex='-1'])"));
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      okxTransferReturnFocusRef.current?.focus();
    };
  }, [okxTransferOpen]);

  useEffect(() => {
    if (!okxTransferOpen) return;
    if (okxTransferView === "eligibility") {
      okxTransferEligibilityHeadingRef.current?.focus();
      return;
    }
    okxTransferBackRef.current?.focus();
  }, [okxTransferOpen, okxTransferView]);

  return (
    <div className="site-shell">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: organizationJsonLd }} />
      <header className="topbar">
        <button className="brand" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="返回顶部">
          <span className="pm4-mark" aria-hidden="true" />
          <span className="pm4-word"><b>PM</b><em>4</em></span>
        </button>

        <nav className={menuOpen ? "nav nav-open" : "nav"} aria-label="主导航">
          <button onClick={() => scrollToSection("#claim")}>领取指标</button>
          <button onClick={() => scrollToSection("#exchanges")}>合作交易所</button>
          <button onClick={() => scrollToSection("#process")}>领取流程</button>
          <button onClick={() => scrollToSection("#eligibility")}>参与条件</button>
          <button onClick={() => scrollToSection("#review")}>提交资料</button>
          <button onClick={() => scrollToSection("#rebate-note")}>返佣说明</button>
          <button onClick={() => window.open(EXTERNAL_LINKS.discordInvite, "_blank", "noopener,noreferrer")}>Discord</button>
          <button className="rwa" onClick={() => openSupport()}>客服支持</button>
        </nav>

        <div className="header-actions">
          <button className="menu-button" aria-label="展开或收起导航" aria-expanded={menuOpen} onClick={() => setMenuOpen((value) => !value)}>
            <span /><span /><span />
          </button>
        </div>
      </header>

      <main id="main-content">

      <section id="claim" className="hero" aria-labelledby="hero-title">
        <div className="hero-lines hero-lines-left" aria-hidden="true" />
        <div className="hero-lines hero-lines-right" aria-hidden="true" />

        <div className="hero-copy">
          <h1 id="hero-title">一次注册，返佣指标双享</h1>
          <p className="hero-value">
            <strong>最高 <span>65%</span> 手续费返佣 + 专属指标</strong>
          </p>

          <nav className="hero-quick-actions" aria-label="快捷操作">
            <a className="hero-quick-action hero-quick-primary" href="#exchanges">
              <span className="hero-action-label">选择交易所注册</span>
            </a>
            <a className="hero-quick-action hero-quick-secondary" href="#review">
              <span className="hero-action-label">已注册，提交审核</span>
            </a>
          </nav>
          <p className="hero-assurance">完成 KYC 与活动任务后，提交 <strong>UID / TV / Discord 用户名</strong> <i>·</i> <strong>预计 24 小时</strong>审核</p>
        </div>

        <div className="market-terminal video-terminal" aria-label="品牌展示视频">
          <video ref={videoRef} className="market-video" muted loop playsInline preload="metadata" poster="/media/market-panel-poster.jpg">
            <source src="/media/market-panel.mp4" type="video/mp4" />
          </video>
          <button className="video-toggle" type="button" aria-pressed={videoPaused} onClick={toggleVideo}>
            {videoPaused ? "播放视频" : "暂停视频"}
          </button>
        </div>
      </section>

      <section id="process" className="campaigns" aria-label="注册交易所领取指标流程">
        <div className="campaign-heading">
          <div className="campaign-title">
            <h2>注册交易所，完成任务领指标</h2>
            <p>按三步完成注册、资格任务和资料提交，审核后开通 TradingView 专属指标。</p>
          </div>
        </div>

        <div className="campaign-grid">
          {campaigns.map((campaign) => (
            <button className="campaign-card" key={campaign.title} onClick={() => {
              if (campaign.art === "1") return scrollToSection("#exchanges");
              if (campaign.art === "3") return scrollToSection("#review");
              return scrollToSection("#eligibility");
            }}>
              <span className={`campaign-art ${campaign.tone}`}>{campaign.art}</span>
              <span className="campaign-text"><small>{campaign.eyebrow}</small><strong>{campaign.title}</strong></span>
              <span className="campaign-arrow">↗</span>
            </button>
          ))}
        </div>
      </section>

      <section id="exchanges" className="spotx exchange-comparison" aria-labelledby="spotx-title">
        <div className="spotx-heading">
          <p>合作交易所权益</p>
          <h2 id="spotx-title">选择合作交易所<br />返佣与指标一次解锁</h2>
          <span>通过专属链接完成注册与活动任务，持续享受手续费返佣，并申请 TradingView 专属指标。</span>
        </div>

        <div className="exchange-table-shell">
          <div className="exchange-table-scroll">
            <table className="exchange-table" aria-label="合作交易所权益对比">
              <thead>
                <tr>
                  <th scope="col">合作交易所</th>
                  <th scope="col">返佣权益</th>
                  <th scope="col">KYC认证</th>
                  <th scope="col">合约 Maker Fee</th>
                  <th scope="col">合约 Taker Fee</th>
                  <th scope="col">指标权益</th>
                  <th scope="col">审核时间</th>
                  <th scope="col">操作</th>
                </tr>
              </thead>
              <tbody>
                {exchangeRows.map((exchange) => (
                  <tr key={exchange.name}>
                    <td className="exchange-name-cell" data-label="合作交易所">
                      <span className="exchange-name">
                        <span className="exchange-badge" style={{ background: exchange.logo ? undefined : exchange.color, color: exchange.logo ? undefined : "#fff" }}>
                          {exchange.logo ? <Image src={exchange.logo} alt="" width={34} height={34} sizes="34px" unoptimized /> : exchange.symbol}
                        </span>
                        <strong>{exchange.name}</strong>
                      </span>
                    </td>
                    <td data-label="返佣权益">{exchange.rebateBenefit}</td>
                    <td data-label="KYC认证">{exchange.kyc}</td>
                    <td data-label="Maker Fee">{exchange.makerFee}</td>
                    <td data-label="Taker Fee">{exchange.takerFee}</td>
                    <td data-label="指标权益"><span className="indicator-benefit">{exchange.indicator}</span></td>
                    <td data-label="审核时间">{exchange.reviewTime}</td>
                    <td className="exchange-actions-cell" data-label="操作">
                      <span className="exchange-actions">
                        {exchange.registerUrl ? (
                          <a
                            className="primary-cta exchange-action"
                            href={exchange.registerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            data-pm4-event="exchange_click"
                            data-pm4-exchange={exchange.name}
                          >立即注册</a>
                        ) : (
                          <button className="primary-cta exchange-action exchange-action-disabled" type="button" disabled title="该交易所注册链接尚未配置">暂未配置</button>
                        )}
                        {exchange.name === "OKX" ? (
                          <button
                            className="primary-cta exchange-action"
                            type="button"
                            data-pm4-event="transfer_click"
                            data-pm4-exchange="OKX"
                            onClick={openOkxTransfer}
                          >身份转移</button>
                        ) : exchange.transferUrl ? (
                          <a
                            className="primary-cta exchange-action"
                            href={exchange.transferUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            data-pm4-event="transfer_click"
                            data-pm4-exchange={exchange.name}
                          >身份转移</a>
                        ) : (
                          <button
                            className="primary-cta exchange-action"
                            type="button"
                            data-pm4-event="transfer_click"
                            data-pm4-exchange={exchange.name}
                            onClick={() => openSupport(`${exchange.name} 已有账户身份转移`)}
                          >咨询身份转移</button>
                        )}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div id="rebate-note" className="exchange-note">
            <span className="exchange-note-copy">
              <strong>返佣到账说明</strong>
              <span>手续费返佣由系统自动结算并发放，无需手动申请。如未按时收到返佣，请联系在线客服协助核查。</span>
              <small>费率为各交易所普通用户公开的永续合约费率，可能随 VIP 等级、产品、地区及活动调整；操作前请以交易所官方费率页为准。</small>
            </span>
            <button className="note-support" type="button" onClick={() => openSupport("返佣未到账核查")}>
              <span className="note-headset" aria-hidden="true" />
              联系客服
            </button>
          </div>

          <section className="gate-vip-promo" aria-labelledby="gate-vip-title">
            <div className="gate-vip-copy">
              <span className="gate-vip-kicker">Gate 专属权益</span>
              <h3 id="gate-vip-title">解锁 Gate VIP10 体验卡</h3>
              <ol className="gate-vip-steps" aria-label="领取步骤">
                <li><b>1</b><span>注册 Gate</span></li>
                <li><b>2</b><span>提交 Gate UID</span></li>
                <li><b>3</b><span>助理登记并发放 VIP10</span></li>
              </ol>
              <div className="gate-vip-actions">
                <button className="gate-vip-primary" type="button" onClick={() => openSupport("Gate VIP10 助理登记")}>联系助理登记</button>
                <a
                  className="gate-vip-secondary"
                  href={EXTERNAL_LINKS.gateRegister}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-pm4-event="exchange_click"
                  data-pm4-exchange="Gate"
                >注册 Gate</a>
              </div>
              <small>实际权益以 Gate 官方活动规则及审核结果为准。</small>
            </div>

            <div className="gate-vip-fees">
              <p>合约手续费对比</p>
              <div className="gate-vip-fee-head" aria-hidden="true"><span>用户权益</span><span>Maker</span><span>Taker</span></div>
              <div className="gate-vip-fee-row"><strong>普通用户</strong><span>0.02%</span><span>0.05%</span></div>
              <div className="gate-vip-fee-row gate-vip-fee-highlight"><strong>VIP10 体验</strong><span>0.01%</span><span>0.03%</span></div>
            </div>

            <div className="gate-vip-card" aria-hidden="true">
              <span className="gate-vip-card-brand">Gate</span>
              <strong>VIP10</strong>
              <span>EXPERIENCE</span>
              <i>PM4 专属体验权益</i>
            </div>
          </section>
        </div>

        <section id="eligibility" className="eligibility-panel" aria-labelledby="eligibility-title">
          <div className="eligibility-heading">
            <span>提交前确认</span>
            <h3 id="eligibility-title">参与条件与审核标准</h3>
            <p>不同交易所的活动门槛可能调整，注册或入金前请先确认当期规则。</p>
          </div>
          <ol className="eligibility-list">
            <li><b>1</b><span><strong>使用专属链接</strong>创建新账户；已有账户需先确认是否符合身份转移条件。</span></li>
            <li><b>2</b><span><strong>完成 KYC</strong>，并按合作交易所当期规则完成入金与交易任务。</span></li>
            <li><b>3</b><span><strong>提交 UID、TradingView 与 Discord 用户名</strong>；请勿提供密码、验证码、API 密钥或助记词。</span></li>
            <li><b>4</b><span><strong>等待资格核验</strong>，通常预计 24 小时；最终结果以交易所活动规则与审核为准。</span></li>
          </ol>
          <p className="eligibility-caution">具体入金金额、币种、交易量及活动条件可能随活动变化。如不确定，请在操作前联系客服确认。</p>
        </section>

        <div className="exchange-recommend">
          <span className="recommend-copy"><strong>不知道该选择哪家交易所？</strong><small>根据交易习惯与权益条件，快速匹配适合你的方案。</small></span>
          <button className="primary-cta spot-cta" onClick={() => openSupport("选择交易所与活动条件确认")}>联系客服确认适用方案</button>
        </div>
      </section>

      <ReviewSection />
      </main>

      <footer className="site-disclosures" aria-labelledby="disclosure-title">
        <div className="disclosure-inner">
          <h2 id="disclosure-title">权益、隐私与风险说明</h2>
          <div className="disclosure-grid">
            <article><h3>推广关系</h3><p>本页包含合作交易所专属推广链接。用户通过链接注册或交易时，PM4 可能获得推广佣金；用户可享权益以交易所最终规则为准。</p></article>
            <article><h3>指标说明</h3><p>审核通过后开通专属指标，具体使用条件以当期活动、交易活跃度和审核结果为准。</p></article>
            <article><h3>资料用途</h3><p>交易所 UID、TradingView 与 Discord 用户名仅用于资格核验、开通指标及发送审核通知。我们不会索取密码、验证码、API 密钥、私钥或助记词。</p></article>
            <article><h3>风险提示</h3><p>数字资产价格波动较大，可能损失全部本金。本页不构成投资建议，服务可用性也可能受地区限制。</p></article>
          </div>
          <p className="disclosure-updated">规则更新：2026 年 8 月 28 日 · 费率、返佣周期和参与资格如有变化，以交易所活动页面及审核结果为准。</p>
          <nav className="disclosure-links" aria-label="法律与隐私"><a href="/privacy">隐私政策</a><a href="/terms">服务条款与风险说明</a></nav>
        </div>
      </footer>

      <aside className="floating-tools" aria-label="快捷工具">
        <button className="support-button" aria-label="打开在线客服" onClick={() => openSupport()}>
          <span className="support-icon" aria-hidden="true"><i /></span>
        </button>
      </aside>

      {okxTransferOpen && (
        <div className="okx-transfer-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) closeOkxTransfer(); }}>
          <section ref={okxTransferDialogRef} className="okx-transfer-dialog" role="dialog" aria-modal="true" aria-labelledby="okx-transfer-title" aria-describedby={`okx-transfer-description-${okxTransferView}`}>
            <button className="okx-transfer-close" type="button" aria-label="关闭 OKX 身份转移窗口" onClick={closeOkxTransfer}>×</button>

            <header className="okx-transfer-header">
              <button className="okx-transfer-kicker" type="button" onClick={() => okxTransferView === "eligibility" ? closeOkxTransfer() : setOkxTransferView("eligibility")}>← 选择其他情况</button>
              <h2 id="okx-transfer-title">更换 OKX 推荐人</h2>
            </header>

            {okxTransferView === "eligibility" && <div className="okx-transfer-content">
              <div className="okx-transfer-intro">
                <h3 ref={okxTransferEligibilityHeadingRef} tabIndex={-1}>首先，确认您可以使用哪种方式<br />更换推荐人</h3>
                <p id="okx-transfer-description-eligibility">符合以下任一条件，即可在不注销 OKX 账户的情况下更换推荐人。</p>
              </div>

              <ol className="okx-transfer-rules" aria-label="OKX 更换推荐人条件">
                <li><b>1</b><span><small>注册后 7 天内</small><strong>无要求</strong></span></li>
                <li><b>2</b><span><small>注册后 7 至 30 天</small><strong>累计交易量不超过 400,000 USD</strong></span></li>
                <li><b>3</b><span><small>注册后 30 至 90 天</small><strong>累计交易量不超过 500,000 USD</strong></span></li>
                <li><b>4</b><span><small>注册超过 90 天</small><strong>近 90 天交易量不超过 5,000,000 USD</strong></span></li>
              </ol>

              <section className="okx-transfer-decision" aria-labelledby="okx-transfer-question">
                <h3 id="okx-transfer-question">您的账户是否符合上述条件之一？</h3>
                <div className="okx-transfer-choice">
                  <button className="okx-transfer-yes" type="button" onClick={() => setOkxTransferView("eligible")}>是，符合 <span>→</span></button>
                  <button type="button" onClick={() => setOkxTransferView("ineligible")}>否，不符合</button>
                </div>

                <div className="okx-transfer-how">
                  <h4><span>?</span> 如何确认？</h4>
                  <div>
                    <p>无需自行计算注册日期或交易量。请先登录 OKX，然后前往官方页面确认账户资格。</p>
                    <a href={OKX_ELIGIBILITY_URL} target="_blank" rel="noopener noreferrer">在 OKX 确认资格 <span>↗</span></a>
                    <ul>
                      <li>如果您看到可以输入推荐码的栏位，说明账户符合条件。请返回本页选择“是，符合”。</li>
                      <li>如果显示“Not eligible”（不符合条件），说明账户暂不满足要求，可选择“否，不符合”联系客服。</li>
                    </ul>
                  </div>
                </div>
              </section>

              <p className="okx-transfer-disclaimer">资格与限额可能调整，最终以 OKX 官方页面显示及审核结果为准。</p>
            </div>}

            {okxTransferView === "eligible" && <div className="okx-transfer-content okx-transfer-result">
              <button ref={okxTransferBackRef} className="okx-transfer-back" type="button" onClick={() => setOkxTransferView("eligibility")}>← 返回</button>
              <div className="okx-transfer-result-heading">
                <span aria-hidden="true">✓</span>
                <h3>无需注销，直接更换推荐人</h3>
                <p id="okx-transfer-description-eligible">您可以在不注销账户的情况下更换推荐人。请按以下步骤操作。</p>
              </div>

              <ol className="okx-transfer-rules okx-transfer-result-steps" aria-label="OKX 更换推荐人步骤">
                <li><b>1</b><strong>在已登录 OKX 的状态下，点击下方按钮进入推荐人变更页面。</strong></li>
                <li><b>2</b><strong>页面打开后，您将看到用于输入新推荐码的栏位以及填写变更原因的栏位。</strong></li>
                <li><b>3</b><strong>在推荐码栏位输入下方代码，填写变更原因后提交即完成。</strong></li>
              </ol>

              <div className="okx-transfer-code"><span>需填写的推荐码</span><strong>PPMM44</strong></div>

              <div className="okx-transfer-reason">
                <strong>变更原因（请复制并粘贴下方英文文本）</strong>
                <p>{OKX_CHANGE_REASON}</p>
                <button type="button" onClick={copyOkxChangeReason}>{okxReasonCopied ? "✓ 已复制" : "▣ 复制原因"}</button>
              </div>

              <a className="okx-transfer-submit" href={OKX_TRANSFER_URL} target="_blank" rel="noopener noreferrer">在 OKX 更换推荐人 <span>↗</span></a>
              <p className="okx-transfer-result-note">如果页面显示“Not eligible”（不符合条件），请返回起始页选择“否，不符合”。</p>
            </div>}

            {okxTransferView === "ineligible" && <div className="okx-transfer-content okx-transfer-result okx-transfer-ineligible">
              <button ref={okxTransferBackRef} className="okx-transfer-back" type="button" onClick={() => setOkxTransferView("eligibility")}>← 返回</button>
              <div className="okx-transfer-result-heading">
                <h3>联系客服确认可用方案</h3>
                <p id="okx-transfer-description-ineligible">如果 OKX 官方页面显示暂不符合条件，请先联系客服核对账户状态与可用方案。</p>
                <strong>请勿仅为变更推荐关系注销账户；具体处理方式以 OKX 官方规则和客服确认结果为准。</strong>
              </div>

              <ol className="okx-transfer-rules okx-transfer-result-steps" aria-label="OKX 不符合条件时的处理步骤">
                <li><b>1</b><strong>保留 OKX 官方页面显示的资格结果或提示信息。</strong></li>
                <li><b>2</b><strong>联系 PM4 客服说明账户情况，并提供交易所名称和 UID。</strong></li>
                <li><b>3</b><strong>等待客服核对后，再按 OKX 当期规则选择安全的处理方案。</strong></li>
              </ol>

              <button className="okx-transfer-submit" type="button" onClick={() => openSupport("OKX 身份转移资格与可用方案确认")}>联系客服确认方案 <span aria-hidden="true">→</span></button>
              <p className="okx-transfer-result-note">联系客服时请勿发送密码、验证码、API 密钥、私钥或助记词。</p>
            </div>}
          </section>
        </div>
      )}

      {supportOpen && (
        <div className="support-dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) closeSupport(); }}>
          <section ref={supportDialogRef} className="support-dialog" role="dialog" aria-modal="true" aria-labelledby="support-dialog-title" aria-describedby="support-dialog-description">
            <button ref={supportCloseRef} className="support-dialog-close" type="button" aria-label="关闭客服窗口" onClick={closeSupport}>×</button>
            <span className="support-dialog-icon" aria-hidden="true"><span className="support-icon"><i /></span></span>
            <h2 id="support-dialog-title">联系客服</h2>
            <p id="support-dialog-description">关于“{supportContext}”，请通过以下渠道联系我们，并附上交易所名称和 UID（请勿发送密码或 API 密钥）。</p>
            <div className="support-dialog-actions">
              <a href={EXTERNAL_LINKS.discordContact} target="_blank" rel="noopener noreferrer">Discord 联系</a>
              <a href={EXTERNAL_LINKS.telegramContact} target="_blank" rel="noopener noreferrer">Telegram 联系</a>
            </div>
            <a className="support-discord-join" href={EXTERNAL_LINKS.discordInvite} target="_blank" rel="noopener noreferrer">首次使用？加入 Discord <span>↗</span></a>
          </section>
        </div>
      )}
    </div>
  );
}
