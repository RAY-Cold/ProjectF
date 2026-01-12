// src/app/api/seed/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function POST() {
  // idempotent-ish: only seed if empty
  const markets = await prisma.lendingMarket.count();
  if (markets > 0) {
    return NextResponse.json({ ok: true, data: { seeded: false } });
  }

  const vault1 = await prisma.vault.create({
    data: {
      symbol: "ETH",
      name: "Fortify ETH Vault",
      chain: "Ethereum",
      tvlUsd: 5_500_000,
      apyBase: 0.06,
      apyRiskAdj: 0.055,
      riskScore: 42,
    },
  });

  await prisma.vault.create({
    data: {
      symbol: "USDC",
      name: "Fortify USDC Vault",
      chain: "Base",
      tvlUsd: 9_200_000,
      apyBase: 0.085,
      apyRiskAdj: 0.078,
      riskScore: 35,
    },
  });

  await prisma.lendingMarket.createMany({
    data: [
      {
        assetSymbol: "USDC",
        assetName: "USD Coin",
        totalSupplyUsd: 12_000_000,
        totalBorrowUsd: 7_800_000,
        reserveFactor: 0.1,
        kinkUtilization: 0.8,
        baseRate: 0.02,
        slope1: 0.08,
        slope2: 0.6,
        riskPremiumMax: 0.12,
      },
      {
        assetSymbol: "ETH",
        assetName: "Ethereum",
        totalSupplyUsd: 8_500_000,
        totalBorrowUsd: 4_000_000,
        reserveFactor: 0.12,
        kinkUtilization: 0.75,
        baseRate: 0.015,
        slope1: 0.07,
        slope2: 0.55,
        riskPremiumMax: 0.15,
      },
    ],
  });

  await prisma.activity.create({
    data: {
      type: "proposal_created",
      vaultId: vault1.id,
      metaJson: JSON.stringify({ title: "Initial Risk Parameters Seeded" }),
    },
  });

  return NextResponse.json({ ok: true, data: { seeded: true } });
}