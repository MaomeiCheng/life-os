# Deployment Index (DEFAULT v1)

This repo supports multiple deployment paths. Choose one to start.

## Recommended default path
- Web app on **Vercel**: `docs/12_deploy_vercel.md`

## Optional / future
- API/worker on **Render**: `docs/13_deploy_render.md`
- Cloudflare Pages/Workers alternative: `docs/14_deploy_cloudflare.md`

## Pre-deploy checklist
- Node version pinned (Node 20)
- `pnpm build` succeeds locally
- `.env.example` includes all required keys
- No secrets committed
- SSOT validation integrated in build or CI (recommended)

## Current implementation path
- Next.js app root: `apps/web`
