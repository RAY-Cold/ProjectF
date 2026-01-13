import { NextResponse } from "next/server";

export async function GET() {
  // Demo/mock response so UI features work
  return NextResponse.json({
    ok: true,
    data: {
      treasuryBalance: 1250000,
      activeProposals: 4,
      totalMembers: 1832,
      quorumPercent: 12,
      proposals: [
        { id: "P-101", title: "Adjust insurance premium curve", status: "Active", votesFor: 340, votesAgainst: 80 },
        { id: "P-102", title: "Add Stablecoin Vault strategy", status: "Passed", votesFor: 560, votesAgainst: 90 },
        { id: "P-103", title: "Increase risk threshold for leveraged pools", status: "Active", votesFor: 220, votesAgainst: 110 },
        { id: "P-104", title: "Fund bug bounty program", status: "Queued", votesFor: 410, votesAgainst: 20 },
      ],
    },
  });
}
