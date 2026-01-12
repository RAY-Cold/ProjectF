"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAccount } from "wagmi";

import {
  getLendingMarkets,
  getMyPositions,
  lendingTx,
  type LendingMarketDTO,
} from "@/lib/api/lending";

import { WalletButton } from "@/components/shared/WalletButton";
import { Button } from "@/components/shared/Button";
import { Modal } from "@/components/shared/Modal";

import { formatUSD, formatPercentage } from "@/lib/utils/formatters";

function riskLabel(score: number) {
  if (score <= 33) return "Low";
  if (score <= 66) return "Medium";
  return "High";
}

export default function LendingMarketTable() {
  const qc = useQueryClient();
  const { address, isConnected } = useAccount();

  const [selected, setSelected] = useState<LendingMarketDTO | null>(null);
  const [action, setAction] = useState<"supply" | "withdraw" | "borrow" | "repay">(
    "supply"
  );
  const [amount, setAmount] = useState<number>(250);

  const marketsQ = useQuery({
    queryKey: ["lending-markets"],
    queryFn: getLendingMarkets,
  });

  const positionsQ = useQuery({
    queryKey: ["lending-positions", address],
    queryFn: () => getMyPositions(address as string),
    enabled: Boolean(address),
  });

  const txM = useMutation({
    mutationFn: lendingTx,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["lending-markets"] });
      await qc.invalidateQueries({ queryKey: ["lending-positions", address] });
      setSelected(null);
    },
  });

  const myPosByMarket = useMemo(() => {
    const map = new Map<string, any>();
    (positionsQ.data ?? []).forEach((p) => map.set(p.marketId, p));
    return map;
  }, [positionsQ.data]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Lending Markets</h2>
          <p className="text-sm text-muted-foreground">
            Risk-based rates update automatically using the Risk Engine snapshots.
          </p>
        </div>
        <WalletButton />
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <div className="grid grid-cols-7 gap-2 px-4 py-3 text-xs text-muted-foreground bg-muted/40">
          <div>Asset</div>
          <div className="text-right">Supply</div>
          <div className="text-right">Borrow</div>
          <div className="text-right">Util</div>
          <div className="text-right">Supply APR</div>
          <div className="text-right">Borrow APR</div>
          <div className="text-right">Risk</div>
        </div>

        {(marketsQ.data ?? []).map((m) => (
          <button
            key={m.id}
            onClick={() => setSelected(m)}
            className="w-full grid grid-cols-7 gap-2 px-4 py-3 text-sm border-t border-border hover:bg-muted/30 text-left"
          >
            <div className="font-medium">
              {m.assetSymbol} <span className="text-muted-foreground">({m.assetName})</span>
            </div>
            <div className="text-right">{formatUSD(m.totalSupplyUsd)}</div>
            <div className="text-right">{formatUSD(m.totalBorrowUsd)}</div>
            <div className="text-right">{formatPercentage(m.utilization * 100)}</div>
            <div className="text-right">{formatPercentage(m.supplyApr * 100)}</div>
            <div className="text-right">{formatPercentage(m.borrowApr * 100)}</div>
            <div className="text-right">
              <span className="text-foreground/80">{m.riskScore}</span>{" "}
              <span className="text-muted-foreground">({riskLabel(m.riskScore)})</span>
            </div>
          </button>
        ))}

        {marketsQ.isLoading && (
          <div className="p-4 text-sm text-muted-foreground">Loading markets…</div>
        )}
        {marketsQ.isError && (
          <div className="p-4 text-sm text-red-400">Failed to load markets.</div>
        )}
      </div>

      <div className="rounded-xl border border-border p-4">
        <h3 className="font-semibold mb-2">My Positions</h3>

        {!isConnected && (
          <div className="text-sm text-muted-foreground">
            Connect wallet to view positions.
          </div>
        )}

        {isConnected && (positionsQ.data ?? []).length === 0 && (
          <div className="text-sm text-muted-foreground">
            No positions yet. Open a market to supply/borrow.
          </div>
        )}

        {isConnected && (positionsQ.data ?? []).length > 0 && (
          <div className="space-y-2">
            {(positionsQ.data ?? []).map((p) => (
              <div key={p.id} className="flex items-center justify-between text-sm">
                <div className="font-medium">{p.market.assetSymbol}</div>
                <div className="text-muted-foreground">
                  Supplied: {formatUSD(p.suppliedUsd)} · Borrowed: {formatUSD(p.borrowedUsd)} · HF:{" "}
                  <span className={p.healthFactor < 1.2 ? "text-red-400" : "text-green-400"}>
                    {p.healthFactor.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected ? `Market: ${selected.assetSymbol}` : ""}
        size="lg"
      >
        {!isConnected ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Connect wallet to transact.
            </p>
            <WalletButton />
          </div>
        ) : (
          <div className="space-y-4">
            {selected && (
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg border border-border p-3">
                  <div className="text-muted-foreground">Supply APR</div>
                  <div className="text-lg font-semibold">
                    {formatPercentage(selected.supplyApr * 100)}
                  </div>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <div className="text-muted-foreground">Borrow APR</div>
                  <div className="text-lg font-semibold">
                    {formatPercentage(selected.borrowApr * 100)}
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2 flex-wrap">
              {(["supply", "withdraw", "borrow", "repay"] as const).map((a) => (
                <button
                  key={a}
                  onClick={() => setAction(a)}
                  className={`px-3 py-2 rounded-lg border text-sm ${
                    action === a
                      ? "border-border bg-muted/60"
                      : "border-border hover:bg-muted/30"
                  }`}
                >
                  {a.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full rounded-lg bg-background border border-border px-3 py-2 text-sm"
                min={1}
              />
              <div className="text-sm text-muted-foreground">USD</div>
            </div>

            <Button
              onClick={() => {
                if (!selected || !address) return;
                txM.mutate({
                  address,
                  marketId: selected.id,
                  action,
                  amountUsd: amount,
                });
              }}
              isLoading={txM.isPending}
              disabled={!selected || !address}
            >
              Execute
            </Button>

            {selected && (
              <div className="text-xs text-muted-foreground">
                Rates = utilization kink model + Risk Engine premium.
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
