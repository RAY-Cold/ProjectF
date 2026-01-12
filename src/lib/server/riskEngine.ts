// src/lib/server/riskEngine.ts
import { prisma } from "@/lib/db/prisma";

export type RiskFactors = {
  utilization: number; // 0..1
  concentration: number; // 0..1
  oracleRisk: number; // 0..1
  auditScore: number; // 0..1 (higher is better)
  volatility: number; // 0..1
  incidentProbability: number; // 0..1
};

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

export function computeRiskScore(f: RiskFactors): { score: number; breakdown: any } {
  // Weighted: higher numbers mean riskier (except auditScore)
  const w = {
    utilization: 0.20,
    concentration: 0.15,
    oracleRisk: 0.15,
    auditPenalty: 0.15,
    volatility: 0.20,
    incidentProbability: 0.15,
  };

  const auditPenalty = 1 - clamp01(f.auditScore);

  const raw =
    w.utilization * clamp01(f.utilization) +
    w.concentration * clamp01(f.concentration) +
    w.oracleRisk * clamp01(f.oracleRisk) +
    w.auditPenalty * auditPenalty +
    w.volatility * clamp01(f.volatility) +
    w.incidentProbability * clamp01(f.incidentProbability);

  const score = Math.round(clamp01(raw) * 100);

  return {
    score,
    breakdown: {
      ...f,
      auditPenalty,
      weights: w,
      raw: clamp01(raw),
    },
  };
}

/**
 * Generates a reasonable factor set from market state + optional overrides.
 * This makes your demo "feel real" even without external oracles.
 */
export function deriveFactorsFromMarket(input: {
  utilization: number;
  totalSupplyUsd: number;
  totalBorrowUsd: number;
  overrides?: Partial<RiskFactors>;
}): RiskFactors {
  const { utilization, totalSupplyUsd, totalBorrowUsd, overrides } = input;

  // Heuristics for demo realism:
  const concentration = clamp01(0.25 + Math.log10(1 + (totalBorrowUsd / Math.max(1, totalSupplyUsd))) * 0.25);
  const volatility = clamp01(0.2 + utilization * 0.6);
  const oracleRisk = clamp01(0.15 + utilization * 0.45);
  const auditScore = clamp01(0.7 - utilization * 0.25); // higher util => more risk
  const incidentProbability = clamp01(0.05 + utilization * 0.35);

  const base: RiskFactors = {
    utilization: clamp01(utilization),
    concentration,
    oracleRisk,
    auditScore,
    volatility,
    incidentProbability,
  };

  return { ...base, ...(overrides ?? {}) };
}

export async function snapshotMarketRisk(marketId: string, overrides?: Partial<RiskFactors>) {
  const m = await prisma.lendingMarket.findUnique({ where: { id: marketId } });
  if (!m) throw new Error("Market not found");

  const util = m.totalSupplyUsd <= 0 ? 0 : m.totalBorrowUsd / m.totalSupplyUsd;
  const factors = deriveFactorsFromMarket({
    utilization: util,
    totalSupplyUsd: m.totalSupplyUsd,
    totalBorrowUsd: m.totalBorrowUsd,
    overrides,
  });

  const { score, breakdown } = computeRiskScore(factors);

  await prisma.riskSnapshot.create({
    data: {
      marketId,
      riskScore: score,
      factorsJson: JSON.stringify(breakdown),
    },
  });

  return { marketId, riskScore: score, factors: breakdown };
}