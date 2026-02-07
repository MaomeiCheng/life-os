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

- Public base URL: https://pub-4ff6e284500a472e9913cb662e4384ca.r2.dev
- S3 endpoint: https://95766963cde8c3ebf0481bfac54e1c3b.r2.cloudflarestorage.com
- Bucket: lifeos-cards
- AWS profile: lifeos-r2

Upload from Mac (batch example):
aws --profile lifeos-r2 --endpoint-url https://95766963cde8c3ebf0481bfac54e1c3b.r2.cloudflarestorage.com s3 cp "/path/to/cards" "s3://lifeos-cards/cards/" --recursive --exclude "*" --include "*.mp4" --content-type "video/mp4"

Bulk import cards into DB from R2 (Codespaces):
cd apps/web
export CF_R2_PUBLIC_BASE="https://pub-4ff6e284500a472e9913cb662e4384ca.r2.dev"
export CF_R2_ENDPOINT="https://95766963cde8c3ebf0481bfac54e1c3b.r2.cloudflarestorage.com"
export R2_BUCKET="lifeos-cards"
export AWS_PROFILE="lifeos-r2"
./scripts/cards/import-from-r2.sh

Generate missing thumbnails + update DB (Codespaces):
./scripts/cards/generate-thumbs.sh

Flow (recommended order):
1) Upload mp4 to R2 from Mac
2) Bulk import missing cards into DB: apps/web/scripts/cards/import-from-r2.sh
3) Generate missing thumbnails: apps/web/scripts/cards/generate-thumbs.sh
4) Sync card titles from crown items: apps/web/scripts/cards/sync-from-crown-items.sh
UI notes:
- Hover preview is muted.
- Click to play with sound (browser may require user gesture; works on click).

<!-- R2_WORKFLOW_END -->
