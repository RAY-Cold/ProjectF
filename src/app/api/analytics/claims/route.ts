import { NextResponse } from "next/server";
import { getClaimsHistory } from "@/lib/server/analyticsEngine";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const days = Number(url.searchParams.get("days") ?? "90");
    const data = getClaimsHistory(Number.isFinite(days) ? days : 90);
    return NextResponse.json({ ok: true, data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Error" }, { status: 500 });
  }
}
