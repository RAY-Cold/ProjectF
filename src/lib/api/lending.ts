// src/lib/api/lending.ts
import { apiRequest } from "@/lib/api/client";

export type LendingMarketDTO = {
  id: string;
  assetSymbol: string;
  assetName: string;
  totalSupplyUsd: number;
  totalBorrowUsd: number;
  utilization: number;
  riskScore: number;
  borrowApr: number;
  supplyApr: number;
};

export type LendingPositionDTO = {
  id: string;
  marketId: string;
  userId: string;
  suppliedUsd: number;
  borrowedUsd: number;
  healthFactor: number;
  market: any;
};

export function getLendingMarkets() {
  return apiRequest<LendingMarketDTO[]>("/lending/markets");
}

export function getMyPositions(address: string) {
  return apiRequest<LendingPositionDTO[]>(`/lending/positions?address=${encodeURIComponent(address)}`);
}

export function lendingTx(input: {
  address: string;
  marketId: string;
  action: "supply" | "withdraw" | "borrow" | "repay";
  amountUsd: number;
}) {
  return apiRequest<LendingPositionDTO>("/lending/positions", {
    method: "POST",
    body: JSON.stringify(input),
  });
}