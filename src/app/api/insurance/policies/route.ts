// src/app/api/insurance/policies/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

const CreateSchema = z.object({
  address: z.string().min(3),
  vaultId: z.string().min(5),
  coverageUsd: z.number().positive(),
  durationDays: z.number().min(1).max(365),
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const address = url.searchParams.get("address");
  if (!address) {
    const all = await prisma.policy.findMany({ include: { user: true } });
    return NextResponse.json({ ok: true, data: all });
  }

  const user = await prisma.user.findUnique({ where: { address } });
  if (!user) return NextResponse.json({ ok: true, data: [] });

  const policies = await prisma.policy.findMany({ where: { userId: user.id } });
  return NextResponse.json({ ok: true, data: policies });
}

export async function POST(req: Request) {
  const body = await req.json();
  const input = CreateSchema.parse(body);

  const user =
    (await prisma.user.findUnique({ where: { address: input.address } })) ??
    (await prisma.user.create({ data: { address: input.address } }));

  // Premium: base 2% annualized + risk multiplier from vault riskScore
  const vault = await prisma.vault.findUnique({ where: { id: input.vaultId } });
  if (!vault) return NextResponse.json({ ok: false, error: "Vault not found" }, { status: 404 });

  const annualBase = 0.02;
  const riskMult = 1 + vault.riskScore / 120; // 1.0..~1.8
  const annualRate = annualBase * riskMult;

  const premiumUsd = input.coverageUsd * annualRate * (input.durationDays / 365);

  const endAt = new Date(Date.now() + input.durationDays * 86400000);

  const policy = await prisma.policy.create({
    data: {
      userId: user.id,
      vaultId: input.vaultId,
      coverageUsd: input.coverageUsd,
      premiumUsd,
      endAt,
    },
  });

  await prisma.activity.create({
    data: {
      type: "coverage_purchased",
      userId: user.id,
      vaultId: input.vaultId,
      amountUsd: premiumUsd,
      metaJson: JSON.stringify({ coverageUsd: input.coverageUsd, durationDays: input.durationDays }),
    },
  });

  return NextResponse.json({ ok: true, data: policy });
}