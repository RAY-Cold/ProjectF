'use client';

import { RiskEngineOutput } from '@/lib/types/analytics';
import { formatPercentage } from '@/lib/utils/formatters';
import { motion } from 'framer-motion';

interface RiskEngineTableProps {
  output: RiskEngineOutput;
}

export function RiskEngineTable({ output }: RiskEngineTableProps) {
  const rows = [
    {
      label: 'User Risk Score',
      value: output.userRiskScore,
      description: 'Your personal risk profile score',
    },
    {
      label: 'Vault Risk Score',
      value: output.vaultRiskScore,
      description: 'Average risk score across vaults',
    },
    {
      label: 'Premium Multiplier',
      value: `${output.premiumMultiplier.toFixed(2)}x`,
      description: 'Insurance premium adjustment factor',
    },
    {
      label: 'Interest Rate Multiplier',
      value: `${output.interestRateMultiplier.toFixed(2)}x`,
      description: 'Lending interest rate adjustment factor',
    },
  ];

  return (
    <div className="p-6 rounded-lg border border-border bg-card">
      <h3 className="text-lg font-semibold mb-4">Risk Engine Output</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-semibold">Metric</th>
              <th className="text-right py-3 px-4 font-semibold">Value</th>
              <th className="text-left py-3 px-4 font-semibold">Description</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <motion.tr
                key={row.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="border-b border-border hover:bg-muted/50 transition-colors"
              >
                <td className="py-3 px-4">{row.label}</td>
                <td className="py-3 px-4 text-right font-medium">{row.value}</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">{row.description}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

