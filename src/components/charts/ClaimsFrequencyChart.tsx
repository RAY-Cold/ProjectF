'use client';

import { ClaimsDataPoint } from '@/lib/types/analytics';
import { formatETH } from '@/lib/utils/formatters';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';

interface ClaimsFrequencyChartProps {
  data: ClaimsDataPoint[];
}

export function ClaimsFrequencyChart({ data }: ClaimsFrequencyChartProps) {
  const chartData = data.map(point => ({
    date: new Date(point.timestamp * 1000).toLocaleDateString('en-US', {
      month: 'short',
    }),
    count: point.count,
    amount: point.totalAmount,
  }));

  return (
    <div className="p-6 rounded-lg border border-border bg-card">
      <h3 className="text-lg font-semibold mb-4">Claims Frequency</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
          <XAxis
            dataKey="date"
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: '12px' }}
          />
          <RechartsTooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
            formatter={(value: number, name: string) => {
              if (name === 'amount') return formatETH(value);
              return value;
            }}
          />
          <Bar dataKey="count" fill="hsl(var(--primary))" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

