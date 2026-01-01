'use client';

import { useState } from 'react';
import { Vault } from '@/lib/types/vault';
import { Button } from '@/components/shared/Button';
import { formatETH, formatPercentage } from '@/lib/utils/formatters';
import { useAccount } from 'wagmi';
import { depositToVault } from '@/lib/api/vaults';
import { useToast } from '@/providers/ToastProvider';
import { Toggle } from '@/components/shared/Toggle';
import { Info } from 'lucide-react';
import { Tooltip } from '@/components/shared/Tooltip';

interface DepositPanelProps {
  vault: Vault;
  onSuccess?: () => void;
}

export function DepositPanel({ vault, onSuccess }: DepositPanelProps) {
  const { address } = useAccount();
  const { addToast } = useToast();
  const [amount, setAmount] = useState('');
  const [insured, setInsured] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleDeposit = async () => {
    if (!address) {
      addToast('error', 'Please connect your wallet');
      return;
    }

    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount < vault.minDeposit) {
      addToast('error', `Minimum deposit is ${formatETH(vault.minDeposit)}`);
      return;
    }

    if (vault.maxDeposit && depositAmount > vault.maxDeposit) {
      addToast('error', `Maximum deposit is ${formatETH(vault.maxDeposit)}`);
      return;
    }

    setLoading(true);
    try {
      const result = await depositToVault(vault.id, depositAmount, insured, address);
      addToast('success', `Deposit successful! TX: ${result.txHash.slice(0, 10)}...`);
      setAmount('');
      onSuccess?.();
    } catch (error) {
      addToast('error', 'Deposit failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const apy = insured ? vault.apyInsured : vault.apyUninsured;
  const expectedYield = amount ? (parseFloat(amount) * apy) / 100 : 0;

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">Deposit Amount (ETH)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={`Min: ${formatETH(vault.minDeposit)}`}
          className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          min={vault.minDeposit}
          max={vault.maxDeposit}
        />
      </div>

      <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Insured Mode</span>
          <Tooltip content="Insured mode provides coverage against losses but has a lower APY due to insurance premium">
            <Info className="w-4 h-4 text-muted-foreground" />
          </Tooltip>
        </div>
        <Toggle checked={insured} onCheckedChange={setInsured} />
      </div>

      <div className="p-4 bg-card rounded-lg border border-border space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Expected APY</span>
          <span className="font-medium">{formatPercentage(apy)}</span>
        </div>
        {insured && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Insurance Premium</span>
            <span className="font-medium">{formatPercentage(vault.insurancePremium)}</span>
          </div>
        )}
        {amount && (
          <div className="flex justify-between text-sm pt-2 border-t border-border">
            <span className="text-muted-foreground">Expected Annual Yield</span>
            <span className="font-medium text-green-500">{formatETH(expectedYield)}</span>
          </div>
        )}
      </div>

      <Button
        onClick={handleDeposit}
        className="w-full"
        isLoading={loading}
        disabled={!amount || parseFloat(amount) < vault.minDeposit}
      >
        Deposit
      </Button>
    </div>
  );
}

