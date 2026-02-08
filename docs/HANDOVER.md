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
