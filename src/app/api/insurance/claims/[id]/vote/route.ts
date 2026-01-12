// src/app/api/insurance/claims/[id]/vote/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

const VoteSchema = z.object({
  address: z.string().min(3),
  support: z.boolean(),
  weight: z.number().positive().max(100).optional(),
});

export async function POST(
  req: Request,
  { params }: { params: { id: string } } // ✅ keep this as { id } to match folder name [id]
) {
  const body = await req.json().catch(() => ({}));
  const input = VoteSchema.parse(body);

  try {
    const result = await prisma.$transaction(async (tx) => {
      const user =
        (await tx.user.findUnique({ where: { address: input.address } })) ??
        (await tx.user.create({ data: { address: input.address } }));

      const claim = await tx.claim.findUnique({
        where: { id: params.id }, // ✅ use params.id
        include: { votes: true, policy: true },
      });

      if (!claim) {
        return { error: "Claim not found", status: 404 as const };
      }

      // Only allow voting while claim is in voting status
      if (claim.status !== "voting") {
        return {
          error: `Claim is not in voting state (current: ${claim.status})`,
          status: 400 as const,
        };
      }

      await tx.claimVote.upsert({
        where: { claimId_userId: { claimId: claim.id, userId: user.id } },
        create: {
          claimId: claim.id,
          userId: user.id,
          support: input.support,
          weight: input.weight ?? 1,
        },
        update: {
          support: input.support,
          weight: input.weight ?? 1,
        },
      });

      // Recompute votes
      const votes = await tx.claimVote.findMany({ where: { claimId: claim.id } });

      const yesWeight = votes
        .filter((v) => v.support)
        .reduce((sum, v) => sum + v.weight, 0);

      const noWeight = votes
        .filter((v) => !v.support)
        .reduce((sum, v) => sum + v.weight, 0);

      const totalWeight = yesWeight + noWeight;

      let newStatus = claim.status;
      let yesPct = totalWeight > 0 ? yesWeight / totalWeight : 0;

      // Adjudication: >=60% yes-weight and >=3 votes => approve; else reject
      if (votes.length >= 3 && totalWeight > 0) {
        newStatus = yesPct >= 0.6 ? "approved" : "rejected";

        await tx.claim.update({
          where: { id: claim.id },
          data: { status: newStatus },
        });

        await tx.activity.create({
          data: {
            type: newStatus === "approved" ? "claim_approved" : "claim_rejected",
            vaultId: claim.vaultId,
            metaJson: JSON.stringify({ claimId: claim.id, yesPct }),
          },
        });

        // Demo payout: immediate pay if approved
        if (newStatus === "approved") {
          newStatus = "paid";

          await tx.claim.update({
            where: { id: claim.id },
            data: { status: "paid" },
          });

          await tx.activity.create({
            data: {
              type: "payout_received",
              vaultId: claim.vaultId,
              amountUsd: claim.amountUsd,
              metaJson: JSON.stringify({ claimId: claim.id }),
            },
          });
        }
      }

      return {
        data: {
          claimId: claim.id,
          status: newStatus,
          votesCount: votes.length,
          yesWeight,
          noWeight,
          totalWeight,
          yesPct,
          votes,
        },
        status: 200 as const,
      };
    });

    if ("error" in result) {
      return NextResponse.json({ ok: false, error: result.error }, { status: result.status });
    }

    return NextResponse.json({ ok: true, data: result.data }, { status: result.status });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: "Vote failed", details: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}