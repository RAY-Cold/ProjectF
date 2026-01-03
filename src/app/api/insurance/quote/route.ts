import { NextResponse } from "next/server";
import { estimateCoverage } from "@/lib/server/insuranceEngine";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = estimateCoverage(body);
    return NextResponse.json({ ok: true, data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Error" }, { status: 400 });
  }
}
