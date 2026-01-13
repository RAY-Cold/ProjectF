import { NextResponse } from "next/server";

export async function GET(_req: Request, { params }: { params: { user: string } }) {
  return NextResponse.json({
    ok: true,
    data: {
      user: params.user,
      supplied: [
        { asset: "USDC", amount: 1200, apy: 6.2 },
        { asset: "ETH", amount: 0.75, apy: 3.4 },
      ],
      borrowed: [{ asset: "USDC", amount: 400, apy: 9.8 }],
      healthFactor: 1.62,
      liquidationThreshold: 0.82,
    },
  });
}
