'use client';

import { formatPercentage } from '@/lib/utils/formatters';
import { motion } from 'framer-motion';

interface SolvencyGaugeProps {
  reserveRatio: number;
  solvencyRatio: number;
}

export function SolvencyGauge({ reserveRatio, solvencyRatio }: SolvencyGaugeProps) {
  const circumference = 2 * Math.PI * 60;
  const reserveOffset = circumference - (reserveRatio / 100) * circumference;
  const solvencyOffset = circumference - (solvencyRatio / 100) * circumference;

  const getColor = (value: number) => {
    if (value >= 80) return '#10B981';
    if (value >= 50) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <div className="p-6 rounded-lg border border-border bg-card">
      <h3 className="text-lg font-semibold mb-6">Solvency Metrics</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col items-center">
          <div className="relative w-40 h-40 mb-4">
            <svg className="w-40 h-40 transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="60"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-muted"
              />
              <motion.circle
                cx="80"
                cy="80"
                r="60"
                stroke={getColor(reserveRatio)}
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: reserveOffset }}
                transition={{ duration: 2, ease: 'easeOut' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: getColor(reserveRatio) }}>
                  {formatPercentage(reserveRatio)}
                </div>
                <div className="text-xs text-muted-foreground">Reserve Ratio</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div className="relative w-40 h-40 mb-4">
            <svg className="w-40 h-40 transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="60"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-muted"
              />
              <motion.circle
                cx="80"
                cy="80"
                r="60"
                stroke={getColor(solvencyRatio)}
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: solvencyOffset }}
                transition={{ duration: 2, ease: 'easeOut', delay: 0.2 }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: getColor(solvencyRatio) }}>
                  {formatPercentage(solvencyRatio)}
                </div>
                <div className="text-xs text-muted-foreground">Solvency Ratio</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

