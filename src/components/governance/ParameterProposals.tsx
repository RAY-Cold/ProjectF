'use client';

import { ParameterProposal } from '@/lib/types/governance';
import { Button } from '@/components/shared/Button';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatRelativeTime } from '@/lib/utils/formatters';

interface ParameterProposalsProps {
  proposals: ParameterProposal[];
}

export function ParameterProposals({ proposals }: ParameterProposalsProps) {
  if (proposals.length === 0) {
    return (
      <div className="p-6 rounded-lg border border-border bg-card text-center text-muted-foreground">
        No parameter proposals
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {proposals.map((proposal) => {
        const timeRemaining = proposal.votingEndsAt - Date.now() / 1000;
        const daysRemaining = Math.max(0, Math.floor(timeRemaining / 86400));
        const progress = (proposal.votesFor / proposal.requiredQuorum) * 100;

        return (
          <motion.div
            key={proposal.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-lg border border-border bg-card"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">{proposal.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{proposal.description}</p>
              </div>
              <span
                className={`px-3 py-1 rounded text-xs font-medium ${
                  proposal.status === 'passed'
                    ? 'bg-green-500/20 text-green-500'
                    : proposal.status === 'rejected'
                    ? 'bg-red-500/20 text-red-500'
                    : 'bg-yellow-500/20 text-yellow-500'
                }`}
              >
                {proposal.status.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Parameter</div>
                <div className="text-sm font-medium">{proposal.parameter}</div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Current Value</div>
                <div className="text-sm font-medium">{proposal.currentValue}</div>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                <div className="text-sm text-muted-foreground mb-1">Proposed Value</div>
                <div className="text-sm font-medium text-primary">{proposal.proposedValue}</div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Required Quorum</div>
                <div className="text-sm font-medium">{proposal.requiredQuorum}</div>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Votes For</span>
                <span className="font-medium text-green-500">{proposal.votesFor}</span>
              </div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Votes Against</span>
                <span className="font-medium text-red-500">{proposal.votesAgainst}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(100, progress)}%` }}
                />
              </div>
            </div>

            {proposal.status === 'active' && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{daysRemaining} days remaining</span>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

