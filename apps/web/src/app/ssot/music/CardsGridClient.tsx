"use client";

import * as React from "react";

export type CardRowClient = {
  id: string;
  title: string;
  timelineIndex: number | null;
  pendingId: string | null;
  videoSrc: string;
  thumbSrc: string;
};

export function CardsGridClient({ rows }: { rows: CardRowClient[] }) {
  const videoRefs = React.useRef<Record<string, HTMLVideoElement | null>>({});
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [hoverId, setHoverId] = React.useState<string | null>(null);
  const [soundId, setSoundId] = React.useState<string | null>(null);

  function stop(id: string) {
    const v = videoRefs.current[id];
    if (!v) return;
    try {
      v.pause();
      v.currentTime = 0;
      v.muted = true;
    } catch {}
    setSoundId((prev) => (prev === id ? null : prev));
  }

  function stopAllExcept(keepId: string) {
    for (const [id, v] of Object.entries(videoRefs.current)) {
      if (!v) continue;
      if (id === keepId) continue;
      try {
        v.pause();
        v.currentTime = 0;
        v.muted = true;
      } catch {}
    }
    setSoundId((prev) => (prev && prev !== keepId ? null : prev));
  }

  function play(id: string, opts?: { muted?: boolean }) {
    stopAllExcept(id);

    const v = videoRefs.current[id];
    if (!v) return;

    const wantMuted = opts?.muted ?? true;
    v.muted = wantMuted;
    v.playsInline = true;

    setSoundId(wantMuted ? null : id);

    v.play().catch(() => {});
  }

  function toggleSound(id: string) {
    const v = videoRefs.current[id];
    if (!v) return;

    stopAllExcept(id);

    if (v.paused) {
      play(id, { muted: false });
      return;
    }

    const nextMuted = !v.muted;
    v.muted = nextMuted;
    setSoundId(nextMuted ? null : id);

    if (!nextMuted) v.play().catch(() => {});
  }

  function toggleActive(id: string) {
    if (activeId === id) {
      setActiveId(null);
      stop(id);
      return;
    }
    setActiveId(id);
    // active should remain muted unless user taps speaker
    play(id, { muted: true });
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
        gap: 14,
      }}
    >
      {rows.map((c) => {
        const isActive = activeId === c.id;
        const isHover = hoverId === c.id;
        const showVideo = isActive || isHover;

        return (
          <div
            key={c.id}
            style={{
              border: "1px solid #E5E7EB",
              borderRadius: 16,
              overflow: "hidden",
              background: "#fff",
              boxShadow: "0 10px 24px rgba(15, 23, 42, 0.06)",
            }}
          >
            <div
              style={{ aspectRatio: "16 / 9", background: "#0F172A", position: "relative", cursor: "pointer" }}
              onClick={(e) => {
                  e.preventDefault();
                  if (c.videoSrc) window.open(c.videoSrc, `card_${Date.now()}_${Math.random().toString(36).slice(2)}`, "noopener,noreferrer");
                }}
              onMouseEnter={() => {
                setHoverId(c.id);
                // if this card is the one with sound enabled, keep it unmuted on hover-back
                play(c.id, { muted: soundId === c.id ? false : true });
              }}
              onMouseLeave={() => {
                setHoverId((prev) => (prev === c.id ? null : prev));
                // if not active, stop on leave
                if (activeId !== c.id) stop(c.id);
              }}
            >
              {c.thumbSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={c.thumbSrc}
                  alt={c.title}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: showVideo ? "none" : "block",
                  }}
                />
              ) : null}

                {c.videoSrc && !showVideo ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleActive(c.id);
                    }}
                    aria-label="Preview"
                    style={{
                      position: "absolute",
                      left: "50%",
                      top: "50%",
                      transform: "translate(-50%, -50%)",
                      zIndex: 6,
                      padding: "10px 14px",
                      borderRadius: 999,
                      border: "1px solid rgba(255,255,255,0.40)",
                      background: "rgba(15, 23, 42, 0.55)",
                      color: "white",
                      fontSize: 12,
                      fontWeight: 900,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      backdropFilter: "blur(6px)",
                      WebkitBackdropFilter: "blur(6px)",
                      cursor: "pointer",
                    }}
                  >
                    <span aria-hidden="true">▶</span>
                    Preview
                  </button>
                ) : null}


              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleSound(c.id);
                }}
                aria-label={soundId === c.id ? "Mute" : "Unmute"}
                style={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  zIndex: 5,
                  width: 38,
                  height: 38,
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.35)",
                  background: "rgba(15, 23, 42, 0.45)",
                  color: "white",
                  display: "grid",
                  placeItems: "center",
                  backdropFilter: "blur(6px)",
                  WebkitBackdropFilter: "blur(6px)",
                  cursor: "pointer",
                }}
              >
                {soundId === c.id ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M11 5L6 9H3v6h3l5 4V5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                    <path d="M15.5 8.5a5 5 0 0 1 0 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M18 6a8.5 8.5 0 0 1 0 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M11 5L6 9H3v6h3l5 4V5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                    <path d="M16 9l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M21 9l-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                )}
              </button>

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
                  display: showVideo ? "block" : "none",
                }}
              />
            </div>

            <div style={{ padding: 10, display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 900, color: "#0F172A" }}>{c.title}</div>
                <div style={{ marginTop: 6, fontSize: 12, color: "#64748B" }}>
                  {c.timelineIndex != null ? `#${c.timelineIndex}` : c.pendingId ? c.pendingId : ""}
                </div>
              </div>

              <button aria-label="Open"
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (c.videoSrc) window.open(c.videoSrc, `card_${Date.now()}_${Math.random().toString(36).slice(2)}`, "noopener,noreferrer");
                }}
                style={{
                  fontSize: 12,
                  fontWeight: 900,
                  color: "#0F172A",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                  background: "transparent",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                    width: 22,
                    height: 22,
                    display: "grid",
                    placeItems: "center",
                }}
              >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
  <path d="M14 3h7v7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M10 14L21 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M21 14v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
</svg>
                  </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
