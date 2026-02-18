import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function PATCH(req: Request, ctx: { params: Promise<{ pendingId: string }> }) {
  const { pendingId } = await ctx.params;

  const body = await req.json().catch(() => ({}));
  const reason = typeof body?.reason === "string" ? body.reason : "";

  const db = getDb();

  const before = await db.musicPending.findUnique({
    where: { pendingId },
    select: { pendingId: true, tempCode: true, title: true, reason: true },
  });
  if (!before) {
    return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });
  }

  const updated = await db.$transaction(async (tx: any) => {
    const pending = await tx.musicPending.update({
      where: { pendingId },
      data: { reason },
      select: { pendingId: true, tempCode: true, title: true, reason: true },
    });

    await tx.auditLog.create({
      data: {
        entityType: "musicPending",
        entityId: pendingId,
        action: "update_reason",
        before,
        after: pending,
      },
    });

    return pending;
  });

  return NextResponse.json({ ok: true, pending: updated });
}
