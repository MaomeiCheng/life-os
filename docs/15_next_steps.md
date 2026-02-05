# Next Steps (DEFAULT v1)

## Current State (locked)
- Web app: `apps/web` (Next.js) boots locally.
- Home page shows SSOT status.
- SSOT skeleton exists at repo root: `ssot/`.
- Legacy folders are marked as paused: `frontend/`, `backend/`, `modules/`.

## Next Implementation Order
1) SSOT: replace placeholder with archived SSOT content
   - Define schema format (json schema / zod / other)
   - Add `ssot:validate` script
   - Add `ssot:export` script (optional)

2) Web: create a minimal data page that reads SSOT `data/*` safely
   - Read JSON from `ssot/data`
   - Render list view (read-only)

3) API: decide initial backend approach
   - Option A: Next.js route handlers (`apps/web/src/app/api/*`)
   - Option B: separate backend in `backend/`

4) Deployment: pick first platform (recommended: Vercel)
   - Ensure Node 20
   - Add env vars
   - Confirm build passes

## Definition of Done (near-term)
- `pnpm build` passes in `apps/web`
- A page renders SSOT data from repo
- First deployment succeeds with env + build locked
