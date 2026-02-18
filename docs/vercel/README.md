# Vercel deploy (apps/web)

## Prerequisites
- Node + pnpm installed
- Vercel CLI installed and logged in:
  - `vercel login`

## One-time: link Vercel project
From repo root:
- `scripts/vercel/deploy-web.sh`
Follow prompts to select scope and link the existing/new project.
After linked, Vercel will remember the project for this repo.

## Environment variables (Production)
Set these in Vercel Project Settings → Environment Variables (Production):

- `DATABASE_URL` = Postgres connection string for production
- `NEXTAUTH_URL` = `https://<YOUR_VERCEL_DOMAIN>`
- `NEXTAUTH_SECRET` = a long random secret (keep private)

Notes:
- Do NOT commit `.env.local` or any production secrets.
- `.env.example` is allowed for documenting variable names only.

## Deploy
From repo root:
- `./scripts/vercel/deploy-web.sh`

## Verify
- Confirm app loads on `NEXTAUTH_URL`
- Smoke test `/ssot/music`
