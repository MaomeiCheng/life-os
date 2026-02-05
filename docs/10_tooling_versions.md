# Tooling & Versions (DEFAULT v1)

This is the concrete checklist for the default stack.

## Runtime
- Node.js: **20 LTS**

## Package manager
- pnpm: **latest stable via Corepack**
```bash
corepack enable
corepack prepare pnpm@latest --activate
```

## Optional local infra
- Docker Desktop (Apple Silicon)
- Postgres: via Docker Compose (recommended for local)

## Recommended CLI tools
- Git
- curl (built-in)
- make (built-in or via Xcode tools)

## Verification commands
```bash
git --version
node -v
pnpm -v
docker --version   # optional
```

## Repository files to pin versions (recommended)
- `.nvmrc` with `20`
- `package.json#engines.node` set to `>=20 <21`
- `pnpm-lock.yaml` committed
