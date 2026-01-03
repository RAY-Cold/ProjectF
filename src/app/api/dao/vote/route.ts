import { NextResponse } from "next/server";
import { castClaimVote, castParameterVote } from "@/lib/server/daoEngine";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // mode discriminator:
    // { mode: "claim", claimId, voter, support, weight? }
    // { mode: "parameter", proposalId, voter, support, weight? }
    if (body?.mode === "claim") {
      const data = castClaimVote({
        claimId: body.claimId,
        voter: body.voter,
        support: body.support,
        weight: body.weight,
      });
      return NextResponse.json({ ok: true, data });
    }

    if (body?.mode === "parameter") {
      const data = castParameterVote({
        proposalId: body.proposalId,
        voter: body.voter,
        support: body.support,
        weight: body.weight,
      });
      return NextResponse.json({ ok: true, data });
    }

    return NextResponse.json({ ok: false, error: "Invalid vote mode" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Error" }, { status: 400 });
  }
}
