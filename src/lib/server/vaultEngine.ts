import { Vault, VaultPosition } from "@/lib/types/vault";
import {
  mockVaults,
  mockVaultPositions,
  getVaultById as getMockVaultById,
} from "@/lib/mocks/vaultData";

/**
 * In-memory demo “backend”.
 * Works great for hackathon/demo mode.
 * In dev mode, Next route handlers keep this module singleton per server process.
 */

export function listVaults(): Vault[] {
  return mockVaults;
}

export function getVault(id: string): Vault | null {
  return getMockVaultById(id) ?? null;
}

export function getPositionsForVault(vaultId: string): VaultPosition[] {
  return mockVaultPositions.filter((p) => p.vaultId === vaultId);
}

function shortTx(): string {
  return `0x${Math.random().toString(16).slice(2)}${Math.random()
    .toString(16)
    .slice(2)}`.slice(0, 66);
}

export function depositToVault(
  vaultId: string,
  amount: number,
  insured: boolean,
  _userAddress: string
): { txHash: string; positionId?: string } {
  const vault = mockVaults.find((v) => v.id === vaultId);
  if (!vault) throw new Error("Vault not found");

  // Update TVL in demo store
  vault.tvl = Number((vault.tvl + amount).toFixed(4));

  const apy = insured ? (vault.apyInsured ?? 0) : (vault.apyUninsured ?? 0);

  // Update user position
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

  return { txHash: shortTx(), positionId: `pos-${Date.now()}` };
}
