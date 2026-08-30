import Link from "next/link";
import type { Metadata } from "next";
import DiscordBindingLanding from "../../components/DiscordBindingLanding";

export const metadata: Metadata = {
  title: "Discord 自动绑定预览",
  robots: { index: false, follow: false },
};

export default function DiscordBindingPreviewPage() {
  return (
    <main id="main-content" className="review-page binding-preview-page">
      <header className="review-topbar">
        <Link className="brand" href="/" aria-label="返回 PM4 首页">
          <span className="pm4-mark" aria-hidden="true" />
          <span className="pm4-word"><b>PM</b><em>4</em></span>
        </Link>
        <nav className="review-nav" aria-label="预览页导航">
          <Link href="/review">查看当前审核表单</Link>
          <span>本地预览 · 尚未替换线上表单</span>
        </nav>
      </header>

      <DiscordBindingLanding />
    </main>
  );
}
