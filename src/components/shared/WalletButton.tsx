"use client";

import React, { useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Button } from "@/components/shared/Button";

export function WalletButton() {
  const { address, isConnected } = useAccount();
  const { connectAsync, connectors, isPending, error, reset } = useConnect();
  const { disconnect } = useDisconnect();

  const [localError, setLocalError] = useState<string | null>(null);

  const wc = connectors.find((c) => c.id === "walletConnect");
  const injected = connectors.find((c) => c.id === "injected");
  const mm = connectors.find((c) => c.id === "metaMask");

  // Prefer injected in Chrome (MetaMask/Rabby), WalletConnect otherwise
  const preferred = mm ?? injected ?? wc ?? connectors[0];

  async function handleConnect() {
    setLocalError(null);
    reset();

    // Clear any stuck WC session keys before attempting again
    try {
      Object.keys(localStorage)
        .filter((k) => k.startsWith("wc@2") || k.includes("walletconnect"))
        .forEach((k) => localStorage.removeItem(k));
    } catch {}

    try {
      await connectAsync({ connector: preferred });
    } catch (e: any) {
      // Prevent Next.js red-screen
      setLocalError(e?.shortMessage || e?.message || "Connection failed. Try again.");
    }
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-end gap-2">
        <Button onClick={handleConnect} isLoading={isPending}>
          {preferred?.id === "walletConnect" ? "Connect (WalletConnect)" : "Connect Wallet"}
        </Button>

        {(localError || error?.message) && (
          <div className="text-xs text-red-400 max-w-[420px] text-right">
            {localError || error?.message}
            <div className="mt-1 text-[11px] text-muted-foreground">
              If it says “subscribe/connection interrupted”, click Connect again (we cleared stale WC session).
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="text-xs text-muted-foreground">
        <span className="text-foreground">
          {address?.slice(0, 6)}…{address?.slice(-4)}
        </span>
      </div>
      <Button variant="secondary" onClick={() => disconnect()}>
        Disconnect
      </Button>
    </div>
  );
}
