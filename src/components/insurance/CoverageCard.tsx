'use client';

import { CoveragePolicy } from '@/lib/types/insurance';
import { formatETH, formatPercentage } from '@/lib/utils/formatters';
import { Shield, Calendar, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

interface CoverageCardProps {
  policy: CoveragePolicy;
  onSubmitClaim?: (policy: CoveragePolicy) => void; // ✅ new
}

export function CoverageCard({ policy, onSubmitClaim }: CoverageCardProps) {
  const daysRemaining = Math.max(
    0,
    Math.floor((policy.endDate - Date.now() / 1000) / 86400)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-lg border border-border bg-card"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Coverage Policy</h3>
            <p className="text-sm text-muted-foreground">Policy #{policy.id.slice(-8)}</p>
          </div>
        </div>
        {policy.active ? (
          <span className="px-2 py-1 bg-green-500/20 text-green-500 rounded text-xs font-medium">
            Active
          </span>
        ) : (
          <span className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs font-medium">
            Expired
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-sm text-muted-foreground mb-1">Coverage Amount</div>
          <div className="text-lg font-semibold">{formatETH(policy.coverageAmount)}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground mb-1">Premium</div>
          <div className="text-lg font-semibold">{formatETH(policy.premium)}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground mb-1">Premium Rate</div>
          <div className="text-lg font-semibold">{formatPercentage(policy.premiumRate)}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground mb-1">Risk Score</div>
          <div className="text-lg font-semibold">{policy.riskScore}</div>
        </div>
      </div>

      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">
            {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Expired'}
          </span>
        </div>
        {policy.nftTokenId && (
          <span className="text-xs text-muted-foreground">NFT: {policy.nftTokenId}</span>
        )}
      </div>

      {policy.active && onSubmitClaim && (
        <button
          onClick={() => onSubmitClaim(policy)}
          className="mt-4 w-full px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors font-medium flex items-center justify-center gap-2"
        >
          <FileText className="w-4 h-4" />
          Submit Claim
        </button>
      )}
    </motion.div>
  );
}
