## Conversation rule (when starting a new chat for Deploy / UI)
When we intentionally switch to a new chat, the first message must include:
- repo link
- latest commit
- exactly one milestone

# Next Steps (life-os)

## Milestone (single)
- [ ] Auth: enforce `/ssot/*` requires login (verify edge + callbackUrl + logout flow)
  - [ ] Verify: unauth -> /login?callbackUrl=...
  - [ ] Verify: login success -> callbackUrl works (codespace domain)
  - [ ] Verify: logout -> protected routes redirect to login
  - [ ] Verify: NEXTAUTH_URL handling for Codespaces + local

## Auth / Login (follow-ups)
- [ ] Docs: record auth setup + admin creation script usage (safe patterns; never commit creds)
  - [ ] `apps/web/scripts/auth/create-admin.mjs` usage
  - [ ] required env: NEXTAUTH_SECRET, NEXTAUTH_URL, AUTH_CREATE_ADMIN_ENABLED
- [ ] Hardening: ensure `create-admin.mjs` refuses production + requires explicit enable gate
- [ ] Optional: add logout button somewhere (e.g. ssot/music header)

## Music / Crown Cards
- [ ] Cards: store keys (videoKey/thumbKey) instead of full URLs
- [ ] Cards: derive URLs from PUBLIC_R2_BASE_URL
- [ ] Cards: UI add/create card (single)
- [ ] Cards: bulk import (paste JSON/CSV) -> create many cards
- [x] Cards: thumbnail generation script v2 (ffmpeg -> update DB)
- [x] Cards: choose best frame by brightness sampling
- [ ] Cards: thumbnail generation v3 (avoid black/blur/transitions)
- [ ] Cards: add sharpness/edge score (optional OCR/face/text heuristic)
- [ ] Cards: tags + search + filter (eventId/timelineIndex optional)
- [ ] Cards: permissions/auth (private mode)

## Audit
- [ ] Show audit details (before/after JSON viewer)
- [ ] Filter by entityType/entityId/action/date
- [ ] Pagination

## Deploy (any device)
- [ ] Move Postgres to Neon/Supabase
- [ ] Deploy Next.js to Cloudflare Pages or Vercel
- [ ] Set env vars: DATABASE_URL, PUBLIC_R2_BASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL
