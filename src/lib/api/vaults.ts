// src/lib/api/vaults.ts
import { Vault, VaultPosition, VaultState } from "@/lib/types/vault";
import { apiRequest } from "./client";
import {
  mockVaults,
  mockVaultPositions,
  getVaultById as getMockVaultById,
} from "@/lib/mocks/vaultData";

/**
 * Backend Vault (DB/API) shape:
 *  { id, symbol, name, chain, tvlUsd, apyBase, apyRiskAdj, riskScore }
 *
 * UI Vault type (existing) uses:
 *  tvl, apyInsured, apyUninsured, etc.
 *
 * We normalize backend->UI here so the rest of your app doesn't change.
 */
function mapBackendVaultToUI(v: any): Vault {
  // If it already looks like UI Vault (from mocks), return as-is.
  if (v && typeof v === "object" && "tvl" in v) return v as Vault;

  const apyBase = Number(v?.apyBase ?? 0);
  const apyRiskAdj = Number(v?.apyRiskAdj ?? apyBase);

  // Heuristic: insured gets a slightly lower but safer APY; uninsured gets base.
  const apyUninsured = apyBase;
  const apyInsured = Math.max(0, apyRiskAdj);

  return {
    id: String(v.id),
    name: String(v.name ?? `${v.symbol ?? "Asset"} Vault`),
    symbol: String(v.symbol ?? "UNK"),
    chain: String(v.chain ?? "Unknown"),
    tvl: Number(v.tvlUsd ?? 0),
    riskScore: Number(v.riskScore ?? 50),
    apyInsured,
    apyUninsured,
    // If your UI Vault type has extra fields, keep safe defaults:
    description: v.description ?? undefined,
    utilization: v.utilization ?? undefined,
  } as any;
}

export async function getVaults(): Promise<Vault[]> {
  const rows = await apiRequest<any[]>(
    "/vaults",
    { method: "GET" },
    () => mockVaults as any
  );
  return rows.map(mapBackendVaultToUI);
}

export async function getVaultById(id: string): Promise<Vault | null> {
  // Your backend currently exposes GET /api/vaults (list), not /vaults/:id,
  // so we implement get-by-id by filtering the list.
  // (If you later add /api/vaults/:id, just swap this to call it directly.)
  const rows = await apiRequest<any[]>(
    "/vaults",
    { method: "GET" },
    () => mockVaults as any
  );

  const found = rows.find((v) => String(v.id) === String(id));
  if (found) return mapBackendVaultToUI(found);

  // fallback to mock getter (extra safety)
  return getMockVaultById(id) ?? null;
}

// Not used in your current UI, but kept compile-safe
export async function getVaultState(vaultId: string): Promise<VaultState> {
  // Derive from vault + position since backend doesn't have /state yet
  const vault = await getVaultById(vaultId);
  const positions = await getVaultPositions(vaultId);

  const pos = positions?.[0];

  return {
    balanceEth: pos?.balance ?? 0,
    insured: pos?.insured ?? false,
    tvlEth: (vault?.tvl ?? 0) as any,
    riskScore: vault?.riskScore ?? 0,
  };
}

export async function getVaultPositions(
  vaultId: string
): Promise<VaultPosition[]> {
  // Your backend doesn't persist per-vault positions yet in DB,
  // so for now we keep the mock positions (demo still works).
  // If you add position persistence later, replace this endpoint.
  return apiRequest<VaultPosition[]>(
    `/vaults/${vaultId}/positions`,
    { method: "GET" },
    () => mockVaultPositions.filter((p) => p.vaultId === vaultId)
  );
}

/**
 * ✅ Required by: src/components/vaults/DepositPanel.tsx
 * Signature must be: depositToVault(vaultId, amount, insured, userAddress)
 *
 * Backend endpoint: POST /api/vaults/tx
 * { address, vaultId, type, amountUsd }
 */
export async function depositToVault(
  vaultId: string,
  amount: number,
  insured: boolean,
  userAddress: string
): Promise<{ txHash: string; positionId?: string }> {
  return apiRequest<{ id: string } & any>(
    "/vaults/tx",
    {
      method: "POST",
      body: JSON.stringify({
        address: userAddress,
        vaultId,
        type: "deposit",
        amountUsd: amount,
      }),
    },
    () => {
      // --- Update mocks so UI reflects actions during the demo ---
      const vault = mockVaults.find((v) => v.id === vaultId);
      if (vault) vault.tvl = Number((vault.tvl + amount).toFixed(4));

      const apy = insured
        ? (vault?.apyInsured ?? 0)
        : (vault?.apyUninsured ?? 0);

      const existing = mockVaultPositions.find((p) => p.vaultId === vaultId);
      if (existing) {
        existing.balance = Number((existing.balance + amount).toFixed(4));
        existing.insured = insured;
        existing.apy = apy;
      } else {
        mockVaultPositions.unshift({
          vaultId,
          balance: amount,
          insured,
          apy,
          earned: 0,
          depositTimestamp: Math.floor(Date.now() / 1000),
        });
      }

      return { id: vaultId };
    }
  ).then(() => {
    return {
      txHash: `0x${Math.random().toString(16).slice(2)}${Math.random()
        .toString(16)
        .slice(2)}`.slice(0, 66),
      positionId: `pos-${Date.now()}`,
    };
  });
}