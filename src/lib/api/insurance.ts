import { CoveragePolicy, Claim, CoverageEstimate } from "@/lib/types/insurance";
import { apiRequest } from "./client";
import {
  mockClaims,
  mockPolicies,
  getCoverageEstimate,
  getClaimsByUser,
  getClaimById as getMockClaimById,
} from "@/lib/mocks/insuranceData";

export async function getUserPolicies(userAddress: string): Promise<CoveragePolicy[]> {
  return apiRequest<CoveragePolicy[]>(
    `/insurance/policies/${userAddress}`,
    { method: "GET" },
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
    "/insurance/estimate",
    {
      method: "POST",
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
    "/insurance/purchase",
    {
      method: "POST",
      body: JSON.stringify({ positionId, coverageAmount, duration, userAddress }),
    },
    () => {
      const policyId = `policy-${Date.now()}`;
      const now = Math.floor(Date.now() / 1000);
      const end = now + duration * 86400;

      // Use the same estimator so premium/premiumRate match UI expectations
      const est = getCoverageEstimate(coverageAmount, 35, duration);

      // Update mock policies so Insurance page shows it
      mockPolicies.unshift({
        id: policyId,
        policyType: "vault",
        positionId,
        coverageAmount,
        premium: est.premium,
        premiumRate: est.premiumRate,
        duration,
        startDate: now,
        endDate: end,
        riskScore: 35,
        active: true,
        nftTokenId: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random()
          .toString(16)
          .slice(2, 6)}`,
      });

      return {
        policyId,
        txHash: `0x${Math.random().toString(16).slice(2)}`,
      };
    }
  );
}

export async function getUserClaims(userAddress: string): Promise<Claim[]> {
  return apiRequest<Claim[]>(
    `/insurance/claims/${userAddress}`,
    { method: "GET" },
    () => getClaimsByUser(userAddress)
  );
}

export async function getClaimById(id: string): Promise<Claim | null> {
  return apiRequest<Claim | null>(
    `/insurance/claims/${id}`,
    { method: "GET" },
    () => getMockClaimById(id) ?? null
  );
}

/**
 * ✅ Required by: ClaimSubmissionForm.tsx
 * submitClaim(policyId, lossAmount, description, evidence, userAddress)
 */
export async function submitClaim(
  policyId: string,
  lossAmount: number,
  description: string,
  evidence: string[],
  userAddress: string
): Promise<{ claimId: string; txHash: string }> {
  return apiRequest<{ claimId: string; txHash: string }>(
    "/insurance/claim",
    {
      method: "POST",
      body: JSON.stringify({ policyId, lossAmount, description, evidence, userAddress }),
    },
    () => {
      const claimId = `claim-${Date.now()}`;
      const now = Math.floor(Date.now() / 1000);

      // Add to mock claims so Claims tab updates
      mockClaims.unshift({
        id: claimId,
        policyId,
        status: "voting",
        lossAmount,
        claimedAmount: lossAmount,
        evidence,
        description,
        submittedAt: now,
        votesFor: 0,
        votesAgainst: 0,
        requiredQuorum: 2000,
        votingEndsAt: now + 3 * 86400,
        stakeRequired: 0.2,
        staked: 0.2,
      });

      return {
        claimId,
        txHash: `0x${Math.random().toString(16).slice(2)}`,
      };
    }
  );
}
