import { VaultPosition } from './vault';
import { CoveragePolicy } from './insurance';

export type ActivityType = 
  | 'deposit' 
  | 'withdraw' 
  | 'coverage_purchased' 
  | 'claim_submitted' 
  | 'claim_approved' 
  | 'claim_rejected' 
  | 'payout_received';

export interface Activity {
  id: string;
  type: ActivityType;
  timestamp: number;
  amount?: number; // in ETH
  description: string;
  txHash?: string;
  status: 'pending' | 'completed' | 'failed';
}

export interface RiskProfile {
  userRiskScore: number; // 0-100
  factors: {
    factor: string;
    weight: number;
    contribution: number; // how much this factor contributes to score
  }[];
  label: 'low' | 'medium' | 'high';
  lastUpdated: number;
}

export interface Portfolio {
  totalValue: number; // in ETH
  vaultDeposits: {
    insured: number; // in ETH
    uninsured: number; // in ETH
  };
  activeCoverage: number; // in ETH
  lendingPosition?: number; // in ETH (from TrustLend module)
  positions: VaultPosition[];
  policies: CoveragePolicy[];
  riskProfile: RiskProfile;
  activities: Activity[];
}

