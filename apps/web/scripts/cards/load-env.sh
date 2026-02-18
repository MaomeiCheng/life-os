# Source-safe env loader for scripts/cards
# Usage:
#   . scripts/cards/load-env.sh
# It will export CF_R2_* / R2_BUCKET / AWS_PROFILE into current shell.

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
envfile="${here}/.env.local"

if [ ! -f "$envfile" ]; then
  echo "Missing: $envfile" >&2
  return 1 2>/dev/null || exit 1
fi

set -a
# shellcheck disable=SC1090
. "$envfile"
set +a

echo "Loaded into current shell: CF_R2_PUBLIC_BASE CF_R2_ENDPOINT R2_BUCKET AWS_PROFILE"
