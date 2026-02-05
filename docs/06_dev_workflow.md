# Dev Workflow (DEFAULT v1)

## Branching
- `main`: production-ready
- feature branches: `feat/<topic>`

## Local routine
```bash
git checkout main
git pull
git checkout -b feat/<topic>
pnpm install
pnpm lint
pnpm build
pnpm dev
```

## Definition of Done (per PR)
- `pnpm build` passes
- `pnpm ssot:validate` passes (if exists)
- No secrets committed
- Docs updated if architecture/ops changed

## Suggested scripts (add to package.json)
- `dev`, `build`, `start`
- `lint`, `typecheck`
- `ssot:validate`, `ssot:export`, `ssot:seed`
