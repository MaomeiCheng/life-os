"use client";

import * as React from "react";

type PendingRow = {
  pendingId: string;
  tempCode: string;
  title: string;
  reason: string;
};

export function PendingTableClient({
  rows,
}: {
  rows: PendingRow[];
}) {
  const [editing, setEditing] = React.useState<Record<string, string>>({});
  const [saving, setSaving] = React.useState<Record<string, boolean>>({});
  const [savedAt, setSavedAt] = React.useState<Record<string, number>>({});

  const getValue = (id: string, fallback: string) =>
    Object.prototype.hasOwnProperty.call(editing, id) ? editing[id] : fallback;

  async function save(pendingId: string) {
    const reason = (editing[pendingId] ?? "").trim();
    setSaving((m) => ({ ...m, [pendingId]: true }));
    try {
      const res = await fetch(`/api/ssot/music/pending/${encodeURIComponent(pendingId)}/reason`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setSavedAt((m) => ({ ...m, [pendingId]: Date.now() }));
    } finally {
      setSaving((m) => ({ ...m, [pendingId]: false }));
    }
  }

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div style={{ fontSize: 12, color: "#475569" }}>
          Pending items are loaded from DB. You can edit <b>reason</b> and save.
        </div>
      </div>

      <div style={{ border: "1px solid #E2E8F0", borderRadius: 12, overflow: "hidden", background: "#fff" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#F8FAFC" }}>
              <th style={thStyle}>Code</th>
              <th style={thStyle}>Title</th>
              <th style={thStyle}>Reason</th>
              <th style={thStyle}>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const v = getValue(r.pendingId, r.reason || "");
              const isSaving = !!saving[r.pendingId];
              const okFlash = !!savedAt[r.pendingId] && Date.now() - savedAt[r.pendingId] < 1500;

              return (
                <tr key={r.pendingId} style={{ borderTop: "1px solid #E2E8F0" }}>
                  <td style={tdStyleMono}>{r.tempCode}</td>
                  <td style={tdStyle}>{r.title}</td>
                  <td style={tdStyle}>
                    <input
                      value={v}
                      onChange={(e) => setEditing((m) => ({ ...m, [r.pendingId]: e.target.value }))}
                      placeholder="(empty)"
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        borderRadius: 10,
                        border: "1px solid #CBD5E1",
                        outline: "none",
                        background: "#fff",
                      }}
                    />
                  </td>
                  <td style={tdStyle}>
                    <button
                      onClick={() => save(r.pendingId)}
                      disabled={isSaving}
                      style={{
                        padding: "8px 12px",
                        borderRadius: 10,
                        border: "1px solid #CBD5E1",
                        background: okFlash ? "#ECFDF5" : "#fff",
                        cursor: isSaving ? "not-allowed" : "pointer",
                        fontSize: 12,
                      }}
                    >
                      {isSaving ? "Saving..." : okFlash ? "Saved" : "Save"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "10px 12px",
  fontSize: 12,
  color: "#0F172A",
  fontWeight: 700,
};

const tdStyle: React.CSSProperties = {
  padding: "10px 12px",
  fontSize: 13,
  color: "#0F172A",
  verticalAlign: "top",
};

const tdStyleMono: React.CSSProperties = {
  ...tdStyle,
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  fontSize: 12,
  color: "#334155",
};
