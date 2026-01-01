export type RiskTier = 'low' | 'medium' | 'high';

export interface VaultStrategy {
  protocol: string;
  protocolRisk: RiskTier;
  allocation: number; // percentage
  description: string;
}

export interface Vault {
  id: string;
  name: string;
  description: string;
  apyUninsured: number; // percentage
  apyInsured: number; // percentage (lower due to insurance premium)
  riskTier: RiskTier;
  riskScore: number; // 0-100
  insurancePremium: number; // percentage of deposit
  maxCoverageLimit: number; // in ETH
  utilization: number; // percentage
  reserveRatio: number; // percentage
  tvl: number; // in ETH
  strategies: VaultStrategy[];
  minDeposit: number; // in ETH
  maxDeposit?: number; // in ETH, optional
}

export interface VaultPosition {
  vaultId: string;
  balance: number; // in ETH
  insured: boolean;
  apy: number; // current APY based on insured status
  earned: number; // total earned in ETH
  depositTimestamp: number;
}

export interface VaultState {
  balanceEth: number;
  insured: boolean;
  tvlEth: number;
  riskScore: number;
}

