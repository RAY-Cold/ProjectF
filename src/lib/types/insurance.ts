export type ClaimStatus = 
  | 'draft' 
  | 'submitted' 
  | 'voting' 
  | 'approved' 
  | 'paid' 
  | 'rejected';

export interface CoveragePolicy {
  id: string;
  policyType: 'vault' | 'lending';
  positionId: string; // vault ID or lending position ID
  coverageAmount: number; // in ETH
  premium: number; // in ETH
  premiumRate: number; // percentage
  duration: number; // in days
  startDate: number; // timestamp
  endDate: number; // timestamp
  riskScore: number; // at time of purchase
  active: boolean;
  nftTokenId?: string; // if coverage is NFT-based
}

export interface Claim {
  id: string;
  policyId: string;
  status: ClaimStatus;
  lossAmount: number; // in ETH
  claimedAmount: number; // in ETH
  evidence: string[]; // URLs or hashes
  description: string;
  submittedAt: number; // timestamp
  resolvedAt?: number; // timestamp
  payoutAmount?: number; // in ETH
  votesFor: number;
  votesAgainst: number;
  requiredQuorum: number;
  votingEndsAt?: number; // timestamp
  stakeRequired: number; // in ETH (fraud prevention)
  staked?: number; // in ETH
}

export interface CoverageEstimate {
  coverageAmount: number;
  premium: number;
  premiumRate: number;
  duration: number;
  riskScore: number;
  multiplier: number; // risk-based premium multiplier
}

