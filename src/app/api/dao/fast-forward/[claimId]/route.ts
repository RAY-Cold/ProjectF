import { NextResponse } from "next/server";
import { fastForwardClaim } from "@/lib/server/daoEngine";

export async function POST(req: Request, ctx: { params: { claimId: string } }) {
  try {
    const body = await req.json().catch(() => ({}));
    const data = fastForwardClaim(ctx.params.claimId, body?.to);
    return NextResponse.json({ ok: true, data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Error" }, { status: 400 });
  }
}
