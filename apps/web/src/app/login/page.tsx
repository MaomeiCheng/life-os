"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const sp = useSearchParams();
  const callbackUrl = sp.get("callbackUrl") || "/ssot/music?tab=crownCards";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <main style={{ maxWidth: 420, margin: "48px auto", padding: 16 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Login</h1>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setLoading(true);
          setError(null);

          const res = await signIn("credentials", {
            email,
            password,
            redirect: false,
            callbackUrl,
          });

          setLoading(false);

          // res can be: undefined | { error?: string | null; ok?: boolean; status?: number; url?: string | null }
          if (res && "error" in res && res.error) {
            setError(String(res.error));
            return;
          }

          const url =
            res && "url" in res && typeof res.url === "string" && res.url
              ? res.url
              : callbackUrl;

          window.location.href = url;
        }}
      >
        <label style={{ display: "block", marginBottom: 8 }}>
          <div style={{ fontSize: 12, marginBottom: 4 }}>Email</div>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            autoComplete="email"
            required
            style={{
              width: "100%",
              padding: 10,
              border: "1px solid #ddd",
              borderRadius: 8,
            }}
          />
        </label>

        <label style={{ display: "block", marginBottom: 12 }}>
          <div style={{ fontSize: 12, marginBottom: 4 }}>Password</div>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            autoComplete="current-password"
            required
            style={{
              width: "100%",
              padding: 10,
              border: "1px solid #ddd",
              borderRadius: 8,
            }}
          />
        </label>

        {error ? <p style={{ color: "crimson", marginBottom: 10 }}>{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 10,
            border: "1px solid #111",
            background: "#111",
            color: "white",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}
