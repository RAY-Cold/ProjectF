import { RiskBreakdown, TVLDataPoint, ClaimsDataPoint, SystemMetrics, RiskHeatmapData } from '@/lib/types/analytics';

export const mockRiskBreakdown: RiskBreakdown[] = [
  {
    component: 'Protocol Age',
    weight: 20,
    score: 15,
    description: 'Time since protocol launch (longer = lower risk)',
  },
  {
    component: 'TVL Volatility',
    weight: 25,
    score: 35,
    description: 'Stability of total value locked',
  },
  {
    component: 'Audit Status',
    weight: 30,
    score: 20,
    description: 'Quality and recency of security audits',
  },
  {
    component: 'Exploit History',
    weight: 15,
    score: 10,
    description: 'Past security incidents and their severity',
  },
  {
    component: 'Liquidity Depth',
    weight: 10,
    score: 25,
    description: 'Available liquidity for withdrawals',
  },
];

export const mockTVLData: TVLDataPoint[] = Array.from({ length: 30 }, (_, i) => ({
  timestamp: Date.now() / 1000 - (30 - i) * 86400,
  value: 8000 + Math.random() * 2000 + i * 50,
}));

export const mockClaimsData: ClaimsDataPoint[] = Array.from({ length: 12 }, (_, i) => ({
  timestamp: Date.now() / 1000 - (12 - i) * 86400 * 7,
  count: Math.floor(Math.random() * 5) + 1,
  totalAmount: Math.random() * 10 + 2,
}));

export const mockSystemMetrics: SystemMetrics = {
  totalTVL: 8750.5,
  totalCoverage: 1250.8,
  claimsPaid: 45.2,
  reserveRatio: 12.5,
  solvencyRatio: 98.5,
  activeVaults: 4,
  activePolicies: 125,
  pendingClaims: 3,
};

export const mockRiskHeatmapData: RiskHeatmapData[] = [
  { vaultId: 'vault-1', vaultName: 'Conservative Yield', riskTier: 'low', riskScore: 25, tvl: 2450.5 },
  { vaultId: 'vault-2', vaultName: 'Balanced Growth', riskTier: 'medium', riskScore: 48, tvl: 1890.2 },
  { vaultId: 'vault-3', vaultName: 'Aggressive Yield', riskTier: 'high', riskScore: 72, tvl: 1250.8 },
  { vaultId: 'vault-4', vaultName: 'Stablecoin Vault', riskTier: 'low', riskScore: 15, tvl: 3200.0 },
];

