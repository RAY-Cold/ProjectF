'use client';

import { useState, useEffect, useMemo } from 'react';
import { getVaults } from '@/lib/api/vaults';
import { VaultList } from '@/components/vaults/VaultList';
import { VaultFilters } from '@/components/vaults/VaultFilters';
import { VaultDetailModal } from '@/components/vaults/VaultDetailModal';
import { Vault, RiskTier } from '@/lib/types/vault';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useDemoStore } from '@/store/demoStore';
import { Button } from '@/components/shared/Button';
import { AlertTriangle } from 'lucide-react';

export default function VaultsPage() {
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVault, setSelectedVault] = useState<Vault | null>(null);
  const [riskTiers, setRiskTiers] = useState<RiskTier[]>(['low', 'medium', 'high']);
  const [insuredOnly, setInsuredOnly] = useState(false);
  const [apyRange, setApyRange] = useState<[number, number]>([0, 30]);
  const { isDemoMode, addSimulatedEvent } = useDemoStore();

  useEffect(() => {
    async function loadVaults() {
      setLoading(true);
      try {
        const data = await getVaults();
        setVaults(data);
      } catch (error) {
        console.error('Failed to load vaults:', error);
      } finally {
        setLoading(false);
      }
    }
    loadVaults();
  }, []);

  const filteredVaults = useMemo(() => {
    return vaults.filter((vault) => {
      if (!riskTiers.includes(vault.riskTier)) return false;
      if (insuredOnly && vault.insurancePremium === 0) return false;
      if (vault.apyInsured < apyRange[0] || vault.apyInsured > apyRange[1]) return false;
      return true;
    });
  }, [vaults, riskTiers, insuredOnly, apyRange]);

  const handleSimulateLoss = async () => {
    if (!selectedVault) return;
    // In a real app, this would call the API
    addSimulatedEvent(`Loss event simulated for ${selectedVault.name}`);
    alert(`Demo: Loss event simulated for ${selectedVault.name}. Check the Insurance page to submit a claim.`);
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
      <VaultFilters
        riskTiers={riskTiers}
        onRiskTierChange={setRiskTiers}
        insuredOnly={insuredOnly}
        onInsuredOnlyChange={setInsuredOnly}
        apyRange={apyRange}
        onApyRangeChange={setApyRange}
      />

      {isDemoMode && (
        <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            <span className="text-sm font-medium">Demo Mode Active</span>
          </div>
          {selectedVault && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSimulateLoss}
            >
              Simulate Loss Event
            </Button>
          )}
        </div>
      )}

      <VaultList vaults={filteredVaults} onVaultSelect={setSelectedVault} />

      <VaultDetailModal
        vault={selectedVault}
        isOpen={!!selectedVault}
        onClose={() => setSelectedVault(null)}
      />
    </div>
  );
}
