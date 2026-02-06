import Link from "next/link";
import { ssotStatus } from "@/server/ssot";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Home() {
  const s = ssotStatus();

  const wrap: React.CSSProperties = {
    maxWidth: 980,
    margin: "0 auto",
  };

  const card: React.CSSProperties = {
    background: "white",
    border: "1px solid #E5E7EB",
    borderRadius: 16,
    padding: 16,
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.06)",
  };

  const btnPrimary: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #0F172A",
    background: "#0F172A",
    color: "white",
    textDecoration: "none",
    fontWeight: 900,
    fontSize: 13,
  };

  const btn: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #E5E7EB",
    background: "white",
    color: "#0F172A",
    textDecoration: "none",
    fontWeight: 900,
    fontSize: 13,
  };

  const pill: React.CSSProperties = {
    fontSize: 12,
    padding: "4px 10px",
    borderRadius: 999,
    background: "#F1F5F9",
    border: "1px solid #E5E7EB",
    color: "#0F172A",
    fontWeight: 800,
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 24,
        fontFamily: "ui-sans-serif, system-ui",
        background: "linear-gradient(180deg, #FFFFFF, #F8FAFC)",
      }}
    >
      <div style={wrap}>
        <header style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 1000, margin: 0, color: "#0F172A" }}>
              Life OS
            </h1>
            <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span style={pill}>env: {process.env.NEXT_PUBLIC_APP_ENV}</span>
              <span style={pill}>ssot: {s.isDir ? "connected" : "missing"}</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <Link href="/ssot/music" style={btnPrimary}>
              Open SSOT / Music
            </Link>
            <Link href="/ssot/music?tab=items" style={btn}>
              Crown Items
            </Link>
            <Link href="/ssot/music?tab=pending" style={btn}>
              Pending List
            </Link>
          </div>
        </header>

        <section style={{ marginTop: 14, ...card }}>
          <h2 style={{ fontSize: 14, fontWeight: 900, margin: 0, color: "#0F172A" }}>Environment</h2>
          <div style={{ marginTop: 10, fontSize: 13, color: "#334155", lineHeight: 1.8 }}>
            <div>NEXT_PUBLIC_APP_NAME: {process.env.NEXT_PUBLIC_APP_NAME}</div>
            <div>NEXT_PUBLIC_APP_ENV: {process.env.NEXT_PUBLIC_APP_ENV}</div>
            <div>SSOT_PATH: {process.env.SSOT_PATH}</div>
          </div>
        </section>

        <section style={{ marginTop: 14, ...card }}>
          <h2 style={{ fontSize: 14, fontWeight: 900, margin: 0, color: "#0F172A" }}>SSOT Status</h2>
          <div style={{ marginTop: 10, fontSize: 13, color: "#334155", lineHeight: 1.8 }}>
            <div>Resolved path: {s.root}</div>
            <div>Exists: {String(s.exists)}</div>
            <div>Is directory: {String(s.isDir)}</div>
          </div>

          {s.isDir ? (
            <>
              <div style={{ marginTop: 12, fontSize: 12, color: "#64748B" }}>
                Top entries (first 20)
              </div>
              <pre
                style={{
                  marginTop: 8,
                  background: "#0B1020",
                  color: "rgba(255,255,255,0.92)",
                  borderRadius: 12,
                  padding: 12,
                  overflowX: "auto",
                  fontSize: 12,
                  lineHeight: 1.6,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {JSON.stringify(s.entries, null, 2)}
              </pre>
            </>
          ) : (
            <div style={{ marginTop: 12, color: "#B91C1C", fontSize: 13 }}>
              SSOT folder not found. Create it at the resolved path or update SSOT_PATH in .env.local
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
