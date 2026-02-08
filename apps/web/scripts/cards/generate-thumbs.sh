#!/usr/bin/env bash
set -euo pipefail

# Canonical entrypoint for thumbnail generation (v3 default).
# Usage:
#   bash scripts/cards/generate-thumbs.sh
# Options:
#   FORCE=1  -> regenerate even if thumb exists
#   LIMIT=N  -> only process first N rows

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
cd "$ROOT_DIR/apps/web" || exit 1

# Source-safe env loader (exports CF_R2_* / R2_BUCKET / AWS_PROFILE)
. ./scripts/cards/load-env.sh >/dev/null

exec bash ./scripts/cards/generate-thumbs-v3.sh
