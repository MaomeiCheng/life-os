# Cards workflow (R2 / DB / Thumbs / Titles)

## Recommended flow (end-to-end)
1) Upload mp4 to R2 from Mac
2) Bulk import missing cards into DB:
   apps/web/scripts/cards/import-from-r2.sh
3) Generate missing thumbnails:
   apps/web/scripts/cards/generate-thumbs.sh
4) Sync card titles from crown items:
   apps/web/scripts/cards/sync-from-crown-items.sh

## Notes
- Hover preview is muted; click/tap sound icon toggles sound (browser gesture rules apply).
- If you edit crown item titles (MusicCrownItem), rerun step 4 to refresh card titles.
- iOS in-app browser may reuse the same tab/window for `_blank`; we use a unique window name to avoid "back to previous card" behavior.
