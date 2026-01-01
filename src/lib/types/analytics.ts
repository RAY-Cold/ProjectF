export interface RiskBreakdown {
  component: string;
  weight: number; // percentage contribution
  score: number; // 0-100
  description: string;
}

export interface TVLDataPoint {
  timestamp: number;
  value: number; // in ETH
}

export interface ClaimsDataPoint {
  timestamp: number;
  count: number;
  totalAmount: number; // in ETH
}

export interface RiskEngineOutput {
  userRiskScore: number;
  vaultRiskScore: number;
  premiumMultiplier: number;
  interestRateMultiplier: number; // for lending module
  factors: RiskBreakdown[];
}

export interface SystemMetrics {
  totalTVL: number; // in ETH
  totalCoverage: number; // in ETH
  claimsPaid: number; // in ETH
  reserveRatio: number; // percentage
  solvencyRatio: number; // percentage
  activeVaults: number;
  activePolicies: number;
  pendingClaims: number;
}

export interface RiskHeatmapData {
  vaultId: string;
  vaultName: string;
  riskTier: 'low' | 'medium' | 'high';
  riskScore: number;
  tvl: number;
}

