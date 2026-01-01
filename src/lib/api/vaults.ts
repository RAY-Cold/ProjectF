import { Vault, VaultState } from "@/lib/types/vault";
import { apiRequest } from "./client";
import {
  mockVaults,
  mockVaultPositions,
  getVaultById as getMockVaultById, // ✅ alias to avoid name collision
} from "@/lib/mocks/vaultData";

export async function getVaults(): Promise<Vault[]> {
  return apiRequest<Vault[]>("/vaults", { method: "GET" }, () => mockVaults);
}

export async function getVaultById(id: string): Promise<Vault | null> {
  return apiRequest<Vault | null>(
    `/vaults/${id}`,
    { method: "GET" },
    () => getMockVaultById(id) ?? null // ✅ convert undefined -> null
  );
}

export async function getVaultState(vaultId: string): Promise<VaultState> {
  return apiRequest<VaultState>(
    `/vaults/${vaultId}/state`,
    { method: "GET" },
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
