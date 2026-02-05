# Troubleshooting (DEFAULT v1)

## Node / pnpm
- Confirm Node 20:
```bash
node -v
```
- Confirm pnpm:
```bash
pnpm -v
```

## Build fails on Vercel but works locally
- Ensure Node 20 in Vercel settings (or `engines` in package.json).
- Ensure build command uses pnpm and lockfile exists.

## Env missing
- Compare `.env.example` with platform env vars.
