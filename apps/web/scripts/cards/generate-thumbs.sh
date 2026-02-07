#!/usr/bin/env bash
set -euo pipefail

: "${CF_R2_PUBLIC_BASE:?set CF_R2_PUBLIC_BASE}"
: "${CF_R2_ENDPOINT:?set CF_R2_ENDPOINT}"
: "${R2_BUCKET:?set R2_BUCKET}"
: "${AWS_PROFILE:?set AWS_PROFILE}"

tmpdir="$(mktemp -d)"
echo "tmpdir=$tmpdir"

# Ensure DB container is up (no-op if already running)
docker start lifeos-postgres >/dev/null 2>&1 || true

# Build list of cards missing thumbnails
docker exec lifeos-postgres psql -U postgres -d lifeos -t -A -F $'\t' -c \
"select id, \"videoKey\" from \"MusicCard\"
 where coalesce(\"thumbKey\",'')='' and coalesce(\"thumbUrl\",'')=''
   and coalesce(\"videoKey\",'') like 'cards/%.mp4'
 order by \"createdAt\" asc;" \
> /tmp/no_thumb.tsv

echo "to_generate=$(wc -l < /tmp/no_thumb.tsv)"

# Generate + upload + update DB (do not consume stdin inside loop)
while IFS=$'\t' read -r id videoKey; do
  [ -n "${id:-}" ] || continue

  jpgKey="${videoKey%.mp4}.jpg"
  src="${CF_R2_PUBLIC_BASE}/${videoKey}"
  out="${tmpdir}/${id}.jpg"

  echo "thumb: $id | $videoKey -> $jpgKey"

  if ffmpeg -y -ss 00:00:01 -i "$src" -frames:v 1 -q:v 2 -update 1 "$out" </dev/null >/dev/null 2>&1 \
    && aws --profile "$AWS_PROFILE" --endpoint-url "$CF_R2_ENDPOINT" s3 cp "$out" "s3://${R2_BUCKET}/${jpgKey}" --only-show-errors </dev/null \
    && docker exec lifeos-postgres psql -U postgres -d lifeos -c \
      "update \"MusicCard\"
       set \"thumbKey\"='${jpgKey}',
           \"thumbUrl\"='${CF_R2_PUBLIC_BASE}/${jpgKey}',
           \"updatedAt\"=now()
       where id='${id}';" >/dev/null
  then
    echo "OK: $id"
  else
    echo "FAIL: $id | $videoKey"
  fi
done < /tmp/no_thumb.tsv

docker exec lifeos-postgres psql -U postgres -d lifeos -c \
"select count(*) as total_cards,
        count(*) filter (where coalesce(\"thumbKey\",'')<>'' or coalesce(\"thumbUrl\",'')<>'') as with_thumb,
        count(*) filter (where coalesce(\"thumbKey\",'')='' and coalesce(\"thumbUrl\",'')='') as no_thumb
 from \"MusicCard\";"
