import { NextResponse } from "next/server";
import { mockPortfolio } from "@/lib/mocks/userData";

export async function GET(
  _req: Request,
  { params }: { params: { userAddress: string } }
) {
  try {
    // Demo backend: return mock regardless of address
    return NextResponse.json({
      ok: true,
      data: { ...mockPortfolio, userAddress: params.userAddress },
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Failed to fetch portfolio" },
      { status: 500 }
    );
  }
}
