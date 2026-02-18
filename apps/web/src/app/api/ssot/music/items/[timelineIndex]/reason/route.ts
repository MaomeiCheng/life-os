import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getDb } from "@/lib/db";

export async function PATCH(req: Request, ctx: { params: Promise<{ timelineIndex: string }> }) {
  const { timelineIndex } = await ctx.params;
  const idx = Number(timelineIndex);
  if (!Number.isFinite(idx)) {
    return NextResponse.json({ ok: false, error: "invalid timelineIndex" }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const reason = typeof body?.reason === "string" ? body.reason : "";

  const db = getDb();

  const before = await db.musicCrownItem.findUnique({
    where: { timelineIndex: idx },
    select: { timelineIndex: true, title: true, reason: true, eventId: true },
  });
  if (!before) {
    return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });
  }

  const updated = await db.$transaction(async (tx: Prisma.TransactionClient) => {
    const item = await tx.musicCrownItem.update({
      where: { timelineIndex: idx },
      data: { reason },
      select: { timelineIndex: true, title: true, reason: true, eventId: true },
    });

    await tx.auditLog.create({
      data: {
        entityType: "musicCrownItem",
        entityId: String(idx),
        action: "update_reason",
        before,
        after: item,
      },
    });

    return item;
  });

  return NextResponse.json({ ok: true, item: updated });
}
