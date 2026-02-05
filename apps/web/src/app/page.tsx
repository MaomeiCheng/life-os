import { ssotStatus } from "@/server/ssot";

export default function Home() {
  const s = ssotStatus();

  return (
    <main style={{ padding: 24, fontFamily: "ui-sans-serif, system-ui" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
        Life OS (Local)
      </h1>

      <section style={{ marginTop: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600 }}>Environment</h2>
        <ul style={{ lineHeight: 1.8 }}>
          <li>NEXT_PUBLIC_APP_NAME: {process.env.NEXT_PUBLIC_APP_NAME}</li>
          <li>NEXT_PUBLIC_APP_ENV: {process.env.NEXT_PUBLIC_APP_ENV}</li>
          <li>SSOT_PATH: {process.env.SSOT_PATH}</li>
        </ul>
      </section>

      <section style={{ marginTop: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600 }}>SSOT Status</h2>
        <ul style={{ lineHeight: 1.8 }}>
          <li>Resolved path: {s.root}</li>
          <li>Exists: {String(s.exists)}</li>
          <li>Is directory: {String(s.isDir)}</li>
        </ul>

        {s.isDir ? (
          <>
            <h3 style={{ marginTop: 12, fontSize: 16, fontWeight: 600 }}>
              Top entries (first 20)
            </h3>
            <pre
              style={{
                background: "#f6f8fa",
                padding: 12,
                borderRadius: 8,
                overflowX: "auto",
              }}
            >
              {JSON.stringify(s.entries, null, 2)}
            </pre>
          </>
        ) : (
          <p style={{ marginTop: 12 }}>
            SSOT folder not found. Create it at the resolved path or update
            SSOT_PATH in <code>.env.local</code>.
          </p>
        )}
      </section>
    </main>
  );
}
