'use client';

import { ClaimProposal } from '@/lib/types/governance';
import { formatETH, formatRelativeTime } from '@/lib/utils/formatters';
import { Button } from '@/components/shared/Button';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { voteOnClaim } from '@/lib/api/governance';
import { useToast } from '@/providers/ToastProvider';
import { useState } from 'react';

interface ClaimVoteCardProps {
  proposal: ClaimProposal;
  onVote?: () => void;
}

export function ClaimVoteCard({ proposal, onVote }: ClaimVoteCardProps) {
  const { address } = useAccount();
  const { addToast } = useToast();
  const [voting, setVoting] = useState(false);

  const handleVote = async (voteType: 'approve' | 'reject') => {
    if (!address) {
      addToast('error', 'Please connect your wallet');
      return;
    }

    setVoting(true);
    try {
      await voteOnClaim(proposal.claimId, voteType, address);
      addToast('success', `Vote ${voteType === 'approve' ? 'approved' : 'rejected'} successfully`);
      onVote?.();
    } catch (error) {
      addToast('error', 'Failed to submit vote. Please try again.');
    } finally {
      setVoting(false);
    }
  };

  const progress = (proposal.votesFor / proposal.requiredQuorum) * 100;
  const timeRemaining = proposal.votingEndsAt - Date.now() / 1000;
  const daysRemaining = Math.max(0, Math.floor(timeRemaining / 86400));

  return (
    <motion.div
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
          <div className="text-sm text-muted-foreground mb-1">Loss Amount</div>
          <div className="text-lg font-semibold">{formatETH(proposal.lossAmount)}</div>
        </div>
        <div className="p-3 bg-muted rounded-lg">
          <div className="text-sm text-muted-foreground mb-1">Required Quorum</div>
          <div className="text-lg font-semibold">{proposal.requiredQuorum}</div>
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
        <div className="text-xs text-muted-foreground mt-2">
          {proposal.requiredQuorum - proposal.votesFor} more votes needed
        </div>
      </div>

      {proposal.status === 'active' && (
        <>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Clock className="w-4 h-4" />
            <span>{daysRemaining} days remaining</span>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => handleVote('approve')}
              isLoading={voting}
              className="flex-1"
              variant="default"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve
            </Button>
            <Button
              onClick={() => handleVote('reject')}
              isLoading={voting}
              className="flex-1"
              variant="destructive"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </Button>
          </div>
        </>
      )}
    </motion.div>
  );
}

