// src/app/api/insurance/claims/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

const AllowedStatuses = ["voting", "approved", "rejected", "paid", "pending"] as const;

const CreateSchema = z.object({
  address: z.string().min(3),
  policyId: z.string().min(5),
  vaultId: z.string().min(3),
  amountUsd: z.coerce.number().positive(), // ✅ handles "123.45" from form inputs
  reason: z.string().min(8),
  evidenceUrl: z.string().url().optional(),
});

function jsonError(message: string, status = 400, details?: unknown) {
  return NextResponse.json(
    { ok: false, error: message, details },
    { status }
  );
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const status = url.searchParams.get("status");

    const statusFilter =
      status && (AllowedStatuses as readonly string[]).includes(status)
        ? (status as (typeof AllowedStatuses)[number])
        : null;

    const claims = await prisma.claim.findMany({
      where: statusFilter ? { status: statusFilter } : undefined,
      include: { votes: true, policy: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ ok: true, data: claims });
  } catch (e: any) {
    return jsonError(e?.message ?? "Failed to fetch claims", 500);
  }
}

export async function POST(req: Request) {
  try {
    // ✅ Handle invalid JSON safely
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return jsonError("Invalid JSON body", 400);
    }

    const input = CreateSchema.parse(body);

    // ✅ Find or create user (by address)
    const user =
      (await prisma.user.findUnique({ where: { address: input.address } })) ??
      (await prisma.user.create({ data: { address: input.address } }));

    // ✅ Validate policy exists
    const policy = await prisma.policy.findUnique({
      where: { id: input.policyId },
    });

    if (!policy) {
      return jsonError("Policy not found", 404);
    }

    // ✅ Create claim
    const claim = await prisma.claim.create({
      data: {
        policyId: input.policyId,
        vaultId: input.vaultId,
        amountUsd: input.amountUsd,
        reason: input.reason,
        evidenceUrl: input.evidenceUrl,
        status: "voting",

        // ✅ Strongly recommended: associate claim to the user if schema supports it
        // If your prisma schema uses relation: Claim { userId String ... user User @relation(...) }
        userId: user.id,
      },
    });

    // ✅ Log activity
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
  } catch (e: any) {
    // ✅ Clean validation errors
    if (e instanceof z.ZodError) {
      return jsonError("Validation failed", 422, e.flatten());
    }

    // ✅ Prisma known request errors usually have .code
    if (e?.code) {
      return jsonError(`Database error: ${e.code}`, 500, e?.meta);
    }

    return jsonError(e?.message ?? "Failed to create claim", 500);
  }
}
