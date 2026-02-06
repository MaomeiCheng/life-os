## Conversation rule (when starting a new chat for Deploy / UI)
When we intentionally switch to a new chat, the first message must include:
- repo link
- latest commit
- exactly one milestone

# Next Steps (life-os)

## Music / Crown Cards
- [ ] Cards: store keys (videoKey/thumbKey) instead of full URLs; derive URLs from PUBLIC_R2_BASE_URL
- [ ] Cards: UI add/create card (single)
- [ ] Cards: bulk import (paste JSON/CSV) -> create many cards
- [ ] Cards: thumbnail generation script (ffmpeg -> R2 -> update DB)
- [ ] Cards: tags + search + filter (eventId/timelineIndex optional)
- [ ] Cards: permissions/auth (private mode)

## Audit
- [ ] Show audit details (before/after JSON viewer)
- [ ] Filter by entityType/entityId/action/date
- [ ] Pagination

## Deploy (any device)
- [ ] Move Postgres to Neon/Supabase
- [ ] Deploy Next.js to Cloudflare Pages or Vercel
- [ ] Set env vars: DATABASE_URL, PUBLIC_R2_BASE_URL, etc.
