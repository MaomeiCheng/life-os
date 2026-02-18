#!/usr/bin/env bash
set -euo pipefail

: "${CF_R2_PUBLIC_BASE:?set CF_R2_PUBLIC_BASE}"
: "${CF_R2_ENDPOINT:?set CF_R2_ENDPOINT}"
: "${R2_BUCKET:?set R2_BUCKET}"
: "${AWS_PROFILE:?set AWS_PROFILE}"

# Options
# FORCE=1  -> regenerate even if thumb exists
# LIMIT=N  -> only process first N rows
FORCE="${FORCE:-0}"
LIMIT="${LIMIT:-0}"

tmpdir="$(mktemp -d)"
echo "tmpdir=$tmpdir"

# Ensure DB container is up (no-op if already running)
docker start lifeos-postgres >/dev/null 2>&1 || true

# Build list of cards to process
if [ "$FORCE" = "1" ]; then
  docker exec lifeos-postgres psql -U postgres -d lifeos -t -A -F $'\t' -c "select id, \"videoKey\" from \"MusicCard\" where coalesce(\"videoKey\",'') like 'cards/%.mp4' order by \"createdAt\" asc;" > /tmp/no_thumb.tsv
else
  docker exec lifeos-postgres psql -U postgres -d lifeos -t -A -F $'\t' -c "select id, \"videoKey\" from \"MusicCard\" where coalesce(\"thumbKey\",'')='' and coalesce(\"thumbUrl\",'')='' and coalesce(\"videoKey\",'') like 'cards/%.mp4' order by \"createdAt\" asc;" > /tmp/no_thumb.tsv
fi

if [ "$LIMIT" != "0" ]; then
  head -n "$LIMIT" /tmp/no_thumb.tsv > /tmp/no_thumb.limited.tsv
  mv /tmp/no_thumb.limited.tsv /tmp/no_thumb.tsv
fi

echo "to_generate=$(wc -l < /tmp/no_thumb.tsv)"

# Get duration (seconds) from remote URL
get_duration() {
  local src="$1"
  ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$src" 2>/dev/null || true
}

# Extract 1 frame at time t, also compute YAVG (brightness) via signalstats
# Prints: "<yavg>\t<outpath>" on success, empty on failure
extract_with_score() {
  local src="$1"
  local t="$2"
  local out="$3"
  local meta="$4"

  : > "$meta"
  if ffmpeg -v error -y -ss "$t" -i "$src" -frames:v 1 \
    -vf "scale=480:-2,signalstats,metadata=print:file=${meta}" \
    -q:v 2 -update 1 "$out" </dev/null >/dev/null 2>&1
  then
    local yavg
    yavg="$(grep -Eo 'lavfi\.signalstats\.YAVG=[0-9]+(\.[0-9]+)?' "$meta" | tail -n 1 | cut -d= -f2 || true)"
    [ -n "${yavg:-}" ] || yavg="0"
    printf "%s\t%s\n" "$yavg" "$out"
  else
    return 1
  fi
}

# Choose best thumbnail by trying multiple timestamps and picking max YAVG
pick_best_thumb() {
  local src="$1"
  local id="$2"
  local best_out="$3"

  local dur
  dur="$(get_duration "$src")"
  if [ -z "${dur:-}" ]; then dur="0"; fi
  # duration-aware candidates: spread + tail (often shows title/artist)
  # Note: when duration unknown (dur=0), we fall back to the old fixed seconds list.
  local candidates=()
  if awk "BEGIN{exit !(${dur} > 0)}"; then
    # spread points (percent-based)
    candidates+=("$(awk "BEGIN{printf \"%.3f\", ${dur}*0.10}")")
    candidates+=("$(awk "BEGIN{printf \"%.3f\", ${dur}*0.25}")")
    candidates+=("$(awk "BEGIN{printf \"%.3f\", ${dur}*0.40}")")
    candidates+=("$(awk "BEGIN{printf \"%.3f\", ${dur}*0.55}")")
    candidates+=("$(awk "BEGIN{printf \"%.3f\", ${dur}*0.70}")")
    candidates+=("$(awk "BEGIN{printf \"%.3f\", ${dur}*0.85}")")
    # tail points (prefer end cards)
    candidates+=("$(awk "BEGIN{t=${dur}-180; if(t<1)t=1; printf \"%.3f\", t}")")
    candidates+=("$(awk "BEGIN{t=${dur}-120; if(t<1)t=1; printf \"%.3f\", t}")")
    candidates+=("$(awk "BEGIN{t=${dur}-60;  if(t<1)t=1; printf \"%.3f\", t}")")
    candidates+=("$(awk "BEGIN{t=${dur}-30;  if(t<1)t=1; printf \"%.3f\", t}")")
    candidates+=("$(awk "BEGIN{t=${dur}-10;  if(t<1)t=1; printf \"%.3f\", t}")")
    candidates+=("$(awk "BEGIN{t=${dur}-5;   if(t<1)t=1; printf \"%.3f\", t}")")
  else
    candidates=("0.8" "1.2" "1.8" "2.6" "3.6" "4.8" "6.2")
  fi

  local best_y="0"
  local best_path=""

  for t in "${candidates[@]}"; do
    if awk "BEGIN{exit !(${dur} > 0 && ${t}+0.2 > ${dur})}"; then
      continue
    fi

    local out="${tmpdir}/${id}.t${t}.jpg"
    local meta="${tmpdir}/${id}.t${t}.meta.txt"
    local scored
    if scored="$(extract_with_score "$src" "$t" "$out" "$meta" 2>/dev/null)"; then
      local yavg path
      yavg="$(printf "%s" "$scored" | cut -f1)"
      path="$(printf "%s" "$scored" | cut -f2)"

      if awk "BEGIN{exit !(${yavg} > ${best_y})}"; then
        best_y="$yavg"
        best_path="$path"
      fi
    fi
  done

  if [ -z "${best_path:-}" ]; then
    local out="${tmpdir}/${id}.fallback.jpg"
    if ffmpeg -y -ss 00:00:01 -i "$src" -frames:v 1 -vf "scale=480:-2" -q:v 2 -update 1 "$out" </dev/null >/dev/null 2>&1; then
      best_path="$out"
    fi
  fi

  if [ -n "${best_path:-}" ]; then
    cp -f "$best_path" "$best_out"
    return 0
  fi

  return 1
}

while IFS=$'\t' read -r id videoKey; do
  [ -n "${id:-}" ] || continue

  jpgKey="${videoKey%.mp4}.jpg"
  src="${CF_R2_PUBLIC_BASE}/${videoKey}"
  out="${tmpdir}/${id}.jpg"

  echo "thumb(v2): $id | $videoKey -> $jpgKey"

  if pick_best_thumb "$src" "$id" "$out" \
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
