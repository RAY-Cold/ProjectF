import { NextResponse } from "next/server";
import { getUserClaims } from "@/lib/server/insuranceEngine";

export async function GET(_: Request, ctx: { params: { userAddress: string } }) {
  try {
    const data = getUserClaims(ctx.params.userAddress);
    return NextResponse.json({ ok: true, data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Error" }, { status: 400 });
  }
}
