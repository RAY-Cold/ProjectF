'use client';

import { Vault } from '@/lib/types/vault';
import { formatETH, formatPercentage } from '@/lib/utils/formatters';
import { getRiskTier, getRiskColor } from '@/lib/utils/riskCalculations';
import { Button } from '@/components/shared/Button';
import { TrendingUp, Shield, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { Tooltip } from '@/components/shared/Tooltip';

interface VaultCardProps {
  vault: Vault;
  onSelect: (vault: Vault) => void;
}

export function VaultCard({ vault, onSelect }: VaultCardProps) {
  const tier = getRiskTier(vault.riskScore);
  const color = getRiskColor(vault.riskScore);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-semibold">{vault.name}</h3>
            <span
              className="px-2 py-1 rounded text-xs font-medium"
              style={{
                backgroundColor: `${color}20`,
                color: color,
              }}
            >
              {tier.toUpperCase()} RISK
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-4">{vault.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="flex items-center gap-1 mb-1">
            <span className="text-xs text-muted-foreground">Uninsured APY</span>
            <Tooltip content="Annual percentage yield without insurance coverage">
              <Info className="w-3 h-3 text-muted-foreground" />
            </Tooltip>
          </div>
          <div className="text-2xl font-bold text-primary">
            {formatPercentage(vault.apyUninsured)}
          </div>
        </div>
        <div>
          <div className="flex items-center gap-1 mb-1">
            <span className="text-xs text-muted-foreground">Insured APY</span>
            <Tooltip content="Annual percentage yield with insurance coverage (premium deducted)">
              <Info className="w-3 h-3 text-muted-foreground" />
            </Tooltip>
          </div>
          <div className="text-2xl font-bold text-green-500">
            {formatPercentage(vault.apyInsured)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
        <div>
          <div className="text-muted-foreground mb-1">Premium</div>
          <div className="font-medium">{formatPercentage(vault.insurancePremium)}</div>
        </div>
        <div>
          <div className="text-muted-foreground mb-1">TVL</div>
          <div className="font-medium">{formatETH(vault.tvl)}</div>
        </div>
        <div>
          <div className="text-muted-foreground mb-1">Utilization</div>
          <div className="font-medium">{formatPercentage(vault.utilization)}</div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">
          Max Coverage: {formatETH(vault.maxCoverageLimit)}
        </span>
      </div>

      <Button
        onClick={() => onSelect(vault)}
        className="w-full"
        variant="default"
      >
        View Details
      </Button>
    </motion.div>
  );
}

