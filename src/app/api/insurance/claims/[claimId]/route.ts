import { NextResponse } from "next/server";
import { getClaimById } from "@/lib/server/insuranceEngine";

export async function GET(_: Request, ctx: { params: { claimId: string } }) {
  try {
    const data = getClaimById(ctx.params.claimId);
    return NextResponse.json({ ok: true, data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Error" }, { status: 404 });
  }
}
