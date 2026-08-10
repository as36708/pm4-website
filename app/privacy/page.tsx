import type { Metadata } from "next";
import Link from "next/link";
import { EXTERNAL_LINKS } from "../links";

export const metadata: Metadata = {
  title: "隐私政策",
  description: "PM4 网站的数据收集、使用、保留与删除说明。",
  alternates: { canonical: "/privacy" },
  openGraph: { url: "/privacy", title: "隐私政策 | PM4", description: "PM4 网站的数据收集、使用、保留与删除说明。" },
  twitter: { card: "summary_large_image", title: "隐私政策 | PM4", description: "PM4 网站的数据收集、使用、保留与删除说明。" },
};

export default function PrivacyPage() {
  return (
    <main id="main-content" className="legal-page">
      <p className="legal-kicker">PRIVACY</p>
      <h1>隐私政策</h1>
      <p className="legal-updated">更新日期：2026 年 8 月 10 日</p>
      <section><h2>我们收集什么</h2><p>当你提交指标审核资料时，我们会收集所选交易所、交易所 UID、TradingView 用户名，以及你自愿填写的 Discord 用户名。请不要提交密码、验证码、API 密钥、助记词或身份证件。</p></section>
      <section><h2>访问与点击统计</h2><p>网站会统计按天去重的访问和合作交易所按钮点击。服务器只使用经过单向哈希处理的短期来源标识进行防刷、限流和去重，不向管理后台发送原始 IP。浏览器本地存储仅记录当天是否已提交访问统计；开启“请勿追踪”时不发送该统计。</p></section>
      <section><h2>用途、共享与保留</h2><p>资料仅用于核对返佣资格、处理 TradingView 指标权限、发送审核通知和防止重复或滥用提交。必要信息会发送至 PM4 管理后台；交易所及 Discord/Telegram 适用其各自的隐私政策。审核记录原则上在业务关系存续期间保留，停止使用后会按运营、争议处理和合规需要定期清理。</p></section>
      <section><h2>查询、更正与删除</h2><p>你可以通过客服请求查询、更正或删除自己的审核资料。为防止他人冒领，处理前可能要求你提供 UID、TradingView 用户名等必要信息进行身份核对。</p></section>
      <section><h2>联系我们</h2><p>请通过 <a href={EXTERNAL_LINKS.discordContact} target="_blank" rel="noopener noreferrer">Discord 客服</a> 或 <a href={EXTERNAL_LINKS.telegramContact} target="_blank" rel="noopener noreferrer">Telegram 客服</a> 联系我们。</p></section>
      <nav className="legal-actions" aria-label="相关页面"><Link href="/">返回首页</Link><Link href="/terms">服务条款</Link></nav>
    </main>
  );
}
