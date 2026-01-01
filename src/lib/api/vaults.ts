import { Vault, VaultPosition, VaultState } from "@/lib/types/vault";
import { apiRequest } from "./client";
import {
  mockVaults,
  mockVaultPositions,
  getVaultById as getMockVaultById,
} from "@/lib/mocks/vaultData";

export async function getVaults(): Promise<Vault[]> {
  return apiRequest<Vault[]>("/vaults", { method: "GET" }, () => mockVaults);
}

export async function getVaultById(id: string): Promise<Vault | null> {
  return apiRequest<Vault | null>(
    `/vaults/${id}`,
    { method: "GET" },
    () => getMockVaultById(id) ?? null
  );
}

// Not used in your current UI, but kept correct + compile-safe
export async function getVaultState(vaultId: string): Promise<VaultState> {
  return apiRequest<VaultState>(
    `/vaults/${vaultId}/state`,
    { method: "GET" },
    () => {
      const v = getMockVaultById(vaultId);
      const pos = mockVaultPositions.find((p) => p.vaultId === vaultId);
      return {
        balanceEth: pos?.balance ?? 0,
        insured: pos?.insured ?? false,
        tvlEth: v?.tvl ?? 0,
        riskScore: v?.riskScore ?? 0,
      };
    }
  );
}

export async function getVaultPositions(vaultId: string): Promise<VaultPosition[]> {
  return apiRequest<VaultPosition[]>(
    `/vaults/${vaultId}/positions`,
    { method: "GET" },
    () => mockVaultPositions.filter((p) => p.vaultId === vaultId)
  );
}

/**
 * ✅ Required by: src/components/vaults/DepositPanel.tsx
 * Signature must be: depositToVault(vaultId, amount, insured, userAddress)
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
    () => {
      // --- Update mocks so UI reflects actions during the demo ---
      const vault = mockVaults.find((v) => v.id === vaultId);
      if (vault) {
        vault.tvl = Number((vault.tvl + amount).toFixed(4));
      }

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

      return {
        txHash: `0x${Math.random().toString(16).slice(2)}`,
        positionId: `pos-${Date.now()}`,
      };
    }
  );
}
