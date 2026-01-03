/* eslint-disable no-var */

export type ISODate = string;

export type PolicyStatus = "active" | "expired" | "settled" | "cancelled";
export type ClaimStatus = "submitted" | "voting" | "approved" | "rejected" | "paid";

export type CoverageType = "vault" | "lending" | "depeg" | "exploit";

export type Policy = {
  id: string;
  userAddress: string;
  coverageType: CoverageType;
  targetId: string; // vaultId / marketId / asset
  coverageAmountUSD: number;
  premiumPaidUSD: number;
  deductibleBps: number; // e.g. 1000 = 10%
  activationDelaySec: number; // anti-sniping
  startAt: ISODate;
  activeFrom: ISODate;
  endAt: ISODate;
  status: PolicyStatus;
  createdAt: ISODate;
};

export type Claim = {
  id: string;
  policyId: string;
  userAddress: string;
  incidentType: CoverageType;
  targetId: string;
  incidentAt: ISODate;
  submittedAt: ISODate;
  evidence: {
    txHash?: string;
    description?: string;
    url?: string;
  };
  claimedAmountUSD: number;
  bondUSD: number;
  status: ClaimStatus;

  // voting
  votingStartsAt?: ISODate;
  votingEndsAt?: ISODate;
  votesFor: number;
  votesAgainst: number;

  // decision / payout
  decidedAt?: ISODate;
  decisionReason?: string;
  approvedAmountUSD?: number;
  payoutAt?: ISODate;
};

export type ParameterProposal = {
  id: string;
  title: string;
  description: string;
  proposedBy: string;
  createdAt: ISODate;

  changes: Partial<InsuranceParams>;

  votingStartsAt: ISODate;
  votingEndsAt: ISODate;
  votesFor: number;
  votesAgainst: number;

  status: "voting" | "approved" | "rejected" | "executed";
  executedAt?: ISODate;
};

export type ClaimVote = {
  claimId: string;
  voter: string;
  support: boolean;
  weight: number;
  votedAt: ISODate;
};

export type ParamVote = {
  proposalId: string;
  voter: string;
  support: boolean;
  weight: number;
  votedAt: ISODate;
};

export type PoolAccounting = {
  poolBalanceUSD: number;      // pool capital (premiums + initial seed)
  reservedUSD: number;         // reserved for sold coverage
  totalPremiumsUSD: number;    // sum premiums
  totalPaidOutUSD: number;     // payouts
  totalClaimsUSD: number;      // claimed amount sum (submitted)
};

export type InsuranceParams = {
  baseRateBps: number;            // base annual rate in bps
  riskMultiplierMin: number;       // e.g. 0.7
  riskMultiplierMax: number;       // e.g. 2.0
  utilizationMultiplierMax: number;// e.g. 2.5
  minPremiumUSD: number;           // minimum premium
  maxCoveragePerUserUSD: number;   // cap per user
  maxUtilizationBps: number;       // cap: reserved/poolBalance * 10000
  deductibleBpsDefault: number;
  activationDelaySecDefault: number;
  claimBondBps: number;            // claim bond = bps of claimed
  votingPeriodSec: number;         // claim voting duration
  parameterVotingPeriodSec: number;
  quorumMinVotes: number;          // minimum votes to finalize
};

export type DB = {
  policies: Policy[];
  claims: Claim[];
  claimVotes: ClaimVote[];
  parameterProposals: ParameterProposal[];
  paramVotes: ParamVote[];

  pool: PoolAccounting;
  params: InsuranceParams;
};

function nowISO(): ISODate {
  return new Date().toISOString();
}

function seed(): DB {
  return {
    policies: [],
    claims: [],
    claimVotes: [],
    parameterProposals: [],
    paramVotes: [],
    pool: {
      poolBalanceUSD: 250000, // seed pool for demo
      reservedUSD: 0,
      totalPremiumsUSD: 0,
      totalPaidOutUSD: 0,
      totalClaimsUSD: 0,
    },
    params: {
      baseRateBps: 350, // 3.5% annual base
      riskMultiplierMin: 0.8,
      riskMultiplierMax: 2.2,
      utilizationMultiplierMax: 2.8,
      minPremiumUSD: 2,
      maxCoveragePerUserUSD: 25000,
      maxUtilizationBps: 7500, // 75%
      deductibleBpsDefault: 1000, // 10%
      activationDelaySecDefault: 900, // 15 min
      claimBondBps: 100, // 1% bond
      votingPeriodSec: 300, // 5 min (hackathon demo)
      parameterVotingPeriodSec: 300,
      quorumMinVotes: 1,
    },
  };
}

declare global {
  // eslint-disable-next-line no-var
  var __FORTIFY_DEFIDB__: DB | undefined;
}

export function getDB(): DB {
  if (!globalThis.__FORTIFY_DEFIDB__) globalThis.__FORTIFY_DEFIDB__ = seed();
  return globalThis.__FORTIFY_DEFIDB__!;
}

export function resetDB(): void {
  globalThis.__FORTIFY_DEFIDB__ = seed();
}

export const time = { nowISO };
