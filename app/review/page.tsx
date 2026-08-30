import Link from "next/link";
import type { Metadata } from "next";
import DiscordBindingLanding from "../components/DiscordBindingLanding";

export const metadata: Metadata = {
  title: "Discord 自动绑定",
  description: "加入 PM4 Discord，绑定交易所 UID 与 TradingView 用户名，自动核对资格并进入指标队列。",
  alternates: { canonical: "/review" },
  openGraph: {
    url: "/review",
    title: "Discord 自动绑定 | PM4",
    description: "加入 PM4 Discord，绑定交易所账号并自动进入指标队列。",
  },
  twitter: {
    card: "summary_large_image",
    title: "Discord 自动绑定 | PM4",
    description: "加入 PM4 Discord，绑定交易所账号并自动进入指标队列。",
  },
};

export default function ReviewPage() {
  return (
    <main id="main-content" className="review-page">
      <header className="review-topbar">
        <Link className="brand" href="/" aria-label="返回 PM4 首页">
          <span className="pm4-mark" aria-hidden="true" />
          <span className="pm4-word"><b>PM</b><em>4</em></span>
        </Link>
        <nav className="review-nav" aria-label="Discord 绑定页导航">
          <Link href="/">返回首页</Link>
          <span>Discord 自动绑定 · 30 秒拿指标</span>
        </nav>
      </header>

      <DiscordBindingLanding />
    </main>
  );
}
