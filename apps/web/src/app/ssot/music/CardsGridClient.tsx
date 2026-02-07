"use client";

import * as React from "react";

export type CardRowClient = {
  id: string;
  title: string;
  timelineIndex: number | null;
  pendingId: string | null;
  videoSrc: string;   // resolved URL (server already derived)
  thumbSrc: string;   // resolved URL (server already derived, can be "")
};

export function CardsGridClient({ rows }: { rows: CardRowClient[] }) {
  const [hoverId, setHoverId] = React.useState<string | null>(null);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const videoRefs = React.useRef<Record<string, HTMLVideoElement | null>>({});

  function stop(id: string) {
    const v = videoRefs.current[id];
    if (!v) return;
    try {
      v.pause();
      v.currentTime = 0;
    } catch {}
  }

  function toggle(id: string) {
    if (activeId === id) {
      setActiveId(null);
      stop(id);
      return;
    }
    setActiveId(id);
    play(id, { muted: false });
  }

  function play(id: string, opts?: { muted?: boolean }) {
    if (hoverId && hoverId !== id) stop(hoverId);
    setHoverId(id);
    const v = videoRefs.current[id];
    if (!v) return;
    v.muted = opts?.muted ?? true;
    v.playsInline = true;
    v.play().catch(() => {});
  }

  return (
    <div style={{ padding: 14 }}>
      <div style={{ fontSize: 12, color: "#64748B", marginBottom: 10 }}>
        Video cards. Hover to preview (muted). Click to open.
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 12,
        }}
      >
        {rows.map((c) => (
          <div
            key={c.id}
            style={{
              display: "block",
              textDecoration: "none",
              border: "1px solid #E5E7EB",
              borderRadius: 16,
              overflow: "hidden",
              background: "#fff",
              boxShadow: "0 10px 24px rgba(15, 23, 42, 0.06)",
            }}
          >
            <div
              style={{ aspectRatio: "16 / 9", background: "#0F172A", position: "relative" }}
              onClick={() => toggle(c.id)}
              onMouseEnter={() => play(c.id, { muted: true })}
              onMouseLeave={() => {
                setHoverId((prev) => (prev === c.id ? null : prev));
                stop(c.id);
              }}
            >
              {c.thumbSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={c.thumbSrc}
                  alt={c.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "grid",
                    placeItems: "center",
                    color: "#94A3B8",
                    fontSize: 12,
                  }}
                >
                  No thumbnail
                </div>
              )}

              <video
                ref={(el) => {
                  videoRefs.current[c.id] = el;
                }}
                src={c.videoSrc}
                muted
                playsInline
                preload="metadata"
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: hoverId === c.id || activeId === c.id ? "block" : "none",
                }}
              />
            </div>

            <div style={{ padding: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: "#0F172A" }}>{c.title}</div>
              <div style={{ marginTop: 6, fontSize: 12, color: "#64748B" }}>
                <div style={{ marginTop: 8 }}>
                  <a href={c.videoSrc} target="_blank" rel="noreferrer" style={{ fontSize: 12, fontWeight: 900, color: "#0F172A", textDecoration: "underline" }}>
                    Open
                  </a>
                </div>
                {c.timelineIndex != null ? `#${c.timelineIndex}` : c.pendingId ? c.pendingId : ""}
              </div>
            </div>
          </div>
        ))}

        {rows.length === 0 ? (
          <div style={{ padding: 12, color: "#64748B", fontSize: 13 }}>No cards</div>
        ) : null}
      </div>
    </div>
  );
}
