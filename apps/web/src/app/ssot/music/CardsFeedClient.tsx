"use client";

import * as React from "react";
import type { CardRowClient } from "./CardsGridClient";

export function CardsFeedClient({ rows }: { rows: CardRowClient[] }) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const videoRefs = React.useRef<Record<string, HTMLVideoElement | null>>({});
  const cardNodesRef = React.useRef<HTMLElement[]>([]);
  const rafRef = React.useRef<number | null>(null);

  const [activeId, setActiveId] = React.useState<string | null>(null);

  function stop(id: string) {
    const v = videoRefs.current[id];
    if (!v) return;
    try {
      v.pause();
      v.currentTime = 0;
    } catch {}
  }

  function play(id: string, opts?: { muted?: boolean }) {
    if (activeId && activeId !== id) stop(activeId);
    setActiveId(id);
    const v = videoRefs.current[id];
    if (!v) return;
    v.muted = opts?.muted ?? true;
    v.playsInline = true;
    v.play().catch(() => {});
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

      if (bestId) play(bestId, { muted: true });
    };

    const onScroll = () => {
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
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows.length]);

  return (
    <div
      ref={containerRef}
      style={{
        height: "70vh",
        overflowY: "auto",
        borderRadius: 16,

        // critical for mobile: keep scroll inside this container
        overscrollBehaviorY: "contain",
        WebkitOverflowScrolling: "touch",
        touchAction: "pan-y",

        // scroll snap often causes "whole page feels stuck/janky" on iOS;
        // keep it soft instead of mandatory.
        scrollSnapType: "y proximity",
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
              <button
                type="button"
                onClick={() => play(c.id, { muted: false })}
                style={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  zIndex: 10,
                  padding: "6px 10px",
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.35)",
                  background: "rgba(15, 23, 42, 0.55)",
                  color: "white",
                  fontSize: 12,
                  fontWeight: 900,
                  cursor: "pointer",
                }}
                aria-label="Play with sound"
              >
                Sound
              </button>

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
    </div>
  );
}
