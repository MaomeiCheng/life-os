# life-os

## Dev (Codespaces)


### Start DB (Postgres)
If you reconnect to Codespaces and DB is not reachable, start the postgres container:

```bash
docker start lifeos-postgres || true
docker ps --filter "name=lifeos-postgres"
```

If the container does not exist, create it (data will persist in the `lifeos_pgdata` volume):

```bash
docker run -d --name lifeos-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_DB=lifeos \
  -p 5432:5432 \
  -v lifeos_pgdata:/var/lib/postgresql/data \
  postgres:16
```

### Migrate / Seed
```bash
cd apps/web
pnpm prisma migrate dev
pnpm db:seed
```

### Start Web
```bash
cd apps/web
pnpm dev
```

Notes:
- Keep `.env` / `.env.local` uncommitted (local-only).
- Do NOT remove `lifeos_pgdata` unless you accept data loss.

<!-- R2_WORKFLOW_START -->
### R2 (large mp4 upload + thumbnail)

- Public base URL: https://<your-public-r2-base>
- S3 endpoint: https://<your-r2-endpoint>
- Bucket: lifeos-cards
- AWS profile: lifeos-r2

Upload from Mac (batch example):
aws --profile lifeos-r2 --endpoint-url https://<your-r2-endpoint> s3 cp "/path/to/cards" "s3://<your-bucket>/cards/" --recursive --exclude "*" --include "*.mp4" --content-type "video/mp4"

Bulk import cards into DB from R2 (Codespaces):
cd apps/web
export CF_R2_PUBLIC_BASE="https://<your-public-r2-base>"
export CF_R2_ENDPOINT="https://<your-r2-endpoint>"
export R2_BUCKET="<your-bucket>"
export AWS_PROFILE="lifeos-r2"
./scripts/cards/import-from-r2.sh

Generate missing thumbnails + update DB (Codespaces):
./scripts/cards/generate-thumbs.sh

Flow (recommended order):
(Details: docs/cards-workflow.md)
1) Upload mp4 to R2 from Mac
2) Bulk import missing cards into DB: apps/web/scripts/cards/import-from-r2.sh
3) Generate missing thumbnails: apps/web/scripts/cards/generate-thumbs.sh
4) Sync card titles from crown items: apps/web/scripts/cards/sync-from-crown-items.sh

When you edit crown item titles (MusicCrownItem), rerun step 4 to refresh card titles.
UI notes:
- Hover preview is muted.
- Click to play with sound (browser may require user gesture; works on click).

Known issues (mobile browsers/iOS):
- Tapping "Open" may open a new page/tab. Closing it can sometimes return to a previously opened card page (browser/in-app WebView history behavior). Not treated as an app bug.
- Workaround: open in Safari (system browser) or prefer in-page playback. Optionally add "Copy link"/"Share" later.

<!-- R2_WORKFLOW_END -->
