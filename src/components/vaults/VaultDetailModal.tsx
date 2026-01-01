'use client';

import React from 'react';
import { Vault } from '@/lib/types/vault';
import { Modal } from '@/components/shared/Modal';
import { DepositPanel } from './DepositPanel';
import { formatETH, formatPercentage } from '@/lib/utils/formatters';
import { getRiskTier, getRiskColor } from '@/lib/utils/riskCalculations';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shared/Tabs';

interface VaultDetailModalProps {
  vault: Vault | null;
  isOpen: boolean;
  onClose: () => void;
}

export function VaultDetailModal({ vault, isOpen, onClose }: VaultDetailModalProps) {
  if (!vault) return null;

  const tier = getRiskTier(vault.riskScore);
  const color = getRiskColor(vault.riskScore);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={vault.name} size="lg">
      <Tabs defaultValue="deposit">
        <TabsList>
          <TabsTrigger value="deposit">Deposit</TabsTrigger>
          <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
          <TabsTrigger value="strategy">Strategy</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="deposit">
          <DepositPanel vault={vault} onSuccess={onClose} />
        </TabsContent>

        <TabsContent value="withdraw">
          <div className="text-center py-8 text-muted-foreground">
            Withdraw functionality coming soon
          </div>
        </TabsContent>

        <TabsContent value="strategy">
          <div className="space-y-4">
            <h3 className="font-semibold mb-4">Strategy Breakdown</h3>
            {vault.strategies.map((strategy, idx) => (
              <div key={idx} className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{strategy.protocol}</span>
                  <span className="text-sm text-muted-foreground">
                    {formatPercentage(strategy.allocation)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {strategy.description}
                </p>
                <span
                  className="px-2 py-1 rounded text-xs"
                  style={{
                    backgroundColor: `${getRiskColor(strategy.protocolRisk === 'low' ? 20 : strategy.protocolRisk === 'medium' ? 50 : 80)}20`,
                    color: getRiskColor(strategy.protocolRisk === 'low' ? 20 : strategy.protocolRisk === 'medium' ? 50 : 80),
                  }}
                >
                  {strategy.protocolRisk.toUpperCase()} RISK
                </span>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="details">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Risk Score</div>
                <div className="text-lg font-semibold" style={{ color }}>
                  {vault.riskScore}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Risk Tier</div>
                <div className="text-lg font-semibold">{tier.toUpperCase()}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Total TVL</div>
                <div className="text-lg font-semibold">{formatETH(vault.tvl)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Utilization</div>
                <div className="text-lg font-semibold">
                  {formatPercentage(vault.utilization)}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Reserve Ratio</div>
                <div className="text-lg font-semibold">
                  {formatPercentage(vault.reserveRatio)}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Max Coverage</div>
                <div className="text-lg font-semibold">
                  {formatETH(vault.maxCoverageLimit)}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Modal>
  );
}

