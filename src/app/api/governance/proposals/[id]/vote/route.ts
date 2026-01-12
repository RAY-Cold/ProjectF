// src/app/api/governance/proposals/[id]/vote/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

const VoteSchema = z.object({
  address: z.string().min(3),
  support: z.boolean(),
  weight: z.number().positive().max(100).optional(),
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const input = VoteSchema.parse(body);

  const proposal = await prisma.proposal.findUnique({
    where: { id: params.id },
    include: { votes: true },
  });
  if (!proposal) return NextResponse.json({ ok: false, error: "Proposal not found" }, { status: 404 });

  if (new Date() > proposal.endsAt) {
    return NextResponse.json({ ok: false, error: "Voting ended" }, { status: 400 });
  }

  const user =
    (await prisma.user.findUnique({ where: { address: input.address } })) ??
    (await prisma.user.create({ data: { address: input.address } }));

  await prisma.vote.upsert({
    where: { proposalId_userId: { proposalId: proposal.id, userId: user.id } },
    create: { proposalId: proposal.id, userId: user.id, support: input.support, weight: input.weight ?? 1 },
    update: { support: input.support, weight: input.weight ?? 1 },
  });

  // Simple pass/fail: >50% yes-weight and >=5 votes => passed
  const votes = await prisma.vote.findMany({ where: { proposalId: proposal.id } });
  const yes = votes.filter(v => v.support).reduce((a, v) => a + v.weight, 0);
  const no = votes.filter(v => !v.support).reduce((a, v) => a + v.weight, 0);
  const total = yes + no;

  let status = proposal.status;

  if (votes.length >= 5 && total > 0) {
    status = yes / total > 0.5 ? "passed" : "failed";
    await prisma.proposal.update({ where: { id: proposal.id }, data: { status } });
  }

  await prisma.activity.create({
    data: { type: "vote", userId: user.id, metaJson: JSON.stringify({ proposalId: proposal.id }) },
  });

  return NextResponse.json({ ok: true, data: { votes, status } });
}