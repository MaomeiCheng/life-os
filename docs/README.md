# docs/（入口索引 / SSOT）

這個資料夾的目標：**所有文件各司其職**，避免同一件事散落多處、互相打架。

---

## 文件角色分工（唯一真相規則）

### 1) 交接入口（SSOT Index）
- **docs/HANDOVER.md**
  - 只放：入口索引、最近變更、今日/最近工作紀錄、下一步里程碑
  - 不放：長篇操作細節（操作細節放到 ops）

### 2) 操作手冊（Ops / How-to）
- **docs/ops-chat-handover.md**
  - 只放：啟停（DB/Web）、paste safety、可重跑命令、腳本入口
  - 只放：環境變數檔位置（檔名）、常見錯誤
  - 操作以「可重跑」為原則（提供 FORCE/LIMIT 等參數用法）

### 3) 流程總覽（Workflow）
- **docs/cards-workflow.md**
  - 只放：端到端流程的「高層步驟」與設計約束
  - 不放：太細的指令（細節留在 ops）

### 4) 待辦清單（唯一 TODO）
- **docs/next-steps.md**
  - 只放：TODO/DONE（勾選）與短句描述
  - 規則：若已完成，必須改成 DONE 或改成「下一版升級 TODO」
  - 不放：操作指令，不放大量背景

### 5) 歷史草案（可淘汰/封存）
- **docs/15_next_steps.md**
  - 早期 v1 草案；若已被 next-steps.md 取代，請標記 archived
  - 或移到 `docs/archive/`

---

## Cards / Thumbs / R2 / DB：腳本入口（以 repo 實際路徑為準）
- `apps/web/scripts/cards/load-env.sh`
- `apps/web/scripts/cards/import-from-r2.sh`
- `apps/web/scripts/cards/generate-thumbs-v2.sh`
- `apps/web/scripts/cards/sync-from-crown-items.sh`

---

## 新對話開頭格式（Deploy / UI / Milestone）
當你刻意換新對話，第一句固定包含：
- repo link
- latest commit
- exactly one milestone

---

## 安全（每次部署/公開前必做）
- 檢查：secrets/.env/API keys/R2 keys/敏感資料是否誤入 repo
- 若曾暴露：立刻 rotate
- 「只知道 URL」不是安全手段（仍需 auth/權限/隔離）
