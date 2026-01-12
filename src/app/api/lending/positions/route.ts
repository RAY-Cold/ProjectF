// src/app/api/lending/positions/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

const GetSchema = z.object({
  address: z.string().min(3),
});

const TxSchema = z.object({
  address: z.string().min(3),
  marketId: z.string().min(5),
  action: z.enum(["supply", "withdraw", "borrow", "repay"]),
  amountUsd: z.number().positive(),
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const address = url.searchParams.get("address") || "";
  const input = GetSchema.parse({ address });

  const user = await prisma.user.findUnique({ where: { address: input.address } });
  if (!user) return NextResponse.json({ ok: true, data: [] });

  const positions = await prisma.lendingPosition.findMany({
    where: { userId: user.id },
    include: { market: true },
  });

  return NextResponse.json({ ok: true, data: positions });
}

export async function POST(req: Request) {
  const body = await req.json();
  const input = TxSchema.parse(body);

  const user =
    (await prisma.user.findUnique({ where: { address: input.address } })) ??
    (await prisma.user.create({ data: { address: input.address } }));

  const market = await prisma.lendingMarket.findUnique({ where: { id: input.marketId } });
  if (!market) return NextResponse.json({ ok: false, error: "Market not found" }, { status: 404 });

  const position =
    (await prisma.lendingPosition.findFirst({
      where: { userId: user.id, marketId: market.id },
    })) ??
    (await prisma.lendingPosition.create({
      data: { userId: user.id, marketId: market.id, suppliedUsd: 0, borrowedUsd: 0, healthFactor: 2.0 },
    }));

  let supplied = position.suppliedUsd;
  let borrowed = position.borrowedUsd;

  if (input.action === "supply") supplied += input.amountUsd;
  if (input.action === "withdraw") supplied = Math.max(0, supplied - input.amountUsd);
  if (input.action === "borrow") borrowed += input.amountUsd;
  if (input.action === "repay") borrowed = Math.max(0, borrowed - input.amountUsd);

  // Health factor (demo): collateral factor 80%
  const collateral = supplied * 0.8;
  const hf = borrowed <= 0 ? 10 : collateral / borrowed;

  const updated = await prisma.lendingPosition.update({
    where: { id: position.id },
    data: { suppliedUsd: supplied, borrowedUsd: borrowed, healthFactor: hf },
  });

  // Update market totals (simple accounting for demo)
  const marketUpdate: any = {};
  if (input.action === "supply") marketUpdate.totalSupplyUsd = market.totalSupplyUsd + input.amountUsd;
  if (input.action === "withdraw") marketUpdate.totalSupplyUsd = Math.max(0, market.totalSupplyUsd - input.amountUsd);
  if (input.action === "borrow") marketUpdate.totalBorrowUsd = market.totalBorrowUsd + input.amountUsd;
  if (input.action === "repay") marketUpdate.totalBorrowUsd = Math.max(0, market.totalBorrowUsd - input.amountUsd);

  if (Object.keys(marketUpdate).length) {
    await prisma.lendingMarket.update({ where: { id: market.id }, data: marketUpdate });
  }

  await prisma.activity.create({
    data: {
      type: input.action,
      userId: user.id,
      metaJson: JSON.stringify({ marketId: market.id, amountUsd: input.amountUsd }),
    },
  });

  return NextResponse.json({ ok: true, data: updated });
}