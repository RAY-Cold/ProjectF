import { Vault, VaultPosition } from '@/lib/types/vault';

export const mockVaults: Vault[] = [
  {
    id: 'vault-1',
    name: 'Conservative Yield Vault',
    description: 'Low-risk strategy focusing on established protocols with strong security audits.',
    apyUninsured: 8.5,
    apyInsured: 7.2,
    riskTier: 'low',
    riskScore: 25,
    insurancePremium: 1.3,
    maxCoverageLimit: 1000,
    utilization: 78,
    reserveRatio: 15,
    tvl: 2450.5,
    minDeposit: 0.1,
    strategies: [
      { protocol: 'Aave', protocolRisk: 'low', allocation: 60, description: 'Lending on Aave v3' },
      { protocol: 'Compound', protocolRisk: 'low', allocation: 30, description: 'Lending on Compound v3' },
      { protocol: 'USDC Pool', protocolRisk: 'low', allocation: 10, description: 'Stablecoin liquidity' },
    ],
  },
  {
    id: 'vault-2',
    name: 'Balanced Growth Vault',
    description: 'Medium-risk strategy balancing yield and security across DeFi protocols.',
    apyUninsured: 12.8,
    apyInsured: 10.5,
    riskTier: 'medium',
    riskScore: 48,
    insurancePremium: 2.3,
    maxCoverageLimit: 500,
    utilization: 85,
    reserveRatio: 12,
    tvl: 1890.2,
    minDeposit: 0.1,
    strategies: [
      { protocol: 'Uniswap V3', protocolRisk: 'medium', allocation: 40, description: 'Liquidity provision' },
      { protocol: 'Curve', protocolRisk: 'low', allocation: 35, description: 'Stablecoin pools' },
      { protocol: 'Yearn', protocolRisk: 'medium', allocation: 25, description: 'Yield aggregation' },
    ],
  },
  {
    id: 'vault-3',
    name: 'Aggressive Yield Vault',
    description: 'High-risk, high-reward strategy targeting emerging protocols and strategies.',
    apyUninsured: 18.5,
    apyInsured: 14.2,
    riskTier: 'high',
    riskScore: 72,
    insurancePremium: 4.3,
    maxCoverageLimit: 200,
    utilization: 92,
    reserveRatio: 8,
    tvl: 1250.8,
    minDeposit: 0.5,
    strategies: [
      { protocol: 'New Protocol A', protocolRisk: 'high', allocation: 50, description: 'Emerging yield farm' },
      { protocol: 'Leveraged Position', protocolRisk: 'high', allocation: 30, description: 'Leveraged lending' },
      { protocol: 'LP Token Staking', protocolRisk: 'medium', allocation: 20, description: 'Liquidity mining' },
    ],
  },
  {
    id: 'vault-4',
    name: 'Stablecoin Vault',
    description: 'Ultra-conservative vault focused on stablecoin yield with minimal risk.',
    apyUninsured: 5.2,
    apyInsured: 4.8,
    riskTier: 'low',
    riskScore: 15,
    insurancePremium: 0.4,
    maxCoverageLimit: 2000,
    utilization: 65,
    reserveRatio: 20,
    tvl: 3200.0,
    minDeposit: 0.05,
    strategies: [
      { protocol: 'USDC Savings', protocolRisk: 'low', allocation: 70, description: 'Direct stablecoin lending' },
      { protocol: 'DAI Pool', protocolRisk: 'low', allocation: 30, description: 'DAI liquidity' },
    ],
  },
];

export const mockVaultPositions: VaultPosition[] = [
  {
    vaultId: 'vault-1',
    balance: 10.5,
    insured: true,
    apy: 7.2,
    earned: 0.85,
    depositTimestamp: Date.now() / 1000 - 86400 * 30, // 30 days ago
  },
  {
    vaultId: 'vault-2',
    balance: 5.2,
    insured: false,
    apy: 12.8,
    earned: 0.42,
    depositTimestamp: Date.now() / 1000 - 86400 * 15, // 15 days ago
  },
];

export function getVaultById(id: string): Vault | undefined {
  return mockVaults.find(v => v.id === id);
}

