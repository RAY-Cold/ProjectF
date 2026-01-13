import { NextResponse } from "next/server";
import { depositToVault } from "@/lib/server/vaultEngine";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json().catch(() => ({}));
    const amount = Number(body.amount);
    const insured = Boolean(body.insured);
    const userAddress = String(body.userAddress ?? "0xDEMO");

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { ok: false, error: "Invalid amount" },
        { status: 400 }
      );
    }

    const data = depositToVault(params.id, amount, insured, userAddress);
    return NextResponse.json({ ok: true, data });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Deposit failed" },
      { status: 500 }
    );
  }
}
