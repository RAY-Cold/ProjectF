import { NextResponse } from "next/server";
import { getRiskHeatmap } from "@/lib/server/analyticsEngine";

export async function GET() {
  try {
    const data = getRiskHeatmap();
    return NextResponse.json({ ok: true, data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Error" }, { status: 500 });
  }
}
