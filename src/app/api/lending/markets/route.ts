// src/app/api/lending/markets/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { computeBorrowApr, computeSupplyApr } from "@/lib/server/interestRateModel";
import { snapshotMarketRisk } from "@/lib/server/riskEngine";

function num(v: any, fallback = 0): number {
  if (v === null || v === undefined) return fallback;
  if (typeof v === "number") return Number.isFinite(v) ? v : fallback;
  // Prisma Decimal may arrive as { toNumber() } or string
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  }
  if (typeof v?.toNumber === "function") {
    const n = v.toNumber();
    return Number.isFinite(n) ? n : fallback;
  }
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function clamp01(x: number) {
  if (!Number.isFinite(x)) return 0;
  return Math.max(0, Math.min(1, x));
}

export async function GET() {
  try {
    const markets = await prisma.lendingMarket.findMany({
      orderBy: { totalSupplyUsd: "desc" },
    });

    const enriched = await Promise.all(
      markets.map(async (m) => {
        // normalize core values
        const totalSupplyUsd = num(m.totalSupplyUsd, 0);
        const totalBorrowUsd = num(m.totalBorrowUsd, 0);

        const utilRaw = totalSupplyUsd <= 0 ? 0 : totalBorrowUsd / totalSupplyUsd;
        const utilization = clamp01(utilRaw);

        // Try latest snapshot, else attempt to create one, else fallback
        let riskScore = 50; // fallback mid risk
        try {
          const latest = await prisma.riskSnapshot.findFirst({
            where: { marketId: m.id },
            orderBy: { createdAt: "desc" },
          });

          const snap = latest ?? (await snapshotMarketRisk(m.id));
          riskScore = num((snap as any)?.riskScore, 50);
        } catch {
          // swallow risk engine failures so page doesn't go blank
          riskScore = 50;
        }

        // Compute borrow/supply APR safely
        let borrowApr = 0;
        let supplyApr = 0;

        try {
          borrowApr = num(
            computeBorrowApr(utilization, riskScore, {
              baseRate: num(m.baseRate, 0),
              slope1: num(m.slope1, 0),
              slope2: num(m.slope2, 0),
              kinkUtilization: num(m.kinkUtilization, 0.8),
              reserveFactor: num(m.reserveFactor, 0.1),
              riskPremiumMax: num(m.riskPremiumMax, 0.2),
            }),
            0
          );

          supplyApr = num(computeSupplyApr(borrowApr, utilization, num(m.reserveFactor, 0.1)), 0);
        } catch {
          borrowApr = 0;
          supplyApr = 0;
        }

        return {
          ...m,
          // ensure these return as numbers (helps UI + formatter)
          totalSupplyUsd,
          totalBorrowUsd,
          utilization,
          riskScore,
          borrowApr,
          supplyApr,
        };
      })
    );

    return NextResponse.json({ ok: true, data: enriched });
  } catch (e: any) {
    return NextResponse.json(
      {
        ok: false,
        error: e?.message ?? "Failed to load lending markets",
      },
      { status: 500 }
    );
  }
}
