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

export default function MusicSSOTPage() {
  // apps/web 的 .env.local 設定：SSOT_PATH=../../ssot
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
    <main style={{ padding: 24, fontFamily: "ui-sans-serif, system-ui" }}>
      <h1 style={{ fontSize: 22, fontWeight: 700 }}>SSOT / Music</h1>

      <p style={{ marginTop: 8 }}>
        SSOT_PATH: <code>{ssotRel}</code>
      </p>

      <section style={{ marginTop: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600 }}>Summary</h2>
        <ul style={{ lineHeight: 1.9 }}>
          <li>Events: {events.length}</li>
          <li>Crown items: {items.length}</li>
          <li>Pending list: {pending.length}</li>
          <li>Last event date: {String(lastEventDate || "-")}</li>
        </ul>
      </section>

      <section style={{ marginTop: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600 }}>Latest Events</h2>
        <pre
          style={{
            background: "#f6f8fa",
            padding: 12,
            borderRadius: 8,
            overflowX: "auto",
          }}
        >
          {JSON.stringify(events.slice(-6), null, 2)}
        </pre>
      </section>

      <section style={{ marginTop: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600 }}>Latest Crown Items</h2>
        <pre
          style={{
            background: "#f6f8fa",
            padding: 12,
            borderRadius: 8,
            overflowX: "auto",
          }}
        >
          {JSON.stringify(items.slice(-8), null, 2)}
        </pre>
      </section>

      <section style={{ marginTop: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600 }}>Pending List (Top 20)</h2>
        <pre
          style={{
            background: "#f6f8fa",
            padding: 12,
            borderRadius: 8,
            overflowX: "auto",
          }}
        >
          {JSON.stringify(pending.slice(0, 20), null, 2)}
        </pre>
      </section>
    </main>
  );
}
