#!/usr/bin/env bash
set -euo pipefail

README="README.md"
START="<!-- R2_WORKFLOW_START -->"
END="<!-- R2_WORKFLOW_END -->"

BLOCK=$(cat <<'MD'
<!-- R2_WORKFLOW_START -->
### R2 (large mp4 upload + thumbnail)

- Public base URL: https://<your-public-r2-base>
- S3 endpoint: https://<your-r2-endpoint>
- Bucket: <your-bucket>
- AWS profile: lifeos-r2

Upload from Mac (example):
aws --profile lifeos-r2 --endpoint-url https://<your-r2-endpoint> s3 cp "$HOME/Downloads/93750_raw.mp4" "s3://<your-bucket>/cards/93750_raw.mp4"

Generate thumbnail in Codespaces (requires: ffmpeg + awscli + DB running):
docker start lifeos-postgres >/dev/null 2>&1 || true
CF_R2_PUBLIC_BASE="https://<your-public-r2-base>"
CF_R2_ENDPOINT="https://<your-r2-endpoint>"
R2_BUCKET="<your-bucket>"
AWS_PROFILE="lifeos-r2"
MP4_KEY="cards/93750_raw.mp4"
JPG_KEY="cards/93750_raw.jpg"
CARD_ID="mc_test_1"
tmpdir="$(mktemp -d)"
thumb="$tmpdir/thumb.jpg"
ffmpeg -y -ss 00:00:05 -i "${CF_R2_PUBLIC_BASE}/${MP4_KEY}" -frames:v 1 -q:v 2 "$thumb"
aws --profile "$AWS_PROFILE" --endpoint-url "$CF_R2_ENDPOINT" s3 cp "$thumb" "s3://${R2_BUCKET}/${JPG_KEY}"
docker exec -i lifeos-postgres psql -U postgres -d lifeos -c "update \"MusicCard\" set \"thumbUrl\"='${CF_R2_PUBLIC_BASE}/${JPG_KEY}', \"updatedAt\"=now() where id='${CARD_ID}';"
<!-- R2_WORKFLOW_END -->
MD
)

python3 - <<PY
from pathlib import Path
import re

readme = Path("$README")
s = readme.read_text(encoding="utf-8") if readme.exists() else ""

start = re.escape("$START")
end = re.escape("$END")
pattern = re.compile(rf"{start}.*?{end}", re.DOTALL)

block = """$BLOCK""".rstrip() + "\n"

if pattern.search(s):
    s2 = pattern.sub(block.rstrip("\n"), s)
else:
    s2 = s.rstrip() + "\n\n" + block

readme.write_text(s2.rstrip() + "\n", encoding="utf-8")
print("UPDATED_R2_BLOCK")
PY
