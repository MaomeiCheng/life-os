#!/usr/bin/env bash
set -euo pipefail

: "${CF_R2_PUBLIC_BASE:?set CF_R2_PUBLIC_BASE}"
: "${CF_R2_ENDPOINT:?set CF_R2_ENDPOINT}"
: "${R2_BUCKET:?set R2_BUCKET}"
: "${AWS_PROFILE:?set AWS_PROFILE}"

# Prefer explicit DATABASE_URL; fallback to local secret file you already use
if [[ -z "${DATABASE_URL:-}" ]]; then
  if [[ -f ".secrets.DATABASE_URL.production.txt" ]]; then
    export DATABASE_URL="$(tr -d '\n' < ".secrets.DATABASE_URL.production.txt")"
  fi
fi
: "${DATABASE_URL:?set DATABASE_URL or create .secrets.DATABASE_URL.production.txt}"

# Ensure sslmode=require (Neon pooler + psql on mac often needs this)
if [[ "$DATABASE_URL" == *\?* ]]; then
  DB_URL="${DATABASE_URL}&sslmode=require"
else
  DB_URL="${DATABASE_URL}?sslmode=require"
fi

tmp="${TMPDIR:-/tmp}"
r2_videos="$tmp/r2_videos.txt"
db_videos="$tmp/db_videos.txt"
missing="$tmp/missing_videos.txt"
sql="$tmp/insert_missing_cards.sql"

# 1) Fetch mp4 list from R2
aws --profile "$AWS_PROFILE" --endpoint-url "$CF_R2_ENDPOINT" s3 ls "s3://${R2_BUCKET}/cards/" \
| awk '$4 ~ /\.mp4$/ {print $4}' | sort -u > "$r2_videos"

# 2) Fetch existing mp4 list from Neon DB
psql "$DB_URL" -v ON_ERROR_STOP=1 -t -A -c \
"select regexp_replace(\"videoKey\", '^cards/', '') from \"MusicCard\"
 where \"videoKey\" like 'cards/%.mp4' and \"videoKey\" is not null;" \
| sort -u > "$db_videos"

# 3) Diff: in R2 but not in DB
comm -23 "$r2_videos" "$db_videos" > "$missing"

echo "missing=$(wc -l < "$missing")"

: > "$sql"
while IFS= read -r f; do
  [[ -n "$f" ]] || continue
  key="cards/$f"
  title="${f%.mp4}"
  id="mc_auto_${title}"
  # Escape single quotes for SQL
  esc_title="${title//\'/\'\'}"
  echo "insert into \"MusicCard\" (id, title, \"videoKey\", \"videoUrl\", \"createdAt\", \"updatedAt\")
values ('$id', '$esc_title', '$key', '$CF_R2_PUBLIC_BASE/$key', now(), now())
on conflict (id) do nothing;" >> "$sql"
done < "$missing"

psql "$DB_URL" -v ON_ERROR_STOP=1 -f "$sql"

psql "$DB_URL" -v ON_ERROR_STOP=1 -c \
"select count(*)::int as total_cards from \"MusicCard\";"
