// src/lib/api/governance.ts
import { ClaimProposal, ParameterProposal, DAOStats, Vote } from "@/lib/types/governance";
import { apiRequest } from "./client";
import {
  mockClaimProposals,
  mockParameterProposals,
  mockDAOStats,
  mockVotes,
} from "@/lib/mocks/governanceData";

// Helper: tiny tx hash for demo UI
function shortTx(): string {
  return `0x${Math.random().toString(16).slice(2)}${Math.random()
    .toString(16)
    .slice(2)}`.slice(0, 66);
}

function toUnixSeconds(iso: string): number {
  const ms = Date.parse(iso);
  return Number.isFinite(ms) ? Math.floor(ms / 1000) : Math.floor(Date.now() / 1000);
}

/**
 * CLAIM GOVERNANCE:
 * Our backend adjudication is done via:
 *  POST /api/insurance/claims/:id/vote
 * and claims are listed at:
 *  GET /api/insurance/claims
 *
 * So: ClaimProposal list is derived from insurance claims.
 */
function mapClaimToClaimProposal(c: any): ClaimProposal {
  const votes = Array.isArray(c.votes) ? c.votes : [];
  const votesFor = votes.filter((v: any) => v.support).length;
  const votesAgainst = votes.filter((v: any) => !v.support).length;

  return {
    id: String(c.id),
    claimId: String(c.id),
    policyId: String(c.policyId ?? ""),
    claimant: String(c.claimant ?? c.userAddress ?? ""),
    status: String(c.status ?? "voting") as any,
    amount: Number(c.amountUsd ?? c.claimedAmountUSD ?? 0),
    votesFor,
    votesAgainst,
    requiredQuorum: Number(c.requiredQuorum ?? 3),
    votingEndsAt: c.votingEndsAt
      ? toUnixSeconds(c.votingEndsAt)
      : toUnixSeconds(new Date(Date.now() + 3 * 86400e3).toISOString()),
    incidentType: "vault",
    targetId: String(c.vaultId ?? "unknown"),
    submittedAt: c.createdAt ? toUnixSeconds(c.createdAt) : toUnixSeconds(new Date().toISOString()),
  } as any;
}

/**
 * PARAMETER GOVERNANCE:
 * Stored in Proposal model:
 *  GET /api/governance/proposals
 */
function mapProposalToParameterProposal(p: any): ParameterProposal {
  // payloadJson is stored as string in DB
  let changes: any = {};
  try {
    changes = p.payloadJson ? JSON.parse(p.payloadJson) : {};
  } catch {
    changes = {};
  }

  return {
    id: String(p.id),
    title: String(p.title ?? "Parameter Proposal"),
    description: String(p.description ?? ""),
    proposer: String(p.proposedBy ?? p.proposer ?? "DAO"),
    createdAt: p.createdAt ? toUnixSeconds(p.createdAt) : toUnixSeconds(new Date().toISOString()),
    changes,
    votesFor: Array.isArray(p.votes)
      ? p.votes.filter((v: any) => v.support).reduce((a: number, v: any) => a + Number(v.weight ?? 1), 0)
      : Number(p.votesFor ?? 0),
    votesAgainst: Array.isArray(p.votes)
      ? p.votes.filter((v: any) => !v.support).reduce((a: number, v: any) => a + Number(v.weight ?? 1), 0)
      : Number(p.votesAgainst ?? 0),
    votingEndsAt: p.endsAt ? toUnixSeconds(p.endsAt) : toUnixSeconds(new Date(Date.now() + 3 * 86400e3).toISOString()),
    status: String(p.status ?? "active") as any,
    executedAt: p.executedAt ? toUnixSeconds(p.executedAt) : undefined,
  } as any;
}

/**
 * If UI calls getClaimVotes(claimId), we don't have a dedicated endpoint.
 * We fall back to mocks (or you can add an endpoint later).
 */
export async function getClaimVotes(claimId: string): Promise<Vote[]> {
  return apiRequest<Vote[]>(
    `/dao/votes/${encodeURIComponent(claimId)}`,
    { method: "GET" },
    () => mockVotes.filter((v) => v.claimId === claimId)
  );
}

export async function getClaimProposals(): Promise<ClaimProposal[]> {
  const rows = await apiRequest<any[]>(
    "/insurance/claims",
    { method: "GET" },
    () => mockClaimProposals as any
  );

  // If it’s already in UI claim-proposal shape (mocks), return as is
  if (rows?.length && "claimId" in (rows[0] as any) && "votesFor" in (rows[0] as any)) {
    return rows as any;
  }

  return rows.map(mapClaimToClaimProposal);
}

export async function getParameterProposals(): Promise<ParameterProposal[]> {
  const rows = await apiRequest<any[]>(
    "/governance/proposals",
    { method: "GET" },
    () => mockParameterProposals as any
  );

  // If mocks already match
  if (rows?.length && "changes" in (rows[0] as any) && "votesFor" in (rows[0] as any)) {
    return rows as any;
  }

  return rows.map(mapProposalToParameterProposal);
}

/**
 * DAO stats: your new backend doesn't yet expose treasury stats.
 * For now we keep mock stats (good for hackathon) but still try backend first.
 * If you want, I can add /api/governance/stats later backed by DB + activity sums.
 */
export async function getDAOStats(): Promise<DAOStats> {
  const row = await apiRequest<any>(
    "/governance/stats",
    { method: "GET" },
    () => mockDAOStats as any
  );

  // If backend not present, mock returns correct shape
  return row as DAOStats;
}

/**
 * voteOnClaim(claimId, voteType, userAddress)
 * New backend: POST /api/insurance/claims/:id/vote
 * { address, support, weight? }
 */
export async function voteOnClaim(
  claimId: string,
  voteType: "approve" | "reject",
  userAddress: string
): Promise<{ txHash: string }> {
  await apiRequest<any>(
    `/insurance/claims/${encodeURIComponent(claimId)}/vote`,
    {
      method: "POST",
      body: JSON.stringify({
        address: userAddress,
        support: voteType === "approve",
        weight: 1,
      }),
    },
    () => ({ ok: true })
  );

  return { txHash: shortTx() };
}

/**
 * Optional helpers - these endpoints aren't implemented in the new backend yet,
 * so we keep them as no-ops with mock fallback to avoid breaking UI.
 */
export async function finalizeClaimVote(_claimId: string): Promise<void> {
  // With the new vote endpoint, adjudication happens automatically.
  return;
}

export async function executePayout(_claimId: string): Promise<void> {
  // Payout happens automatically after approval in our backend vote route.
  return;
}

/**
 * fastForwardClaim is demo-only. No backend endpoint yet; keep mock-only behavior.
 */
export async function fastForwardClaim(claimId: string, newStatus: string): Promise<void> {
  // If you want this supported server-side, add a /api/sim/fast-forward endpoint.
  // For now, keep it as a harmless call that uses mock fallback.
  await apiRequest<any>(
    `/dao/fast-forward/${encodeURIComponent(claimId)}`,
    { method: "POST", body: JSON.stringify({ status: newStatus }) },
    () => ({ ok: true })
  );
}