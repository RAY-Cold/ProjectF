import { NextResponse } from "next/server";
import { getPositionsForVault } from "@/lib/server/vaultEngine";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = getPositionsForVault(params.id);
    return NextResponse.json({ ok: true, data });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Failed to fetch positions" },
      { status: 500 }
    );
  }
}
