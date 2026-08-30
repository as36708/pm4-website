"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { EXTERNAL_LINKS } from "../links";
import styles from "./transfer.module.css";

export type TransferExchange = {
  id: "bybit" | "okx" | "gate" | "bitget";
  name: string;
  logo: string;
  mode: "bybit" | "okx" | "support";
  registerUrl: string;
  officialUrl?: string;
};

const OKX_ELIGIBILITY_URL = EXTERNAL_LINKS.discordInvite;
const OKX_CHANGE_REASON = "I would like to change my referrer to PPMM44 to receive trading fee rebates.";

const guideSteps = {
  bybit: ["用 PM4 链接开新号", "旧号发起身份转移", "完成人脸识别", "同意转移声明", "填新号信息完成", "回 Discord 绑定"],
  okx: ["确认变更条件", "查看 OKX 申请表", "准备推荐码和理由", "提交 OKX 申请", "确认结果和下一步"],
};

const exchangeRates: Record<TransferExchange["id"], string> = {
  bybit: "33%", okx: "20%", gate: "65%", bitget: "30%",
};

export default function TransferExperience({ exchange }: { exchange: TransferExchange }) {
  const [copied, setCopied] = useState<"code" | "reason" | null>(null);

  async function copyText(kind: "code" | "reason", value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(kind);
    window.setTimeout(() => setCopied(null), 1800);
  }

  return (
    <main id="main-content" className={styles.page}>
      <nav className={styles.topbar} aria-label="推荐人指南导航"><div className={styles.navInner}>
        <Link className={styles.brand} href="/">PM<span>4</span></Link>
        <Link className={styles.navItem} href="/#exchanges">交易所</Link><Link className={styles.navItem} href="/#membership">会员</Link><Link className={styles.navItem} href="/#faq">FAQ</Link>
        <a className={styles.discordButton} href={EXTERNAL_LINKS.discordInvite} target="_blank" rel="noopener noreferrer">进入 Discord</a>
      </div></nav>

      <header className={styles.exchangeHead}><div className={styles.glow} aria-hidden="true" />
        <Link className={styles.backLink} href="/#exchanges">← 返回交易所选择</Link>
        <span className={styles.exchangeLogo}><Image src={exchange.logo} alt={`${exchange.name} 官方标识`} width={38} height={38} unoptimized /></span>
        <h1>{exchange.name}</h1><span className={styles.rate}>返佣比例 <b>{exchangeRates[exchange.id]}</b></span>
      </header>

      {exchange.mode === "bybit" ? <GuideFrame exchangeName="Bybit" steps={guideSteps.bybit}><BybitGuide exchange={exchange} /></GuideFrame>
        : exchange.mode === "okx" ? <GuideFrame exchangeName="OKX" steps={guideSteps.okx}><OkxGuide copied={copied} copyText={copyText} /></GuideFrame>
          : <div className={styles.supportWrap}><SupportContent exchange={exchange} /></div>}

      <aside className={styles.security}><b>安全提示</b>办理推荐关系只需要交易所 UID 和账户状态，PM4 永远不会索取密码、验证码、API 密钥、私钥或助记词。</aside>
    </main>
  );
}

function GuideFrame({ exchangeName, steps, children }: { exchangeName: string; steps: string[]; children: ReactNode }) {
  return <div className={styles.guideWrap}><section className={styles.guidePanel} aria-label={`更换 ${exchangeName} 推荐人`}>
    <div className={styles.panelTop}><Link href="/#exchanges">← 选择其他情况</Link><h2>更换 {exchangeName} 推荐人</h2></div>
    <div className={styles.guideBody}><ol className={styles.stepRail} aria-label="办理步骤">
      {steps.map((step, index) => <li className={index === 0 ? styles.activeStep : ""} key={step}><span>{String(index + 1).padStart(2, "0")}</span><b>{step}</b></li>)}
    </ol><div className={styles.guideMain}>{children}</div></div>
  </section></div>;
}

function GuideBlock({ number, title, description, children, warning = false }: { number?: string; title?: string; description?: ReactNode; children?: ReactNode; warning?: boolean }) {
  return <section className={`${styles.guideBlock} ${warning ? styles.warningBlock : ""}`}>
    {number && <span className={styles.blockNumber}>{number}</span>}{title && <h4>{title}</h4>}{description && <div className={styles.blockDescription}>{description}</div>}{children}
  </section>;
}

function ScreenshotPlaceholder({ children }: { children: ReactNode }) {
  return <div className={styles.screenshot}><span aria-hidden="true">▧</span><b>{children}</b><small>【上线时替换为实拍截图】</small></div>;
}

function GuideScreenshot({ src, alt, width, height }: { src: string; alt: string; width: number; height: number }) {
  return <figure className={styles.guideScreenshot}><Image src={src} alt={alt} width={width} height={height} sizes="(max-width: 860px) 88vw, 690px" unoptimized /><figcaption>{alt}</figcaption></figure>;
}

function BybitGuide({ exchange }: { exchange: TransferExchange }) {
  return <>
    <div className={styles.guideIntro}><h3>Bybit <b>推荐人变更指南</b></h3><p>已有 Bybit 账户，可用 Identity Transfer（身份转移）把实名认证迁到 PM4 链接开的新号，从而更换推荐人。</p></div>
    <GuideBlock warning><p>⚠️ <b>动手前先看清楚：</b>转移后 <b>180 天内不能再转</b>；转移后 <b>24 小时内新旧账户都不能提现</b>；旧账户会退回未认证状态，<b>旧号剩余奖励会作废</b>。开始前请平掉全部持仓、领完并用掉旧号奖励。</p></GuideBlock>
    <GuideBlock number="01" title="用 PM4 链接创建新账户" description="先用 PM4 推荐链接开一个新的 Bybit 账户，这个账户暂时不用做实名。通过此链接创建，PM4 会被记录为你的推荐人。">
      <a className={styles.outlineButton} href={exchange.registerUrl} target="_blank" rel="noopener noreferrer">通过 PM4 链接注册 ↗</a><ScreenshotPlaceholder>注册页面截图</ScreenshotPlaceholder>
    </GuideBlock>
    <GuideBlock number="02" title="在旧账户上发起身份转移" description="登录你已有的 Bybit 账户，在「Identity Verification（身份认证）」页面点击「Transfer identity（身份转移）」。">
      <a className={styles.outlineButton} href={exchange.officialUrl} target="_blank" rel="noopener noreferrer">前往 Identity Verification ↗</a><GuideScreenshot src="/guide/bybit-step-02.png" alt="Bybit 身份认证页面中的身份转移入口" width={759} height={223} />
    </GuideBlock>
    <GuideBlock number="03" title="完成人脸识别" description="点击「Facial Verification」→「Start」，用手机扫二维码或打开邮件里的链接自拍。出现「Success」即认证完成。"><GuideScreenshot src="/guide/bybit-step-03.png" alt="Bybit 人脸认证提示页面" width={790} height={644} /></GuideBlock>
    <GuideBlock number="04" title="查看并同意身份转移声明" description="会弹出「Identity Transfer Declaration」。看完上面那三条限制，勾选同意，点 Continue。"><GuideScreenshot src="/guide/bybit-step-04.png" alt="Bybit 身份认证转移声明页面" width={762} height={605} /></GuideBlock>
    <GuideBlock number="05" title="输入新账户信息并完成" description="填入第 1 步新账户的邮箱或手机号，点 Continue，在新账户上确认。完成后新账户变为已认证状态，推荐人即为 PM4。"><GuideScreenshot src="/guide/bybit-step-05.png" alt="Bybit 输入接收账户信息页面" width={780} height={617} /></GuideBlock>
    <GuideBlock number="06" title="回 Discord 绑定新 UID" description="用新账户的 UID 在 Discord 绑定，机器人 30 秒自动核验、自动发身份组。"><a className={styles.nextStep} href={EXTERNAL_LINKS.discordInvite} target="_blank" rel="noopener noreferrer"><span><small>下一步</small><b>前往 Discord 绑定 UID</b></span><i>→</i></a></GuideBlock>
  </>;
}

function OkxGuide({ copied, copyText }: { copied: "code" | "reason" | null; copyText: (kind: "code" | "reason", value: string) => Promise<void> }) {
  return <>
    <div className={styles.guideIntro}><h3>OKX <b>推荐人变更指南</b></h3><p>了解如何将 OKX 推荐人变更为 PM4。</p></div>
    <GuideBlock number="01" title="确认变更条件" description="符合以下任一条件，即可在不注销 OKX 账户的情况下更换推荐人。"><ol className={styles.conditions}>
      <li><b>1</b><span><small>注册后 7 天内</small><strong>无要求</strong></span></li><li><b>2</b><span><small>注册后 7 至 30 天</small><strong>累计交易量不超过 400,000 USD</strong></span></li><li><b>3</b><span><small>注册后 30 至 90 天</small><strong>累计交易量不超过 500,000 USD</strong></span></li><li><b>4</b><span><small>注册超过 90 天</small><strong>近 90 天交易量不超过 5,000,000 USD</strong></span></li>
    </ol></GuideBlock>
    <GuideBlock number="02" title="查看 OKX 申请表" description="无需自己计算注册日期或交易量。请先登录 OKX，按下方顺序复制邀请码和理由，然后通过橙色按钮打开页面。"><GuideScreenshot src="/guide/okx-step-02.png" alt="OKX 邀请码申请表空白界面" width={780} height={583} /><p className={styles.tip}>点击按钮后会出现申请界面。如果能看到这个界面（含邀请码输入框），说明您符合条件。</p></GuideBlock>
    <GuideBlock number="03" title="准备推荐码和变更理由" description="变更理由（前往之前，请先复制下方英文文本）">
      <div className={styles.copyRow}><span>需填写的推荐码</span><strong>PPMM44</strong><button type="button" onClick={() => copyText("code", "PPMM44")}>{copied === "code" ? "✓ 已复制" : "⧉ 复制推荐码"}</button></div>
      <div className={styles.englishReason}>{OKX_CHANGE_REASON}</div><button className={styles.copyButton} type="button" onClick={() => copyText("reason", OKX_CHANGE_REASON)}>{copied === "reason" ? "✓ 已复制" : "⧉ 复制原因"}</button>
    </GuideBlock>
    <GuideBlock number="04" title="提交 OKX 申请" description="当前暂未提供 PM4 已确认的资格申请页"><a className={styles.outlineButton} href={OKX_ELIGIBILITY_URL} target="_blank" rel="noopener noreferrer">前往 Discord 开工单 ↗</a><GuideScreenshot src="/guide/okx-step-04.png" alt="OKX 填写推荐码和申请理由后的提交界面" width={795} height={618} /><p className={styles.tip}>请由客服发送确认过的官方入口。填写并点击 Submit 后，仍需等待 OKX 审核批准。</p></GuideBlock>
    <GuideBlock number="05" title="确认结果和下一步" description={<>如果能看到邀请码输入框，说明您符合条件。按上面的步骤输入邀请码和理由并提交，即完成申请。<br />如果看不到邀请码输入框，说明您不符合条件，可以联系客服确认当前可用方案。</>}>
      <a className={styles.outlineButton} href={EXTERNAL_LINKS.telegramContact} target="_blank" rel="noopener noreferrer">没看到输入框？联系客服确认</a><a className={styles.nextStep} href={EXTERNAL_LINKS.discordInvite} target="_blank" rel="noopener noreferrer"><span><small>下一步</small><b>前往 Discord 绑定 UID</b></span><i>→</i></a>
    </GuideBlock>
  </>;
}

function SupportContent({ exchange }: { exchange: TransferExchange }) {
  return <section className={styles.supportContent} aria-labelledby="support-title"><div className={styles.supportIntro}><h2 id="support-title">联系 PM4 客服<br />核对 {exchange.name} 账户</h2><p>{exchange.name} 的公开推荐人变更指南尚未配置，先由客服按当前规则核对。</p></div>
    <ol className={styles.supportRules}><li><b>1</b><span><small>准备资料</small><strong>准备 {exchange.name} UID 和账户注册状态。</strong></span></li><li><b>2</b><span><small>联系客服</small><strong>说明需要更换推荐关系，请勿发送任何密码或验证码。</strong></span></li><li><b>3</b><span><small>按结果办理</small><strong>客服核对当期规则后，会给出可用的办理方式。</strong></span></li></ol>
    <div className={styles.supportActions}><a href={EXTERNAL_LINKS.telegramContact} target="_blank" rel="noopener noreferrer">联系 PM4 客服 ↗</a><a href={exchange.registerUrl} target="_blank" rel="noopener noreferrer">首次注册 {exchange.name}</a></div><p className={styles.disclaimer}>如交易所不支持变更推荐关系，以交易所官方规则及客服核对结果为准。</p>
  </section>;
}
