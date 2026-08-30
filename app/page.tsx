import type { Metadata } from "next";
import HomeLanding from "./components/HomeLanding";
import { EXTERNAL_LINKS } from "./links";

export const metadata: Metadata = {
  title: "交易所返佣与 TradingView 指标",
  description: "通过 PM4 专属链接注册合作交易所，绑定 Discord，享受手续费返佣并自动领取 TradingView 指标。",
  alternates: { canonical: "/" },
};

const organizationJsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "PM4",
  url: "https://cpm4.com",
  logo: "https://cpm4.com/favicon.svg",
  sameAs: [EXTERNAL_LINKS.discordInvite, EXTERNAL_LINKS.telegramContact],
}).replace(/</g, "\\u003c");

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: organizationJsonLd }} />
      <HomeLanding />
    </>
  );
}
