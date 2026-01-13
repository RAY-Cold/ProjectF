import { NextResponse } from "next/server";
import { listVaults } from "@/lib/server/vaultEngine";

export async function GET() {
  try {
    const data = listVaults();
    return NextResponse.json({ ok: true, data });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Failed to fetch vaults" },
      { status: 500 }
    );
  }
}
