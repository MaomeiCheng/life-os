# Life OS — Docs Overview (DEFAULT v1, DRAFT)

This is a **backup-first** documentation pack using a **default stack** so nothing is lost while implementation has not started.

## Default Stack Assumptions (can change later)
- Frontend: Next.js (App Router) + TypeScript
- Backend: Next.js Route Handlers (API) (initial); optional separate API later
- Runtime: Node.js 20 LTS
- Package manager: pnpm
- Database: PostgreSQL (local via Docker) + Prisma (optional; placeholder)
- SSOT path: `ssot/`
- Auth: None initially (placeholder)
- Hosting (options):
  - Vercel: Web app (recommended default)
  - Render: Optional API/worker & managed Postgres (if needed)
  - Cloudflare: Optional Pages/Workers (alternative path)

## What exists in this pack
- System architecture (mother system + subsystems)
- Codebase structure (frontend/backend/modules)
- Environment setup (Mac M1)
- Tooling + versions checklist
- VS Code operating guide (+ recommended workspace settings)
- Deployment guides (Vercel / Render / Cloudflare)
- Security + troubleshooting + ADR template

## Quick Links
- System Architecture: `docs/01_architecture_system.md`
- App / Repo Architecture: `docs/02_architecture_app.md`
- SSOT: `docs/03_data_ssot.md`
- Setup (Mac M1): `docs/04_environment_setup_mac.md`
- Tooling & Versions: `docs/10_tooling_versions.md`
- VS Code Guide: `docs/11_vscode_guide.md`
- Deployment (index): `docs/07_deployment.md`
  - Vercel: `docs/12_deploy_vercel.md`
  - Render: `docs/13_deploy_render.md`
  - Cloudflare: `docs/14_deploy_cloudflare.md`
