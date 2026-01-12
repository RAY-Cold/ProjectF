// src/app/api/vaults/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const vaults = await prisma.vault.findMany({ orderBy: { tvlUsd: "desc" } });
  return NextResponse.json({ ok: true, data: vaults });
}