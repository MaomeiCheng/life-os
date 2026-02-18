# Cards workflow (R2 -> DB -> thumbs -> titles)

## Recommended order
1) Upload mp4 to R2 (from Mac)
2) Bulk import missing cards into DB:
   apps/web/scripts/cards/import-from-r2.sh
3) Generate missing thumbnails:
   apps/web/scripts/cards/generate-thumbs.sh
4) Sync card titles from crown items:
   apps/web/scripts/cards/sync-from-crown-items.sh

## When editing crown item titles
- Edit MusicCrownItem.title
- Rerun step 4 to refresh card titles
- If you want reproducible seed:
  - export MusicCrownItem -> ssot/data/music/music_crown_items.seed.json
  - pnpm db:seed to verify
