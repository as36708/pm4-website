import type { Metadata } from "next";
import FrontendAnalytics from "./components/FrontendAnalytics";
import "./globals.css";

const siteOrigin = new URL("https://cpm4.com");

export const metadata: Metadata = {
  metadataBase: siteOrigin,
  title: { default: "PM4 指标返佣与审核", template: "%s | PM4" },
  description: "通过合作交易所专属链接完成注册与任务，享受手续费返佣并申请 PM4 TradingView 专属指标。",
  alternates: { canonical: "/" },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: "/",
    siteName: "PM4",
    title: "一次注册，指标返佣双享",
    description: "注册合作交易所，按活动规则享受手续费返佣并申请 PM4 TradingView 专属指标。",
    images: [{ url: "/og.png", width: 1536, height: 1024, alt: "PM4 指标返佣平台" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "一次注册，指标返佣双享",
    description: "注册合作交易所，按活动规则享受手续费返佣并申请 PM4 TradingView 专属指标。",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        <a className="skip-link" href="#main-content">跳到主要内容</a>
        <FrontendAnalytics />
        {children}
      </body>
    </html>
  );
}
