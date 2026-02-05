# Deploy — Render (DEFAULT v1, step-by-step)

Render is optional in the default plan.
Use it when you need:
- a separate API service/worker
- managed Postgres
- background jobs

## A) Managed Postgres (optional)
1. Create a new PostgreSQL instance on Render
2. Copy the connection string
3. Set it as `DATABASE_URL` in your service env vars

## B) Web Service (optional for API/worker)
1. New -> Web Service
2. Connect GitHub repo
3. Runtime: Node
4. Build Command: `pnpm install && pnpm build`
5. Start Command: (TBD by service type)
   - API example: `pnpm start`
6. Set env vars (copy from `.env.example`)

## C) Background jobs (optional)
- Use Render Cron Jobs / Background Worker (depending on plan)
- Ensure SSOT validation is part of build or CI

## Notes
- If you deploy only the Next.js web app, Vercel is simpler.
