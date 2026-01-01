'use client';

import { AlertCircle, ArrowRight, Shield, TrendingUp } from 'lucide-react';
import { Button } from '@/components/shared/Button';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface NextActionPanelProps {
  riskScore: number;
  hasUninsuredVaults: boolean;
  hasNoCoverage: boolean;
}

export function NextActionPanel({
  riskScore,
  hasUninsuredVaults,
  hasNoCoverage,
}: NextActionPanelProps) {
  let recommendation: {
    title: string;
    description: string;
    action: string;
    href: string;
    icon: React.ReactNode;
    priority: 'high' | 'medium' | 'low';
  } | null = null;

  if (hasNoCoverage && riskScore > 50) {
    recommendation = {
      title: 'Purchase Insurance Coverage',
      description: 'Your risk score is elevated. Consider purchasing insurance for your vault positions.',
      action: 'View Insurance',
      href: '/insurance',
      icon: <Shield className="w-5 h-5" />,
      priority: 'high',
    };
  } else if (hasUninsuredVaults) {
    recommendation = {
      title: 'Consider Insured Vaults',
      description: 'You have uninsured vault positions. Insured vaults provide protection against losses.',
      action: 'Explore Vaults',
      href: '/vaults',
      icon: <TrendingUp className="w-5 h-5" />,
      priority: 'medium',
    };
  } else if (riskScore > 66) {
    recommendation = {
      title: 'Review Risk Profile',
      description: 'Your risk score is high. Consider diversifying your portfolio or reducing exposure.',
      action: 'View Analytics',
      href: '/risk-analytics',
      icon: <AlertCircle className="w-5 h-5" />,
      priority: 'high',
    };
  }

  if (!recommendation) {
    return null;
  }

  const priorityColors = {
    high: 'border-red-500/50 bg-red-500/10',
    medium: 'border-yellow-500/50 bg-yellow-500/10',
    low: 'border-blue-500/50 bg-blue-500/10',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 rounded-lg border ${priorityColors[recommendation.priority]}`}
    >
      <div className="flex items-start gap-4">
        <div className="p-2 bg-background/50 rounded-lg">
          {recommendation.icon}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold mb-1">{recommendation.title}</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {recommendation.description}
          </p>
          <Link href={recommendation.href}>
            <Button size="sm" variant="outline">
              {recommendation.action}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

