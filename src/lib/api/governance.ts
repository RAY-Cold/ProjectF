import { ClaimProposal, ParameterProposal, DAOStats, Vote } from '@/lib/types/governance';
import { apiRequest } from './client';
import {
  mockClaimProposals,
  mockParameterProposals,
  mockDAOStats,
  mockVotes,
} from '@/lib/mocks/governanceData';

export async function getClaimProposals(): Promise<ClaimProposal[]> {
  return apiRequest<ClaimProposal[]>(
    '/dao/claims',
    { method: 'GET' },
    () => mockClaimProposals
  );
}

export async function getParameterProposals(): Promise<ParameterProposal[]> {
  return apiRequest<ParameterProposal[]>(
    '/dao/proposals',
    { method: 'GET' },
    () => mockParameterProposals
  );
}

export async function getDAOStats(): Promise<DAOStats> {
  return apiRequest<DAOStats>(
    '/dao/stats',
    { method: 'GET' },
    () => mockDAOStats
  );
}

export async function voteOnClaim(
  claimId: string,
  voteType: 'approve' | 'reject',
  userAddress: string
): Promise<{ txHash: string }> {
  return apiRequest<{ txHash: string }>(
    '/dao/vote',
    {
      method: 'POST',
      body: JSON.stringify({ claimId, voteType, userAddress }),
    },
    () => ({
      txHash: `0x${Math.random().toString(16).slice(2)}`,
    })
  );
}

export async function getClaimVotes(claimId: string): Promise<Vote[]> {
  return apiRequest<Vote[]>(
    `/dao/votes/${claimId}`,
    { method: 'GET' },
    () => mockVotes.filter(v => v.claimId === claimId)
  );
}

export async function fastForwardClaim(claimId: string, newStatus: string): Promise<void> {
  return apiRequest<void>(
    `/dao/fast-forward/${claimId}`,
    {
      method: 'POST',
      body: JSON.stringify({ status: newStatus }),
    },
    () => Promise.resolve()
  );
}

