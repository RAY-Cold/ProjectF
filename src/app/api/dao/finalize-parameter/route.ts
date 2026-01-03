import { NextResponse } from "next/server";
import { finalizeParameterProposal, executeParameterProposal } from "@/lib/server/daoEngine";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // { action: "finalize", proposalId } OR { action: "execute", proposalId }
    if (body?.action === "finalize") {
      const data = finalizeParameterProposal({ proposalId: body.proposalId });
      return NextResponse.json({ ok: true, data });
    }
    if (body?.action === "execute") {
      const data = executeParameterProposal({ proposalId: body.proposalId });
      return NextResponse.json({ ok: true, data });
    }

    return NextResponse.json({ ok: false, error: "Invalid action" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Error" }, { status: 400 });
  }
}
