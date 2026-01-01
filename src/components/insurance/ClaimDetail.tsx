'use client';

import { Claim } from '@/lib/types/insurance';
import { formatETH, formatTimestamp } from '@/lib/utils/formatters';
import { CLAIM_STATUS_LABELS } from '@/lib/utils/constants';
import { FileText, ExternalLink, Clock } from 'lucide-react';

interface ClaimDetailProps {
  claim: Claim;
}

export function ClaimDetail({ claim }: ClaimDetailProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Claim #{claim.id.slice(-8)}</h2>
        <span
          className={`px-3 py-1 rounded text-sm font-medium ${
            claim.status === 'approved' || claim.status === 'paid'
              ? 'bg-green-500/20 text-green-500'
              : claim.status === 'rejected'
              ? 'bg-red-500/20 text-red-500'
              : 'bg-yellow-500/20 text-yellow-500'
          }`}
        >
          {CLAIM_STATUS_LABELS[claim.status]}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-card rounded-lg border border-border">
          <div className="text-sm text-muted-foreground mb-1">Loss Amount</div>
          <div className="text-xl font-semibold">{formatETH(claim.lossAmount)}</div>
        </div>
        <div className="p-4 bg-card rounded-lg border border-border">
          <div className="text-sm text-muted-foreground mb-1">Claimed Amount</div>
          <div className="text-xl font-semibold">{formatETH(claim.claimedAmount)}</div>
        </div>
        {claim.payoutAmount && (
          <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/50">
            <div className="text-sm text-muted-foreground mb-1">Payout Amount</div>
            <div className="text-xl font-semibold text-green-500">
              {formatETH(claim.payoutAmount)}
            </div>
          </div>
        )}
        <div className="p-4 bg-card rounded-lg border border-border">
          <div className="text-sm text-muted-foreground mb-1">Stake Required</div>
          <div className="text-xl font-semibold">{formatETH(claim.stakeRequired)}</div>
        </div>
      </div>

      <div className="p-4 bg-card rounded-lg border border-border">
        <h3 className="font-semibold mb-2">Description</h3>
        <p className="text-sm text-muted-foreground">{claim.description}</p>
      </div>

      {claim.evidence && claim.evidence.length > 0 && (
        <div className="p-4 bg-card rounded-lg border border-border">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Evidence
          </h3>
          <div className="space-y-2">
            {claim.evidence.map((evidence, idx) => (
              <a
                key={idx}
                href={evidence}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <ExternalLink className="w-4 h-4" />
                {evidence}
              </a>
            ))}
          </div>
        </div>
      )}

      {claim.status === 'voting' && (
        <div className="p-4 bg-card rounded-lg border border-border">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Voting Status
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Votes For</span>
              <span className="font-semibold text-green-500">{claim.votesFor}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Votes Against</span>
              <span className="font-semibold text-red-500">{claim.votesAgainst}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Required Quorum</span>
              <span className="font-semibold">{claim.requiredQuorum}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-3 mt-4">
              <div
                className="bg-primary h-3 rounded-full transition-all"
                style={{
                  width: `${Math.min(100, (claim.votesFor / claim.requiredQuorum) * 100)}%`,
                }}
              />
            </div>
            {claim.votingEndsAt && (
              <p className="text-xs text-muted-foreground mt-2">
                Voting ends: {formatTimestamp(claim.votingEndsAt)}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="p-4 bg-muted rounded-lg">
        <div className="text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Submitted</span>
            <span>{formatTimestamp(claim.submittedAt)}</span>
          </div>
          {claim.resolvedAt && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Resolved</span>
              <span>{formatTimestamp(claim.resolvedAt)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

