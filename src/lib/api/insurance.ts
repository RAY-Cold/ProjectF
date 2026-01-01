import { CoveragePolicy, Claim, CoverageEstimate } from '@/lib/types/insurance';
import { apiRequest } from './client';
import {
  mockClaims,
  mockPolicies,
  getCoverageEstimate,
  getClaimsByUser,
  getClaimById as getMockClaimById, // ✅ alias
} from "@/lib/mocks/insuranceData";


export async function getUserPolicies(userAddress: string): Promise<CoveragePolicy[]> {
  return apiRequest<CoveragePolicy[]>(
    `/insurance/policies/${userAddress}`,
    { method: 'GET' },
    () => mockPolicies
  );
}

export async function getCoverageEstimateApi(
  positionId: string,
  coverageAmount: number,
  riskScore: number,
  duration: number = 90
): Promise<CoverageEstimate> {
  return apiRequest<CoverageEstimate>(
    '/insurance/estimate',
    {
      method: 'POST',
      body: JSON.stringify({ positionId, coverageAmount, riskScore, duration }),
    },
    () => getCoverageEstimate(coverageAmount, riskScore, duration)
  );
}

export async function purchaseCoverage(
  positionId: string,
  coverageAmount: number,
  duration: number,
  userAddress: string
): Promise<{ policyId: string; txHash: string }> {
  return apiRequest<{ policyId: string; txHash: string }>(
    '/insurance/purchase',
    {
      method: 'POST',
      body: JSON.stringify({ positionId, coverageAmount, duration, userAddress }),
    },
    () => ({
      policyId: `policy-${Date.now()}`,
      txHash: `0x${Math.random().toString(16).slice(2)}`,
    })
  );
}

export async function getUserClaims(userAddress: string): Promise<Claim[]> {
  return apiRequest<Claim[]>(
    `/insurance/claims/${userAddress}`,
    { method: 'GET' },
    () => getClaimsByUser(userAddress)
  );
}

export async function getClaimById(id: string): Promise<Claim | null> {
  return apiRequest<Claim | null>(
    `/insurance/claims/${id}`,
    { method: 'GET' },
    () => getMockClaimById(id) ?? null
  );
}

export async function submitClaim(
  policyId: string,
  lossAmount: number,
  description: string,
  evidence: string[],
  userAddress: string
): Promise<{ claimId: string; txHash: string }> {
  return apiRequest<{ claimId: string; txHash: string }>(
    '/insurance/claim',
    {
      method: 'POST',
      body: JSON.stringify({ policyId, lossAmount, description, evidence, userAddress }),
    },
    () => ({
      claimId: `claim-${Date.now()}`,
      txHash: `0x${Math.random().toString(16).slice(2)}`,
    })
  );
}

