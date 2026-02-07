"use client";

import * as React from "react";
import type { CardRowClient } from "./CardsGridClient";

export function CardsFeedClient({ rows }: { rows: CardRowClient[] }) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const videoRefs = React.useRef<Record<string, HTMLVideoElement | null>>({});
  const cardNodesRef = React.useRef<HTMLElement[]>([]);
  const rafRef = React.useRef<number | null>(null);

  const [activeId, setActiveId] = React.useState<string | null>(null);
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

  function play(id: string, opts?: { muted?: boolean }) {
    // do not restart if already active and state matches
    const v = videoRefs.current[id];
    if (!v) return;
    const wantMuted = opts?.muted ?? true;
    if (activeId === id && v.muted === wantMuted && !v.paused) return;
    if (activeId && activeId !== id) stop(activeId);
    setActiveId(id);

    
    if (!v) return;

    // auto preview should always be muted
    v.muted = wantMuted;
    v.playsInline = true;

    if (!wantMuted) setSoundId(id);
    v.play().catch(() => {});
  }

  function toggleSound(id: string) {
    const v = videoRefs.current[id];
    if (!v) return;

    // If this card is not active, start it first (muted -> then unmute)
    if (activeId !== id) {
      play(id, { muted: false });
      return;
    }

    // active: toggle mute
    const nextMuted = !v.muted;
    v.muted = nextMuted;
    setSoundId(nextMuted ? null : id);

    if (!nextMuted) {
      v.play().catch(() => {});
    }
  }

  React.useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    // cache nodes once per rows change
    cardNodesRef.current = Array.from(root.querySelectorAll<HTMLElement>("[data-card-id]"));

    const pickBest = () => {
      const r = root.getBoundingClientRect();
      const centerY = r.top + r.height * 0.35;

      let bestId: string | null = null;
      let bestScore = -Infinity;

      for (const el of cardNodesRef.current) {
        const id = el.dataset.cardId;
        if (!id) continue;

        const b = el.getBoundingClientRect();

        // compute overlap with container viewport (avoid picking offscreen)
        const overlapTop = Math.max(b.top, r.top);
        const overlapBottom = Math.min(b.bottom, r.bottom);
        const overlap = Math.max(0, overlapBottom - overlapTop);
        const visibleRatio = overlap / Math.max(1, b.height);

        if (visibleRatio <= 0) continue;

        const elemCenter = (b.top + b.bottom) / 2;
        const dist = Math.abs(elemCenter - centerY);

        // higher score is better:
        // prefer more visible + closer to center
        const score = visibleRatio * 1000 - dist;

        if (score > bestScore) {
          bestScore = score;
          bestId = id;
        }
      }

      if (bestId && bestId !== activeId) {
        if (activeId) stop(activeId);
        play(bestId, { muted: true });
      }
    };

    let settleTimer: number | null = null;

    const onScroll = () => {
            // trailing: after scroll settles, re-pick (fixes "already on next card but still playing previous")
      if (settleTimer != null) window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(() => {
        settleTimer = null;
        pickBest();
      }, 80);

      // rAF: cheap throttling for rapid scroll events
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        pickBest();
      });
    };

    // run once on mount (after nodes cached)
    pickBest();

    root.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      root.removeEventListener("scroll", onScroll);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      if (settleTimer != null) window.clearTimeout(settleTimer);
      settleTimer = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows.length]);

  return (
    <div
      ref={containerRef}
      style={{
        height: "70vh",
        overflowY: "auto",
        scrollBehavior: "auto",
        borderRadius: 16,

        // critical for mobile: keep scroll inside this container
        overscrollBehaviorY: "contain",
        WebkitOverflowScrolling: "touch",
        touchAction: "pan-y",

        // scroll snap often causes "whole page feels stuck/janky" on iOS;
        // keep it soft instead of mandatory.
        scrollSnapType: "none",
      }}
    >
      {rows.map((c) => (
        <div
          key={c.id}
          data-card-id={c.id}
          style={{
            scrollSnapAlign: "center",
            padding: 12,
          }}
        >
          <div
            style={{
              border: "1px solid #E5E7EB",
              borderRadius: 16,
              overflow: "hidden",
              background: "#fff",
              boxShadow: "0 10px 24px rgba(15, 23, 42, 0.06)",
            }}
          >
            <div style={{ aspectRatio: "16 / 9", background: "#0F172A", position: "relative" }}>
              {/* sound button (do not block scroll gestures) */}
              {c.thumbSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={c.thumbSrc}
                  alt={c.title}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: activeId === c.id ? "none" : "block",
                  }}
                />
              ) : null}

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleSound(c.id);
                }}
                onPointerDown={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.96)";
                }}
                onPointerUp={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
                }}
                onPointerCancel={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
                }}
                aria-label={soundId === c.id ? "Mute" : "Unmute"}
                style={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  zIndex: 5,
                  width: 40,
                  height: 40,
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.32)",
                  background: soundId === c.id ? "rgba(2, 6, 23, 0.60)" : "rgba(15, 23, 42, 0.45)",
                  color: "white",
                  display: "grid",
                  placeItems: "center",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                  cursor: "pointer",
                  boxShadow: "0 8px 18px rgba(0,0,0,0.22)",
                  transition: "transform 120ms ease, background 120ms ease, opacity 120ms ease",
                  opacity: 0.92,
                  userSelect: "none",
                }}
              >
                {soundId === c.id ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M11 5L6 9H3v6h3l5 4V5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                    <path d="M15.5 8.5a5 5 0 010 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M18 6a8 8 0 010 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M11 5L6 9H3v6h3l5 4V5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                    <path d="M16 9l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M21 9l-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
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
                  display: activeId === c.id ? "block" : "none",
                }}
              />
            </div>

            <div
              style={{
                padding: 10,
                display: "flex",
                justifyContent: "space-between",
                gap: 10,
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 900, color: "#0F172A" }}>{c.title}</div>
                <div style={{ marginTop: 6, fontSize: 12, color: "#64748B" }}>
                  {c.timelineIndex != null ? `#${c.timelineIndex}` : c.pendingId ? c.pendingId : ""}
                </div>
              </div>

              <a
                href={c.videoSrc}
                target="_blank"
                rel="noreferrer"
                style={{
                  fontSize: 12,
                  fontWeight: 900,
                  color: "#0F172A",
                  textDecoration: "underline",
                  whiteSpace: "nowrap",
                }}
              >
                Open
              </a>
            </div>
          </div>
        </div>
      ))}
      {rows.length === 0 ? <div style={{ padding: 12, color: "#64748B", fontSize: 13 }}>No cards</div> : null}

      {/* spacer: allow last card to reach the detection zone */}
      <div data-scroll-spacer style={{ height: "35vh" }} />
    </div>
  );
}
