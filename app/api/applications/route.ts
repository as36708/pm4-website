import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      code: "SUBMISSION_NOT_CONFIGURED",
      message: "审核接口尚未连接，请在部署前配置安全的数据存储或 Webhook。",
    },
    { status: 501 },
  );
}
