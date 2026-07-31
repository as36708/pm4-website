import type { Metadata } from "next";
import "./globals.css";

const title = "PM4交易所返佣与专属指标";
const description =
  "通过PM4专属链接注册合作交易所，享受手续费优惠，并根据活动规则免费开通PM4 TradingView支撑阻力位指标。";

export const metadata: Metadata = {
  metadataBase: new URL("https://pm4-trading-tools.chexin1103.chatgpt.site"),
  title,
  description,
  keywords: ["PM4", "交易所返佣", "TradingView指标", "支撑阻力位"],
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title,
    description,
    type: "website",
    locale: "zh_CN",
    siteName: "PM4",
    images: [{ url: "/og.png", width: 1680, height: 945, alt: "PM4 交易成本与专属指标" }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
