export type VoteType = 'approve' | 'reject' | 'abstain';

export interface Vote {
  voter: string; // address
  claimId: string;
  voteType: VoteType;
  votingPower: number; // token amount
  timestamp: number;
}

export interface ClaimProposal {
  claimId: string;
  title: string;
  description: string;
  lossAmount: number;
  votesFor: number;
  votesAgainst: number;
  requiredQuorum: number;
  votingEndsAt: number;
  status: 'active' | 'passed' | 'rejected' | 'expired';
}

export interface ParameterProposal {
  id: string;
  title: string;
  description: string;
  parameter: string; // e.g., 'risk_model.base_multiplier'
  currentValue: string;
  proposedValue: string;
  votesFor: number;
  votesAgainst: number;
  requiredQuorum: number;
  votingEndsAt: number;
  status: 'active' | 'passed' | 'rejected' | 'expired';
}

export interface DAOStats {
  totalProposals: number;
  activeProposals: number;
  totalVoters: number;
  quorumThreshold: number; // percentage
  votingPeriod: number; // in days
}

