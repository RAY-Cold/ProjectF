// src/lib/server/interestRateModel.ts
export type RateModelParams = {
    baseRate: number;        // e.g. 0.02
    slope1: number;          // e.g. 0.08
    slope2: number;          // e.g. 0.60
    kinkUtilization: number; // e.g. 0.80
    reserveFactor: number;   // e.g. 0.10
    riskPremiumMax: number;  // e.g. 0.15
  };
  
  function clamp01(x: number) {
    return Math.max(0, Math.min(1, x));
  }
  
  // Kink model + risk premium; output APR as decimals (0.12 = 12%)
  export function computeBorrowApr(utilization: number, riskScore: number, p: RateModelParams) {
    const u = clamp01(utilization);
    const kink = clamp01(p.kinkUtilization);
  
    let apr: number;
    if (u <= kink) {
      apr = p.baseRate + (u / Math.max(kink, 1e-6)) * p.slope1;
    } else {
      const excess = (u - kink) / Math.max(1 - kink, 1e-6);
      apr = p.baseRate + p.slope1 + excess * p.slope2;
    }
  
    // Risk premium: 0..riskPremiumMax linearly by riskScore
    const riskPremium = (clamp01(riskScore / 100) * p.riskPremiumMax);
    return apr + riskPremium;
  }
  
  export function computeSupplyApr(borrowApr: number, utilization: number, reserveFactor: number) {
    const u = clamp01(utilization);
    const rf = clamp01(reserveFactor);
    return borrowApr * u * (1 - rf);
  }
  