# VS Code Guide (DEFAULT v1)

This guide is written as an **operational checklist**.

## Install
- Install VS Code (stable)

## Recommended Extensions
- ESLint
- Prettier
- Prisma (optional)
- Docker (optional)
- EditorConfig (optional)

## Open workspace
- Open the repo folder: `life-os/`

## Configure formatting (default)
- Use Prettier for TS/JS formatting.
- Enable format on save.

## Suggested workspace settings
This pack includes `.vscode/settings.json` and `.vscode/extensions.json` as a baseline.

## Run tasks
Use Terminal inside VS Code:
```bash
pnpm install
pnpm dev
pnpm build
```

## Debugging (placeholder)
- For Next.js: start dev server and use browser devtools.
- Add `launch.json` later if needed.
