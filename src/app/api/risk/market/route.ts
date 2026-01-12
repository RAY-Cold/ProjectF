// src/app/api/risk/market/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { snapshotMarketRisk } from "@/lib/server/riskEngine";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const marketId = url.searchParams.get("marketId") || "";
  if (!marketId) return NextResponse.json({ ok: false, error: "marketId required" }, { status: 400 });

  const latest = await prisma.riskSnapshot.findFirst({
    where: { marketId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ ok: true, data: latest });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const marketId = String(body.marketId || "");
  const overrides = body.overrides || undefined;

  if (!marketId) return NextResponse.json({ ok: false, error: "marketId required" }, { status: 400 });

  const snap = await snapshotMarketRisk(marketId, overrides);
  return NextResponse.json({ ok: true, data: snap });
}