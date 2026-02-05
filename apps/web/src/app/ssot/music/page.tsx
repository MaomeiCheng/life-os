import fs from "node:fs";
import path from "node:path";

type AnyObj = Record<string, any>;

function readJson(relPathFromWebRoot: string): AnyObj[] {
  const abs = path.resolve(process.cwd(), relPathFromWebRoot);
  const raw = fs.readFileSync(abs, "utf-8");
  const data = JSON.parse(raw);
  if (!Array.isArray(data)) return [];
  return data;
}

function Card(props: { title: string; children: React.ReactNode }) {
  return (
    <section
      style={{
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.10)",
        borderRadius: 16,
        padding: 16,
        marginTop: 14,
        boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
      }}
    >
      <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10, color: "rgba(255,255,255,0.92)" }}>
        {props.title}
      </h2>
      {props.children}
    </section>
  );
}

function CodeBlock({ data }: { data: unknown }) {
  return (
    <pre
      style={{
        background: "rgba(0,0,0,0.45)",
        border: "1px solid rgba(255,255,255,0.10)",
        borderRadius: 12,
        padding: 12,
        overflowX: "auto",
        color: "rgba(255,255,255,0.88)",
        lineHeight: 1.6,
        fontSize: 13,
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
      }}
    >
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

export default function MusicSSOTPage() {
  const ssotRel = process.env.SSOT_PATH || "../../ssot";

  const events = readJson(path.join(ssotRel, "data/music/music_events.json"));
  const items = readJson(path.join(ssotRel, "data/music/music_crown_items.json"));
  const pending = readJson(path.join(ssotRel, "data/music/music_pending_list.json"));

  const lastEventDate = events
    .map((e) => e.event_date)
    .filter(Boolean)
    .sort()
    .slice(-1)[0];

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 24,
        fontFamily: "ui-sans-serif, system-ui",
        background:
          "radial-gradient(1200px 600px at 10% 0%, rgba(99,102,241,0.25), transparent 60%), radial-gradient(900px 500px at 90% 10%, rgba(236,72,153,0.18), transparent 55%), linear-gradient(180deg, #0b1020, #070a12)",
        color: "rgba(255,255,255,0.92)",
      }}
    >
      <header style={{ maxWidth: 980, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "baseline", flexWrap: "wrap" }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>SSOT / Music</h1>
          <span
            style={{
              fontSize: 12,
              padding: "4px 10px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.10)",
              color: "rgba(255,255,255,0.75)",
            }}
          >
            read-only viewer
          </span>
        </div>

        <p style={{ marginTop: 10, marginBottom: 0, color: "rgba(255,255,255,0.72)", fontSize: 13 }}>
          SSOT_PATH: <code style={{ color: "rgba(255,255,255,0.9)" }}>{ssotRel}</code>
        </p>
      </header>

      <div style={{ maxWidth: 980, margin: "18px auto 0" }}>
        <Card title="Summary">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 12,
            }}
          >
            {[
              ["Events", String(events.length)],
              ["Crown items", String(items.length)],
              ["Pending", String(pending.length)],
              ["Last event", String(lastEventDate || "-")],
            ].map(([k, v]) => (
              <div
                key={k}
                style={{
                  background: "rgba(0,0,0,0.25)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  borderRadius: 14,
                  padding: 12,
                }}
              >
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)" }}>{k}</div>
                <div style={{ fontSize: 18, fontWeight: 800, marginTop: 4 }}>{v}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Latest Events (last 6)">
          <CodeBlock data={events.slice(-6)} />
        </Card>

        <Card title="Latest Crown Items (last 8)">
          <CodeBlock data={items.slice(-8)} />
        </Card>

        <Card title="Pending List (top 20)">
          <CodeBlock data={pending.slice(0, 20)} />
        </Card>
      </div>
    </main>
  );
}
