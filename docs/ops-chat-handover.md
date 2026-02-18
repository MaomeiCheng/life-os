# Ops / Chat Handover Notes (life-os)

## Repo / Environment SSOT
- Repo root: /workspaces/life-os
- Web app: /workspaces/life-os/apps/web
- ORM/DB: Prisma + Postgres (prisma, @prisma/client, pg, @prisma/adapter-pg)
- Prisma schema: /workspaces/life-os/apps/web/prisma/schema.prisma
- DB client: /workspaces/life-os/apps/web/src/lib/db.ts
- Env files (filenames only):
  - /workspaces/life-os/apps/web/.env
  - /workspaces/life-os/apps/web/.env.local
  - /workspaces/life-os/.env.example

## Avoid terminal command truncation
- Do NOT paste long heredocs directly into the terminal.
- Preferred: write scripts to a file first, then execute:
  - `cat > /tmp/script.py <<'PY' ... PY`
  - `python3 /tmp/script.py`
- If you must run one-liners, keep them short; avoid coupling with `set -e` until stable.

## Truncation pitfall: line continuations
### Shell / paste safety
- Avoid multi-line commands with `\` line continuations when pasting into the terminal (they can be truncated/stripped).
- Prefer:
  - Single-line commands; OR
  - Write scripts/files first, then execute (`cat > file <<'EOF' ... EOF` / `python3 file.py`).
- Symptom of truncation: `docker exec ... psql ...` silently breaks and you end up running **host** `psql`, which then fails with:
  - `connection to server on socket /var/run/postgresql/.s.PGSQL.5432 failed`
- Fix: rewrite the command into a single line (no `\`) and re-run.

## Start/Stop (common)
### Start DB (docker)
- Check containers:
  - `docker ps -a --format 'table {{.Names}}\t{{.Status}}\t{{.Image}}'`
- Start DB (no-op if already running):
  - `docker start lifeos-postgres >/dev/null 2>&1 || true`

### Start Web (apps/web)
- `cd /workspaces/life-os/apps/web`
- Dev:
  - `pnpm -s dev`
- Build:
  - `pnpm -s build`

### Quick DB sanity
- Cards thumb stats:
  - `docker exec lifeos-postgres psql -U postgres -d lifeos -c "select count(*) as total, count(*) filter (where coalesce(\"thumbKey\",'')<>'' or coalesce(\"thumbUrl\",'')<>'') as with_thumb, count(*) filter (where coalesce(\"thumbKey\",'')='' and coalesce(\"thumbUrl\",'')='') as no_thumb from \"MusicCard\";"`

### Cards thumbnails (R2 + DB)
- Local env (not committed): `apps/web/scripts/cards/.env.local` (gitignored)
- Load env into current shell (IMPORTANT: use dot/source):
  - `cd /workspaces/life-os/apps/web`
  - `. scripts/cards/load-env.sh`
- Generate / regenerate thumbnails:
  - Dry small batch (force + limit 3):
    - `FORCE=1 LIMIT=3 ./scripts/cards/generate-thumbs-v2.sh`
  - Full regenerate (force all):
    - `FORCE=1 ./scripts/cards/generate-thumbs-v2.sh`
  - Only fill missing thumbs:
    - `./scripts/cards/generate-thumbs-v2.sh`
- Notes:
  - v2 picks candidates across the video including tail-biased points (often shows title/artist cards).

  - Touch devices (iPad/mobile): CardsFeedClient supports tap-to-preview on the 16:9 media area (toggles active video).

### Cards preview UX (grid/feed)
- Desktop:
  - Grid: hover shows inline preview; click media opens video in new tab.
  - Feed: inline preview auto-attaches video around viewport; Open icon opens video.
- Touch devices (iPad/mobile):
  - Feed: tap the 16:9 media area toggles preview (active video).
  - Center preview button is icon-only (▶) with softened opacity.
- Open button:
  - Icon-only; has aria-label="Open" and title="Open" for tooltip on desktop.

### Thumbnail selection strategy (current vs. future)
- Current (v2 script): sample multiple timestamps across video with tail-biased points; pick the frame with higher average brightness (YAVG).
- Why not always “last minutes”:
  - Many videos end on fades/black/credits; best frame can be mid-video.
- How TikTok/short-video apps do it (typical):
  - Generate a set of candidate frames.
  - Run lightweight CV/ML scoring to pick best: sharpness, faces/text presence, contrast, motion blur, saliency; sometimes OCR for title/artist text.
  - Optionally personalize by engagement signals (what users tend to tap).
- Costs (what you pay for):
  - Compute: decoding/sampling frames (ffmpeg/GPU), running CV/ML/OCR models.
  - Storage/egress: storing thumbs, serving images/videos.
  - Engineering/ops: pipelines, retries, monitoring, moderation if needed.
- Next upgrade options:
  - Add heuristics: avoid near-black frames; prefer frames with edges/detail (sharpness).
  - Optional OCR pass on a few tail frames to detect song title overlay, fallback if found.

