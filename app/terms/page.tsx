import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "服务条款与风险说明",
  description: "PM4 返佣与 TradingView 指标申请服务的规则和风险说明。",
  alternates: { canonical: "/terms" },
  openGraph: { url: "/terms", title: "服务条款与风险说明 | PM4", description: "PM4 返佣与 TradingView 指标申请服务的规则和风险说明。" },
  twitter: { card: "summary_large_image", title: "服务条款与风险说明 | PM4", description: "PM4 返佣与 TradingView 指标申请服务的规则和风险说明。" },
};

export default function TermsPage() {
  return (
    <main id="main-content" className="legal-page">
      <p className="legal-kicker">TERMS</p>
      <h1>服务条款与风险说明</h1>
      <p className="legal-updated">更新日期：2026 年 8 月 10 日</p>
      <section><h2>服务范围</h2><p>PM4 提供合作交易所活动信息、审核资料转交、返佣资格核对和 TradingView 指标权限协助。最终资格、返佣比例、手续费、活动期限及账户规则以对应交易所页面和审核结果为准。</p></section>
      <section><h2>推广关系</h2><p>本网站包含合作交易所推广链接。你通过链接注册或交易时，PM4 可能获得推广佣金。该关系不会增加网站另行收取的费用，但交易所仍会按其规则收取手续费。</p></section>
      <section><h2>交易风险</h2><p>数字资产价格波动较大，可能造成部分或全部本金损失。网站内容、指标和客服说明不构成投资建议、收益保证或代客交易服务。请在理解产品规则和风险后独立决策。</p></section>
      <section><h2>用户责任</h2><p>你应提供真实、准确且属于自己的 UID 与用户名，并妥善保管账户凭据。任何人都不应向 PM4 提交密码、验证码、API 密钥、助记词或私钥。</p></section>
      <section><h2>变更与中断</h2><p>交易所活动、接口或平台政策可能调整，服务也可能因维护、网络或第三方原因暂时中断。我们会尽力更新页面，但不能保证所有第三方信息实时不变。</p></section>
      <nav className="legal-actions" aria-label="相关页面"><Link href="/">返回首页</Link><Link href="/privacy">隐私政策</Link></nav>
    </main>
  );
}
