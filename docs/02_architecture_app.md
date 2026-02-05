# App / Repo Architecture (DEFAULT v1, DRAFT)

Default approach: **single repo**, Next.js app, with a clear modules structure.

## Suggested Repo Layout
```
life-os/
  app/                    # Next.js App Router
  src/
    modules/              # feature modules (subsystems)
    shared/               # shared utilities, components, types
    server/               # server-only code (db, services)
  ssot/                   # schema + data + validators + exports
  scripts/                # one-off scripts (seed/import/maintenance)
  docs/                   # documentation (this folder)
  .vscode/                # VS Code workspace settings
```

## Modules Structure (pattern)
Each module under `src/modules/<module-name>/`:
- `ui/` (components/pages helpers)
- `domain/` (types/entities/rules)
- `data/` (queries/repositories/mappers)
- `api/` (optional: route helpers)

Example:
```
src/modules/notes/
  ui/
  domain/
  data/
```

## Frontend / Backend Separation (within Next.js)
- Frontend UI:
  - `app/` routes, React components
- Backend (initial):
  - Next.js Route Handlers: `app/api/**/route.ts`
  - Server-only services: `src/server/**`
- Optional later:
  - extract `apps/api` or separate service when needed

## Config & Env
- `.env.example` is committed
- `.env.local` is local only (NOT committed)
- CI and hosting configure env variables in platform dashboard

## Logging (default)
- `console.*` locally
- Platform logs in production
- Introduce structured logger later if needed
