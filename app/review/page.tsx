import Link from "next/link";
import type { Metadata } from "next";
import ReviewSection from "../components/ReviewSection";

export const metadata: Metadata = {
  title: "提交指标审核资料",
  description: "提交交易所 UID、TradingView 用户名和审核必填的 Discord 用户名，并同步到 PM4 管理后台。",
  alternates: { canonical: "/review" },
  openGraph: {
    url: "/review",
    title: "提交指标审核资料 | PM4",
    description: "安全提交交易所 UID、TradingView 用户名和审核必填的 Discord 用户名，进入 PM4 人工审核流程。",
  },
  twitter: {
    card: "summary_large_image",
    title: "提交指标审核资料 | PM4",
    description: "安全提交交易所 UID、TradingView 用户名和审核必填的 Discord 用户名，进入 PM4 人工审核流程。",
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
        <nav className="review-nav" aria-label="审核页导航">
          <Link href="/">返回首页</Link>
          <span>指标审核 · Discord 必填</span>
        </nav>
      </header>

      <ReviewSection standalone />
    </main>
  );
}
