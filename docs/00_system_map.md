# Life OS — System Map (Mother System + Modules)

This document is a living overview of the Life OS architecture: core layers, module map, and phased roadmap.
Status reflects repo reality as of the latest commits (Phase 1 in progress).

---

## 0) Repo Structure (High Level)

- `apps/web/`
  - Next.js web app (UI + API routes)
  - Prisma schema, migrations, seed scripts live here
- `ssot/`
  - `imports/` raw imports (xlsx, etc.)
  - `data/` normalized JSON (version-controlled SSOT)
- `docs/`
  - Architecture, environment setup, deployment, security, troubleshooting
- `modules/` (legacy skeleton / paused)
  - Prior skeleton folders kept for reference (not active)

---

## 1) Mother System: Core Layers

### 1.1 SSOT Layer (Single Source of Truth)
Purpose:
- Keep normalized, validated, version-controlled data in `ssot/data/*`
- Keep raw import artifacts in `ssot/imports/*`

Current:
- Music SSOT: events/items/pending (with `pending_id`)
- Finance SSOT: payroll slips/items + withholding certificates

Tooling:
- `pnpm ssot:validate`
- `pnpm finance:validate`

### 1.2 DB Layer (Operational Data)
Purpose:
- Provide queryable, editable storage for UI operations (CRUD)
- Seed from SSOT when needed

Current:
- Prisma 7 + Postgres + adapter-pg
- Seed pipeline works for Music + Finance

### 1.3 Web App Layer (UI)
Purpose:
- Human-friendly views over SSOT/DB
- Incrementally add CRUD features with minimal risk

Current:
- `/ssot/music` tabs:
  - pending + items read from DB
  - reason editable (inline save)
- `/` shows SSOT status

### 1.4 API Layer
Purpose:
- Route handlers for minimal CRUD without a separate backend

Current:
- `PATCH /api/ssot/music/pending/[pendingId]/reason`
- `PATCH /api/ssot/music/items/[timelineIndex]/reason`

### 1.5 Auth / Permission (Phase 2)
Purpose:
- Login + role control
- Module-level access: private / shared / multi-user

Planned:
- User table
- Role: admin/user
- Basic authorization for write APIs

### 1.6 Audit Log (Phase 2)
Purpose:
- Record who changed what, when (future multi-user support)

Planned minimal schema:
- `AuditLog`
  - `id` (uuid)
  - `entityType` (e.g., `music_pending`, `music_item`)
  - `entityId` (string: pendingId or timelineIndex)
  - `action` (e.g., `update_reason`)
  - `before` (json)
  - `after` (json)
  - `actorUserId` (nullable until auth)
  - `createdAt`

---

## 2) Modules (Child Systems)

### A) Music — Crown Song System (Active)
Scope:
- Events: crown sessions
- Items: already crowned songs (timeline-based)
- Pending: waiting list (with stable `pending_id`)
- Fields include `reason` and notes; editable via UI

Current:
- SSOT archived + normalized JSON
- Seeded into DB
- UI read + inline edit reason for pending/items

Planned next:
- Edit mode UX (read-only + per-row Edit button)
- Add/create/delete via UI (Phase 2)
- Media attachments (crown card videos/thumbnails) (future)

### B) Finance — Payroll / Bonus / Withholding (Active SSOT)
Scope:
- Payroll slips
- Payroll items (bonus etc.)
- Withholding certificates

Current:
- SSOT imports recorded + normalized JSON
- Validation scripts exist
- Seed pipeline exists (DB side)

Planned next:
- UI views for finance data
- CRUD gated by auth (Phase 2)

### C) Travel — Registration + Album (Planned)
Scope:
- LINE Bot registration parsing
- Admin panel: payment status, roster
- Album site: GitHub Pages + image hosting (or R2)

### D) E-commerce (Planned Skeleton)
Scope:
- Catalog, cart, orders
- Payment integration deferred (Phase 3+)

### E) Warehouse / Crawlers (Planned)
Scope:
- TW stock crawler + analysis
- Scheduling + storage strategy

### F) Astrology (Planned)
Scope:
- Charts (Zi Wei, Ba Zi, etc.)
- Structured records + reports

### G) Learning (Planned)
Scope:
- Notes / tasks / review

### H) AI Assistant (Phase 2+)
Scope:
- Voice/text to structured updates
- Query + summarize personal DB
- Requires auth + audit boundaries

---

## 3) Roadmap (Phases)

### Phase 1 — SSOT → DB → UI Read/Write (MVP)
Goal:
- Data is safe, validated, and editable for key fields

Done:
- Music pending/items: DB read + reason editable
- Finance: SSOT + validate + seed pipeline

Next:
- Items/pending UX: per-row Edit button (reduce mis-edits)
- Optional: events tab read from DB (if needed)

### Phase 2 — Secure Remote Usage
Goal:
- Use from anywhere with protection + traceability

Includes:
- Auth + permissions
- Audit log for all write actions
- UI create/delete + safer forms

### Phase 3 — Expand Modules
Goal:
- Travel/album, e-commerce, warehouse, astrology, learning, assistant

---

## 4) Operational Notes

- SSOT is the archival truth; DB is the operational layer for UI edits.
- For safety, write APIs should be authenticated once Phase 2 begins.
- Before making repo public or deploying for others:
  - security pass for secrets/.env/API keys and sensitive data
  - rotate keys if exposed
  - URL-only is not security

