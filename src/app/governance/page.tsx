'use client';

import { useState, useEffect } from 'react';
import { getClaimProposals, getParameterProposals, getDAOStats } from '@/lib/api/governance';
import { ClaimProposal, ParameterProposal, DAOStats } from '@/lib/types/governance';
import { VotingQueue } from '@/components/governance/VotingQueue';
import { ParameterProposals } from '@/components/governance/ParameterProposals';
import { DAOExplanation } from '@/components/governance/DAOExplanation';
import { MetricCard } from '@/components/shared/MetricCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shared/Tabs';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { FileText, Settings, Users } from 'lucide-react';
import { useDemoStore } from '@/store/demoStore';
import { Button } from '@/components/shared/Button';
import { fastForwardClaim } from '@/lib/api/governance';
import { useToast } from '@/providers/ToastProvider';

export default function GovernancePage() {
  const [claimProposals, setClaimProposals] = useState<ClaimProposal[]>([]);
  const [parameterProposals, setParameterProposals] = useState<ParameterProposal[]>([]);
  const [stats, setStats] = useState<DAOStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { isDemoMode } = useDemoStore();
  const { addToast } = useToast();

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [claims, params, daoStats] = await Promise.all([
          getClaimProposals(),
          getParameterProposals(),
          getDAOStats(),
        ]);
        setClaimProposals(claims);
        setParameterProposals(params);
        setStats(daoStats);
      } catch (error) {
        console.error('Failed to load governance data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleFastForward = async (claimId: string, status: string) => {
    try {
      await fastForwardClaim(claimId, status);
      addToast('success', `Claim status updated to ${status}`);
      // Reload proposals
      const proposals = await getClaimProposals();
      setClaimProposals(proposals);
    } catch (error) {
      addToast('error', 'Failed to fast-forward claim');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Governance</h1>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <MetricCard
            title="Total Proposals"
            value={stats.totalProposals}
            icon={FileText}
          />
          <MetricCard
            title="Active Proposals"
            value={stats.activeProposals}
            icon={FileText}
          />
          <MetricCard
            title="Total Voters"
            value={stats.totalVoters}
            icon={Users}
          />
          <MetricCard
            title="Quorum Threshold"
            value={stats.quorumThreshold}
            icon={Settings}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Tabs defaultValue="claims">
            <TabsList>
              <TabsTrigger value="claims">
                <FileText className="w-4 h-4 mr-2" />
                Claim Proposals
              </TabsTrigger>
              <TabsTrigger value="parameters">
                <Settings className="w-4 h-4 mr-2" />
                Parameter Proposals
              </TabsTrigger>
            </TabsList>

            <TabsContent value="claims">
              <VotingQueue
                proposals={claimProposals}
                onVote={() => {
                  // Reload proposals after vote
                  getClaimProposals().then(setClaimProposals);
                }}
              />
              {isDemoMode && (
                <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-lg">
                  <h4 className="font-semibold mb-2">Demo Mode: Fast-forward Claims</h4>
                  <div className="flex gap-2">
                    {claimProposals
                      .filter(p => p.status === 'active')
                      .map((proposal) => (
                        <div key={proposal.claimId} className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleFastForward(proposal.claimId, 'approved')}
                          >
                            Approve {proposal.claimId.slice(-4)}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleFastForward(proposal.claimId, 'rejected')}
                          >
                            Reject {proposal.claimId.slice(-4)}
                          </Button>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="parameters">
              <ParameterProposals proposals={parameterProposals} />
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <DAOExplanation />
        </div>
      </div>
    </div>
  );
}
