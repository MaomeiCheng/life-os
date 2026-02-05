# Deploy — Cloudflare (DEFAULT v1, step-by-step)

Cloudflare is an alternative path.
Typical options:
- Cloudflare Pages for frontend
- Cloudflare Workers for lightweight APIs

## Pages (frontend)
1. Cloudflare Dashboard -> Pages -> Create a project
2. Connect GitHub repo
3. Build settings:
   - Build command: `pnpm build`
   - Output directory: (TBD; for Next.js this depends on adapter)
4. Set env vars

## Next.js on Cloudflare (important)
Next.js may require a specific adapter/tooling for Cloudflare.
Until stack is finalized, treat Cloudflare as a **future option** unless you confirm compatibility.

## Workers (API)
- Use Workers for small endpoints
- Prefer separate implementation if needed

## Recommendation
Start with Vercel for Next.js; revisit Cloudflare later.
