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

get_duration() {
  local src="$1"
  ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$src" 2>/dev/null || true
}

# Extract 1 frame at time t and compute scores:
# - YAVG: brightness
# - YLOW: fraction of low-luma pixels (proxy for black/near-black)
# - SHARP: laplacian variance proxy using edgedetect + signalstats (cheap-ish)
# Prints: "<score>\t<outpath>" where score combines these terms.
extract_with_score() {
  local src="$1"
  local t="$2"
  local out="$3"
  local meta="$4"

  : > "$meta"
  if ffmpeg -v error -y -ss "$t" -i "$src" -frames:v 1 \
    -vf "scale=640:-2,format=yuv420p,signalstats,metadata=print:file=${meta}" \
    -q:v 2 -update 1 "$out" </dev/null >/dev/null 2>&1
  then
    local yavg ylow
    yavg="$(grep -Eo 'lavfi\.signalstats\.YAVG=[0-9]+(\.[0-9]+)?' "$meta" | tail -n 1 | cut -d= -f2 || true)"
    ylow="$(grep -Eo 'lavfi\.signalstats\.YLOW=[0-9]+(\.[0-9]+)?' "$meta" | tail -n 1 | cut -d= -f2 || true)"
    [ -n "${yavg:-}" ] || yavg="0"
    [ -n "${ylow:-}" ] || ylow="1"

    # Sharpness proxy: run a second pass on the same timestamp but only metadata
    # Use edgedetect then signalstats; higher YAVG after edgedetect generally means more edges/detail.
    local meta2="${meta}.edges.txt"
    : > "$meta2"
    ffmpeg -v error -y -ss "$t" -i "$src" -frames:v 1 \
      -vf "scale=640:-2,edgedetect,signalstats,metadata=print:file=${meta2}" \
      -f null - </dev/null >/dev/null 2>&1 || true
    local sharp
    sharp="$(grep -Eo 'lavfi\.signalstats\.YAVG=[0-9]+(\.[0-9]+)?' "$meta2" | tail -n 1 | cut -d= -f2 || true)"
    [ -n "${sharp:-}" ] || sharp="0"

    # Combine:
    # - prefer brighter frames (yavg)
    # - penalize near-black frames (ylow close to 1)
    # - prefer more edges/detail (sharp)
    # Tune weights lightly.
    local score
    score="$(awk "BEGIN{
      s = (${yavg}*1.0) + (${sharp}*0.6) - (${ylow}*120.0);
      if (s<0) s=0;
      printf \"%.6f\", s
    }")"

    printf "%s\t%s\n" "$score" "$out"
  else
    return 1
  fi
}

pick_best_thumb() {
  local src="$1"
  local id="$2"
  local best_out="$3"

  local dur
  dur="$(get_duration "$src")"
  if [ -z "${dur:-}" ]; then dur="0"; fi

  local candidates=()
  if awk "BEGIN{exit !(${dur} > 0)}"; then
    # spread points
    candidates+=("$(awk "BEGIN{printf \"%.3f\", ${dur}*0.12}")")
    candidates+=("$(awk "BEGIN{printf \"%.3f\", ${dur}*0.28}")")
    candidates+=("$(awk "BEGIN{printf \"%.3f\", ${dur}*0.44}")")
    candidates+=("$(awk "BEGIN{printf \"%.3f\", ${dur}*0.60}")")
    candidates+=("$(awk "BEGIN{printf \"%.3f\", ${dur}*0.76}")")
    candidates+=("$(awk "BEGIN{printf \"%.3f\", ${dur}*0.88}")")
    # tail points (but not only tail)
    candidates+=("$(awk "BEGIN{t=${dur}-180; if(t<1)t=1; printf \"%.3f\", t}")")
    candidates+=("$(awk "BEGIN{t=${dur}-90;  if(t<1)t=1; printf \"%.3f\", t}")")
    candidates+=("$(awk "BEGIN{t=${dur}-45;  if(t<1)t=1; printf \"%.3f\", t}")")
    candidates+=("$(awk "BEGIN{t=${dur}-15;  if(t<1)t=1; printf \"%.3f\", t}")")
  else
    candidates=("0.8" "1.6" "2.6" "3.8" "5.2" "6.8")
  fi

  local best_s="-1"
  local best_path=""

  for t in "${candidates[@]}"; do
    if awk "BEGIN{exit !(${dur} > 0 && ${t}+0.2 > ${dur})}"; then
      continue
    fi

    local out="${tmpdir}/${id}.t${t}.jpg"
    local meta="${tmpdir}/${id}.t${t}.meta.txt"
    local scored
    if scored="$(extract_with_score "$src" "$t" "$out" "$meta" 2>/dev/null)"; then
      local score path
      score="$(printf "%s" "$scored" | cut -f1)"
      path="$(printf "%s" "$scored" | cut -f2)"

      if awk "BEGIN{exit !(${score} > ${best_s})}"; then
        best_s="$score"
        best_path="$path"
      fi
    fi
  done

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

  echo "thumb(v3): $id | $videoKey -> $jpgKey"

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
