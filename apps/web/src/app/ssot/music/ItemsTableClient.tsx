"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

type ItemRow = {
  timelineIndex: number;
  title: string;
  crownDate: string;
  cardReceivedDate: string;
  note: string;
  reason: string;
};

export function ItemsTableClient({ rows }: { rows: ItemRow[] }) {
  const router = useRouter();

  const [editingIndex, setEditingIndex] = React.useState<number | null>(null);
  const [draftReason, setDraftReason] = React.useState<string>("");

  const [saving, setSaving] = React.useState<Record<number, boolean>>({});
  const [savedAt, setSavedAt] = React.useState<Record<number, number>>({});
  const [errorById, setErrorById] = React.useState<Record<number, string | null>>({});

  function startEdit(r: ItemRow) {
    setErrorById((m) => ({ ...m, [r.timelineIndex]: null }));
    setEditingIndex(r.timelineIndex);
    setDraftReason(r.reason || "");
  }

  function cancelEdit() {
    setEditingIndex(null);
    setDraftReason("");
  }

  async function save(timelineIndex: number) {
    const reason = draftReason.trim();
    setSaving((m) => ({ ...m, [timelineIndex]: true }));
    setErrorById((m) => ({ ...m, [timelineIndex]: null }));

    try {
      const res = await fetch(
        `/api/ssot/music/items/${encodeURIComponent(String(timelineIndex))}/reason`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason }),
        }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      setSavedAt((m) => ({ ...m, [timelineIndex]: Date.now() }));
      router.refresh();

      setEditingIndex(null);
      setDraftReason("");
    } catch (e: any) {
      setErrorById((m) => ({ ...m, [timelineIndex]: e?.message ?? "Save failed" }));
    } finally {
      setSaving((m) => ({ ...m, [timelineIndex]: false }));
    }
  }

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <div style={{ fontSize: 12, color: "#475569" }}>
        Items are loaded from DB. Edit <b>reason</b> and save.
      </div>

      <div style={{ border: "1px solid #E2E8F0", borderRadius: 12, overflow: "hidden", background: "#fff" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#F8FAFC" }}>
              <th style={th}>#</th>
              <th style={th}>Title</th>
              <th style={th}>Crown</th>
              <th style={th}>Card</th>
              <th style={th}>Reason</th>
              <th style={th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const isEditing = editingIndex === r.timelineIndex;
              const isSaving = !!saving[r.timelineIndex];
              const okFlash = !!savedAt[r.timelineIndex] && Date.now() - savedAt[r.timelineIndex] < 1200;

              return (
                <tr key={r.timelineIndex} style={{ borderTop: "1px solid #E2E8F0" }}>
                  <td style={tdMono}>{r.timelineIndex}</td>
                  <td style={td}>{r.title}</td>
                  <td style={tdMono}>{r.crownDate || "-"}</td>
                  <td style={tdMono}>{r.cardReceivedDate || "-"}</td>

                  <td style={td}>
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
                          }}
                        />
                        {errorById[r.timelineIndex] ? (
                          <div style={{ fontSize: 12, color: "#DC2626" }}>{errorById[r.timelineIndex]}</div>
                        ) : null}
                      </div>
                    )}
                  </td>

                  <td style={td}>
                    {!isEditing ? (
                      <button
                        onClick={() => startEdit(r)}
                        disabled={editingIndex !== null && editingIndex !== r.timelineIndex}
                        style={{
                          padding: "8px 12px",
                          borderRadius: 10,
                          border: "1px solid #CBD5E1",
                          background: "#fff",
                          cursor: editingIndex !== null && editingIndex !== r.timelineIndex ? "not-allowed" : "pointer",
                          fontSize: 12,
                        }}
                      >
                        Edit
                      </button>
                    ) : (
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => save(r.timelineIndex)}
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

const th: React.CSSProperties = {
  textAlign: "left",
  padding: "10px 12px",
  fontSize: 12,
  color: "#0F172A",
  fontWeight: 700,
};

const td: React.CSSProperties = {
  padding: "10px 12px",
  fontSize: 13,
  color: "#0F172A",
  verticalAlign: "top",
};

const tdMono: React.CSSProperties = {
  ...td,
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  fontSize: 12,
  color: "#334155",
};
