import { getDB, time, type Claim, type CoverageType, type Policy } from "./store";

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function addSeconds(iso: string, sec: number) {
  const d = new Date(iso);
  d.setSeconds(d.getSeconds() + sec);
  return d.toISOString();
}

export function getUtilizationBps() {
  const db = getDB();
  const denom = Math.max(1, db.pool.poolBalanceUSD);
  return Math.round((db.pool.reservedUSD / denom) * 10000);
}

/**
 * riskScore: 0..100 where 0 = safest, 100 = riskiest
 * durationDays: policy duration in days
 */
export function estimateCoverage(input: {
  userAddress: string;
  coverageType: CoverageType;
  targetId: string;
  coverageAmountUSD: number;
  durationDays: number;
  riskScore?: number; // from Risk Engine later (Group 2)
}) {
  const db = getDB();
  const params = db.params;

  const amount = Math.max(0, input.coverageAmountUSD);
  const days = Math.max(1, input.durationDays);

  // map riskScore to multiplier
  const rs = clamp(input.riskScore ?? 50, 0, 100);
  const t = rs / 100;
  const riskMult =
    params.riskMultiplierMin + (params.riskMultiplierMax - params.riskMultiplierMin) * t;

  // utilization multiplier
  const utilBps = getUtilizationBps();
  const utilT = clamp(utilBps / params.maxUtilizationBps, 0, 1);
  const utilMult = 1 + (params.utilizationMultiplierMax - 1) * utilT;

  // annualized premium = amount * baseRate * durationFraction * multipliers
  const baseRate = params.baseRateBps / 10000; // bps -> fraction
  const durationFraction = days / 365;

  let premium = amount * baseRate * durationFraction * riskMult * utilMult;
  premium = Math.max(premium, params.minPremiumUSD);

  // caps / constraints for UI feedback
  const maxForUser = params.maxCoveragePerUserUSD;

  return {
    premiumUSD: Number(premium.toFixed(2)),
    deductibleBps: params.deductibleBpsDefault,
    activationDelaySec: params.activationDelaySecDefault,
    utilizationBps: utilBps,
    riskMultiplier: Number(riskMult.toFixed(3)),
    utilizationMultiplier: Number(utilMult.toFixed(3)),
    constraints: {
      maxCoveragePerUserUSD: maxForUser,
      maxUtilizationBps: params.maxUtilizationBps,
    },
  };
}

export function purchaseCoverage(input: {
  userAddress: string;
  coverageType: CoverageType;
  targetId: string;
  coverageAmountUSD: number;
  durationDays: number;
  riskScore?: number;
}) {
  const db = getDB();
  const params = db.params;

  const quote = estimateCoverage(input);

  // enforce per-user cap
  const existing = db.policies
    .filter(p => p.userAddress === input.userAddress && p.status === "active")
    .reduce((sum, p) => sum + p.coverageAmountUSD, 0);

  if (existing + input.coverageAmountUSD > params.maxCoveragePerUserUSD) {
    throw new Error(`Coverage cap exceeded for user. Max ${params.maxCoveragePerUserUSD} USD.`);
  }

  // enforce pool utilization cap (reserve coverage amount)
  const newReserved = db.pool.reservedUSD + input.coverageAmountUSD;
  const newUtilBps = Math.round((newReserved / Math.max(1, db.pool.poolBalanceUSD)) * 10000);
  if (newUtilBps > params.maxUtilizationBps) {
    throw new Error(`Pool utilization too high. Limit ${params.maxUtilizationBps} bps.`);
  }

  // pool accounting
  db.pool.poolBalanceUSD += quote.premiumUSD;
  db.pool.totalPremiumsUSD += quote.premiumUSD;
  db.pool.reservedUSD = newReserved;

  const now = time.nowISO();
  const startAt = now;
  const activeFrom = addSeconds(now, quote.activationDelaySec);
  const endAt = addSeconds(now, input.durationDays * 24 * 3600);

  const policy: Policy = {
    id: uid("pol"),
    userAddress: input.userAddress,
    coverageType: input.coverageType,
    targetId: input.targetId,
    coverageAmountUSD: input.coverageAmountUSD,
    premiumPaidUSD: quote.premiumUSD,
    deductibleBps: quote.deductibleBps,
    activationDelaySec: quote.activationDelaySec,
    startAt,
    activeFrom,
    endAt,
    status: "active",
    createdAt: now,
  };

  db.policies.unshift(policy);
  return { policy, quote };
}

export function getUserPolicies(userAddress: string) {
  const db = getDB();
  // expire policies if needed
  const now = Date.now();
  for (const p of db.policies) {
    if (p.status === "active" && new Date(p.endAt).getTime() < now) p.status = "expired";
  }
  return db.policies.filter(p => p.userAddress === userAddress);
}

export function getUserClaims(userAddress: string) {
  const db = getDB();
  return db.claims.filter(c => c.userAddress === userAddress);
}

export function getClaimById(claimId: string) {
  const db = getDB();
  const claim = db.claims.find(c => c.id === claimId);
  if (!claim) throw new Error("Claim not found");
  return claim;
}

export function submitClaim(input: {
  userAddress: string;
  policyId: string;
  incidentType: CoverageType;
  targetId: string;
  incidentAt: string;
  claimedAmountUSD: number;
  evidence?: { txHash?: string; description?: string; url?: string };
}) {
  const db = getDB();
  const params = db.params;

  const policy = db.policies.find(p => p.id === input.policyId);
  if (!policy) throw new Error("Policy not found");
  if (policy.userAddress !== input.userAddress) throw new Error("Policy owner mismatch");
  if (policy.status !== "active") throw new Error(`Policy is not active (${policy.status})`);

  const now = time.nowISO();
  // anti-sniping: must be after activeFrom
  if (new Date(now).getTime() < new Date(policy.activeFrom).getTime()) {
    throw new Error("Policy not active yet (activation delay).");
  }

  // incident must be within [activeFrom, endAt]
  const incidentMs = new Date(input.incidentAt).getTime();
  if (incidentMs < new Date(policy.activeFrom).getTime() || incidentMs > new Date(policy.endAt).getTime()) {
    throw new Error("Incident not within policy active window.");
  }

  // one claim per policy for simplicity
  const already = db.claims.find(c => c.policyId === policy.id && c.status !== "rejected");
  if (already) throw new Error("A claim already exists for this policy.");

  const claimed = Math.max(0, input.claimedAmountUSD);
  if (claimed <= 0) throw new Error("Claim amount must be > 0");
  if (claimed > policy.coverageAmountUSD) throw new Error("Claim exceeds coverage limit");

  const bond = Number(((claimed * params.claimBondBps) / 10000).toFixed(2));
  db.pool.totalClaimsUSD += claimed;

  const votingStartsAt = now;
  const votingEndsAt = addSeconds(now, params.votingPeriodSec);

  const claim: Claim = {
    id: uid("clm"),
    policyId: policy.id,
    userAddress: input.userAddress,
    incidentType: input.incidentType,
    targetId: input.targetId,
    incidentAt: input.incidentAt,
    submittedAt: now,
    evidence: input.evidence ?? {},
    claimedAmountUSD: claimed,
    bondUSD: bond,
    status: "voting",
    votingStartsAt,
    votingEndsAt,
    votesFor: 0,
    votesAgainst: 0,
  };

  db.claims.unshift(claim);
  return { claim };
}

/**
 * Applies deductible and pays from pool.
 * Called by DAO engine after approval.
 */
export function payoutClaim(claimId: string) {
  const db = getDB();
  const claim = db.claims.find(c => c.id === claimId);
  if (!claim) throw new Error("Claim not found");
  if (claim.status !== "approved") throw new Error(`Claim not approved (status=${claim.status})`);

  const policy = db.policies.find(p => p.id === claim.policyId);
  if (!policy) throw new Error("Policy not found");

  const deductible = (policy.deductibleBps / 10000) * claim.claimedAmountUSD;
  const payout = Math.max(0, claim.claimedAmountUSD - deductible);

  // Pool solvency check
  const available = db.pool.poolBalanceUSD - db.pool.reservedUSD;
  if (payout > available) {
    throw new Error("Pool insolvent for payout (demo constraint).");
  }

  // accounting
  db.pool.poolBalanceUSD -= payout;
  db.pool.totalPaidOutUSD += payout;

  // reduce reserved coverage for this policy (settle)
  db.pool.reservedUSD = Math.max(0, db.pool.reservedUSD - policy.coverageAmountUSD);

  // update statuses
  claim.status = "paid";
  claim.approvedAmountUSD = Number(payout.toFixed(2));
  claim.payoutAt = time.nowISO();

  policy.status = "settled";

  return { claim, payoutUSD: Number(payout.toFixed(2)), deductibleUSD: Number(deductible.toFixed(2)) };
}
