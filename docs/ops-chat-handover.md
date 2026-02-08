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
