'use client';

import { ClaimProposal } from '@/lib/types/governance';
import { ClaimVoteCard } from './ClaimVoteCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { FileText } from 'lucide-react';

interface VotingQueueProps {
  proposals: ClaimProposal[];
  onVote?: () => void;
}

export function VotingQueue({ proposals, onVote }: VotingQueueProps) {
  const activeProposals = proposals.filter(p => p.status === 'active');

  if (activeProposals.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No active proposals"
        description="There are currently no claims in the voting queue."
      />
    );
  }

  return (
    <div className="space-y-4">
      {activeProposals.map((proposal) => (
        <ClaimVoteCard key={proposal.claimId} proposal={proposal} onVote={onVote} />
      ))}
    </div>
  );
}

