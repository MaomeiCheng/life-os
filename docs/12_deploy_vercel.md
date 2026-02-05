# Deploy — Vercel (DEFAULT v1, step-by-step)

Recommended for the default Next.js app.

## 0) Prerequisites
- Repo on GitHub
- App builds locally: `pnpm build`
- `.env.example` exists

## 1) Import project
1. Go to Vercel Dashboard
2. Add New Project
3. Import the GitHub repo `life-os`

## 2) Configure build
- Framework: Next.js (auto-detect)
- Install Command: `pnpm install`
- Build Command: `pnpm build`
- Output: (auto for Next.js)

## 3) Set runtime version (important)
Pin Node.js to 20:
- Option A: `package.json` engines
- Option B: Vercel Project Settings -> Node.js Version -> 20

## 4) Environment variables
- Copy keys from `.env.example` into Vercel Environment Variables
- Provide values for Production (and Preview if needed)

## 5) Deploy
- Deploy from `main`
- Avoid manual changes; prefer configuration via repo + Vercel settings

## 6) Post-deploy checks
- Open deployed URL
- Confirm home page renders
- Check Vercel logs for runtime errors
