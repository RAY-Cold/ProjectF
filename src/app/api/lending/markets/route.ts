// src/app/api/lending/markets/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { computeBorrowApr, computeSupplyApr } from "@/lib/server/interestRateModel";
import { snapshotMarketRisk } from "@/lib/server/riskEngine";

export async function GET() {
  const markets = await prisma.lendingMarket.findMany({ orderBy: { totalSupplyUsd: "desc" } });

  // Compute rates live using latest risk snapshot (or create one)
  const enriched = await Promise.all(
    markets.map(async (m) => {
      const util = m.totalSupplyUsd <= 0 ? 0 : m.totalBorrowUsd / m.totalSupplyUsd;

      // ensure at least one snapshot exists
      const latest = await prisma.riskSnapshot.findFirst({
        where: { marketId: m.id },
        orderBy: { createdAt: "desc" },
      });

      const snap = latest ?? (await snapshotMarketRisk(m.id));

      const borrowApr = computeBorrowApr(util, snap.riskScore, {
        baseRate: m.baseRate,
        slope1: m.slope1,
        slope2: m.slope2,
        kinkUtilization: m.kinkUtilization,
        reserveFactor: m.reserveFactor,
        riskPremiumMax: m.riskPremiumMax,
      });

      const supplyApr = computeSupplyApr(borrowApr, util, m.reserveFactor);

      return {
        ...m,
        utilization: util,
        riskScore: snap.riskScore,
        borrowApr,
        supplyApr,
      };
    })
  );

  return NextResponse.json({ ok: true, data: enriched });
}