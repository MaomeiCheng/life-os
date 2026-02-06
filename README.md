# life-os

## Dev (Codespaces)


### R2 (upload large mp4 + generate thumbnail)

> Dashboard upload has a 300MB limit. Use S3 compatibility API instead.

Public dev base URL:
- https://pub-4ff6e284500a472e9913cb662e4384ca.r2.dev

Upload (Mac):
```bash
aws --profile lifeos-r2 --endpoint-url https://95766963cde8c3ebf0481bfac54e1c3b.r2.cloudflarestorage.com \
  s3 cp "$HOME/Downloads/93750_raw.mp4" "s3://lifeos-cards/cards/93750_raw.mp4"

##Generate thumbnail in Codespaces (needs ffmpeg + awscli + DB running):

docker start lifeos-postgres || true

VIDEO_URL="https://pub-4ff6e284500a472e9913cb662e4384ca.r2.dev/cards/93750_raw.mp4"
THUMB_KEY="cards/93750_raw.jpg"

ffmpeg -y -ss 00:00:05 -i "$VIDEO_URL" -frames:v 1 -q:v 2 /tmp/thumb.jpg

aws --profile lifeos-r2 --endpoint-url https://95766963cde8c3ebf0481bfac54e1c3b.r2.cloudflarestorage.com \
  s3 cp /tmp/thumb.jpg "s3://lifeos-cards/$THUMB_KEY"


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

Upload from Mac (example):
aws --profile lifeos-r2 --endpoint-url https://95766963cde8c3ebf0481bfac54e1c3b.r2.cloudflarestorage.com s3 cp "$HOME/Downloads/93750_raw.mp4" "s3://lifeos-cards/cards/93750_raw.mp4"

Generate thumbnail in Codespaces (requires: ffmpeg + awscli + DB running):
docker start lifeos-postgres >/dev/null 2>&1 || true
CF_R2_PUBLIC_BASE="https://pub-4ff6e284500a472e9913cb662e4384ca.r2.dev"
CF_R2_ENDPOINT="https://95766963cde8c3ebf0481bfac54e1c3b.r2.cloudflarestorage.com"
R2_BUCKET="lifeos-cards"
AWS_PROFILE="lifeos-r2"
MP4_KEY="cards/93750_raw.mp4"
JPG_KEY="cards/93750_raw.jpg"
CARD_ID="mc_test_1"
tmpdir="$(mktemp -d)"
thumb="$tmpdir/thumb.jpg"
ffmpeg -y -ss 00:00:05 -i "${CF_R2_PUBLIC_BASE}/${MP4_KEY}" -frames:v 1 -q:v 2 "$thumb"
aws --profile "$AWS_PROFILE" --endpoint-url "$CF_R2_ENDPOINT" s3 cp "$thumb" "s3://${R2_BUCKET}/${JPG_KEY}"
docker exec -i lifeos-postgres psql -U postgres -d lifeos -c "update "MusicCard" set "thumbUrl"='${CF_R2_PUBLIC_BASE}/${JPG_KEY}', "updatedAt"=now() where id='${CARD_ID}';"
<!-- R2_WORKFLOW_END -->
