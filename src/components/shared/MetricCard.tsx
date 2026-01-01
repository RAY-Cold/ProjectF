'use client';

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { motion } from 'framer-motion';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  change?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
  className?: string;
  gradient?: boolean;
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  change,
  description,
  className,
  gradient = false,
}: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'relative p-6 rounded-lg border border-border bg-card',
        gradient && 'bg-gradient-to-br from-card to-card/50',
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        {Icon && (
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon className="w-5 h-5 text-primary" />
          </div>
        )}
      </div>

      {change && (
        <div className="flex items-center gap-2 text-sm">
          <span
            className={cn(
              'font-medium',
              change.isPositive ? 'text-green-500' : 'text-red-500'
            )}
          >
            {change.isPositive ? '+' : ''}
            {change.value}%
          </span>
          <span className="text-muted-foreground">vs last period</span>
        </div>
      )}

      {description && (
        <p className="text-xs text-muted-foreground mt-2">{description}</p>
      )}
    </motion.div>
  );
}

