import { NextResponse } from "next/server";
import { proposeParameters } from "@/lib/server/daoEngine";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = proposeParameters(body);
    return NextResponse.json({ ok: true, data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Error" }, { status: 400 });
  }
}
