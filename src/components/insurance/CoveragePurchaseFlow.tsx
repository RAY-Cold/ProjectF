'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/shared/Button';
import { formatETH, formatPercentage } from '@/lib/utils/formatters';
import { getCoverageEstimateApi } from '@/lib/api/insurance';
import { CoverageEstimate } from '@/lib/types/insurance';
import { useAccount } from 'wagmi';
import { purchaseCoverage } from '@/lib/api/insurance';
import { useToast } from '@/providers/ToastProvider';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Shield, Info } from 'lucide-react';
import { Tooltip } from '@/components/shared/Tooltip';

interface CoveragePurchaseFlowProps {
  positionId: string;
  positionType: 'vault' | 'lending';
  maxCoverage: number;
  riskScore: number;
  onSuccess?: () => void;
}

export function CoveragePurchaseFlow({
  positionId,
  positionType,
  maxCoverage,
  riskScore,
  onSuccess,
}: CoveragePurchaseFlowProps) {
  const { address } = useAccount();
  const { addToast } = useToast();
  const [coverageAmount, setCoverageAmount] = useState('');
  const [duration, setDuration] = useState(90);
  const [estimate, setEstimate] = useState<CoverageEstimate | null>(null);
  const [loading, setLoading] = useState(false);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    async function loadEstimate() {
      if (!coverageAmount || parseFloat(coverageAmount) <= 0) {
        setEstimate(null);
        return;
      }

      setLoading(true);
      try {
        const est = await getCoverageEstimateApi(
          positionId,
          parseFloat(coverageAmount),
          riskScore,
          duration
        );
        setEstimate(est);
      } catch (error) {
        console.error('Failed to load estimate:', error);
      } finally {
        setLoading(false);
      }
    }

    loadEstimate();
  }, [coverageAmount, duration, positionId, riskScore]);

  const handlePurchase = async () => {
    if (!address) {
      addToast('error', 'Please connect your wallet');
      return;
    }

    if (!coverageAmount || parseFloat(coverageAmount) <= 0) {
      addToast('error', 'Please enter a valid coverage amount');
      return;
    }

    if (parseFloat(coverageAmount) > maxCoverage) {
      addToast('error', `Maximum coverage is ${formatETH(maxCoverage)}`);
      return;
    }

    if (!estimate) {
      addToast('error', 'Please wait for estimate to load');
      return;
    }

    setPurchasing(true);
    try {
      const result = await purchaseCoverage(
        positionId,
        parseFloat(coverageAmount),
        duration,
        address
      );
      addToast('success', `Coverage purchased! Policy ID: ${result.policyId.slice(-8)}`);
      setCoverageAmount('');
      setEstimate(null);
      onSuccess?.();
    } catch (error) {
      addToast('error', 'Failed to purchase coverage. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium mb-2 block">
          Coverage Amount (ETH)
        </label>
        <input
          type="number"
          value={coverageAmount}
          onChange={(e) => setCoverageAmount(e.target.value)}
          placeholder={`Max: ${formatETH(maxCoverage)}`}
          max={maxCoverage}
          className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Maximum coverage: {formatETH(maxCoverage)}
        </p>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Coverage Duration (days)</label>
        <select
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value={30}>30 days</option>
          <option value={60}>60 days</option>
          <option value={90}>90 days</option>
          <option value={180}>180 days</option>
          <option value={365}>365 days</option>
        </select>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-4">
          <LoadingSpinner />
        </div>
      )}

      {estimate && !loading && (
        <div className="p-4 bg-card rounded-lg border border-border space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Premium</span>
            <span className="font-semibold">{formatETH(estimate.premium)}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-sm text-muted-foreground">Premium Rate</span>
              <Tooltip content="Premium rate is calculated based on risk score and coverage duration">
                <Info className="w-3 h-3 text-muted-foreground" />
              </Tooltip>
            </div>
            <span className="font-semibold">{formatPercentage(estimate.premiumRate)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Risk Multiplier</span>
            <span className="font-semibold">
  {Number(
    (estimate as any)?.multiplier ??
      (estimate as any)?.riskMultiplier ??
      1
  ).toFixed(2)}
  x
</span>

          </div>
          <div className="pt-3 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Cost</span>
              <span className="text-lg font-bold text-primary">
                {formatETH(estimate.premium)}
              </span>
            </div>
          </div>
        </div>
      )}

      <Button
        onClick={handlePurchase}
        className="w-full"
        isLoading={purchasing}
        disabled={!estimate || !coverageAmount}
      >
        <Shield className="w-4 h-4 mr-2" />
        Purchase Coverage
      </Button>
    </div>
  );
}

