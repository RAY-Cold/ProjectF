// src/lib/api/governance.ts
import { ClaimProposal, ParameterProposal, DAOStats, Vote } from "@/lib/types/governance";
import { apiRequest } from "./client";
import {
  mockClaimProposals,
  mockParameterProposals,
  mockDAOStats,
  mockVotes,
} from "@/lib/mocks/governanceData";

/**
 * Backend endpoints used (Next.js API routes):
 *  - GET  /api/dao/claims
 *  - GET  /api/dao/parameters
 *  - GET  /api/dao/stats
 *  - POST /api/dao/vote              (supports claim + parameter voting)
 *  - POST /api/dao/finalize-claim
 *  - POST /api/dao/payout
 *  - POST /api/dao/propose
 *  - POST /api/dao/finalize-parameter (action: finalize|execute)
 *  - POST /api/dao/fast-forward/:claimId
 *
 * Your UI types may differ slightly from backend shape, so we normalize.
 */

function shortTx(): string {
  return `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`.slice(0, 66);
}

function toUnixSeconds(iso: string): number {
  const ms = Date.parse(iso);
  return Number.isFinite(ms) ? Math.floor(ms / 1000) : Math.floor(Date.now() / 1000);
}

/** Normalize backend claim proposal -> UI ClaimProposal */
function mapClaimProposal(row: any): ClaimProposal {
  // Backend listClaimProposals() returns:
  // { claimId, policyId, userAddress, status, claimedAmountUSD, votesFor, votesAgainst, votingEndsAt, incidentType, targetId, submittedAt }
  // Your UI ClaimProposal likely expects: id, claimId, policyId, ... + quorum info etc.
  return {
    id: String(row.id ?? row.claimId),
    claimId: String(row.claimId ?? row.id),
    policyId: String(row.policyId ?? ""),
    claimant: String(row.userAddress ?? row.claimant ?? ""),
    status: String(row.status ?? "voting") as any,
    amount: Number(row.claimedAmountUSD ?? row.amount ?? 0),
    votesFor: Number(row.votesFor ?? 0),
    votesAgainst: Number(row.votesAgainst ?? 0),
    votingEndsAt: row.votingEndsAt ? toUnixSeconds(row.votingEndsAt) : toUnixSeconds(new Date(Date.now() + 3 * 86400e3).toISOString()),
    // Optional fields some UIs use:
    incidentType: row.incidentType ?? row.type ?? "vault",
    targetId: row.targetId ?? row.positionId ?? "unknown",
    submittedAt: row.submittedAt ? toUnixSeconds(row.submittedAt) : toUnixSeconds(new Date().toISOString()),
    requiredQuorum: Number(row.requiredQuorum ?? 2000),
  } as any;
}

/** Normalize backend parameter proposal -> UI ParameterProposal */
function mapParameterProposal(row: any): ParameterProposal {
  // Backend returns ParameterProposal { id,title,description,proposedBy,createdAt,changes,votingStartsAt,votingEndsAt,votesFor,votesAgainst,status,executedAt? }
  return {
    id: String(row.id),
    title: String(row.title ?? "Parameter Proposal"),
    description: String(row.description ?? ""),
    proposer: String(row.proposedBy ?? row.proposer ?? ""),
    createdAt: row.createdAt ? toUnixSeconds(row.createdAt) : toUnixSeconds(new Date().toISOString()),
    changes: row.changes ?? {},
    votesFor: Number(row.votesFor ?? 0),
    votesAgainst: Number(row.votesAgainst ?? 0),
    votingEndsAt: row.votingEndsAt ? toUnixSeconds(row.votingEndsAt) : toUnixSeconds(new Date(Date.now() + 3 * 86400e3).toISOString()),
    status: String(row.status ?? "voting") as any,
    executedAt: row.executedAt ? toUnixSeconds(row.executedAt) : undefined,
  } as any;
}

/** Normalize backend dao stats -> UI DAOStats */
function mapDAOStats(row: any): DAOStats {
  // Backend getDAOStats returns:
  // { poolBalanceUSD, reservedUSD, utilizationBps, totalPremiumsUSD, totalPaidOutUSD, totalClaimsUSD, params }
  return {
    poolBalance: Number(row.poolBalanceUSD ?? row.poolBalance ?? 0),
    reserved: Number(row.reservedUSD ?? row.reserved ?? 0),
    utilization: Number(row.utilizationBps ?? 0) / 100, // bps -> %
    totalPremiums: Number(row.totalPremiumsUSD ?? 0),
    totalPaidOut: Number(row.totalPaidOutUSD ?? 0),
    totalClaims: Number(row.totalClaimsUSD ?? 0),
    params: row.params ?? {},
  } as any;
}

/**
 * If your UI calls getClaimVotes(claimId), but backend doesn't expose a votes list endpoint yet,
 * we fall back to mock votes.
 * (You can add /api/dao/votes/[claimId] later if needed.)
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
    "/dao/claims",
    { method: "GET" },
    () => mockClaimProposals as any
  );

  // If mocks already match UI types, keep them
  if (rows?.length && "claimId" in (rows[0] as any) && "votesFor" in (rows[0] as any) && "status" in (rows[0] as any)) {
    // Might still be backend shape; we map safely
    return rows.map(mapClaimProposal);
  }
  return (rows as any[]).map(mapClaimProposal);
}

export async function getParameterProposals(): Promise<ParameterProposal[]> {
  // Your old code used '/dao/proposals' but our backend route is '/dao/parameters'
  const rows = await apiRequest<any[]>(
    "/dao/parameters",
    { method: "GET" },
    () => mockParameterProposals as any
  );

  // If mock shape is already UI-compatible, return as-is; otherwise map.
  if (rows?.length && "changes" in (rows[0] as any) && "votesFor" in (rows[0] as any)) {
    return rows.map(mapParameterProposal);
  }
  return (rows as any[]).map(mapParameterProposal);
}

export async function getDAOStats(): Promise<DAOStats> {
  const row = await apiRequest<any>(
    "/dao/stats",
    { method: "GET" },
    () => mockDAOStats as any
  );
  // If mock already correct, map is harmless
  return mapDAOStats(row);
}

/**
 * voteOnClaim(claimId, voteType, userAddress)
 * voteType: 'approve' | 'reject'
 * Backend expects: POST /dao/vote with { mode:'claim', claimId, voter, support }
 */
export async function voteOnClaim(
  claimId: string,
  voteType: "approve" | "reject",
  userAddress: string
): Promise<{ txHash: string }> {
  await apiRequest<any>(
    "/dao/vote",
    {
      method: "POST",
      body: JSON.stringify({
        mode: "claim",
        claimId,
        voter: userAddress,
        support: voteType === "approve",
        weight: 1,
      }),
    },
    () => ({ ok: true })
  );

  return { txHash: shortTx() };
}

/**
 * Optional helpers (useful if your Governance UI has these actions)
 */
export async function finalizeClaimVote(claimId: string): Promise<void> {
  await apiRequest<any>(
    "/dao/finalize-claim",
    { method: "POST", body: JSON.stringify({ claimId }) },
    () => ({ ok: true })
  );
}

export async function executePayout(claimId: string): Promise<void> {
  await apiRequest<any>(
    "/dao/payout",
    { method: "POST", body: JSON.stringify({ claimId }) },
    () => ({ ok: true })
  );
}

/**
 * fastForwardClaim(claimId, newStatus)
 * Your existing UI sends { status: newStatus }
 * Backend expects { to } where to is one of: "endVoting"|"approved"|"rejected"|"paid"
 */
export async function fastForwardClaim(claimId: string, newStatus: string): Promise<void> {
  // map UI status -> backend "to"
  const map: Record<string, "endVoting" | "approved" | "rejected" | "paid"> = {
    voting: "endVoting",
    endVoting: "endVoting",
    approved: "approved",
    rejected: "rejected",
    paid: "paid",
  };

  const to = map[newStatus] ?? "endVoting";

  await apiRequest<any>(
    `/dao/fast-forward/${encodeURIComponent(claimId)}`,
    {
      method: "POST",
      body: JSON.stringify({ to, status: newStatus }),
    },
    () => ({ ok: true })
  );
}
