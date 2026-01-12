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

function shortTx(): string {
  return `0x${Math.random().toString(16).slice(2)}${Math.random()
    .toString(16)
    .slice(2)}`.slice(0, 66);
}

function toUnixSeconds(iso: string): number {
  const ms = Date.parse(iso);
  return Number.isFinite(ms) ? Math.floor(ms / 1000) : Math.floor(Date.now() / 1000);
}

// Backend Policy -> UI CoveragePolicy
function mapPolicyToCoveragePolicy(p: any): CoveragePolicy {
  // If it's already UI-shaped, return as-is
  if (p && typeof p === "object" && "coverageAmount" in p && "premiumRate" in p) {
    return p as CoveragePolicy;
  }

  const startIso = p.startAt ?? p.createdAt ?? new Date().toISOString();
  const endIso = p.endAt ?? new Date(Date.now() + 90 * 86400 * 1000).toISOString();

  const startDate = toUnixSeconds(startIso);
  const endDate = toUnixSeconds(endIso);

  const durationDays =
    Number.isFinite(Date.parse(endIso)) && Number.isFinite(Date.parse(startIso))
      ? Math.max(1, Math.round((Date.parse(endIso) - Date.parse(startIso)) / 86400000))
      : 90;

  const coverageAmount = Number(p.coverageUsd ?? p.coverageAmountUSD ?? p.coverageAmount ?? 0);
  const premium = Number(p.premiumUsd ?? p.premiumPaidUSD ?? p.premium ?? 0);

  const premiumRate =
    coverageAmount > 0 && durationDays > 0
      ? Number(((premium / coverageAmount) * (365 / durationDays)).toFixed(4))
      : 0;

  return {
    id: String(p.id),
    policyType: "vault" as any,
    // Your UI uses positionId; backend has vaultId as target
    positionId: String(p.vaultId ?? p.targetId ?? "unknown"),
    coverageAmount,
    premium,
    premiumRate,
    duration: durationDays,
    startDate,
    endDate,
    riskScore: Number(p.riskScore ?? 35),
    active: Boolean(p.active ?? true),
    nftTokenId:
      p.nftTokenId ??
      `0x${Math.random().toString(16).slice(2, 10)}...${Math.random()
        .toString(16)
        .slice(2, 6)}`,
  } as any;
}

// Backend Claim -> UI Claim
function mapBackendClaimToUIClaim(c: any): Claim {
  // If already UI-shaped (mocks), return as-is
  if (c && typeof c === "object" && "lossAmount" in c && "claimedAmount" in c) {
    return c as Claim;
  }

  const submittedAt = toUnixSeconds(c.createdAt ?? new Date().toISOString());
  const votingEndsAt = toUnixSeconds(
    c.votingEndsAt ?? new Date(Date.now() + 3 * 86400 * 1000).toISOString()
  );

  const claimedAmount = Number(c.amountUsd ?? c.claimedAmountUSD ?? 0);

  // Backend does not store votesFor/votesAgainst directly; it stores votes list.
  const votes = Array.isArray(c.votes) ? c.votes : [];
  const votesFor = votes.filter((v: any) => v.support).length;
  const votesAgainst = votes.filter((v: any) => !v.support).length;

  return {
    id: String(c.id),
    policyId: String(c.policyId),
    status: String(c.status ?? "voting") as any,
    lossAmount: claimedAmount,
    claimedAmount,
    evidence: [
      c.evidenceUrl ? `url:${c.evidenceUrl}` : "",
    ].filter(Boolean),
    description: String(c.reason ?? ""),
    submittedAt,
    votesFor,
    votesAgainst,
    requiredQuorum: Number(c.requiredQuorum ?? 3), // using count-based quorum in backend vote route
    votingEndsAt,
    stakeRequired: Number(c.stakeRequired ?? 0.2),
    staked: Number(c.staked ?? 0.2),
  } as any;
}

/**
 * Backend route: GET /api/insurance/policies?address=0x...
 */
export async function getUserPolicies(userAddress: string): Promise<CoveragePolicy[]> {
  const rows = await apiRequest<any[]>(
    `/insurance/policies?address=${encodeURIComponent(userAddress)}`,
    { method: "GET" },
    () => mockPolicies as any
  );

  return rows.map(mapPolicyToCoveragePolicy);
}

/**
 * You don't have a quote endpoint in the backend yet.
 * For now, keep the existing estimator (excellent for demo).
 */
export async function getCoverageEstimateApi(
  positionId: string,
  coverageAmount: number,
  riskScore: number,
  duration: number = 90
): Promise<CoverageEstimate> {
  return apiRequest<CoverageEstimate>(
    "/insurance/quote",
    { method: "POST", body: JSON.stringify({ positionId, coverageAmount, riskScore, duration }) },
    () => getCoverageEstimate(coverageAmount, riskScore, duration)
  );
}

/**
 * Backend route: POST /api/insurance/policies
 * { address, vaultId, coverageUsd, durationDays }
 *
 * Your UI calls: purchaseCoverage(positionId, coverageAmount, duration, userAddress)
 * Here positionId == vaultId in our new backend model.
 */
export async function purchaseCoverage(
  positionId: string,
  coverageAmount: number,
  duration: number,
  userAddress: string
): Promise<{ policyId: string; txHash: string }> {
  const resp = await apiRequest<any>(
    "/insurance/policies",
    {
      method: "POST",
      body: JSON.stringify({
        address: userAddress,
        vaultId: positionId,
        coverageUsd: coverageAmount,
        durationDays: duration,
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

      return { id: policyId };
    }
  );

  // resp is policy object from backend
  const policyId = String(resp?.id ?? resp?.policyId ?? `policy-${Date.now()}`);
  return { policyId, txHash: shortTx() };
}

/**
 * Backend route: GET /api/insurance/claims
 * (returns all claims; we filter client-side by user’s policies)
 *
 * If you want a server-filter endpoint later, add it — but this works now.
 */
export async function getUserClaims(userAddress: string): Promise<Claim[]> {
  // First get policies for this user
  const policies = await getUserPolicies(userAddress);
  const myPolicyIds = new Set(policies.map((p) => p.id));

  const rows = await apiRequest<any[]>(
    "/insurance/claims",
    { method: "GET" },
    () => getClaimsByUser(userAddress) as any
  );

  const mapped = rows.map(mapBackendClaimToUIClaim);
  // Filter to claims whose policyId is owned by user
  return mapped.filter((c) => myPolicyIds.has(String(c.policyId)));
}

/**
 * Backend currently has GET /api/insurance/claims (list), no /claims/:id.
 * So we list + find.
 */
export async function getClaimById(id: string): Promise<Claim | null> {
  const rows = await apiRequest<any[]>(
    "/insurance/claims",
    { method: "GET" },
    () => mockClaims as any
  );

  const found = rows.find((c) => String(c.id) === String(id));
  if (found) return mapBackendClaimToUIClaim(found);

  // fallback to mock getter
  return getMockClaimById(id) ?? null;
}

/**
 * UI expects: submitClaim(policyId, lossAmount, description, evidence, userAddress)
 *
 * Backend route: POST /api/insurance/claims
 * { address, policyId, vaultId, amountUsd, reason, evidenceUrl? }
 *
 * We don't store evidence[] in DB yet; we store one URL. We pick the first http link.
 */
export async function submitClaim(
  policyId: string,
  lossAmount: number,
  description: string,
  evidence: string[],
  userAddress: string
): Promise<{ claimId: string; txHash: string }> {
  // Find the policy so we can attach vaultId
  const policies = await getUserPolicies(userAddress);
  const policy = policies.find((p) => String(p.id) === String(policyId));

  const vaultId = policy?.positionId ?? "unknown";
  const evidenceUrl = evidence?.find((e) => typeof e === "string" && e.startsWith("http"));

  const resp = await apiRequest<any>(
    "/insurance/claims",
    {
      method: "POST",
      body: JSON.stringify({
        address: userAddress,
        policyId,
        vaultId,
        amountUsd: lossAmount,
        reason: description,
        evidenceUrl,
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

      return { id: claimId };
    }
  );

  const claimId = String(resp?.id ?? resp?.claimId ?? `claim-${Date.now()}`);
  return { claimId, txHash: shortTx() };
}