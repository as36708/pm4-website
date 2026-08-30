import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TransferExperience, { type TransferExchange } from "../TransferExperience";
import { EXTERNAL_LINKS } from "../../links";

const transferExchanges: Record<string, TransferExchange> = {
  bybit: {
    id: "bybit",
    name: "Bybit",
    logo: "/logos/bybit.svg",
    mode: "bybit",
    registerUrl: EXTERNAL_LINKS.bybitRegister,
    officialUrl: EXTERNAL_LINKS.bybitIdentityTransfer,
  },
  okx: {
    id: "okx",
    name: "OKX",
    logo: "/logos/okx.svg",
    mode: "okx",
    registerUrl: EXTERNAL_LINKS.okxRegister,
  },
  gate: {
    id: "gate",
    name: "Gate",
    logo: "/logos/gate.svg",
    mode: "support",
    registerUrl: EXTERNAL_LINKS.gateRegister,
  },
  bitget: {
    id: "bitget",
    name: "Bitget",
    logo: "/logos/bitget.svg",
    mode: "support",
    registerUrl: EXTERNAL_LINKS.bitgetRegister,
  },
};

export function generateStaticParams() {
  return Object.keys(transferExchanges).map((exchange) => ({ exchange }));
}

export async function generateMetadata({ params }: { params: Promise<{ exchange: string }> }): Promise<Metadata> {
  const { exchange } = await params;
  const item = transferExchanges[exchange];
  if (!item) return {};
  return {
    title: `更换 ${item.name} 推荐人`,
    description: `查看 ${item.name} 推荐关系办理方式，并连接 PM4 客服完成后续绑定。`,
    alternates: { canonical: `/transfer/${item.id}` },
  };
}

export default async function TransferPage({ params }: { params: Promise<{ exchange: string }> }) {
  const { exchange } = await params;
  const item = transferExchanges[exchange];
  if (!item) notFound();
  return <TransferExperience exchange={item} />;
}
