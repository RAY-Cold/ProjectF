'use client';

import { useState, useEffect } from 'react';
import {
  getRiskBreakdown,
  getTVLHistory,
  getClaimsHistory,
  getSystemMetrics,
  getRiskHeatmap,
  getRiskEngineOutput,
} from '@/lib/api/analytics';
import { RiskBreakdown, TVLDataPoint, ClaimsDataPoint, SystemMetrics, RiskHeatmapData, RiskEngineOutput } from '@/lib/types/analytics';
import { RiskScoreBreakdown } from '@/components/risk/RiskScoreBreakdown';
import { RiskHeatmap } from '@/components/risk/RiskHeatmap';
import { TVLChart } from '@/components/charts/TVLChart';
import { ClaimsFrequencyChart } from '@/components/charts/ClaimsFrequencyChart';
import { SolvencyGauge } from '@/components/charts/SolvencyGauge';
import { RiskEngineTable } from '@/components/risk/RiskEngineTable';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useAccount } from 'wagmi';

export default function RiskAnalyticsPage() {
  const { address } = useAccount();
  const [breakdown, setBreakdown] = useState<RiskBreakdown[]>([]);
  const [tvlData, setTvlData] = useState<TVLDataPoint[]>([]);
  const [claimsData, setClaimsData] = useState<ClaimsDataPoint[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [heatmapData, setHeatmapData] = useState<RiskHeatmapData[]>([]);
  const [engineOutput, setEngineOutput] = useState<RiskEngineOutput | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [
          breakdownData,
          tvlDataResult,
          claimsDataResult,
          metricsData,
          heatmapDataResult,
          engineOutputData,
        ] = await Promise.all([
          getRiskBreakdown(),
          getTVLHistory(30),
          getClaimsHistory(90),
          getSystemMetrics(),
          getRiskHeatmap(),
          getRiskEngineOutput(address),
        ]);
        setBreakdown(breakdownData);
        setTvlData(tvlDataResult);
        setClaimsData(claimsDataResult);
        setMetrics(metricsData);
        setHeatmapData(heatmapDataResult);
        setEngineOutput(engineOutputData);
      } catch (error) {
        console.error('Failed to load analytics data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [address]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Risk Analytics</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <RiskScoreBreakdown breakdown={breakdown} />
        <RiskHeatmap data={heatmapData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <TVLChart data={tvlData} />
        <ClaimsFrequencyChart data={claimsData} />
      </div>

      {metrics && (
        <div className="mb-8">
          <SolvencyGauge
            reserveRatio={metrics.reserveRatio}
            solvencyRatio={metrics.solvencyRatio}
          />
        </div>
      )}

      {engineOutput && (
        <div>
          <RiskEngineTable output={engineOutput} />
        </div>
      )}
    </div>
  );
}
