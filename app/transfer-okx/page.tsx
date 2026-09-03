import type { Metadata } from "next";
import TransferExperience, { type TransferExchange } from "../transfer/TransferExperience";
import { EXTERNAL_LINKS } from "../links";

export const metadata: Metadata = {
  title: "更换 OKX 推荐人",
  description: "查看 OKX 推荐关系办理方式，并连接 PM4 客服完成后续绑定。",
  alternates: { canonical: "/transfer-okx" },
};

const okx: TransferExchange = {
  id: "okx",
  name: "OKX",
  logo: "/logos/okx.svg",
  mode: "okx",
  registerUrl: EXTERNAL_LINKS.okxRegister,
};

export default function TransferOkxPage() {
  return <TransferExperience exchange={okx} />;
}
