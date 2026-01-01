'use client';

import { motion } from 'framer-motion';
import { getRiskTier, getRiskLabel, getRiskColor } from '@/lib/utils/riskCalculations';
import { Tooltip } from '@/components/shared/Tooltip';
import { Info } from 'lucide-react';

interface RiskScoreCardProps {
  score: number;
  breakdown?: Array<{ factor: string; contribution: number }>;
}

export function RiskScoreCard({ score, breakdown }: RiskScoreCardProps) {
  const tier = getRiskTier(score);
  const label = getRiskLabel(score);
  const color = getRiskColor(score);
  
  // Calculate circumference for SVG circle (radius = 60, so circumference = 2 * π * 60 ≈ 377)
  const circumference = 2 * Math.PI * 60;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="p-6 rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Your Risk Score</h3>
        <Tooltip content="Risk score (0-100) influences insurance premiums, interest rates, and vault strategy recommendations. Lower is better.">
          <Info className="w-4 h-4 text-muted-foreground cursor-help" />
        </Tooltip>
      </div>

      <div className="flex items-center gap-8">
        <div className="relative w-32 h-32">
          <svg className="w-32 h-32 transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="64"
              cy="64"
              r="60"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-muted"
            />
            {/* Progress circle */}
            <motion.circle
              cx="64"
              cy="64"
              r="60"
              stroke={color}
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 2, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl font-bold" style={{ color }}>
                {score}
              </div>
              <div className="text-xs text-muted-foreground mt-1">{label}</div>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium">Risk Tier:</span>
              <span
                className="px-2 py-1 rounded text-xs font-medium"
                style={{
                  backgroundColor: `${color}20`,
                  color: color,
                }}
              >
                {label}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Your risk profile is calculated based on portfolio diversity, coverage ratio, and transaction history.
            </p>
          </div>

          {breakdown && breakdown.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Contributing Factors:
              </p>
              {breakdown.map((factor, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${factor.contribution}%` }}
                      transition={{ duration: 1, delay: idx * 0.1 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-20 text-right">
                    {factor.factor}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

