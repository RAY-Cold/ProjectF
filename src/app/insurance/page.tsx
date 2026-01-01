'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { getUserPolicies, getUserClaims } from '@/lib/api/insurance';
import { CoveragePolicy, Claim } from '@/lib/types/insurance';
import { CoverageCard } from '@/components/insurance/CoverageCard';
import { CoveragePurchaseFlow } from '@/components/insurance/CoveragePurchaseFlow';
import { ClaimsList } from '@/components/insurance/ClaimsList';
import { ClaimDetail } from '@/components/insurance/ClaimDetail';
import { ClaimSubmissionForm } from '@/components/insurance/ClaimSubmissionForm';
import { Modal } from '@/components/shared/Modal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shared/Tabs';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Shield, FileText } from 'lucide-react';

export default function InsurancePage() {
  const { address } = useAccount();
  const [policies, setPolicies] = useState<CoveragePolicy[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!address) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const [policiesData, claimsData] = await Promise.all([
          getUserPolicies(address),
          getUserClaims(address),
        ]);
        setPolicies(policiesData);
        setClaims(claimsData);
      } catch (error) {
        console.error('Failed to load insurance data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [address]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Insurance</h1>
        <button
          onClick={() => setShowPurchaseModal(true)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          <Shield className="w-4 h-4 inline mr-2" />
          Purchase Coverage
        </button>
      </div>

      <Tabs defaultValue="policies">
        <TabsList>
          <TabsTrigger value="policies">
            <Shield className="w-4 h-4 mr-2" />
            Policies
          </TabsTrigger>
          <TabsTrigger value="claims">
            <FileText className="w-4 h-4 mr-2" />
            Claims
          </TabsTrigger>
        </TabsList>

        <TabsContent value="policies">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {policies.map((policy) => (
              <CoverageCard key={policy.id} policy={policy} />
            ))}
            {policies.length === 0 && (
              <div className="col-span-2 p-12 text-center text-muted-foreground">
                No active policies. Purchase coverage to get started.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="claims">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ClaimsList claims={claims} onClaimSelect={setSelectedClaim} />
            </div>
            <div>
              {selectedClaim ? (
                <ClaimDetail claim={selectedClaim} />
              ) : (
                <div className="p-6 rounded-lg border border-border bg-card text-center text-muted-foreground">
                  Select a claim to view details
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Modal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        title="Purchase Coverage"
        size="lg"
      >
        <CoveragePurchaseFlow
          positionId="vault-1"
          positionType="vault"
          maxCoverage={1000}
          riskScore={35}
          onSuccess={() => {
            setShowPurchaseModal(false);
            // Reload policies
            if (address) {
              getUserPolicies(address).then(setPolicies);
            }
          }}
        />
      </Modal>
    </div>
  );
}
