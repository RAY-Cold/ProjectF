// src/app/api/governance/proposals/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

const CreateSchema = z.object({
  title: z.string().min(6),
  description: z.string().min(10),
  type: z.string().min(3),
  payload: z.any(),
  durationHours: z.number().min(1).max(168),
});

export async function GET() {
  const proposals = await prisma.proposal.findMany({
    include: { votes: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ ok: true, data: proposals });
}

export async function POST(req: Request) {
  const body = await req.json();
  const input = CreateSchema.parse(body);

  const endsAt = new Date(Date.now() + input.durationHours * 3600000);

  const proposal = await prisma.proposal.create({
    data: {
      title: input.title,
      description: input.description,
      type: input.type,
      payloadJson: JSON.stringify(input.payload),
      endsAt,
    },
  });

  await prisma.activity.create({
    data: {
      type: "proposal_created",
      metaJson: JSON.stringify({ proposalId: proposal.id, title: proposal.title }),
    },
  });

  return NextResponse.json({ ok: true, data: proposal });
}