'use client';

import { RiskTier } from '@/lib/types/vault';
import { useState } from 'react';
import { Button } from '@/components/shared/Button';
import { Filter, X } from 'lucide-react';

interface VaultFiltersProps {
  riskTiers: RiskTier[];
  onRiskTierChange: (tiers: RiskTier[]) => void;
  insuredOnly: boolean;
  onInsuredOnlyChange: (value: boolean) => void;
  apyRange: [number, number];
  onApyRangeChange: (range: [number, number]) => void;
}

export function VaultFilters({
  riskTiers,
  onRiskTierChange,
  insuredOnly,
  onInsuredOnlyChange,
  apyRange,
  onApyRangeChange,
}: VaultFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);

  const toggleRiskTier = (tier: RiskTier) => {
    if (riskTiers.includes(tier)) {
      onRiskTierChange(riskTiers.filter(t => t !== tier));
    } else {
      onRiskTierChange([...riskTiers, tier]);
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Vaults</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
      </div>

      {showFilters && (
        <div className="p-4 rounded-lg border border-border bg-card space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Risk Tier</label>
            <div className="flex gap-2">
              {(['low', 'medium', 'high'] as RiskTier[]).map((tier) => (
                <button
                  key={tier}
                  onClick={() => toggleRiskTier(tier)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    riskTiers.includes(tier)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {tier.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={insuredOnly}
                onChange={(e) => onInsuredOnlyChange(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Insured vaults only</span>
            </label>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              APY Range: {apyRange[0]}% - {apyRange[1]}%
            </label>
            <div className="flex gap-4">
              <input
                type="range"
                min="0"
                max="30"
                value={apyRange[0]}
                onChange={(e) => onApyRangeChange([Number(e.target.value), apyRange[1]])}
                className="flex-1"
              />
              <input
                type="range"
                min="0"
                max="30"
                value={apyRange[1]}
                onChange={(e) => onApyRangeChange([apyRange[0], Number(e.target.value)])}
                className="flex-1"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

