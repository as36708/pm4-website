"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { EXTERNAL_LINKS } from "../links";
import styles from "../home.module.css";

type Exchange = {
  id: "bybit" | "okx" | "gate" | "bitget";
  name: string;
  rebate: string;
  maker: string;
  taker: string;
  logo: string;
  registerUrl: string;
};

const exchanges: Exchange[] = [
  { id: "bybit", name: "Bybit", rebate: "33%", maker: "0.02%", taker: "0.055%", logo: "/logos/bybit.svg", registerUrl: EXTERNAL_LINKS.bybitRegister },
  { id: "gate", name: "Gate", rebate: "65%", maker: "0.02%", taker: "0.05%", logo: "/logos/gate.svg", registerUrl: EXTERNAL_LINKS.gateRegister },
  { id: "bitget", name: "Bitget", rebate: "30%", maker: "0.02%", taker: "0.06%", logo: "/logos/bitget.svg", registerUrl: EXTERNAL_LINKS.bitgetRegister },
  { id: "okx", name: "OKX", rebate: "20%", maker: "0.02%", taker: "0.05%", logo: "/logos/okx.svg", registerUrl: EXTERNAL_LINKS.okxRegister },
];

const membershipTiers = [
  {
    name: "实盘会员",
    price: "入门 · 免费",
    label: "怎么拿 · 二选一",
    qualification: <>用返佣链接注册，<br />实名+入金 或 有交易</>,
    description: "满足其一即可，入金不限金额。绑定后机器人 30 秒自动核对、自动发。",
    footnote: "入口：进 Discord 点「绑定账号」",
  },
  {
    name: "VIP",
    price: "达标或付费",
    label: "怎么拿 · 二选一",
    qualification: <>近一年交易量 50 万 USDT<br />或直接付费 499 U</>,
    description: "交易量达标自动升，不用申请；付费开通找客服。",
    footnote: "交易量到了自动升（每天核对） · 付费找 #客服与审核",
    featured: true,
  },
  {
    name: "SVIP",
    price: "付费专属",
    label: "怎么拿",
    qualification: <>付费 4999 U</>,
    description: "和交易量、返佣无关，单独的付费档位。",
    footnote: "咨询：#客服与审核 开工单私聊",
  },
] as const;

const matrixRows = [
  { section: "免费内容" },
  { name: "Discord 社区与挑战实盘", detail: "公告、大厅与 US$10,000 挑战每笔开平仓节点", free: "✓ 免费开放", vip: "✓ 免费开放", svip: "✓ 免费开放" },
  { name: "PM4 专属指标工具", detail: "实盘会员资格开通，使用说明以领取页为准", free: "— 需实盘会员", vip: "✓ 自动开通", svip: "✓ 自动开通" },
  { section: "VIP · 达标或付费解锁" },
  { name: "会员·交易思路", detail: "会员频道内的市场分析、执行逻辑与风险边界", free: "— 不包含", vip: "✓ VIP 专属", svip: "✓ 全部 VIP 权益" },
  { name: "复盘资料库", detail: "交易复盘、规则模板与历史资料完整访问", free: "— 不包含", vip: "✓ 完整访问", svip: "✓ 全部 VIP 权益" },
  { section: "SVIP · 付费申请制" },
  { name: "K 线与价格行为系统课", detail: "有效期内系统学习 K 线、关键位置与价格行为", free: "— 不包含", vip: "— 不包含", svip: "✓ 有效期内" },
  { name: "一对一交流", detail: "围绕交易方法、策略理解与复盘问题预约交流", free: "— 不包含", vip: "— 不包含", svip: "◇ 预约制" },
] as const;

const faqs = [
  ["返佣怎么发？", "手续费返佣由系统自动结算并发放，无需手动申请。未按时到账请在 Discord #客服与审核 联系我们。"],
  ["绑定要多久？", "机器人自动核验，通常 30 秒内发放身份组；资料同步中最长 24 小时，结果私信通知。"],
  ["需要完成 KYC 吗？", "按各交易所要求完成注册与实名；PM4 侧只需交易所 UID 和 TradingView 用户名，不收集密码、验证码或 API 密钥。"],
  ["机器人用不了怎么办？", "可使用备用表单提交资料，由人工处理；或在 Discord #客服与审核 开工单。"],
] as const;

const processSteps = [
  { number: 1, title: "用 PM4 专属链接注册交易所", description: "从下方四家里选一家，用专属链接注册。已有账号的可以换推荐人。", href: "#exchanges", link: "选交易所" },
  { number: 2, title: "进 Discord 点「绑定」", description: "在 #从这里开始 频道点按钮，选交易所、填 UID，十秒填完。", href: EXTERNAL_LINKS.discordInvite, link: "绑定 UID", external: true },
  { number: 3, title: "机器人自动开通", description: "自动核验后发 @实盘会员 身份组，TradingView 指标排队开通并私信通知。", href: "#faq", link: "看开通规则" },
  { number: 4, title: "交易量达标自动升 VIP", description: "近一年交易量满 50 万 U 自动升 VIP，不用申请、不用等人工。", href: "#membership", link: "看会员权益" },
] as const;

export default function HomeLanding() {
  const [selectedExchange, setSelectedExchange] = useState<Exchange | null>(null);
  const [videoPaused, setVideoPaused] = useState(false);
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(1);
  const dialogRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  function openExchange(exchange: Exchange) {
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setSelectedExchange(exchange);
  }

  function closeExchange() {
    setSelectedExchange(null);
  }

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      if (preference.matches) {
        video.pause();
        setVideoPaused(true);
      } else {
        void video.play().then(() => setVideoPaused(false)).catch(() => setVideoPaused(true));
      }
    };
    sync();
    preference.addEventListener("change", sync);
    return () => preference.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const root = document.querySelector(`.${styles.site}`);
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const nodes = [...root.querySelectorAll<HTMLElement>(`.${styles.reveal}`)];
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        (entry.target as HTMLElement).classList.add(styles.revealIn);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!selectedExchange) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.querySelector<HTMLElement>("a,button")?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeExchange();
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = [...dialogRef.current.querySelectorAll<HTMLElement>("a[href],button:not([disabled])")];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      returnFocusRef.current?.focus();
    };
  }, [selectedExchange]);

  function toggleVideo() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) void video.play().then(() => setVideoPaused(false));
    else { video.pause(); setVideoPaused(true); }
  }

  return (
    <div className={styles.site}>
      <header className={styles.navbar}>
        <div className={styles.navInner}>
          <Link className={styles.brand} href="/" aria-label="PM4 首页">PM<span>4</span></Link>
          <nav className={styles.navLinks} aria-label="主导航">
            <a href="#exchanges">交易所</a>
            <a href="#membership">会员</a>
            <a href="#faq">FAQ</a>
          </nav>
          <a className={styles.navCta} href={EXTERNAL_LINKS.discordInvite} target="_blank" rel="noopener noreferrer">进入 Discord</a>
        </div>
      </header>

      <main id="main-content">
        <section className={`${styles.section} ${styles.hero}`} aria-labelledby="home-title">
          <div className={styles.glow} aria-hidden="true" />
          <span className={styles.eyebrow}>PM4 返佣与指标</span>
          <h1 id="home-title">一次注册，返佣指标<span>双享。</span></h1>
          <p className={styles.lead}>最高 <b>65%</b> 手续费返佣 + TradingView 专属指标</p>
          <div className={styles.heroActions}>
            <a className={styles.primaryButton} href="#exchanges">选交易所注册 <span>→</span></a>
            <a className={styles.secondaryButton} href={EXTERNAL_LINKS.discordInvite} target="_blank" rel="noopener noreferrer">已注册？去 Discord 绑定</a>
          </div>
          <p className={styles.heroNote}><b>30 秒自动开通</b><span>·</span>机器人自动核验<span>·</span>交易量达标<b>自动升 VIP</b></p>
          <div className={styles.demo}>
            <video ref={videoRef} controls muted loop playsInline preload="metadata" poster="/media/market-panel-poster.jpg" aria-label="PM4 指标演示视频">
              <source src="/media/market-panel.mp4" type="video/mp4" />
            </video>
            <button type="button" className={styles.videoToggle} onClick={toggleVideo} aria-pressed={videoPaused}>{videoPaused ? "播放视频" : "暂停视频"}</button>
          </div>
        </section>

        <section className={`${styles.section} ${styles.centered} ${styles.reveal}`} aria-labelledby="steps-title">
          <span className={styles.eyebrow}>使用流程</span>
          <h2 id="steps-title">注册 → 绑定 → 开通 → <b className={styles.accentText}>升 VIP</b></h2>
          <p className={styles.subtitle}>四步全程机器人处理，最快 30 秒拿到身份组和指标资格。</p>
          <div className={styles.processFlow}>
            <ol className={styles.timeline}>
              {processSteps.map((step) => (
                <li className={activeStep === step.number ? styles.timelineActive : ""} key={step.number} onClick={() => setActiveStep(step.number)} onMouseEnter={() => setActiveStep(step.number)}>
                  <button type="button" aria-pressed={activeStep === step.number} onFocus={() => setActiveStep(step.number)}>
                    <span>{String(step.number).padStart(2, "0")}</span><span><strong>{step.title}</strong><small>{step.description}</small></span>
                  </button>
                  <a href={step.href} target={step.external ? "_blank" : undefined} rel={step.external ? "noopener noreferrer" : undefined}>{step.link} <i>→</i></a>
                </li>
              ))}
            </ol>
            <ProcessPreview step={activeStep} />
          </div>
        </section>

        <section id="exchanges" className={`${styles.section} ${styles.centered}`} aria-labelledby="exchange-title">
          <div className={styles.glow} aria-hidden="true" />
          <span className={styles.eyebrow}>合作交易所</span>
          <h2 id="exchange-title">选择您的交易所</h2>
          <p className={styles.subtitle}>通过专属链接注册，返佣与指标一次解锁。</p>
          <div className={styles.exchangeGrid}>
            {exchanges.map((exchange) => (
              <button className={`${styles.exchangeCard} ${styles.reveal}`} type="button" key={exchange.id} onClick={() => openExchange(exchange)} data-pm4-exchange={exchange.name}>
                <span className={styles.logoWrap}><Image src={exchange.logo} alt={`${exchange.name} 官方标识`} width={48} height={48} sizes="48px" unoptimized /></span>
                <strong>{exchange.name}</strong>
                <small>返佣比例</small>
                <b>{exchange.rebate}</b>
                <span>Maker {exchange.maker} · Taker {exchange.taker}</span>
                <em>点击查看注册方式</em>
              </button>
            ))}
          </div>
          <p className={styles.rebateNote}>返佣由系统自动结算发放，无需手动申请</p>

          <article className={styles.gatePromo} aria-labelledby="gate-title">
            <div>
              <span className={styles.badge}>GATE 专属权益</span>
              <h3 id="gate-title">解锁 Gate VIP10 体验卡</h3>
              <p>注册 Gate → 提交 UID → 助理登记，享 VIP10 费率。实际权益以 Gate 官方活动规则为准。</p>
              <div className={styles.promoActions}>
                <a href={EXTERNAL_LINKS.gateRegister} target="_blank" rel="noopener noreferrer" data-pm4-event="exchange_click" data-pm4-exchange="Gate">注册 Gate →</a>
                <a href={EXTERNAL_LINKS.telegramContact} target="_blank" rel="noopener noreferrer">联系助理登记</a>
              </div>
            </div>
            <div className={styles.feeCompare}>
              <div><span>普通用户</span><b>0.02% / 0.05%</b></div>
              <div><span>VIP10 体验</span><b>0.01% / 0.03%</b></div>
            </div>
          </article>
        </section>

        <section id="membership" className={`${styles.section} ${styles.centered}`} aria-labelledby="membership-title">
          <span className={styles.eyebrow}>会员权益</span>
          <h2 id="membership-title">三档会员，交易量说话</h2>
          <p className={styles.subtitle}>绑定后机器人按交易数据自动判定，达标自动升级。</p>
          <div className={styles.tiers}>
            {membershipTiers.map((tier) => (
              <article className={`${styles.tier} ${tier.featured ? styles.tierFeatured : ""}`} key={tier.name}>
                <div className={styles.tierTop}><span>{tier.name}</span><b>{tier.price}</b></div>
                <small>{tier.label}</small>
                <h3>{tier.qualification}</h3>
                <p>{tier.description}</p>
                <footer>{tier.footnote}</footer>
              </article>
            ))}
          </div>

          <div className={styles.matrixWrap}>
            <table className={styles.matrix}>
              <thead><tr><th>每个等级可以做什么</th><th><b>免费</b><small>加入 Discord 即可</small></th><th><b>实盘会员 / VIP</b><small>绑定后自动判定</small></th><th><b>SVIP</b><small>4,999 USDT · 申请制</small></th></tr></thead>
              <tbody>
                {matrixRows.map((row, index) => row.section ? (
                  <tr className={styles.matrixSection} key={`section-${index}`}><th colSpan={4}>{row.section}</th></tr>
                ) : (
                  <tr key={row.name}><th><b>{row.name}</b><small>{row.detail}</small></th><td>{row.free}</td><td>{row.vip}</td><td>{row.svip}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={styles.matrixNote}>交易量以交易所后台统计为准 · VIP = 近一年交易量 50 万 USDT 自动升，或付费 499 U</p>
        </section>

        <section id="faq" className={`${styles.section} ${styles.faq}`} aria-labelledby="faq-title">
          <span className={styles.eyebrow}>FAQ</span>
          <h2 id="faq-title">常见问题</h2>
          <p className={styles.subtitle}>查找有关 PM4 最常见问题的解答。</p>
          <div className={styles.faqList}>{faqs.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div>
          <div className={styles.fallback}>备用通道：无法使用 Discord？<Link href="/review/manual">提交表单人工处理</Link></div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div><Link href="/privacy">隐私政策</Link><Link href="/terms">服务条款与风险说明</Link></div>
        <p>数字资产价格波动较大，可能损失全部本金。本页不构成投资建议。 · 规则更新：2026-08-30</p>
      </footer>

      <a className={styles.supportFab} href={EXTERNAL_LINKS.telegramContact} target="_blank" rel="noopener noreferrer" aria-label="联系 PM4 客服">联系客服</a>

      {selectedExchange ? (
        <div className={styles.modalBackdrop} role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) closeExchange(); }}>
          <div className={styles.modal} ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="exchange-modal-title">
            <button className={styles.modalClose} type="button" onClick={closeExchange} aria-label="关闭选择窗口">×</button>
            <div className={styles.modalTitle}>
              <Image src={selectedExchange.logo} alt="" width={42} height={42} unoptimized />
              <div><small>选择办理方式</small><h2 id="exchange-modal-title">{selectedExchange.name}</h2></div>
            </div>
            <div className={styles.modalOptions}>
              <a className={styles.modalPrimary} href={selectedExchange.registerUrl} target="_blank" rel="noopener noreferrer" data-pm4-event="exchange_click" data-pm4-exchange={selectedExchange.name}>
                <span>首次注册 {selectedExchange.name}</span><small>通过 PM4 专属链接开户并开始享受返佣。</small><b>→</b>
              </a>
              {selectedExchange.id === "okx" ? <a href={EXTERNAL_LINKS.okxEligibility} target="_blank" rel="noopener noreferrer" onClick={closeExchange} data-pm4-event="transfer_click" data-pm4-exchange={selectedExchange.name}>
                <span>在 OKX 确认资格</span><small>已有账户，查看推荐关系办理步骤。</small><b>→</b>
              </a> : selectedExchange.id === "bybit" ? <Link href={`/transfer/${selectedExchange.id}`} onClick={closeExchange} data-pm4-event="transfer_click" data-pm4-exchange={selectedExchange.name}>
                <span>更换 {selectedExchange.name} 推荐人</span><small>已有账户，查看推荐关系办理步骤。</small><b>→</b>
              </Link> : <div className={styles.modalDisabled} aria-disabled="true">
                <span>更换 {selectedExchange.name} 推荐人</span><small>该交易所的更换指引还没做，请在 Discord 开工单。</small><b>→</b>
              </div>}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ProcessPreview({ step }: { step: 1 | 2 | 3 | 4 }) {
  return <div className={styles.processPreview} aria-live="polite">
    <div className={`${styles.processScreen} ${step === 1 ? "" : styles.discordScreen}`}>
      {step === 1 ? <>
        <div className={styles.previewHeader}>选一家交易所 · <b>用 PM4 专属链接注册</b></div>
        <div className={styles.previewExchanges}>{exchanges.map((exchange) => <div key={exchange.id}><b>{exchange.name}</b><strong>{exchange.rebate}</strong><small>返佣比例</small></div>)}</div>
        <div className={styles.previewOkay}><i>✓</i><span>注册完成 · 记住你的 <b>UID</b>，下一步要用</span></div>
      </> : <>
        <div className={styles.previewHeader}>{step === 2 ? <># <b>从这里开始</b></> : <>机器人私信 · <b>{step === 3 ? "自动开通" : "升级通知"}</b></>}</div>
        <div className={styles.discordMessage}><div className={styles.botAvatar}>P4</div><div className={styles.messageBody}>
          <div className={styles.botName}>PM4 机器人 <i>BOT</i><small>今天 21:05</small></div>
          {step === 2 ? <div className={styles.discordEmbed}><b>绑定交易所 UID</b><p>选择你注册的交易所，填入 UID，机器人自动核验并开通权限。</p><div className={styles.discordChoices}><span>Bybit</span><span>Gate</span><span>Bitget</span><span>OKX</span></div></div> : null}
          {step === 3 ? <><div className={`${styles.discordEmbed} ${styles.successEmbed}`}><b><mark>@实盘会员</mark> 已发放</b><div className={styles.embedFields}><span><small>交易所</small>Bybit</span><span><small>UID</small>1234****89</span><span><small>TradingView</small>PM4User</span></div><p>已经确认有非零交易量，指标已经进入开通队列。管理员完成开通后会私信告诉你。</p></div><span className={styles.discordAction}>我的权益</span></> : null}
          {step === 4 ? <><div className={`${styles.discordEmbed} ${styles.successEmbed}`}><b>升 VIP 了</b><div className={styles.embedFields}><span><small>身份组</small><mark>@VIP</mark> 已发放</span><span><small>近一年交易量</small>Bybit 62.3 万 / 50 万 USDT</span></div><p>会员·交易思路、复盘资料库、会员交流三个频道现在都能进了。</p><footer>近一年交易量保持在 50 万 USDT 以上就一直保留，我这边每天自动核对，不用管。</footer></div><span className={styles.discordAction}>去会员·交易思路</span></> : null}
        </div></div>
        {step === 2 ? <div className={styles.uidField}><small>UID</small><span>1234****89</span><b>提交</b></div> : null}
      </>}
    </div>
  </div>;
}
