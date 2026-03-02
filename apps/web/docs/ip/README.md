# IP Assets Index (SSOT)

This folder is the single source of truth for Joanna IP assets and character specs.

## Structure

- `spec/`
  - Character & pets spec docs (lock proportions / style rules / output rules)
- `cats/`
  - `le-le/` / `yuan-yuan/` / `nian-nian/`
- `joanna/`
  - `canon/` (logo / monogram / headpiece / svg)
  - `band/` (band set assets)

## Canon (Joanna)
- Logo final masters:
  - `joanna/canon/logo_finalMaster_StandardVersion*.png`
- Monogram:
  - `joanna/canon/FINALMASTER_MonogramLockedVersion_v1.png`
- Headpiece:
  - `joanna/canon/Headpiece Master/`
  - `joanna/canon/Joanna_Headpiece_A_InterlockClip_MasterPack/`
- SVG:
  - `joanna/canon/SVG/Joanna_JQ_Master.svg`

## Cats (Master Sets)
- LeLe:
  - `cats/le-le/v1_master/`
- YuanYuan:
  - `cats/yuan-yuan/v1_master/`
- NianNian:
  - `cats/nian-nian/v1_master/` (baby set)

## Versioning rules
- Any identity/style change must bump spec version (e.g. `*_v2`, `*_v3`).
- Keep drafts out of repo. Only final masters + specs are tracked.
