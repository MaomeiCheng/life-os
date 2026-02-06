import "dotenv/config";
import fs from "node:fs";
import path from "node:path";

import pkg from "@prisma/client";
const { PrismaClient } = pkg;

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is missing in apps/web/.env");

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

async function main() {
  const webRoot = process.cwd(); // apps/web
  const ssotRel = process.env.SSOT_PATH || "../../ssot";
  const ssotAbs = path.resolve(webRoot, ssotRel);

  const musicDir = path.join(ssotAbs, "data", "music");
  const events = readJson(path.join(musicDir, "music_events.json"));
  const items = readJson(path.join(musicDir, "music_crown_items.json"));
  const pending = readJson(path.join(musicDir, "music_pending_list.json"));

  for (const e of events) {
    await prisma.musicEvent.upsert({
      where: { id: e.event_id },
      update: {
        eventDate: e.event_date,
        plannedCount: Number(e.planned_count ?? 0),
        decidedCount: Number(e.decided_count ?? 0),
        status: String(e.status ?? ""),
        note: String(e.note ?? ""),
      },
      create: {
        id: e.event_id,
        eventDate: e.event_date,
        plannedCount: Number(e.planned_count ?? 0),
        decidedCount: Number(e.decided_count ?? 0),
        status: String(e.status ?? ""),
        note: String(e.note ?? ""),
      },
    });
  }

  for (const it of items) {
    await prisma.musicCrownItem.upsert({
      where: { timelineIndex: Number(it.timeline_index) },
      update: {
        eventId: it.event_id,
        crownDate: String(it.crown_date ?? ""),
        title: String(it.title ?? ""),
        cardReceivedDate: String(it.card_received_date ?? ""),
        note: String(it.note ?? ""),
        reason: String(it.reason ?? ""),
      },
      create: {
        timelineIndex: Number(it.timeline_index),
        eventId: it.event_id,
        crownDate: String(it.crown_date ?? ""),
        title: String(it.title ?? ""),
        cardReceivedDate: String(it.card_received_date ?? ""),
        note: String(it.note ?? ""),
        reason: String(it.reason ?? ""),
      },
    });
  }

  for (const p of pending) {
    if (!p.pending_id) throw new Error(`missing pending_id: ${JSON.stringify(p)}`);
    await prisma.musicPending.upsert({
      where: { pendingId: p.pending_id },
      update: {
        tempCode: String(p.temp_code ?? ""),
        title: String(p.title ?? ""),
        reason: String(p.reason ?? ""),
      },
      create: {
        pendingId: p.pending_id,
        tempCode: String(p.temp_code ?? ""),
        title: String(p.title ?? ""),
        reason: String(p.reason ?? ""),
      },
    });
  }

  const c1 = await prisma.musicEvent.count();
  const c2 = await prisma.musicCrownItem.count();
  const c3 = await prisma.musicPending.count();
  console.log(`[seed] done. events=${c1}, items=${c2}, pending=${c3}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
