import { NextResponse } from "next/server";
import { listParameterProposals } from "@/lib/server/daoEngine";

export async function GET() {
  try {
    const data = listParameterProposals();
    return NextResponse.json({ ok: true, data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Error" }, { status: 400 });
  }
}
