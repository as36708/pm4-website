import type { Metadata } from "next";
import Link from "next/link";
import ReviewSection from "../../components/ReviewSection";

export const metadata: Metadata = {
  title: "备用人工审核表单",
  description: "当 Discord 机器人暂时无法使用时，通过备用表单提交交易所 UID、TradingView 与 Discord 用户名。",
  alternates: { canonical: "/review/manual" },
};

export default function ManualReviewPage() {
  return (
    <main id="main-content" className="review-page">
      <header className="review-topbar">
        <Link className="brand" href="/" aria-label="返回 PM4 首页">
          <span className="pm4-mark" aria-hidden="true" />
          <span className="pm4-word"><b>PM</b><em>4</em></span>
        </Link>
        <nav className="review-nav" aria-label="备用审核页导航">
          <Link href="/review">优先使用 Discord 自动绑定</Link>
          <span>备用人工审核表单</span>
        </nav>
      </header>
      <ReviewSection />
    </main>
  );
}
