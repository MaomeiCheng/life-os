# Environment Setup — macOS (Apple Silicon / M1) (DEFAULT v1)

This guide targets a clean, reproducible setup for the default stack:
- Node 20 LTS + pnpm
- (Optional) Docker Desktop for local Postgres
- VS Code as IDE

## 1) Install prerequisites
### Xcode Command Line Tools
```bash
xcode-select --install
```

### Homebrew
Install via Homebrew official instructions, then verify:
```bash
brew --version
```

### Git
```bash
git --version
```

## 2) Node.js 20 via fnm (recommended)
Install fnm:
```bash
brew install fnm
```
Enable fnm in shell (zsh):
```bash
echo 'eval "$(fnm env --use-on-cd)"' >> ~/.zshrc
source ~/.zshrc
```
Install and use Node 20:
```bash
fnm install 20
fnm use 20
node -v
```

## 3) pnpm
```bash
corepack enable
corepack prepare pnpm@latest --activate
pnpm -v
```

## 4) Docker Desktop (optional, for Postgres)
Install Docker Desktop for Mac (Apple Silicon), then verify:
```bash
docker --version
docker compose version
```

## 5) Clone and bootstrap
```bash
cd ~/dev
git clone <REPO_URL> life-os
cd life-os
pnpm install
```

## 6) Environment variables
Create local env file:
```bash
cp .env.example .env.local
```
Fill values in `.env.local`.

## 7) Run quality gates (placeholders until scripts exist)
```bash
pnpm lint
pnpm build
pnpm ssot:validate
```

## 8) Start dev server
```bash
pnpm dev
```

## Troubleshooting (quick)
- If `pnpm` fails: ensure `corepack enable` and restart terminal.
- If node version mismatch: confirm `node -v` is 20.x.
