import { RISK_TIERS } from './constants';

export function getRiskTier(score: number): 'low' | 'medium' | 'high' {
  if (score <= RISK_TIERS.low.max) return 'low';
  if (score <= RISK_TIERS.medium.max) return 'medium';
  return 'high';
}

export function getRiskLabel(score: number): string {
  const tier = getRiskTier(score);
  return RISK_TIERS[tier].label;
}

export function getRiskColor(score: number): string {
  const tier = getRiskTier(score);
  return RISK_TIERS[tier].color;
}

export function calculatePremiumMultiplier(riskScore: number): number {
  // Premium multiplier increases with risk score
  // Base: 1.0x, scales to 3.0x at max risk
  return 1.0 + (riskScore / 100) * 2.0;
}

export function calculateInterestRateMultiplier(riskScore: number): number {
  // Interest rate multiplier decreases with risk score
  // Higher risk = lower interest rates
  // Base: 1.0x, scales down to 0.5x at max risk
  return 1.0 - (riskScore / 100) * 0.5;
}

