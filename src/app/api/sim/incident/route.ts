// src/app/api/sim/incident/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

/**
 * Demo-only: triggers an incident in a vault:
 * - increases risk score
 * - creates an activity entry
 * - optionally opens a "template" claim scenario
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const vaultId = String(body.vaultId || "");
  const severity = Math.max(1, Math.min(10, Number(body.severity ?? 6)));

  const vault = await prisma.vault.findUnique({ where: { id: vaultId } });
  if (!vault) return NextResponse.json({ ok: false, error: "Vault not found" }, { status: 404 });

  const bump = Math.round(severity * 4); // up to +40
  const newScore = Math.min(95, vault.riskScore + bump);

  const updated = await prisma.vault.update({
    where: { id: vaultId },
    data: {
      riskScore: newScore,
      apyRiskAdj: Math.max(0, vault.apyBase - (newScore / 100) * 0.02),
    },
  });

  await prisma.activity.create({
    data: {
      type: "claim_submitted",
      vaultId,
      metaJson: JSON.stringify({
        incident: true,
        severity,
        message: "Incident simulated: oracle deviation / exploit risk spike",
      }),
    },
  });

  return NextResponse.json({ ok: true, data: updated });
}