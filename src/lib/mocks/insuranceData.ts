import { CoveragePolicy, Claim, CoverageEstimate } from '@/lib/types/insurance';

export const mockPolicies: CoveragePolicy[] = [
  {
    id: 'policy-1',
    policyType: 'vault',
    positionId: 'vault-1',
    coverageAmount: 10.5,
    premium: 0.1365,
    premiumRate: 1.3,
    duration: 90,
    startDate: Date.now() / 1000 - 86400 * 30,
    endDate: Date.now() / 1000 + 86400 * 60,
    riskScore: 25,
    active: true,
    nftTokenId: '0x1234...5678',
  },
];

export const mockClaims: Claim[] = [
  {
    id: 'claim-1',
    policyId: 'policy-1',
    status: 'voting',
    lossAmount: 2.5,
    claimedAmount: 2.5,
    evidence: [
      'https://etherscan.io/tx/0xabc...',
      'https://ipfs.io/ipfs/QmXyz...',
    ],
    description: 'Vault experienced a smart contract exploit resulting in partial loss of funds. Evidence includes on-chain transaction logs and protocol incident report.',
    submittedAt: Date.now() / 1000 - 86400 * 2,
    votesFor: 1250,
    votesAgainst: 320,
    requiredQuorum: 2000,
    votingEndsAt: Date.now() / 1000 + 86400 * 3,
    stakeRequired: 0.5,
    staked: 0.5,
  },
  {
    id: 'claim-2',
    policyId: 'policy-1',
    status: 'approved',
    lossAmount: 1.2,
    claimedAmount: 1.2,
    evidence: [
      'https://etherscan.io/tx/0xdef...',
    ],
    description: 'Previous claim for smaller loss amount, already approved and paid.',
    submittedAt: Date.now() / 1000 - 86400 * 45,
    resolvedAt: Date.now() / 1000 - 86400 * 40,
    payoutAmount: 1.2,
    votesFor: 1800,
    votesAgainst: 200,
    requiredQuorum: 2000,
    stakeRequired: 0.3,
    staked: 0.3,
  },
  {
    id: 'claim-3',
    policyId: 'policy-1',
    status: 'draft',
    lossAmount: 0.8,
    claimedAmount: 0.8,
    evidence: [],
    description: 'Draft claim not yet submitted.',
    submittedAt: 0,
    votesFor: 0,
    votesAgainst: 0,
    requiredQuorum: 2000,
    stakeRequired: 0.2,
  },
];

export function getCoverageEstimate(
  coverageAmount: number,
  riskScore: number,
  duration: number = 90
): CoverageEstimate {
  const basePremiumRate = 1.0; // 1% base
  const riskMultiplier = 1.0 + (riskScore / 100) * 2.0; // 1x to 3x
  const premiumRate = basePremiumRate * riskMultiplier;
  const premium = (coverageAmount * premiumRate * duration) / 365;
  
  return {
    coverageAmount,
    premium,
    premiumRate,
    duration,
    riskScore,
    multiplier: riskMultiplier,
  };
}

export function getClaimsByUser(userAddress?: string): Claim[] {
  // In real app, filter by user's policies
  return mockClaims;
}

export function getClaimById(id: string): Claim | undefined {
  return mockClaims.find(c => c.id === id);
}

