'use client';

import { Vault } from '@/lib/types/vault';
import { VaultCard } from './VaultCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { TrendingUp } from 'lucide-react';

interface VaultListProps {
  vaults: Vault[];
  onVaultSelect: (vault: Vault) => void;
}

export function VaultList({ vaults, onVaultSelect }: VaultListProps) {
  if (vaults.length === 0) {
    return (
      <EmptyState
        icon={TrendingUp}
        title="No vaults found"
        description="Try adjusting your filters to see more vaults."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {vaults.map((vault) => (
        <VaultCard key={vault.id} vault={vault} onSelect={onVaultSelect} />
      ))}
    </div>
  );
}

