import Link from "next/link";
import { ssotStatus } from "@/server/ssot";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Home() {
  const s = ssotStatus();

  const cardStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: 16,
    padding: 16,
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
  };

  const btnStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.08)",
    color: "rgba(255,255,255,0.92)",
    textDecoration: "none",
    fontWeight: 800,
    fontSize: 13,
  };

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
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <header style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 900, margin: 0 }}>Life OS (Local)</h1>
            <p style={{ marginTop: 8, marginBottom: 0, color: "rgba(255,255,255,0.72)", fontSize: 13 }}>
              SSOT connected: <b>{String(s.isDir)}</b>
            </p>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <Link href="/ssot/music" style={btnStyle}>
              Open SSOT / Music
            </Link>
            <Link href="/ssot/music?tab=items" style={btnStyle}>
              Crown Items
            </Link>
            <Link href="/ssot/music?tab=pending" style={btnStyle}>
              Pending List
            </Link>
          </div>
        </header>

        <section style={{ marginTop: 16, ...cardStyle }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0, marginBottom: 10 }}>
            Environment
          </h2>
          <ul style={{ lineHeight: 1.9, margin: 0, paddingLeft: 18 }}>
            <li>NEXT_PUBLIC_APP_NAME: {process.env.NEXT_PUBLIC_APP_NAME}</li>
            <li>NEXT_PUBLIC_APP_ENV: {process.env.NEXT_PUBLIC_APP_ENV}</li>
            <li>SSOT_PATH: {process.env.SSOT_PATH}</li>
          </ul>
        </section>

        <section style={{ marginTop: 14, ...cardStyle }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0, marginBottom: 10 }}>
            SSOT Status
          </h2>
          <ul style={{ lineHeight: 1.9, margin: 0, paddingLeft: 18 }}>
            <li>Resolved path: {s.root}</li>
            <li>Exists: {String(s.exists)}</li>
            <li>Is directory: {String(s.isDir)}</li>
          </ul>

          {s.isDir ? (
            <>
              <h3 style={{ marginTop: 12, fontSize: 14, fontWeight: 800 }}>
                Top entries (first 20)
              </h3>
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
                {JSON.stringify(s.entries, null, 2)}
              </pre>
            </>
          ) : (
            <p style={{ marginTop: 12, color: "rgba(255,255,255,0.75)" }}>
              SSOT folder not found. Create it at the resolved path or update SSOT_PATH in{" "}
              <code>.env.local</code>.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
