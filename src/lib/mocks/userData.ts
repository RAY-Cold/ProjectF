import { Portfolio, Activity, RiskProfile } from '@/lib/types/user';
import { mockVaultPositions } from './vaultData';
import { mockPolicies } from './insuranceData';

export const mockRiskProfile: RiskProfile = {
  userRiskScore: 35,
  factors: [
    { factor: 'Account Age', weight: 15, contribution: 10 },
    { factor: 'Portfolio Diversity', weight: 25, contribution: 20 },
    { factor: 'Transaction History', weight: 20, contribution: 15 },
    { factor: 'Coverage Ratio', weight: 30, contribution: 25 },
    { factor: 'Vault Selection', weight: 10, contribution: 5 },
  ],
  label: 'medium',
  lastUpdated: Date.now() / 1000,
};

export const mockActivities: Activity[] = [
  {
    id: 'act-1',
    type: 'deposit',
    timestamp: Date.now() / 1000 - 86400 * 30,
    amount: 10.5,
    description: 'Deposited 10.5 ETH into Conservative Yield Vault (Insured)',
    txHash: '0xabc123...',
    status: 'completed',
  },
  {
    id: 'act-2',
    type: 'coverage_purchased',
    timestamp: Date.now() / 1000 - 86400 * 30,
    amount: 0.1365,
    description: 'Purchased coverage for Conservative Yield Vault position',
    txHash: '0xdef456...',
    status: 'completed',
  },
  {
    id: 'act-3',
    type: 'deposit',
    timestamp: Date.now() / 1000 - 86400 * 15,
    amount: 5.2,
    description: 'Deposited 5.2 ETH into Balanced Growth Vault (Uninsured)',
    txHash: '0xghi789...',
    status: 'completed',
  },
  {
    id: 'act-4',
    type: 'claim_submitted',
    timestamp: Date.now() / 1000 - 86400 * 2,
    amount: 2.5,
    description: 'Submitted claim for 2.5 ETH loss',
    txHash: '0xjkl012...',
    status: 'pending',
  },
];

export const mockPortfolio: Portfolio = {
  totalValue: 15.7,
  vaultDeposits: {
    insured: 10.5,
    uninsured: 5.2,
  },
  activeCoverage: 10.5,
  positions: mockVaultPositions,
  policies: mockPolicies,
  riskProfile: mockRiskProfile,
  activities: mockActivities,
};

