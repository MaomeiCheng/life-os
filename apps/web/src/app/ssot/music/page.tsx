import { getDb } from "@/lib/db";

import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import { PendingTableClient } from "./PendingTableClient";
import { ItemsTableClient } from "./ItemsTableClient";
import { CardsGridClient } from "./CardsGridClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type AnyObj = Record<string, unknown>;

type AuditRow = {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  createdAt: Date;
};

type PendingRow = {
  pendingId: string;
  tempCode: string;
  title: string;
  reason: string;
  createdAt: Date;
  updatedAt: Date;
};

type CrownItemRow = {
  timelineIndex: number;
  eventId: string;
  crownDate: string;
  title: string;
  cardReceivedDate: string;
  note: string;
  reason: string;
  createdAt: Date;
  updatedAt: Date;
};

type CardRow = {
  id: string;
  timelineIndex: number | null;
  pendingId: string | null;
  title: string;
  kind: string;
  videoUrl: string | null;
  thumbUrl: string | null;
  videoKey?: string | null;
  thumbKey?: string | null;
  createdAt: Date;
  updatedAt: Date;
};


function readJson(relPathFromWebRoot: string): AnyObj[] {
  const abs = path.resolve(process.cwd(), relPathFromWebRoot);
  const raw = fs.readFileSync(abs, "utf-8");
  const data = JSON.parse(raw);
  if (!Array.isArray(data)) return [];
  return data;
}

function normalize(s: unknown) {
  return String(s ?? "").trim().toLowerCase();
}

function Table({
  columns,
  rows,
}: {
  columns: { key: string; label: string; width?: string }[];
  rows: AnyObj[];
}) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                style={{
                  textAlign: "left",
                  fontSize: 12,
                  color: "#64748B",
                  padding: "10px 12px",
                  borderBottom: "1px solid #E5E7EB",
                  whiteSpace: "nowrap",
                  width: c.width,
                }}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => (
            <tr key={idx}>
              {columns.map((c) => (
                <td
                  key={c.key}
                  style={{
                    padding: "10px 12px",
                    borderBottom: "1px solid #F1F5F9",
                    fontSize: 13,
                    color: "#0F172A",
                    verticalAlign: "top",
                  }}
                >
                  {r[c.key] == null || r[c.key] === "" ? (
                    <span style={{ color: "#94A3B8" }}>-</span>
                  ) : (
                    <span style={{ whiteSpace: "nowrap" }}>{String(r[c.key])}</span>
                  )}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ padding: 14, color: "#64748B", fontSize: 13 }}>
                No data
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}

function buildHref(tab: string, q: string) {
  const params = new URLSearchParams();
  params.set("tab", tab);
  if (q.trim()) params.set("q", q.trim());
  return `/ssot/music?${params.toString()}`;
}

function TabLink({
  href,
  active,
  label,
  count,
}: {
  href: string;
  active: boolean;
  label: string;
  count: number;
}) {
  return (
    <Link
      href={href}
      style={{
        padding: "6px 10px",
        borderRadius: 10,
        fontSize: 13,
        fontWeight: 900,
        textDecoration: "none",
        background: active ? "#0F172A" : "transparent",
        color: active ? "white" : "#0F172A",
        border: `1px solid ${active ? "#0F172A" : "#E5E7EB"}`,
        display: "inline-flex",
        gap: 8,
        alignItems: "center",
      }}
    >
      {label}
      <span
        style={{
          fontSize: 12,
          padding: "1px 8px",
          borderRadius: 999,
          background: active ? "rgba(255,255,255,0.18)" : "#F1F5F9",
          color: active ? "white" : "#0F172A",
          border: active ? "1px solid rgba(255,255,255,0.18)" : "1px solid #E5E7EB",
        }}
      >
        {count}
      </span>
    </Link>
  );
}

export default async function MusicSSOTPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tab?: string }>;
}) {
  const sp = await searchParams;

  const ssotRel = process.env.SSOT_PATH || "../../ssot";
  const q = (sp.q || "").trim();
  const tab = (sp.tab || "events").trim(); // events | items | pending | cards | audit
  const qn = q.toLowerCase();

  const R2_BASE = (process.env.PUBLIC_R2_BASE_URL || "").replace(/\/$/, "");
  function r2Url(key?: string | null, fallback?: string | null) {
    const k = (key || "").trim();
    if (k && R2_BASE) return `${R2_BASE}/${k.replace(/^\//, "")}`;
    return (fallback || "").trim();
  }



  const events = readJson(path.join(ssotRel, "data/music/music_events.json"));
  const db2 = getDb();
  const items: CrownItemRow[] = await db2.musicCrownItem.findMany({
    where: q ? { OR: [{ title: { contains: q, mode: "insensitive" } }, { note: { contains: q, mode: "insensitive" } }, { reason: { contains: q, mode: "insensitive" } }] } : undefined,
    orderBy: [{ timelineIndex: "asc" }],
  });

  const itemsFiltered = items;
  const db = getDb();
  const pending: PendingRow[] = await db.musicPending.findMany({
    where: q ? { OR: [{ title: { contains: q, mode: "insensitive" } }, { tempCode: { contains: q, mode: "insensitive" } }, { reason: { contains: q, mode: "insensitive" } }] } : undefined,
    orderBy: [{ tempCode: "asc" }],
  });

  const pendingFiltered = pending;

  const audit: AuditRow[] = await db2.auditLog.findMany({
    orderBy: [{ createdAt: "desc" }],
    take: 200,
  });

  const cardsRaw = await db2.musicCard.findMany({
    select: {
      timelineIndex: true,
        pendingId: true,
        id: true,
      title: true,
      videoUrl: true,
      thumbUrl: true,
      videoKey: true,
      thumbKey: true,
      createdAt: true,
      updatedAt: true,
    },

    orderBy: [
      { timelineIndex: "asc" },
      { createdAt: "asc" },
    ],
  });

  const cards: CardRow[] = cardsRaw.map((c) => ({
    ...c,
    kind: (c as any).kind ?? "crown",
  }));
const cardsFiltered = q
    ? cards.filter(
        (c) =>
          normalize(c.title).includes(qn) ||
          normalize(r2Url(c.videoKey, c.videoUrl) || c.videoKey).includes(qn) ||
          normalize(r2Url(c.thumbKey, c.thumbUrl) || c.thumbKey).includes(qn)
      )
    : cards;

  const crownCardsView = cardsFiltered.filter((c) => (c.kind || "crown") === "crown");
  const templateCardsView = cardsFiltered.filter((c) => c.kind === "template");


  const lastEventDate = events
    .map((e) => e.event_date)
    .filter(Boolean)
    .sort()
    .slice(-1)[0];

  const eventsView = q
    ? events.filter(
        (e) =>
          normalize(e.event_id).includes(qn) ||
          normalize(e.event_date).includes(qn) ||
          normalize(e.note).includes(qn) ||
          normalize(e.status).includes(qn)
      )
    : events;

  const itemsView = q
    ? items.filter(
        (i) =>
          normalize(i.title).includes(qn) ||
          normalize(i.eventId).includes(qn) ||
          normalize(i.crownDate).includes(qn) ||
          normalize(i.cardReceivedDate).includes(qn) ||
          normalize(i.note).includes(qn)
      )
    : items;

  const pendingView = q
    ? pending.filter(
        (p) => normalize(p.tempCode).includes(qn) || normalize(p.title).includes(qn)
      )
    : pending;

  const tabs = [
    { key: "events", label: "Events", count: events.length },
    { key: "items", label: "Crown Items", count: items.length },
    { key: "pending", label: "Pending", count: pending.length },
    { key: "crownCards", label: "Crown Cards", count: cards.filter((c) => c.kind === "crown").length },
    { key: "templateCards", label: "Template Cards", count: cards.filter((c) => c.kind === "template").length },
    { key: "audit", label: "Audit", count: audit.length },
  ] as const;

  const rowsCount =
    tab === "events" ? eventsView.length : tab === "items" ? itemsView.length : tab === "pending" ? pendingView.length : tab === "cards" ? (crownCardsView.length + templateCardsView.length) : audit.length;

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 24,
        fontFamily: "ui-sans-serif, system-ui",
        background: "linear-gradient(180deg, #FFFFFF, #F8FAFC)",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Minimal header */}
        <header style={{ marginBottom: 14 }}>
          <nav style={{ fontSize: 12, color: "#64748B" }}>
            <Link href="/" style={{ color: "#0F172A", textDecoration: "none", fontWeight: 900 }}>
              Home
            </Link>{" "}
            <span style={{ color: "#94A3B8" }}>/</span> SSOT{" "}
            <span style={{ color: "#94A3B8" }}>/</span> Music
          </nav>

          <div style={{ marginTop: 8, fontSize: 12, color: "#64748B" }}>
            Validate: <code style={{ color: "#0F172A" }}>pnpm validate</code>
          </div>

          <div style={{ marginTop: 8, fontSize: 12, color: "#64748B", lineHeight: 1.6 }}>
            <div>
              Validate: <code style={{ color: "#0F172A" }}>cd apps/web && pnpm validate</code>
            </div>
            <div>
              Data: <code style={{ color: "#0F172A" }}>ssot/data/music/music_events.json</code> · <code style={{ color: "#0F172A" }}>music_crown_items.json</code> · <code style={{ color: "#0F172A" }}>music_pending_list.json</code>
            </div>
          </div>

          <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 1000, margin: 0, color: "#0F172A" }}>
                Music
              </h1>
              <div style={{ marginTop: 6, fontSize: 12, color: "#64748B" }}>
                SSOT_PATH: <code style={{ color: "#0F172A" }}>{ssotRel}</code> • Last event:{" "}
                <code style={{ color: "#0F172A" }}>{String(lastEventDate || "-")}</code>
              </div>
            </div>

            <form method="get" style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <input type="hidden" name="tab" value={tab} />
              <input
                name="q"
                defaultValue={q}
                placeholder="Search…"
                style={{
                  width: 300,
                  maxWidth: "72vw",
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid #E5E7EB",
                  outline: "none",
                  fontSize: 13,
                }}
              />
              <button
                type="submit"
                style={{
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid #0F172A",
                  background: "#0F172A",
                  color: "white",
                  fontSize: 13,
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                Go
              </button>
              <Link
                href={buildHref(tab, "")}
                style={{
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid #E5E7EB",
                  background: "transparent",
                  color: "#0F172A",
                  fontSize: 13,
                  fontWeight: 900,
                  textDecoration: "none",
                }}
              >
                Clear
              </Link>
            </form>
          </div>

          <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            {tabs.map((t) => (
              <TabLink
                key={t.key}
                href={buildHref(t.key, q)}
                active={tab === t.key}
                label={t.label}
                count={t.count}
              />
            ))}
            <span style={{ marginLeft: 6, fontSize: 12, color: "#64748B" }}>
              Showing <b style={{ color: "#0F172A" }}>{rowsCount}</b> rows
            </span>
          </div>
        </header>

        {/* Content */}
        <section
          style={{
            background: "white",
            border: "1px solid #E5E7EB",
            borderRadius: 16,
            boxShadow: "0 10px 24px rgba(15, 23, 42, 0.06)",
          }}
        >
          {tab === "events" ? (
            <Table
              columns={[
                { key: "event_id", label: "Event ID", width: "90px" },
                { key: "event_date", label: "Date", width: "120px" },
                { key: "planned_count", label: "Planned", width: "90px" },
                { key: "decided_count", label: "Decided", width: "90px" },
                { key: "status", label: "Status", width: "110px" },
                { key: "note", label: "Note" },
              ]}
              rows={eventsView}
            />
          ) : null}

          {tab === "items" ? (<ItemsTableClient rows={itemsFiltered} />) : null}

          {tab === "pending" ? (<PendingTableClient rows={pendingFiltered} />) : null}

          {tab === "crownCards" ? (
            <CardsGridClient
              rows={crownCardsView.map((c) => ({
                id: c.id,
                title: c.title,
                timelineIndex: c.timelineIndex ?? null,
                pendingId: c.pendingId ?? null,
                videoSrc: r2Url(c.videoKey, c.videoUrl) || "",
                thumbSrc: r2Url(c.thumbKey, c.thumbUrl) || "",
              }))}
            />
          ) : null}

          {tab === "audit" ? (
            <Table
              columns={[
                { key: "createdAt", label: "Time", width: "180px" },
                { key: "entityType", label: "Entity", width: "140px" },
                { key: "entityId", label: "Entity ID", width: "220px" },
                { key: "action", label: "Action", width: "140px" },
              ]}
              rows={audit.map((a) => ({
                createdAt: new Date(a.createdAt).toISOString(),
                entityType: a.entityType,
                entityId: a.entityId,
                action: a.action,
              }))}
            />
          ) : null}
        </section>

        <footer style={{ marginTop: 14, fontSize: 12, color: "#94A3B8" }}>
          Read-only view from <code style={{ color: "#0F172A" }}>ssot/data/music</code>
        </footer>
      </div>
    </main>
  );
}
