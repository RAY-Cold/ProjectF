import {
  RiskBreakdown,
  TVLDataPoint,
  ClaimsDataPoint,
  SystemMetrics,
  RiskHeatmapData,
  RiskEngineOutput,
} from '@/lib/types/analytics';
import { apiRequest } from './client';
import {
  mockRiskBreakdown,
  mockTVLData,
  mockClaimsData,
  mockSystemMetrics,
  mockRiskHeatmapData,
} from '@/lib/mocks/analyticsData';

export async function getRiskBreakdown(vaultId?: string): Promise<RiskBreakdown[]> {
  return apiRequest<RiskBreakdown[]>(
    `/analytics/risk-breakdown${vaultId ? `?vaultId=${vaultId}` : ''}`,
    { method: 'GET' },
    () => mockRiskBreakdown
  );
}

export async function getTVLHistory(days: number = 30): Promise<TVLDataPoint[]> {
  return apiRequest<TVLDataPoint[]>(
    `/analytics/tvl?days=${days}`,
    { method: 'GET' },
    () => mockTVLData
  );
}

export async function getClaimsHistory(days: number = 90): Promise<ClaimsDataPoint[]> {
  return apiRequest<ClaimsDataPoint[]>(
    `/analytics/claims?days=${days}`,
    { method: 'GET' },
    () => mockClaimsData
  );
}

export async function getSystemMetrics(): Promise<SystemMetrics> {
  return apiRequest<SystemMetrics>(
    '/analytics/metrics',
    { method: 'GET' },
    () => mockSystemMetrics
  );
}

export async function getRiskHeatmap(): Promise<RiskHeatmapData[]> {
  return apiRequest<RiskHeatmapData[]>(
    '/analytics/risk-heatmap',
    { method: 'GET' },
    () => mockRiskHeatmapData
  );
}

export async function getRiskEngineOutput(
  userAddress?: string,
  vaultId?: string
): Promise<RiskEngineOutput> {
  return apiRequest<RiskEngineOutput>(
    `/analytics/risk-engine${userAddress ? `?user=${userAddress}` : ''}${vaultId ? `&vault=${vaultId}` : ''}`,
    { method: 'GET' },
    () => ({
      userRiskScore: 35,
      vaultRiskScore: 25,
      premiumMultiplier: 1.7,
      interestRateMultiplier: 0.825,
      factors: mockRiskBreakdown,
    })
  );
}

