'use client';

import { RiskBreakdown } from '@/lib/types/analytics';
import { formatPercentage } from '@/lib/utils/formatters';
import { motion } from 'framer-motion';
import { Info } from 'lucide-react';
import { Tooltip } from '@/components/shared/Tooltip';

interface RiskScoreBreakdownProps {
  breakdown: RiskBreakdown[];
}

export function RiskScoreBreakdown({ breakdown }: RiskScoreBreakdownProps) {
  return (
    <div className="p-6 rounded-lg border border-border bg-card">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-lg font-semibold">Risk Score Breakdown</h3>
        <Tooltip content="Risk score is calculated from multiple factors, each contributing a weighted percentage to the final score.">
          <Info className="w-4 h-4 text-muted-foreground" />
        </Tooltip>
      </div>
      <div className="space-y-4">
        {breakdown.map((component, idx) => (
          <motion.div
            key={component.component}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{component.component}</span>
                <Tooltip content={component.description}>
                  <Info className="w-3 h-3 text-muted-foreground" />
                </Tooltip>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  Weight: {formatPercentage(component.weight)}
                </span>
                <span className="text-sm font-semibold">Score: {component.score}</span>
              </div>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${component.score}%` }}
                transition={{ duration: 1, delay: idx * 0.1 }}
                className="h-2 rounded-full bg-primary"
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

