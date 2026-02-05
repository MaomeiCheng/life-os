# System Architecture — Mother System + Subsystems (DEFAULT v1, DRAFT)

## Goals
- **Single Source of Truth (SSOT)** is the authoritative definition of data and rules.
- **Modular subsystems**: each module can evolve independently.
- **Backup-first**: docs and decisions are captured early to prevent loss.
- **Reproducible environment + deployment**: predictable local and CI builds.

## Mother System vs Subsystems
### Mother System (Core)
Responsibilities:
- Identity / tenant concept (optional; single-user first)
- SSOT validation + exports pipeline
- Shared UI shell, navigation, layout
- Shared libraries: date/time, formatting, logging, error handling
- Infrastructure adapters: DB, storage, external APIs

### Subsystems (Modules)
Examples (not all must be implemented initially):
- Notes / Knowledge
- Tasks / Habit tracking
- Finance / Ledger
- Media / Albums
- Travel / Events
- Admin / Settings

Each module should contain:
- Domain models (module-specific)
- SSOT mappings (if it uses SSOT entities)
- UI pages/components
- API routes (if needed)
- Tests (optional initially)

## High-Level Components (default)
1. **Web App (Next.js)**
   - UI + Server Components
   - Route Handlers as API endpoints (initially)
2. **SSOT Layer**
   - `ssot/schema`, `ssot/data`, `ssot/validators`, `ssot/exports`
3. **Data Layer**
   - PostgreSQL (local via Docker), Prisma optional placeholder
4. **Automation (optional)**
   - Cron tasks / workers (Render or other)
5. **Observability (minimal)**
   - Logs via platform
   - Error tracking (TBD later)

## Data Flow (default)
- UI -> (server actions / route handlers) -> DB
- SSOT -> validation -> exports -> seed/init -> DB

## Quality Gates (minimum)
- `pnpm lint` (placeholder)
- `pnpm build`
- `pnpm ssot:validate`
- Smoke test: app boots and a basic page renders

## Non-goals (for now)
- Payments / ecommerce
- Microservices
- Multi-region HA
