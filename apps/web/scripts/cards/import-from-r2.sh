#!/usr/bin/env bash
set -euo pipefail

: "${CF_R2_PUBLIC_BASE:?set CF_R2_PUBLIC_BASE}"
: "${CF_R2_ENDPOINT:?set CF_R2_ENDPOINT}"
: "${R2_BUCKET:?set R2_BUCKET}"
: "${AWS_PROFILE:?set AWS_PROFILE}"

docker start lifeos-postgres >/dev/null 2>&1 || true

# Fetch mp4 list from R2
aws --profile "$AWS_PROFILE" --endpoint-url "$CF_R2_ENDPOINT" s3 ls "s3://${R2_BUCKET}/cards/" \
| awk '$4 ~ /\.mp4$/ {print $4}' | sort -u > /tmp/r2_videos.txt

# Fetch existing mp4 list from DB
docker exec lifeos-postgres psql -U postgres -d lifeos -t -A -c \
"select regexp_replace(\"videoKey\", '^cards/', '') from \"MusicCard\"
 where \"videoKey\" like 'cards/%.mp4' and \"videoKey\" is not null;" \
| sort -u > /tmp/db_videos.txt

# Diff: in R2 but not in DB
comm -23 /tmp/r2_videos.txt /tmp/db_videos.txt > /tmp/missing_videos.txt

echo "missing=$(wc -l < /tmp/missing_videos.txt)"

sql="/tmp/insert_missing_cards.sql"
: > "$sql"

while IFS= read -r f; do
  [ -n "$f" ] || continue
  key="cards/$f"
  title="${f%.mp4}"
  id="mc_auto_${title}"
  echo "insert into \"MusicCard\" (id, title, \"videoKey\", \"videoUrl\", \"createdAt\", \"updatedAt\") values ('$id', '$title', '$key', '$CF_R2_PUBLIC_BASE/$key', now(), now()) on conflict (id) do nothing;" >> "$sql"
done < /tmp/missing_videos.txt

docker exec -i lifeos-postgres psql -U postgres -d lifeos < "$sql"

docker exec lifeos-postgres psql -U postgres -d lifeos -c \
"select count(*) as total_cards from \"MusicCard\";"
