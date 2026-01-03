import { getDB, time, type ParameterProposal } from "./store";
import { payoutClaim } from "./insuranceEngine";

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

function addSeconds(iso: string, sec: number) {
  const d = new Date(iso);
  d.setSeconds(d.getSeconds() + sec);
  return d.toISOString();
}

export function getDAOStats() {
  const db = getDB();
  return {
    poolBalanceUSD: db.pool.poolBalanceUSD,
    reservedUSD: db.pool.reservedUSD,
    utilizationBps: Math.round((db.pool.reservedUSD / Math.max(1, db.pool.poolBalanceUSD)) * 10000),
    totalPremiumsUSD: db.pool.totalPremiumsUSD,
    totalPaidOutUSD: db.pool.totalPaidOutUSD,
    totalClaimsUSD: db.pool.totalClaimsUSD,
    params: db.params,
  };
}

export function listClaimProposals() {
  const db = getDB();
  // expose claims in voting/approved etc. as "proposals"
  return db.claims.map(c => ({
    claimId: c.id,
    policyId: c.policyId,
    userAddress: c.userAddress,
    status: c.status,
    claimedAmountUSD: c.claimedAmountUSD,
    votesFor: c.votesFor,
    votesAgainst: c.votesAgainst,
    votingEndsAt: c.votingEndsAt,
    incidentType: c.incidentType,
    targetId: c.targetId,
    submittedAt: c.submittedAt,
  }));
}

export function castClaimVote(input: { claimId: string; voter: string; support: boolean; weight?: number }) {
  const db = getDB();
  const claim = db.claims.find(c => c.id === input.claimId);
  if (!claim) throw new Error("Claim not found");
  if (claim.status !== "voting") throw new Error(`Claim not in voting state (${claim.status})`);

  const now = time.nowISO();
  const ends = new Date(claim.votingEndsAt ?? now).getTime();
  if (Date.now() > ends) throw new Error("Voting period ended");

  // one vote per voter per claim
  const existing = db.claimVotes.find(v => v.claimId === input.claimId && v.voter === input.voter);
  if (existing) throw new Error("Already voted");

  const weight = Math.max(1, Math.floor(input.weight ?? 1));

  db.claimVotes.push({
    claimId: input.claimId,
    voter: input.voter,
    support: input.support,
    weight,
    votedAt: now,
  });

  if (input.support) claim.votesFor += weight;
  else claim.votesAgainst += weight;

  return { claimId: claim.id, votesFor: claim.votesFor, votesAgainst: claim.votesAgainst };
}

export function finalizeClaimVote(input: { claimId: string }) {
  const db = getDB();
  const params = db.params;
  const claim = db.claims.find(c => c.id === input.claimId);
  if (!claim) throw new Error("Claim not found");
  if (claim.status !== "voting") throw new Error(`Claim not in voting (${claim.status})`);

  const now = time.nowISO();
  const ends = new Date(claim.votingEndsAt ?? now).getTime();
  if (Date.now() < ends) throw new Error("Voting period not ended yet");

  const totalVotes = claim.votesFor + claim.votesAgainst;
  if (totalVotes < params.quorumMinVotes) {
    claim.status = "rejected";
    claim.decidedAt = now;
    claim.decisionReason = "Quorum not met";
    return { claim };
  }

  if (claim.votesFor > claim.votesAgainst) {
    claim.status = "approved";
    claim.decidedAt = now;
    claim.decisionReason = "Approved by DAO vote";
  } else {
    claim.status = "rejected";
    claim.decidedAt = now;
    claim.decisionReason = "Rejected by DAO vote";
  }

  return { claim };
}

export function executePayout(input: { claimId: string }) {
  // only approved -> paid
  return payoutClaim(input.claimId);
}

// ---------------- Parameter proposals ----------------

export function listParameterProposals() {
  const db = getDB();
  return db.parameterProposals;
}

export function proposeParameters(input: {
  proposedBy: string;
  title: string;
  description: string;
  changes: Partial<ReturnType<typeof getDAOStats>["params"]>;
}) {
  const db = getDB();
  const now = time.nowISO();

  const prop: ParameterProposal = {
    id: uid("prm"),
    title: input.title,
    description: input.description,
    proposedBy: input.proposedBy,
    createdAt: now,
    changes: input.changes,
    votingStartsAt: now,
    votingEndsAt: addSeconds(now, db.params.parameterVotingPeriodSec),
    votesFor: 0,
    votesAgainst: 0,
    status: "voting",
  };

  db.parameterProposals.unshift(prop);
  return { proposal: prop };
}

export function castParameterVote(input: {
  proposalId: string;
  voter: string;
  support: boolean;
  weight?: number;
}) {
  const db = getDB();
  const prop = db.parameterProposals.find(p => p.id === input.proposalId);
  if (!prop) throw new Error("Proposal not found");
  if (prop.status !== "voting") throw new Error(`Proposal not voting (${prop.status})`);

  const ends = new Date(prop.votingEndsAt).getTime();
  if (Date.now() > ends) throw new Error("Voting ended");

  const existing = db.paramVotes.find(v => v.proposalId === input.proposalId && v.voter === input.voter);
  if (existing) throw new Error("Already voted");

  const weight = Math.max(1, Math.floor(input.weight ?? 1));
  const now = time.nowISO();

  db.paramVotes.push({
    proposalId: input.proposalId,
    voter: input.voter,
    support: input.support,
    weight,
    votedAt: now,
  });

  if (input.support) prop.votesFor += weight;
  else prop.votesAgainst += weight;

  return { proposalId: prop.id, votesFor: prop.votesFor, votesAgainst: prop.votesAgainst };
}

export function finalizeParameterProposal(input: { proposalId: string }) {
  const db = getDB();
  const params = db.params;
  const prop = db.parameterProposals.find(p => p.id === input.proposalId);
  if (!prop) throw new Error("Proposal not found");
  if (prop.status !== "voting") throw new Error(`Proposal not voting (${prop.status})`);

  const ends = new Date(prop.votingEndsAt).getTime();
  if (Date.now() < ends) throw new Error("Voting not ended");

  const totalVotes = prop.votesFor + prop.votesAgainst;
  if (totalVotes < params.quorumMinVotes) {
    prop.status = "rejected";
    return { proposal: prop };
  }

  if (prop.votesFor > prop.votesAgainst) prop.status = "approved";
  else prop.status = "rejected";

  return { proposal: prop };
}

export function executeParameterProposal(input: { proposalId: string }) {
  const db = getDB();
  const prop = db.parameterProposals.find(p => p.id === input.proposalId);
  if (!prop) throw new Error("Proposal not found");
  if (prop.status !== "approved") throw new Error(`Proposal not approved (${prop.status})`);

  // Apply changes
  db.params = { ...db.params, ...prop.changes };
  prop.status = "executed";
  prop.executedAt = time.nowISO();

  return { proposal: prop, params: db.params };
}

// ---------------- Demo helper ----------------

export function fastForwardClaim(claimId: string, to?: "endVoting" | "approved" | "rejected" | "paid") {
  const db = getDB();
  const claim = db.claims.find(c => c.id === claimId);
  if (!claim) throw new Error("Claim not found");

  const now = time.nowISO();

  // end voting immediately
  if (claim.status === "voting") {
    claim.votingEndsAt = now;
  }

  if (to === "approved") {
    claim.status = "approved";
    claim.decidedAt = now;
    claim.decisionReason = "Fast-forward approved (demo)";
    return { claim };
  }

  if (to === "rejected") {
    claim.status = "rejected";
    claim.decidedAt = now;
    claim.decisionReason = "Fast-forward rejected (demo)";
    return { claim };
  }

  if (to === "paid") {
    if (claim.status !== "approved") {
      claim.status = "approved";
      claim.decidedAt = now;
      claim.decisionReason = "Fast-forward approved before payout (demo)";
    }
    return executePayout({ claimId });
  }

  // default: just end voting
  return { claim };
}
