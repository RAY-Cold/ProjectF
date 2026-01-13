import { NextResponse } from "next/server";
import { getVault } from "@/lib/server/vaultEngine";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const vault = getVault(params.id);
    if (!vault) {
      return NextResponse.json(
        { ok: false, error: "Vault not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ ok: true, data: vault });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Failed to fetch vault" },
      { status: 500 }
    );
  }
}
