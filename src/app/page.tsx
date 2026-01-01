'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { HeroSection } from '@/components/dashboard/HeroSection';
import { MetricCard } from '@/components/shared/MetricCard';
import { RiskScoreCard } from '@/components/dashboard/RiskScoreCard';
import { NextActionPanel } from '@/components/dashboard/NextActionPanel';
import { ActivityTimeline } from '@/components/dashboard/ActivityTimeline';
import { getUserPortfolio } from '@/lib/api/user';
import { getSystemMetrics } from '@/lib/api/analytics';
import { Portfolio } from '@/lib/types/user';
import { SystemMetrics } from '@/lib/types/analytics';
import { formatETH, formatPercentage } from '@/lib/utils/formatters';
import { Wallet, TrendingUp, Shield, DollarSign, BarChart3 } from 'lucide-react';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

export default function DashboardPage() {
  const { address } = useAccount();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [portfolioData, metricsData] = await Promise.all([
          getUserPortfolio(address || '0x0000000000000000000000000000000000000000'),
          getSystemMetrics(),
        ]);
        setPortfolio(portfolioData);
        setMetrics(metricsData);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
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

  const riskScore = portfolio?.riskProfile.userRiskScore || 0;
  const hasUninsuredVaults = (portfolio?.vaultDeposits.uninsured || 0) > 0;
  const hasNoCoverage = (portfolio?.activeCoverage || 0) === 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <HeroSection />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          title="Portfolio Value"
          value={formatETH(portfolio?.totalValue || 0)}
          icon={Wallet}
          description="Total value across all positions"
        />
        <MetricCard
          title="Vault Deposits"
          value={formatETH((portfolio?.vaultDeposits.insured || 0) + (portfolio?.vaultDeposits.uninsured || 0))}
          icon={TrendingUp}
          description={`${formatETH(portfolio?.vaultDeposits.insured || 0)} insured`}
        />
        <MetricCard
          title="Active Coverage"
          value={formatETH(portfolio?.activeCoverage || 0)}
          icon={Shield}
          description="Total coverage amount"
        />
        <MetricCard
          title="System TVL"
          value={formatETH(metrics?.totalTVL || 0)}
          icon={BarChart3}
          description="Total value locked in protocol"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <RiskScoreCard
            score={riskScore}
            breakdown={portfolio?.riskProfile.factors.map(f => ({
              factor: f.factor,
              contribution: f.contribution,
            }))}
          />
        </div>
        <div>
          <NextActionPanel
            riskScore={riskScore}
            hasUninsuredVaults={hasUninsuredVaults}
            hasNoCoverage={hasNoCoverage}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <MetricCard
          title="Total Coverage"
          value={formatETH(metrics?.totalCoverage || 0)}
          description="System-wide coverage"
        />
        <MetricCard
          title="Claims Paid"
          value={formatETH(metrics?.claimsPaid || 0)}
          description="Total claims paid to date"
        />
        <MetricCard
          title="Reserve Ratio"
          value={formatPercentage(metrics?.reserveRatio || 0)}
          description="Protocol reserve health"
        />
      </div>

      <ActivityTimeline activities={portfolio?.activities || []} />
    </div>
  );
}
