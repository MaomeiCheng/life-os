import fs from "node:fs";
import path from "node:path";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;


type AnyObj = Record<string, any>;

function readJson(relPathFromWebRoot: string): AnyObj[] {
  const abs = path.resolve(process.cwd(), relPathFromWebRoot);
  const raw = fs.readFileSync(abs, "utf-8");
  const data = JSON.parse(raw);
  if (!Array.isArray(data)) return [];
  return data;
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontSize: 12,
        padding: "4px 10px",
        borderRadius: 999,
        background: "#EEF2FF",
        border: "1px solid #E0E7FF",
        color: "#3730A3",
      }}
    >
      {children}
    </span>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #E5E7EB",
        borderRadius: 14,
        padding: 14,
        boxShadow: "0 6px 18px rgba(15, 23, 42, 0.06)",
      }}
    >
      <div style={{ fontSize: 12, color: "#6B7280" }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 800, marginTop: 6, color: "#0F172A" }}>
        {value}
      </div>
    </div>
  );
}

function Card(props: { title: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section
      style={{
        background: "white",
        border: "1px solid #E5E7EB",
        borderRadius: 16,
        padding: 16,
        marginTop: 14,
        boxShadow: "0 10px 24px rgba(15, 23, 42, 0.06)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 12,
        }}
      >
        <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: "#0F172A" }}>
          {props.title}
        </h2>
        {props.right}
      </div>
      {props.children}
    </section>
  );
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

function normalize(s: unknown) {
  return String(s ?? "").trim().toLowerCase();
}

function buildHref(tab: string, q: string) {
  const params = new URLSearchParams();
  params.set("tab", tab);
  if (q.trim()) params.set("q", q.trim());
  return `/ssot/music?${params.toString()}`;
}

export default async function MusicSSOTPage({ searchParams }: { searchParams: Promise<{ q?: string; tab?: string }> }) {
  const sp = await searchParams;

  const ssotRel = process.env.SSOT_PATH || "../../ssot";
  const q = (sp.q || "").trim();
  const tab = (sp.tab || "events").trim(); // events | items | pending
  const qn = q.toLowerCase();

  const events = readJson(path.join(ssotRel, "data/music/music_events.json"));
  const items = readJson(path.join(ssotRel, "data/music/music_crown_items.json"));
  const pending = readJson(path.join(ssotRel, "data/music/music_pending_list.json"));

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
          normalize(i.event_id).includes(qn) ||
          normalize(i.crown_date).includes(qn) ||
          normalize(i.card_received_date).includes(qn) ||
          normalize(i.note).includes(qn)
      )
    : items;

  const pendingView = q
    ? pending.filter(
        (p) => normalize(p.temp_code).includes(qn) || normalize(p.title).includes(qn)
      )
    : pending;

  const tabs: { key: string; label: string; count: number }[] = [
    { key: "events", label: "Events", count: events.length },
    { key: "items", label: "Crown Items", count: items.length },
    { key: "pending", label: "Pending", count: pending.length },
  ];

  const activeTabStyle: React.CSSProperties = {
    background: "#0F172A",
    color: "white",
    border: "1px solid #0F172A",
  };

  const inactiveTabStyle: React.CSSProperties = {
    background: "white",
    color: "#0F172A",
    border: "1px solid #E5E7EB",
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 24,
        fontFamily: "ui-sans-serif, system-ui",
        background: "linear-gradient(180deg, #F8FAFC, #FFFFFF)",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "flex-start",
          }}
        >
          <div>
            <div style={{ display: "flex", gap: 10, alignItems: "baseline", flexWrap: "wrap" }}>
              <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0, color: "#0F172A" }}>
                SSOT / Music
              </h1>
              <Badge>dashboard</Badge>
            </div>
            <div style={{ marginTop: 8, color: "#64748B", fontSize: 13 }}>
              SSOT_PATH: <code style={{ color: "#0F172A" }}>{ssotRel}</code>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <form method="get" style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input type="hidden" name="tab" value={tab} />
              <input
                name="q"
                defaultValue={q}
                placeholder="Search (song / note / date / id...)"
                style={{
                  width: 320,
                  maxWidth: "70vw",
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
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Search
              </button>

              <Link
                href={buildHref(tab, "")}
                style={{
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid #E5E7EB",
                  background: "white",
                  color: "#0F172A",
                  fontSize: 13,
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                Clear
              </Link>
            </form>
          </div>
        </header>

        <div
          style={{
            marginTop: 14,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 12,
          }}
        >
          <Stat label="Events" value={String(events.length)} />
          <Stat label="Crown items" value={String(items.length)} />
          <Stat label="Pending" value={String(pending.length)} />
          <Stat label="Last event date" value={String(lastEventDate || "-")} />
        </div>

        <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
          {tabs.map((t) => (
            <Link
              key={t.key}
              href={buildHref(t.key, q)}
              style={{
                padding: "8px 12px",
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 800,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                cursor: "pointer",
                ...(tab === t.key ? activeTabStyle : inactiveTabStyle),
              }}
            >
              {t.label}
              <span
                style={{
                  fontSize: 12,
                  padding: "2px 8px",
                  borderRadius: 999,
                  background: tab === t.key ? "rgba(255,255,255,0.18)" : "#F1F5F9",
                  color: tab === t.key ? "white" : "#0F172A",
                  border:
                    tab === t.key ? "1px solid rgba(255,255,255,0.18)" : "1px solid #E5E7EB",
                }}
              >
                {t.count}
              </span>
            </Link>
          ))}
        </div>

        {tab === "events" ? (
          <Card title={`Events${q ? ` (filtered)` : ""}`} right={<Badge>{eventsView.length} rows</Badge>}>
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
          </Card>
        ) : null}

        {tab === "items" ? (
          <Card title={`Crown Items${q ? ` (filtered)` : ""}`} right={<Badge>{itemsView.length} rows</Badge>}>
            <Table
              columns={[
                { key: "timeline_index", label: "#", width: "70px" },
                { key: "event_id", label: "Event ID", width: "90px" },
                { key: "crown_date", label: "Crown date", width: "120px" },
                { key: "title", label: "Title" },
                { key: "card_received_date", label: "Card received", width: "130px" },
                { key: "note", label: "Note" },
              ]}
              rows={itemsView}
            />
          </Card>
        ) : null}

        {tab === "pending" ? (
          <Card title={`Pending List${q ? ` (filtered)` : ""}`} right={<Badge>{pendingView.length} rows</Badge>}>
            <Table
              columns={[
                { key: "temp_code", label: "Code", width: "90px" },
                { key: "title", label: "Title" },
              ]}
              rows={pendingView}
            />
          </Card>
        ) : null}

        <footer style={{ marginTop: 18, color: "#94A3B8", fontSize: 12 }}>
          Tip: click tabs to switch views. Search supports song name, dates, ids, notes.
        </footer>
      </div>
    </main>
  );
}
