export const RISK_TIERS = {
  low: { min: 0, max: 33, color: "#10B981", label: "Low Risk" },
  medium: { min: 34, max: 66, color: "#F59E0B", label: "Medium Risk" },
  high: { min: 67, max: 100, color: "#EF4444", label: "High Risk" },
} as const;

export const CLAIM_STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  submitted: "Submitted",
  voting: "Voting",
  approved: "Approved",
  paid: "Paid",
  rejected: "Rejected",
};

export const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  deposit: "Deposit",
  withdraw: "Withdraw",
  coverage_purchased: "Coverage Purchased",
  claim_submitted: "Claim Submitted",
  claim_approved: "Claim Approved",
  claim_rejected: "Claim Rejected",
  payout_received: "Payout Received",
  // optional extras for lending/governance activity feeds
  supply: "Supply",
  borrow: "Borrow",
  repay: "Repay",
  liquidation: "Liquidation",
  vote: "Vote",
  proposal_created: "Proposal Created",
};

export const USE_MOCK_API =
  (process.env.NEXT_PUBLIC_USE_MOCK_API || "").toLowerCase() === "true";

/**
 * Single source of truth for API base.
 * - In production + local Next.js route handlers: "/api"
 * - If you later move backend to separate server, set NEXT_PUBLIC_API_BASE_URL
 *   e.g. "https://your-backend.com/api"
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ||
  process.env.NEXT_PUBLIC_API_URL?.trim() ||
  "/api";
