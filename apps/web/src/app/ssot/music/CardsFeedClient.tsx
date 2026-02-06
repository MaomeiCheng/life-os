"use client";

import * as React from "react";
import type { CardRowClient } from "./CardsGridClient";

export function CardsFeedClient({ rows }: { rows: CardRowClient[] }) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const videoRefs = React.useRef<Record<string, HTMLVideoElement | null>>({});
  const [activeId, setActiveId] = React.useState<string | null>(null);

  function stop(id: string) {
    const v = videoRefs.current[id];
    if (!v) return;
    try {
      v.pause();
      v.currentTime = 0;
    } catch {}
  }

  function play(id: string) {
    if (activeId && activeId !== id) stop(activeId);
    setActiveId(id);
    const v = videoRefs.current[id];
    if (!v) return;
    v.muted = true;
    v.playsInline = true;
    v.play().catch(() => {});
  }

  React.useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const thresholds = [0, 0.25, 0.5, 0.75, 1];
    const io = new IntersectionObserver(
      (entries) => {
        // pick the entry closest to viewport center among visible ones
        const vh = window.innerHeight || 1;
        const centerY = vh / 2;

        let best: { id: string; score: number } | null = null;
        for (const e of entries) {
          const el = e.target as HTMLElement;
          const id = el.dataset.cardId;
          if (!id) continue;

          if (!e.isIntersecting) continue;

          const r = e.boundingClientRect;
          const elemCenter = (r.top + r.bottom) / 2;
          const dist = Math.abs(elemCenter - centerY);
          // score: higher is better
          const score = (e.intersectionRatio * 1000) - dist;
          if (!best || score > best.score) {
            best = { id, score };
          }
        }

        if (best) play(best.id);
      },
      {
        root: null,
        threshold: thresholds,
      }
    );

    const nodes = Array.from(root.querySelectorAll("[data-card-id]"));
    nodes.forEach((n) => io.observe(n));

    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows.length]);

  return (
    <div
      ref={containerRef}
      style={{
        height: "70vh",
        overflowY: "auto",
        scrollSnapType: "y mandatory",
        borderRadius: 16,
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

            <div style={{ padding: 10, display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
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
                style={{ fontSize: 12, fontWeight: 900, color: "#0F172A", textDecoration: "underline", whiteSpace: "nowrap" }}
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
