// src/lib/api/insurance.ts
import { CoveragePolicy, Claim, CoverageEstimate } from "@/lib/types/insurance";
import { apiRequest } from "./client";
import {
  mockClaims,
  mockPolicies,
  getCoverageEstimate,
  getClaimsByUser,
  getClaimById as getMockClaimById,
} from "@/lib/mocks/insuranceData";

/**
 * Backend endpoints we use (Next.js API routes):
 *  - GET   /api/insurance/policies/:userAddress
 *  - POST  /api/insurance/quote
 *  - POST  /api/insurance/purchase
 *  - GET   /api/insurance/claims/user/:userAddress
 *  - GET   /api/insurance/claims/:claimId
 *  - POST  /api/insurance/claims/submit
 *
 * NOTE:
 * Your UI currently calls these functions. We keep signatures stable.
 * If backend fails, we fall back to mocks (your existing behavior).
 */

/** ---------------------------
 * Helpers to map backend -> UI types
 * -------------------------- */

function toUnixSeconds(iso: string): number {
  const ms = Date.parse(iso);
  return Number.isFinite(ms) ? Math.floor(ms / 1000) : Math.floor(Date.now() / 1000);
}

function shortTx(): string {
  return `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`.slice(0, 66);
}

/**
 * Map backend Policy (server/store.ts) -> CoveragePolicy (UI)
 * Your UI type expects:
 *  id, policyType, positionId, coverageAmount, premium, premiumRate, duration,
 *  startDate, endDate, riskScore, active, nftTokenId
 */
function mapPolicyToCoveragePolicy(p: any): CoveragePolicy {
  const start = toUnixSeconds(p.startAt ?? p.createdAt ?? new Date().toISOString());
  const end = toUnixSeconds(p.endAt ?? new Date(Date.now() + 90 * 86400 * 1000).toISOString());

  const durationDays =
    typeof p?.endAt === "string" && typeof p?.startAt === "string"
      ? Math.max(1, Math.round((Date.parse(p.endAt) - Date.parse(p.startAt)) / (1000 * 60 * 60 * 24)))
      : Number(p.durationDays ?? p.duration ?? 90);

  // Estimate a "premiumRate" for UI if backend doesn't provide it
  const premium = Number(p.premiumPaidUSD ?? p.premium ?? 0);
  const coverage = Number(p.coverageAmountUSD ?? p.coverageAmount ?? 0);
  const premiumRate =
    coverage > 0 && durationDays > 0 ? Number(((premium / coverage) * (365 / durationDays)).toFixed(4)) : 0;

  return {
    id: String(p.id),
    policyType: (p.coverageType ?? p.policyType ?? "vault") as any,
    positionId: String(p.targetId ?? p.positionId ?? "unknown"),
    coverageAmount: Number(p.coverageAmountUSD ?? p.coverageAmount ?? 0),
    premium,
    premiumRate,
    duration: durationDays,
    startDate: start,
    endDate: end,
    riskScore: Number(p.riskScore ?? 35),
    active: (p.status ? p.status === "active" : Boolean(p.active ?? true)) as boolean,
    nftTokenId:
      p.nftTokenId ??
      `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
  };
}

/**
 * Map backend Claim (server/store.ts) -> Claim (UI)
 * Your UI claim expects fields like:
 *  id, policyId, status, lossAmount, claimedAmount, evidence, description,
 *  submittedAt, votesFor, votesAgainst, requiredQuorum, votingEndsAt, stakeRequired, staked
 */
function mapBackendClaimToUIClaim(c: any): Claim {
  const submittedAt = toUnixSeconds(c.submittedAt ?? new Date().toISOString());
  const votingEndsAt = toUnixSeconds(c.votingEndsAt ?? new Date(Date.now() + 3 * 86400 * 1000).toISOString());

  const lossAmount = Number(c.claimedAmountUSD ?? c.lossAmount ?? 0);
  const claimedAmount = Number(c.claimedAmountUSD ?? c.claimedAmount ?? lossAmount);

  return {
    id: String(c.id),
    policyId: String(c.policyId),
    status: (c.status ?? "voting") as any,
    lossAmount,
    claimedAmount,
    evidence: Array.isArray(c.evidence)
      ? c.evidence
      : c.evidence
      ? [
          c.evidence.txHash ? `tx:${c.evidence.txHash}` : "",
          c.evidence.url ? `url:${c.evidence.url}` : "",
        ].filter(Boolean)
      : [],
    description: c.description ?? c.evidence?.description ?? "",
    submittedAt,
    votesFor: Number(c.votesFor ?? 0),
    votesAgainst: Number(c.votesAgainst ?? 0),
    requiredQuorum: Number(c.requiredQuorum ?? 2000),
    votingEndsAt,
    stakeRequired: Number(c.stakeRequired ?? 0.2),
    staked: Number(c.staked ?? 0.2),
  };
}

/** ---------------------------
 * Public API used by UI
 * -------------------------- */

export async function getUserPolicies(userAddress: string): Promise<CoveragePolicy[]> {
  return apiRequest<any[]>(
    `/insurance/policies/${encodeURIComponent(userAddress)}`,
    { method: "GET" },
    () => mockPolicies
  ).then((rows) => rows.map(mapPolicyToCoveragePolicy));
}

/**
 * UI expects getCoverageEstimateApi(positionId, coverageAmount, riskScore, duration?)
 *
 * Backend expects:
 *  POST /insurance/quote
 *  {
 *    userAddress, coverageType, targetId, coverageAmountUSD, durationDays, riskScore
 *  }
 */
export async function getCoverageEstimateApi(
  positionId: string,
  coverageAmount: number,
  riskScore: number,
  duration: number = 90
): Promise<CoverageEstimate> {
  return apiRequest<any>(
    "/insurance/quote",
    {
      method: "POST",
      body: JSON.stringify({
        userAddress: "0xDEMO", // UI doesn't pass user here; safe placeholder
        coverageType: "vault",
        targetId: positionId,
        coverageAmountUSD: coverageAmount,
        durationDays: duration,
        riskScore,
      }),
    },
    () => getCoverageEstimate(coverageAmount, riskScore, duration)
  ).then((q) => {
    // Your mock getCoverageEstimate returns a CoverageEstimate already
    // Backend quote returns: premiumUSD, deductibleBps, activationDelaySec, utilizationBps, multipliers...
    // We map to CoverageEstimate shape used in UI (premium, premiumRate, etc.)
    if ("premium" in q) return q as CoverageEstimate;

    const premium = Number(q.premiumUSD ?? 0);
    const premiumRate =
      coverageAmount > 0 && duration > 0 ? Number(((premium / coverageAmount) * (365 / duration)).toFixed(4)) : 0;

    const est: CoverageEstimate = {
      premium,
      premiumRate,
      riskScore,
      coverageAmount,
      duration,
      deductible: Number(q.deductibleBps ?? 1000) / 100, // UI often shows %; 1000bps => 10
      activationDelay: Number(q.activationDelaySec ?? 900),
      utilization: Number(q.utilizationBps ?? 0) / 100, // bps->%
    } as any;

    return est;
  });
}

/**
 * UI expects purchaseCoverage(positionId, coverageAmount, duration, userAddress)
 *
 * Backend expects:
 *  POST /insurance/purchase
 *  { userAddress, coverageType, targetId, coverageAmountUSD, durationDays, riskScore? }
 *
 * We return { policyId, txHash } as UI expects
 */
export async function purchaseCoverage(
  positionId: string,
  coverageAmount: number,
  duration: number,
  userAddress: string
): Promise<{ policyId: string; txHash: string }> {
  return apiRequest<any>(
    "/insurance/purchase",
    {
      method: "POST",
      body: JSON.stringify({
        userAddress,
        coverageType: "vault",
        targetId: positionId,
        coverageAmountUSD: coverageAmount,
        durationDays: duration,
        riskScore: 35,
      }),
    },
    () => {
      const policyId = `policy-${Date.now()}`;
      const now = Math.floor(Date.now() / 1000);
      const end = now + duration * 86400;

      const est = getCoverageEstimate(coverageAmount, 35, duration);

      mockPolicies.unshift({
        id: policyId,
        policyType: "vault",
        positionId,
        coverageAmount,
        premium: est.premium,
        premiumRate: est.premiumRate,
        duration,
        startDate: now,
        endDate: end,
        riskScore: 35,
        active: true,
        nftTokenId: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random()
          .toString(16)
          .slice(2, 6)}`,
      });

      return { policyId, txHash: shortTx() };
    }
  ).then((resp) => {
    // Backend returns { policy, quote } or similar
    if (resp?.policy?.id) return { policyId: String(resp.policy.id), txHash: shortTx() };
    if (resp?.policyId) return { policyId: String(resp.policyId), txHash: resp.txHash ?? shortTx() };
    // Fallback
    return { policyId: `policy-${Date.now()}`, txHash: shortTx() };
  });
}

/**
 * UI expects getUserClaims(userAddress) -> Claim[]
 *
 * Backend route: GET /insurance/claims/user/:userAddress
 */
export async function getUserClaims(userAddress: string): Promise<Claim[]> {
  return apiRequest<any[]>(
    `/insurance/claims/user/${encodeURIComponent(userAddress)}`,
    { method: "GET" },
    () => getClaimsByUser(userAddress)
  ).then((rows) => rows.map(mapBackendClaimToUIClaim));
}

/**
 * UI expects getClaimById(id) -> Claim | null
 *
 * Backend route: GET /insurance/claims/:claimId
 */
export async function getClaimById(id: string): Promise<Claim | null> {
  return apiRequest<any>(
    `/insurance/claims/${encodeURIComponent(id)}`,
    { method: "GET" },
    () => getMockClaimById(id) ?? null
  ).then((row) => {
    if (!row) return null;
    // mock returns already shaped Claim
    if ("lossAmount" in row) return row as Claim;
    return mapBackendClaimToUIClaim(row);
  });
}

/**
 * ✅ Required by: ClaimSubmissionForm.tsx
 * submitClaim(policyId, lossAmount, description, evidence, userAddress)
 *
 * Backend route: POST /insurance/claims/submit
 * Body: { userAddress, policyId, incidentType, targetId, incidentAt, claimedAmountUSD, evidence }
 */
export async function submitClaim(
  policyId: string,
  lossAmount: number,
  description: string,
  evidence: string[],
  userAddress: string
): Promise<{ claimId: string; txHash: string }> {
  return apiRequest<any>(
    "/insurance/claims/submit",
    {
      method: "POST",
      body: JSON.stringify({
        userAddress,
        policyId,
        incidentType: "vault",
        targetId: "unknown",
        incidentAt: new Date().toISOString(),
        claimedAmountUSD: lossAmount,
        evidence: {
          description,
          // Put the first evidence string into txHash if it looks like one
          txHash: evidence?.find((e) => typeof e === "string" && e.startsWith("0x")) ?? undefined,
          url: evidence?.find((e) => typeof e === "string" && e.startsWith("http")) ?? undefined,
        },
      }),
    },
    () => {
      const claimId = `claim-${Date.now()}`;
      const now = Math.floor(Date.now() / 1000);

      mockClaims.unshift({
        id: claimId,
        policyId,
        status: "voting",
        lossAmount,
        claimedAmount: lossAmount,
        evidence,
        description,
        submittedAt: now,
        votesFor: 0,
        votesAgainst: 0,
        requiredQuorum: 2000,
        votingEndsAt: now + 3 * 86400,
        stakeRequired: 0.2,
        staked: 0.2,
      });

      return { claimId, txHash: shortTx() };
    }
  ).then((resp) => {
    // Backend returns { claim } or { claimId }
    if (resp?.claim?.id) return { claimId: String(resp.claim.id), txHash: shortTx() };
    if (resp?.claimId) return { claimId: String(resp.claimId), txHash: resp.txHash ?? shortTx() };
    return { claimId: `claim-${Date.now()}`, txHash: shortTx() };
  });
}
