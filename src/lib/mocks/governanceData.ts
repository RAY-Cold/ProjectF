import { ClaimProposal, ParameterProposal, DAOStats, Vote } from '@/lib/types/governance';

export const mockClaimProposals: ClaimProposal[] = [
  {
    claimId: 'claim-1',
    title: 'Vault Exploit Claim - Conservative Yield Vault',
    description: 'Claim for 2.5 ETH loss due to smart contract exploit in underlying protocol.',
    lossAmount: 2.5,
    votesFor: 1250,
    votesAgainst: 320,
    requiredQuorum: 2000,
    votingEndsAt: Date.now() / 1000 + 86400 * 3,
    status: 'active',
  },
  {
    claimId: 'claim-2',
    title: 'Previous Approved Claim',
    description: 'Already approved and paid claim.',
    lossAmount: 1.2,
    votesFor: 1800,
    votesAgainst: 200,
    requiredQuorum: 2000,
    votingEndsAt: Date.now() / 1000 - 86400 * 5,
    status: 'passed',
  },
];

export const mockParameterProposals: ParameterProposal[] = [
  {
    id: 'param-1',
    title: 'Adjust Base Risk Multiplier',
    description: 'Proposal to increase base risk multiplier from 1.0x to 1.2x to account for increased market volatility.',
    parameter: 'risk_model.base_multiplier',
    currentValue: '1.0',
    proposedValue: '1.2',
    votesFor: 850,
    votesAgainst: 420,
    requiredQuorum: 2000,
    votingEndsAt: Date.now() / 1000 + 86400 * 5,
    status: 'active',
  },
  {
    id: 'param-2',
    title: 'Update Premium Curve Parameters',
    description: 'Adjust premium calculation curve to better reflect actual risk levels.',
    parameter: 'insurance.premium_curve',
    currentValue: 'linear',
    proposedValue: 'exponential',
    votesFor: 620,
    votesAgainst: 380,
    requiredQuorum: 2000,
    votingEndsAt: Date.now() / 1000 + 86400 * 7,
    status: 'active',
  },
];

export const mockDAOStats: DAOStats = {
  totalProposals: 24,
  activeProposals: 3,
  totalVoters: 1250,
  quorumThreshold: 2000, // token amount
  votingPeriod: 7, // days
};

export const mockVotes: Vote[] = [
  {
    voter: '0x1234...5678',
    claimId: 'claim-1',
    voteType: 'approve',
    votingPower: 500,
    timestamp: Date.now() / 1000 - 3600,
  },
  {
    voter: '0xabcd...efgh',
    claimId: 'claim-1',
    voteType: 'reject',
    votingPower: 200,
    timestamp: Date.now() / 1000 - 1800,
  },
];

