'use client';

import { RiskHeatmapData } from '@/lib/types/analytics';
import { formatETH } from '@/lib/utils/formatters';
import { getRiskColor } from '@/lib/utils/riskCalculations';
import { motion } from 'framer-motion';

interface RiskHeatmapProps {
  data: RiskHeatmapData[];
}

export function RiskHeatmap({ data }: RiskHeatmapProps) {
  const tiers = ['low', 'medium', 'high'] as const;
  const maxTvl = Math.max(...data.map(d => d.tvl));

  return (
    <div className="p-6 rounded-lg border border-border bg-card">
      <h3 className="text-lg font-semibold mb-4">Risk Heatmap</h3>
      <div className="space-y-3">
        {data.map((vault, idx) => {
          const intensity = vault.tvl / maxTvl;
          const color = getRiskColor(vault.riskScore);
          
          return (
            <motion.div
              key={vault.vaultId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-center gap-4 p-4 bg-muted rounded-lg"
            >
              <div className="flex-1">
                <div className="font-medium mb-1">{vault.vaultName}</div>
                <div className="text-sm text-muted-foreground">
                  Risk Score: {vault.riskScore} | TVL: {formatETH(vault.tvl)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-24 h-8 rounded"
                  style={{
                    backgroundColor: color,
                    opacity: 0.3 + intensity * 0.7,
                  }}
                />
                <span
                  className="px-2 py-1 rounded text-xs font-medium"
                  style={{
                    backgroundColor: `${color}20`,
                    color: color,
                  }}
                >
                  {vault.riskTier.toUpperCase()}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

