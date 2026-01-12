// src/app/api/vaults/tx/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

const TxSchema = z.object({
  address: z.string().min(3),
  vaultId: z.string().min(5),
  type: z.enum(["deposit", "withdraw"]),
  amountUsd: z.number().positive(),
});

export async function POST(req: Request) {
  const body = await req.json();
  const input = TxSchema.parse(body);

  const user =
    (await prisma.user.findUnique({ where: { address: input.address } })) ??
    (await prisma.user.create({ data: { address: input.address } }));

  const vault = await prisma.vault.findUnique({ where: { id: input.vaultId } });
  if (!vault) return NextResponse.json({ ok: false, error: "Vault not found" }, { status: 404 });

  const delta = input.type === "deposit" ? input.amountUsd : -input.amountUsd;

  const updated = await prisma.vault.update({
    where: { id: vault.id },
    data: { tvlUsd: Math.max(0, vault.tvlUsd + delta) },
  });

  await prisma.activity.create({
    data: {
      type: input.type,
      userId: user.id,
      vaultId: vault.id,
      amountUsd: input.amountUsd,
    },
  });

  return NextResponse.json({ ok: true, data: updated });
}