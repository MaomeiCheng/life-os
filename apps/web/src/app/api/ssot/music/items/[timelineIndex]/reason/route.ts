import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ timelineIndex: string }> }
) {
  const { timelineIndex } = await ctx.params;
  const idx = Number(timelineIndex);
  if (!Number.isFinite(idx)) {
    return NextResponse.json({ ok: false, error: "invalid timelineIndex" }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const reason = typeof body?.reason === "string" ? body.reason : "";

  const db = getDb();
  const updated = await db.musicCrownItem.update({
    where: { timelineIndex: idx },
    data: { reason },
    select: { timelineIndex: true, title: true, reason: true },
  });

  return NextResponse.json({ ok: true, item: updated });
}
