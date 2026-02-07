#!/usr/bin/env bash
set -euo pipefail

docker start lifeos-postgres >/dev/null 2>&1 || true

echo "[1/3] Backfill timelineIndex from videoKey (cards/<n>*.mp4)"
docker exec lifeos-postgres psql -U postgres -d lifeos -c \
"update \"MusicCard\"
 set \"timelineIndex\" = cast(substring(regexp_replace(coalesce(\"videoKey\",''), '^cards/', '') from '^[0-9]+') as int),
     \"updatedAt\" = now()
 where \"timelineIndex\" is null
   and coalesce(\"videoKey\",'') ~ '^cards/[0-9]';"

echo "[2/3] Sync MusicCard.title from MusicCrownItem by timelineIndex"
docker exec lifeos-postgres psql -U postgres -d lifeos -c \
"update \"MusicCard\" c
 set title = i.title,
     \"updatedAt\" = now()
 from \"MusicCrownItem\" i
 where c.\"timelineIndex\" = i.\"timelineIndex\";"

echo "[3/3] Report cards that still cannot be matched"
docker exec lifeos-postgres psql -U postgres -d lifeos -c \
"select c.id, c.\"timelineIndex\", c.title, c.\"videoKey\"
 from \"MusicCard\" c
 left join \"MusicCrownItem\" i on i.\"timelineIndex\" = c.\"timelineIndex\"
 where c.\"timelineIndex\" is null or i.\"timelineIndex\" is null
 order by c.\"timelineIndex\" asc nulls last, c.\"videoKey\" asc;"

echo "DONE"
