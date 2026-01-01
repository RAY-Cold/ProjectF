'use client';

import { Claim } from '@/lib/types/insurance';
import { formatETH, formatRelativeTime } from '@/lib/utils/formatters';
import { CLAIM_STATUS_LABELS } from '@/lib/utils/constants';
import { FileText, Clock, CheckCircle, XCircle, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface ClaimsListProps {
  claims: Claim[];
  onClaimSelect?: (claim: Claim) => void;
}

const statusIcons = {
  draft: FileText,
  submitted: Clock,
  voting: Clock,
  approved: CheckCircle,
  paid: DollarSign,
  rejected: XCircle,
};

const statusColors = {
  draft: 'text-gray-500',
  submitted: 'text-blue-500',
  voting: 'text-yellow-500',
  approved: 'text-green-500',
  paid: 'text-green-500',
  rejected: 'text-red-500',
};

export function ClaimsList({ claims, onClaimSelect }: ClaimsListProps) {
  if (claims.length === 0) {
    return (
      <div className="p-6 rounded-lg border border-border bg-card text-center text-muted-foreground">
        No claims found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {claims.map((claim, idx) => {
        const Icon = statusIcons[claim.status] || FileText;
        return (
          <motion.div
            key={claim.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-6 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors cursor-pointer"
            onClick={() => onClaimSelect?.(claim)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${statusColors[claim.status]}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Claim #{claim.id.slice(-8)}</h3>
                  <p className="text-sm text-muted-foreground">
                    {CLAIM_STATUS_LABELS[claim.status]}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{formatETH(claim.claimedAmount)}</div>
                <div className="text-xs text-muted-foreground">
                  {formatRelativeTime(claim.submittedAt)}
                </div>
              </div>
            </div>

            {claim.status === 'voting' && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Votes For</span>
                  <span className="font-medium text-green-500">{claim.votesFor}</span>
                </div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Votes Against</span>
                  <span className="font-medium text-red-500">{claim.votesAgainst}</span>
                </div>
                <div className="w-full bg-background rounded-full h-2 mt-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{
                      width: `${(claim.votesFor / claim.requiredQuorum) * 100}%`,
                    }}
                  />
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  {claim.requiredQuorum - claim.votesFor} more votes needed
                </div>
              </div>
            )}

            {claim.payoutAmount && (
              <div className="mt-4 p-3 bg-green-500/10 border border-green-500/50 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  <span className="font-medium text-green-500">
                    Payout: {formatETH(claim.payoutAmount)}
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

