"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Wallet, LogOut } from "lucide-react";
import { formatAddress } from "@/lib/utils/formatters";

function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

function isRejected(err: any) {
  const msg = String(err?.message || err?.shortMessage || "").toLowerCase();
  const code = err?.code;
  return (
    code === 4001 ||
    msg.includes("user rejected") ||
    msg.includes("rejected") ||
    msg.includes("cancelled") ||
    msg.includes("canceled")
  );
}

export function WalletButton() {
  const mounted = useMounted();
  const { address, isConnected } = useAccount();
  const { connectAsync, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [msg, setMsg] = useState<string | null>(null);

  const injectedConn = useMemo(
    () => connectors.find((c) => c.id === "injected"),
    [connectors]
  );

  const connectMetaMask = async () => {
    setMsg(null);
    try {
      if (!injectedConn?.ready) {
        setMsg("MetaMask not detected. Enable MetaMask extension in Chrome (not Incognito).");
        return;
      }
      await connectAsync({ connector: injectedConn });
    } catch (e: any) {
      if (isRejected(e)) return setMsg("Connection cancelled.");
      console.error(e);
      setMsg(e?.shortMessage || e?.message || "Wallet connection failed.");
    }
  };

  if (!mounted) {
    return (
      <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground opacity-80" disabled>
        Connect Wallet
      </button>
    );
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-sm font-medium">{formatAddress(address)}</span>
        </div>
        <button
          onClick={() => disconnect()}
          className="p-2 bg-secondary hover:bg-secondary/80 rounded-lg"
          title="Disconnect"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        onClick={connectMetaMask}
        disabled={isPending}
        className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg disabled:opacity-60"
      >
        <Wallet className="w-4 h-4" />
        {isPending ? "Connecting..." : "Connect MetaMask"}
      </button>

      {msg && <div className="text-xs text-red-400 max-w-[360px] text-right">{msg}</div>}
    </div>
  );
}
