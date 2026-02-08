# HANDOVER（入口索引）

> 每次開新對話/交接：先看這份，再按順序看必讀文件。

## 目前狀態（SSOT）
### TODO（命名/資料語意）
- Music items/pending 的「備註」目前 DB/API 欄位名仍為 `reason`（UI 顯示為備註）。正式資料庫/對外 schema 時建議 rename 為 `note`/`remark`（並規劃 migration + API 路徑/欄位相容）。

- Repo root: /workspaces/life-os
- Web app: /workspaces/life-os/apps/web
- ORM/DB: Prisma + Postgres
- Prisma schema: /workspaces/life-os/apps/web/prisma/schema.prisma
- DB client: /workspaces/life-os/apps/web/src/lib/db.ts
- Env files (filenames only):
  - /workspaces/life-os/apps/web/.env
  - /workspaces/life-os/apps/web/.env.local
  - /workspaces/life-os/.env.example

## 交接必讀（依序）
1. README.md
2. docs/ops-chat-handover.md
3. apps/web/README.md（若不存在就用：apps/web/package.json + apps/web/prisma/schema.prisma + apps/web/src/lib/db.ts 代替）

## 目前里程碑（單一）
- 自動從影片挑封面/縮圖（產生更可辨識的 thumb）

## 新對話交接最小輸入
- repo 名稱/連結
- 最新 commit
- 單一里程碑（你現在要做的下一件事）

## First actions (every new session)
- Read: docs/ops-chat-handover.md (Start/Stop + paste safety)
- Start DB if needed: `docker start lifeos-postgres >/dev/null 2>&1 || true`
- Start Web if needed: `cd apps/web && pnpm -s dev`

## 變更紀錄（最近）
- `86a968f` docs(security): redact R2 URLs in README + update script
- `486a64e` docs(security): redact R2 endpoints in README
- `f224578` chore(security): ignore env files + fix thumbs entrypoint
- `b60911e` docs(handover): note reason->note rename plan for music remarks

## Shell 安全寫法（避免引號/ heredoc 在 CI / bash -lc 被截斷）
- 不要在 `bash -lc '...'` 裡面塞多層引號或 heredoc；容易被 shell 提前結束，導致「跳進互動/語法錯誤」。
- 建議做法：先把腳本/程式寫入檔案（`cat > file <<'EOF' ... EOF`），再 `bash file` 或 `python3 file.py` 執行。
- 一律使用 `set -euo pipefail`，並在需要的地方加上 `|| true` 或明確的錯誤處理，避免半途中斷造成不一致狀態。

## 2026-02-08 Security hardening (env + R2 + docs)
- Env files are now ignored and untracked:
  - apps/web/.env, apps/web/.env.local, apps/web/scripts/cards/.env.local
- Redacted R2 details in tracked docs/scripts:
  - README.md + scripts/update-readme-r2.sh now use placeholders:
    - CF_R2_PUBLIC_BASE="https://<your-public-r2-base>"
    - CF_R2_ENDPOINT="https://<your-r2-endpoint>"
    - R2_BUCKET="<your-bucket>"
- Redacted DB example credentials:
  - .env.example DATABASE_URL now uses placeholders (<user>:<password>)
- Safe shell pattern noted (avoid interactive / broken quoting): prefer writing to files (or single-quoted heredocs) and then executing.
- Commits: f224578..6274013

## 2026-02-08 (Security hardening)
- Ignored env files to prevent accidental commits:
  - apps/web/.env, apps/web/.env.local, apps/web/scripts/cards/.env.local
- Untracked any previously-tracked env files (git rm --cached) and verified ignore rules apply.
- Redacted Cloudflare R2 public base / endpoint / bucket name from README + scripts/update-readme-r2.sh (placeholders kept).
- Redacted example DB creds in .env.example (placeholders kept).
- Updated scripts/cards/generate-thumbs.sh entrypoint fixes.
Commits (main):
- f224578 chore(security): ignore env files + fix thumbs entrypoint
- 486a64e docs(security): redact R2 endpoints in README
- 86a968f docs(security): redact R2 URLs in README + update script
- 546e10c docs(handover): record recent security + scripts changes
- 2e7b82e docs(security): redact R2 bucket name in docs/scripts
- d456622 docs(security): redact R2 bucket name in update-readme script
- 749ab70 docs(handover): note safe shell quoting pattern
- 6274013 docs(security): redact example DB credentials
- 5c5d6b1 docs(handover): record 2026-02-08 security hardening

## 2026-02-08 (Late note)
- Time: 23:42 Asia/Taipei (Sunday); approaching Monday.
- Status: security hardening + placeholder scans completed; no non-placeholder CF_R2_* / R2_BUCKET found in tracked files.
- Note: If past midnight, follow nightly wrap-up checklist (stop web/DB, git status, update HANDOVER with progress/TODO, note next-start commands).

## 2026-02-08 (Late UI + DB)
- Fixed UI: icon-only open button for cards.
- Dev server initially hit Prisma ECONNREFUSED (DB not reachable); resolved by starting `lifeos-postgres`.
- Verified `/ssot/music` renders normally after DB up.
- Commit: 34cb6be ui(cards): icon-only open button


## Next start (dev)
```bash
# in Codespaces
cd /workspaces/life-os/apps/web || exit 1
docker start lifeos-postgres >/dev/null 2>&1 || true
pnpm -s dev
# open: http://localhost:3000/ssot/music?tab=crownCards
