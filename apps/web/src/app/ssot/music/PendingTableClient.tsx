"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

type PendingRow = {
  pendingId: string;
  tempCode: string;
  title: string;
  reason: string;
};

export function PendingTableClient({ rows }: { rows: PendingRow[] }) {
  const router = useRouter();

  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [draftReason, setDraftReason] = React.useState<string>("");

  const [saving, setSaving] = React.useState<Record<string, boolean>>({});
  const [savedAt, setSavedAt] = React.useState<Record<string, number>>({});
  const [errorById, setErrorById] = React.useState<Record<string, string | null>>({});

  function startEdit(r: PendingRow) {
    setErrorById((m) => ({ ...m, [r.pendingId]: null }));
    setEditingId(r.pendingId);
    setDraftReason(r.reason || "");
  }

  function cancelEdit() {
    setEditingId(null);
    setDraftReason("");
  }

  async function save(pendingId: string) {
    const reason = draftReason.trim();
    setSaving((m) => ({ ...m, [pendingId]: true }));
    setErrorById((m) => ({ ...m, [pendingId]: null }));

    try {
      const res = await fetch(`/api/ssot/music/pending/${encodeURIComponent(pendingId)}/reason`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      setSavedAt((m) => ({ ...m, [pendingId]: Date.now() }));
      router.refresh();

      setEditingId(null);
      setDraftReason("");
    } catch (e: any) {
      setErrorById((m) => ({ ...m, [pendingId]: e?.message ?? "Save failed" }));
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
              const isEditing = editingId === r.pendingId;
              const isSaving = !!saving[r.pendingId];
              const okFlash = !!savedAt[r.pendingId] && Date.now() - savedAt[r.pendingId] < 1500;

              return (
                <tr key={r.pendingId} style={{ borderTop: "1px solid #E2E8F0" }}>
                  <td style={tdStyleMono}>{r.tempCode}</td>
                  <td style={tdStyle}>{r.title}</td>

                  <td style={tdStyle}>
                    {!isEditing ? (
                      <span style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{r.reason || ""}</span>
                    ) : (
                      <div style={{ display: "grid", gap: 6 }}>
                        <input
                          value={draftReason}
                          onChange={(e) => setDraftReason(e.target.value)}
                          placeholder="(empty)"
                          disabled={isSaving}
                          style={{
                            width: "100%",
                            padding: "8px 10px",
                            borderRadius: 10,
                            border: "1px solid #CBD5E1",
                            outline: "none",
                            background: "#fff",
                          }}
                        />
                        {errorById[r.pendingId] ? (
                          <div style={{ fontSize: 12, color: "#DC2626" }}>{errorById[r.pendingId]}</div>
                        ) : null}
                      </div>
                    )}
                  </td>

                  <td style={tdStyle}>
                    {!isEditing ? (
                      <button
                        onClick={() => startEdit(r)}
                        disabled={editingId !== null && editingId !== r.pendingId}
                        style={{
                          padding: "8px 12px",
                          borderRadius: 10,
                          border: "1px solid #CBD5E1",
                          background: "#fff",
                          cursor: editingId !== null && editingId !== r.pendingId ? "not-allowed" : "pointer",
                          fontSize: 12,
                        }}
                      >
                        Edit
                      </button>
                    ) : (
                      <div style={{ display: "flex", gap: 8 }}>
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

                        <button
                          onClick={cancelEdit}
                          disabled={isSaving}
                          style={{
                            padding: "8px 12px",
                            borderRadius: 10,
                            border: "1px solid #CBD5E1",
                            background: "#fff",
                            cursor: isSaving ? "not-allowed" : "pointer",
                            fontSize: 12,
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
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
