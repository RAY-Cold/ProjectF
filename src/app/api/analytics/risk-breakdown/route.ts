import { NextResponse } from "next/server";
import { getRiskBreakdown } from "@/lib/server/analyticsEngine";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const vaultId = url.searchParams.get("vaultId") ?? undefined;
    const data = getRiskBreakdown(vaultId);
    return NextResponse.json({ ok: true, data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Error" }, { status: 500 });
  }
}
