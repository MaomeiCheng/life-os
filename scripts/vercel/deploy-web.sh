#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT" || exit 1

# Guard: required tools
command -v vercel >/dev/null 2>&1 || { echo "Missing: vercel CLI"; exit 1; }
command -v pnpm  >/dev/null 2>&1 || { echo "Missing: pnpm"; exit 1; }

# Guard: avoid running from wrong place
[ -d "apps/web" ] || { echo "Missing apps/web"; exit 1; }

echo "== Build (apps/web) =="
cd "$ROOT/apps/web" || exit 1
pnpm -s install
pnpm -s build

echo
echo "== Deploy (Vercel) =="
echo "If first time on this machine, run: vercel login"
echo "Then follow prompts to link project (once)."
vercel --prod
