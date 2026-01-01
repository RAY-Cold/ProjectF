import { Vault, VaultState } from "@/lib/types/vault";
import { apiRequest } from "./client";
import {
  mockVaults,
  mockVaultPositions,
  getVaultById as getMockVaultById, // alias to avoid name collision
} from "@/lib/mocks/vaultData";

export async function getVaults(): Promise<Vault[]> {
  return apiRequest<Vault[]>("/vaults", { method: "GET" }, () => mockVaults);
}

export async function getVaultById(id: string): Promise<Vault | null> {
  return apiRequest<Vault | null>(
    `/vaults/${id}`,
    { method: "GET" },
    () => getMockVaultById(id) ?? null // convert undefined -> null
  );
}

export async function getVaultState(vaultId: string): Promise<VaultState> {
  return apiRequest<VaultState>(
    `/vaults/${vaultId}/state`,
    { method: "GET" },
    // don’t guess your VaultState shape; keep it compile-safe
    () => ({ vaultId } as unknown as VaultState)
  );
}

export async function getVaultPositions(vaultId: string) {
  return apiRequest(
    `/vaults/${vaultId}/positions`,
    { method: "GET" },
    () => mockVaultPositions.filter((p: any) => p.vaultId === vaultId)
  );
}

// --- Actions (UI expects these to exist) ---

/**
 * Deposit into a vault.
 * Signature matches src/components/vaults/DepositPanel.tsx
 */
export async function depositToVault(
  vaultId: string,
  amount: number,
  insured: boolean,
  userAddress: string
): Promise<{ txHash: string; positionId?: string }> {
  return apiRequest<{ txHash: string; positionId?: string }>(
    `/vaults/${vaultId}/deposit`,
    {
      method: "POST",
      body: JSON.stringify({ vaultId, amount, insured, userAddress }),
    },
    () => ({
      txHash: `0x${Math.random().toString(16).slice(2)}`,
      positionId: `pos-${Date.now()}`,
    })
  );
}

/**
 * Optional: Withdraw (not currently imported by your UI, but useful later)
 */
export async function withdrawFromVault(
  vaultId: string,
  amount: number,
  userAddress: string
): Promise<{ txHash: string }> {
  return apiRequest<{ txHash: string }>(
    `/vaults/${vaultId}/withdraw`,
    {
      method: "POST",
      body: JSON.stringify({ vaultId, amount, userAddress }),
    },
    () => ({
      txHash: `0x${Math.random().toString(16).slice(2)}`,
    })
  );
}
