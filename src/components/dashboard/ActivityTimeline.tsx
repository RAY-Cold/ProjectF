'use client';

import { Activity } from '@/lib/types/user';
import { formatRelativeTime, formatETH } from '@/lib/utils/formatters';
import { ACTIVITY_TYPE_LABELS } from '@/lib/utils/constants';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Shield,
  FileText,
  CheckCircle,
  XCircle,
  DollarSign,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ActivityTimelineProps {
  activities: Activity[];
}

const activityIcons = {
  deposit: ArrowDownCircle,
  withdraw: ArrowUpCircle,
  coverage_purchased: Shield,
  claim_submitted: FileText,
  claim_approved: CheckCircle,
  claim_rejected: XCircle,
  payout_received: DollarSign,
};

const statusColors = {
  pending: 'text-yellow-500',
  completed: 'text-green-500',
  failed: 'text-red-500',
};

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  if (activities.length === 0) {
    return (
      <div className="p-6 rounded-lg border border-border bg-card text-center text-muted-foreground">
        No recent activity
      </div>
    );
  }

  return (
    <div className="p-6 rounded-lg border border-border bg-card">
      <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity, idx) => {
          const Icon = activityIcons[activity.type] || FileText;
          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-start gap-4 relative pl-8"
            >
              {/* Timeline line */}
              {idx < activities.length - 1 && (
                <div className="absolute left-3 top-8 w-0.5 h-full bg-border" />
              )}
              
              {/* Icon */}
              <div className="relative z-10 p-2 bg-muted rounded-full">
                <Icon className="w-4 h-4" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="text-sm font-medium">
                    {ACTIVITY_TYPE_LABELS[activity.type] || activity.type}
                  </p>
                  <span className={`text-xs ${statusColors[activity.status]}`}>
                    {activity.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-1">
                  {activity.description}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {activity.amount && (
                    <span>{formatETH(activity.amount)}</span>
                  )}
                  <span>{formatRelativeTime(activity.timestamp)}</span>
                  {activity.txHash && (
                    <a
                      href={`https://etherscan.io/tx/${activity.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary transition-colors"
                    >
                      View TX
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

