import {
    mockRiskBreakdown,
    mockTVLData,
    mockClaimsData,
    mockSystemMetrics,
    mockRiskHeatmapData,
  } from "@/lib/mocks/analyticsData";
  import { RiskEngineOutput } from "@/lib/types/analytics";
  
  export function getRiskBreakdown(_vaultId?: string) {
    return mockRiskBreakdown;
  }
  
  export function getTVLHistory(_days: number = 30) {
    return mockTVLData;
  }
  
  export function getClaimsHistory(_days: number = 90) {
    return mockClaimsData;
  }
  
  export function getSystemMetrics() {
    return mockSystemMetrics;
  }
  
  export function getRiskHeatmap() {
    return mockRiskHeatmapData;
  }
  
  export function getRiskEngineOutput(
    _userAddress?: string,
    _vaultId?: string
  ): RiskEngineOutput {
    return {
      userRiskScore: 35,
      vaultRiskScore: 25,
      premiumMultiplier: 1.7,
      interestRateMultiplier: 0.825,
      factors: mockRiskBreakdown,
    };
  }
  