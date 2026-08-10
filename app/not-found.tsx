import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main-content" className="legal-page not-found-page">
      <p className="legal-kicker">404</p>
      <h1>页面不存在</h1>
      <p>这个地址可能已经变更。你可以返回首页，或直接前往指标审核页面。</p>
      <div className="legal-actions">
        <Link href="/">返回首页</Link>
        <Link href="/review">提交审核资料</Link>
      </div>
    </main>
  );
}
