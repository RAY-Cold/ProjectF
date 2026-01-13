import { NextResponse } from "next/server";
import { getRiskEngineOutput } from "@/lib/server/analyticsEngine";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const user = url.searchParams.get("user") ?? undefined;
    const vault = url.searchParams.get("vault") ?? undefined;

    const data = getRiskEngineOutput(user, vault);
    return NextResponse.json({ ok: true, data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Error" }, { status: 500 });
  }
}
