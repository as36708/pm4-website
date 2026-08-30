import Link from "next/link";
import { EXTERNAL_LINKS } from "../links";

const bindingSteps = [
  { number: "01", title: "进 Discord", description: "通过邀请加入 PM4 Discord 服务器" },
  { number: "02", title: "点「绑定账号」", description: "按机器人提示填写 UID 与 TradingView 用户名" },
  { number: "03", title: "自动核对", description: "系统自动匹配返佣账户与绑定资格" },
  { number: "04", title: "指标到手", description: "自动发放身份组并进入指标队列" },
] as const;

const membershipTiers = [
  { name: "实盘会员", qualification: "免费", tone: "standard" },
  { name: "VIP", qualification: "近一年交易量 50 万 USDT 或 499 U", tone: "featured" },
  { name: "SVIP", qualification: "4999 U", tone: "premium" },
] as const;

export default function DiscordBindingLanding() {
  return (
    <section id="review" className="binding-landing" aria-labelledby="binding-landing-title">
      <div className="binding-landing-glow" aria-hidden="true" />

      <header className="binding-landing-hero">
        <span className="binding-landing-kicker"><i /> Discord 自动绑定</span>
        <h1 id="binding-landing-title">绑定交易所账号，<em>30 秒</em>拿指标</h1>
        <p>进入 Discord 完成一次绑定，机器人会自动核对账户、发放身份组并加入指标队列。</p>
        <div className="binding-landing-actions" aria-label="绑定账号快捷操作">
          <a className="binding-landing-primary" href={EXTERNAL_LINKS.discordInvite} target="_blank" rel="noopener noreferrer">
            加入 Discord，现在绑定 <span aria-hidden="true">↗</span>
          </a>
          <Link className="binding-landing-secondary" href="/#exchanges">
            还没注册？先用返佣链接开户 <span aria-hidden="true">→</span>
          </Link>
        </div>
        <small>已经注册过的老用户也要绑一次，系统不会自动认领</small>
      </header>

      <section className="binding-landing-section" aria-labelledby="binding-steps-title">
        <div className="binding-section-heading">
          <span>HOW IT WORKS</span>
          <h2 id="binding-steps-title">四步完成自动绑定</h2>
        </div>
        <ol className="binding-steps">
          {bindingSteps.map((step, index) => (
            <li key={step.number}>
              <b>{step.number}</b>
              <span>
                <strong>{step.title}</strong>
                <small>{step.description}</small>
              </span>
              {index < bindingSteps.length - 1 ? <i aria-hidden="true">→</i> : null}
            </li>
          ))}
        </ol>
      </section>

      <section className="binding-landing-section" aria-labelledby="binding-tiers-title">
        <div className="binding-section-heading">
          <span>MEMBERSHIP</span>
          <h2 id="binding-tiers-title">三档会员权益</h2>
          <p>机器人核对完成后，将按对应条件识别会员等级。</p>
        </div>
        <div className="binding-tiers">
          {membershipTiers.map((tier) => (
            <article className={`binding-tier binding-tier-${tier.tone}`} key={tier.name}>
              <div className="binding-tier-topline">
                <span>{tier.name}</span>
                {tier.tone === "featured" ? <b>推荐</b> : null}
              </div>
              <strong>{tier.qualification}</strong>
              <div className="binding-tier-reference-note">
                <i aria-hidden="true">●</i>
                <span>权益条目等待参考稿补齐</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <aside className="binding-security" aria-label="绑定安全提示">
        <span aria-hidden="true">!</span>
        <p><strong>安全提示</strong>绑定只需要 UID 和 TradingView 用户名，永远不会索取密码、验证码、API 密钥、私钥、助记词。</p>
      </aside>
    </section>
  );
}
