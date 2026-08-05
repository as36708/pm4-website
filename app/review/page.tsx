import Link from "next/link";
import ReviewSection from "../components/ReviewSection";

export default function ReviewPage() {
  return (
    <main className="review-page">
      <header className="review-topbar">
        <Link className="brand" href="/" aria-label="返回 PM4 首页">
          <span className="pm4-mark" aria-hidden="true" />
          <span className="pm4-word"><b>PM</b><em>4</em></span>
        </Link>
        <nav className="review-nav" aria-label="审核页导航">
          <Link href="/">返回首页</Link>
          <span>指标审核</span>
        </nav>
      </header>

      <ReviewSection standalone />
    </main>
  );
}
