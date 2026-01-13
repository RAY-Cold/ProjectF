import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    data: [
      {
        id: "shield-stable",
        name: "Shield Stable Pool",
        asset: "USDC",
        tvl: 3200.0,
        apy: 8.4,
        utilization: 42,
        premiumAPR: 2.1,
        status: "ACTIVE",
      },
      {
        id: "shield-eth",
        name: "Shield ETH Pool",
        asset: "ETH",
        tvl: 1250.8,
        apy: 11.2,
        utilization: 61,
        premiumAPR: 3.0,
        status: "ACTIVE",
      },
    ],
  });
}
