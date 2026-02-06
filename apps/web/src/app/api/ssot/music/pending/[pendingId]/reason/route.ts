import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ pendingId: string }> }
) {
  const { pendingId } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const reason = typeof body?.reason === "string" ? body.reason : "";

  const db = getDb();
  const updated = await db.musicPending.update({
    where: { pendingId },
    data: { reason },
    select: { pendingId: true, tempCode: true, title: true, reason: true },
  });

  return NextResponse.json({ ok: true, pending: updated });
}
