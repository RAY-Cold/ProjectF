// src/app/api/insurance/claims/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

const CreateSchema = z.object({
  address: z.string().min(3),
  policyId: z.string().min(5),
  vaultId: z.string().min(5),
  amountUsd: z.number().positive(),
  reason: z.string().min(8),
  evidenceUrl: z.string().url().optional(),
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const claims = await prisma.claim.findMany({
    where: status ? { status: status as any } : undefined,
    include: { votes: true, policy: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ ok: true, data: claims });
}

export async function POST(req: Request) {
  const body = await req.json();
  const input = CreateSchema.parse(body);

  const user =
    (await prisma.user.findUnique({ where: { address: input.address } })) ??
    (await prisma.user.create({ data: { address: input.address } }));

  const policy = await prisma.policy.findUnique({ where: { id: input.policyId } });
  if (!policy) return NextResponse.json({ ok: false, error: "Policy not found" }, { status: 404 });

  const claim = await prisma.claim.create({
    data: {
      policyId: input.policyId,
      vaultId: input.vaultId,
      amountUsd: input.amountUsd,
      reason: input.reason,
      evidenceUrl: input.evidenceUrl,
      status: "voting",
    },
  });

  await prisma.activity.create({
    data: {
      type: "claim_submitted",
      userId: user.id,
      vaultId: input.vaultId,
      amountUsd: input.amountUsd,
      metaJson: JSON.stringify({ claimId: claim.id }),
    },
  });

  return NextResponse.json({ ok: true, data: claim });
}