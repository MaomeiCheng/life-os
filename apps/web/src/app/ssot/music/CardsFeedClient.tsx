"use client";

import * as React from "react";
import type { CardRowClient } from "./CardsGridClient";

type Range = { start: number; end: number };

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

export function CardsFeedClient({ rows }: { rows: CardRowClient[] }) {
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const videoRefs = React.useRef<Record<string, HTMLVideoElement | null>>({});
  const rafRef = React.useRef<number | null>(null);
  const settleRef = React.useRef<number | null>(null);

  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [soundId, setSoundId] = React.useState<string | null>(null);
  const [range, setRange] = React.useState<Range>({ start: 0, end: 10 });

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
    setActiveId(id);

    const v = videoRefs.current[id];
    if (!v) return;

    const wantMuted = opts?.muted ?? true;
    v.muted = wantMuted;
    v.playsInline = true;

    // icon source of truth
    setSoundId(wantMuted ? null : id);

    v.play().catch(() => {});
  }

  function toggleSound(id: string) {
    const v = videoRefs.current[id];
    if (!v) return;

    stopAllExcept(id);

    // ensure it's the active one
    if (activeId !== id) setActiveId(id);

    if (v.paused) {
      play(id, { muted: false });
      return;
    }

    const nextMuted = !v.muted;
    v.muted = nextMuted;
    setSoundId(nextMuted ? null : id);

    if (!nextMuted) v.play().catch(() => {});
  }

  function updateWindowByScroll() {
    const root = rootRef.current;
    if (!root) return;

    const total = rows.length;
    if (total === 0) return;

    // windowing-lite: estimate by average item height (padding included)
    // This does not have to be perfect; just needs to keep src attached near viewport.
    const approxH = 320;
    const idx = clamp(Math.floor(root.scrollTop / approxH), 0, total - 1);

    const overscan = 8;
    const start = clamp(idx - overscan, 0, total - 1);
    const end = clamp(idx + overscan + 12, 0, total - 1);

    setRange((prev) => (prev.start === start && prev.end === end ? prev : { start, end }));
  }

  function pickBestAndPreview() {
    const root = rootRef.current;
    if (!root) return;

    const r = root.getBoundingClientRect();
    const targetY = r.top + r.height * 0.28;

    let bestId: string | null = null;
    let bestScore = -Infinity;

    const nodes = Array.from(root.querySelectorAll<HTMLElement>("[data-card-id]"));
    for (const el of nodes) {
      const id = el.dataset.cardId;
      if (!id) continue;

      const b = el.getBoundingClientRect();

      const overlapTop = Math.max(b.top, r.top);
      const overlapBottom = Math.min(b.bottom, r.bottom);
      const overlap = Math.max(0, overlapBottom - overlapTop);
      const visibleRatio = overlap / Math.max(1, b.height);
      if (visibleRatio <= 0) continue;

      const elemCenter = (b.top + b.bottom) / 2;
      const dist = Math.abs(elemCenter - targetY);

      const score = visibleRatio * 1000 - dist;
      if (score > bestScore) {
        bestScore = score;
        bestId = id;
      }
    }

    if (bestId) {
      // if user previously enabled sound on this same card, keep it unmuted;
      // otherwise auto-preview is muted.
      const wantMuted = soundId === bestId ? false : true;
      play(bestId, { muted: wantMuted });
    }
  }

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    updateWindowByScroll();

    // allow first card to preview without manual scroll
    const t0 = window.setTimeout(() => {
      updateWindowByScroll();
      pickBestAndPreview();
    }, 0);

    const onScroll = () => {
      updateWindowByScroll();
      pickBestAndPreview();

      // trailing settle
      if (settleRef.current != null) window.clearTimeout(settleRef.current);
      settleRef.current = window.setTimeout(() => {
        settleRef.current = null;
        updateWindowByScroll();
        pickBestAndPreview();
      }, 120);

      // raf throttle for window calc (cheap)
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        updateWindowByScroll();
      });
    };

    root.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(t0);
      root.removeEventListener("scroll", onScroll);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      if (settleRef.current != null) window.clearTimeout(settleRef.current);
      settleRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows.length, soundId]);

  const inRange = (idx: number) => idx >= range.start && idx <= range.end;
  const total = rows.length;

  return (
    <div
      ref={rootRef}
      style={{
        height: "70vh",
        overflowY: "auto",
        borderRadius: 16,
        overscrollBehaviorY: "contain",
        WebkitOverflowScrolling: "touch",
        touchAction: "pan-y",
        scrollSnapType: "none",
      }}
    >
      {rows.map((c, idx) => {
        const isActive = activeId === c.id;
        const shouldAttachVideo = inRange(idx);

        return (
          <div key={c.id} data-card-id={c.id} data-card-index={idx} style={{ padding: 12 }}>
            <div
              style={{
                border: "1px solid #E5E7EB",
                borderRadius: 16,
                overflow: "hidden",
                background: "#fff",
                boxShadow: "0 10px 24px rgba(15, 23, 42, 0.06)",
              }}
            >
              <div style={{ aspectRatio: "16 / 9", background: "#0F172A", position: "relative", cursor: "pointer" }} onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveId(prev => prev === c.id ? null : c.id); }}>
                {c.thumbSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={c.thumbSrc}
                    alt={c.title}
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: isActive ? "none" : "block",
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

                {shouldAttachVideo && c.videoSrc ? (
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
                      display: isActive ? "block" : "none",
                    }}
                  />
                ) : null}
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
          </div>
        );
      })}

      {/* bottom spacer to allow last card enter detection zone */}
      {total > 0 ? <div style={{ height: "35vh" }} /> : null}

      {rows.length === 0 ? <div style={{ padding: 12, color: "#64748B", fontSize: 13 }}>No cards</div> : null}
    </div>
  );
}
