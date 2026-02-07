# Life OS（多功能管理系統）系統總覽

## 1) Core（核心層）

### SSOT（資料單一真相）
- `ssot/imports`：原始匯入（xlsx/json）
- `ssot/data`：標準化 JSON（可版控、可驗證）
- `pnpm ssot:validate`：資料結構與唯一性檢查

原則：
- **SSOT 是可重建 DB 的來源**（可追溯、可驗證、可版本控制）

### DB（可操作資料庫）
- Prisma schema + migrations
- seed：把 SSOT（或匯入資料）灌入 DB

原則：
- **DB 是可互動、可編輯、可審計的操作層**
- DB 遇到需要重建時，應可由 SSOT/seed 還原基礎資料

### Web App（UI）
- Next.js：`apps/web`
- 路由：`/ssot/*`（目前主要入口）

### API（最小 CRUD）
- Next Route Handlers：`/api/...`
- 目前已做：items/pending 的欄位更新（PATCH）

### Auth / Permission（Phase 2）
- 使用者、角色（admin/user）
- 模組與資料存取控制（私人/分享/多人協作）

### Audit Log（已啟動，Phase 2 強化）
- 已有：`AuditLog` model + 寫入紀錄 + UI tab
- Phase 2 強化：加上 userId / ip / before-after 更完整策略、權限稽核

---

## 2) Modules（子系統模組）

### A) Music｜冠歌系統（已啟動）
已實作：
- 冠歌事件（events）：目前仍讀 SSOT JSON
- 已冠歌清單（items）：DB，可編輯（備註/原因欄位）
- 待冠歌清單（pending）：DB，可編輯（備註/原因欄位）
- 冠歌卡（cards）：DB + R2 影片/縮圖（key 存 DB，不依賴固定 URL）
- Audit：對關鍵更新寫入 AuditLog

Media（影片/縮圖）：
- 儲存：Cloudflare R2
- DB：存 `videoKey` / `thumbKey`（必要時可保留舊 URL 欄位作相容）
- URL：由 `PUBLIC_R2_BASE_URL + key` 組合得到
- Thumbnail：ffmpeg 生成後上傳到 R2

後續（待做）：
- Cards 與 items/pending 對應規則（例如 timelineIndex、pendingId、同歌多張卡）
- 上傳冠歌卡（影片/縮圖）功能（in-app）
- UI 美化與手機操作體驗（feed / swipe / preview）
- 權限：私人/分享/只給某些人看

### B) Finance｜財務/記帳/稅務（SSOT 已啟動）
- 目標：薪資/獎金/扣繳等資料結構化與報表
- 後續：收支記帳、分類、帳戶、匯入銀行資料（視需求）

### C) Travel｜旅遊報名與相簿（規劃中）
- LINE Bot：群組報名資訊自動統計
- 管理端：繳費狀態、名單、對帳
- 相簿：GitHub Pages + 圖床／或 R2（視權限與容量）

### D) E-commerce｜電商（骨架規劃中）
- 商品、訂單、購物車
- 付款（金流）Phase 3 之後再接

### E) Warehouse｜資料倉儲/爬蟲分析（規劃中）
- 台股爬蟲、指標計算、策略回測
- 排程、快取、資料入倉

### F) Astrology｜命理排盤（規劃中）
- 紫微/八字等資料結構與查詢、報表

### G) Learning｜學習系統（規劃中）
- 課程/筆記/待辦/複習（spaced repetition）

### H) AI Assistant｜AI 小助手（Phase 2）
- 自然語言新增/修改資料（NL → 結構化）
- 問答（以 SSOT/DB 資料為上下文）
- 前置：Auth + 權限邊界 + 稽核策略

---

## 3) 建議落地順序（依目前狀態）

1. Phase 1：SSOT → DB → UI 可讀可改（Music 已達成多數）
2. Phase 2：Auth + 權限 + Audit 強化 + UI 新增/刪除 + 上傳功能
3. Phase 3：旅行/相簿 → 電商/倉儲等擴充

---

## 4) 安全提醒（重要）
- 「只知道網址才能看」不等於安全（網址可被轉傳/外洩）。
- 在沒有 Auth/權限/資料檢查前，不要公開含私人資料的環境。
