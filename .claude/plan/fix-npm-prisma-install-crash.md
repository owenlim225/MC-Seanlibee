# Implementation Plan: Fix local Prisma install / npm crash

## Task Type

- [ ] Frontend
- [x] Backend / toolchain only (package manager + Prisma CLI alignment)
- [ ] Fullstack

## Problem summary

- Local: `npm add -D prisma` ends with `Cannot read properties of null (reading 'matches')`.
- Vercel: `pnpm install` succeeds; `prisma` + `@prisma/client` @ 6.19.0 present; `postinstall` runs `prisma generate`.

Root expectation: **do not use npm to mutate dependencies** when `package.json` declares `"packageManager": "pnpm@10.33.2"` and `pnpm-lock.yaml` is canonical.

## Technical solution

1. Use **pnpm** for all add/remove/install locally (`pnpm add`, `pnpm install`).
2. If CLI upgrade needed on Windows: `corepack enable` then use pinned pnpm from `packageManager`.
3. If team insists on npm-only: regenerate layout (`rm -rf node_modules`, remove conflicting lockfiles) — **not recommended** vs aligning on pnpm; npm crash may still be npm version bug.

## Implementation steps

1. **Verify current deps** — `package.json` already lists `prisma` under `devDependencies`. No duplicate add needed unless version bump desired (`pnpm add -D prisma@6.19.0`).
2. **Clean local hybrid state** (if user ran npm before): delete `node_modules`, delete `package-lock.json` if created, keep `pnpm-lock.yaml`; run `pnpm install`.
3. **Confirm generate**: `pnpm run db:generate` or rely on `postinstall`.
4. **Optional npm mitigation** (only if must use npm): upgrade npm (`npm -v`), clear cache `npm cache clean --force`, retry — secondary path; primary fix stays pnpm.

## Key files

| File | Operation | Description |
|------|-----------|-------------|
| `package.json` | Read-only unless bump | Already has `prisma`; source of truth for scripts/postinstall |
| `pnpm-lock.yaml` | Keep | Vercel + local must match |
| `package-lock.json` | Delete if present | Signals accidental npm use; conflicts with pnpm |

## Risks and mitigation

| Risk | Mitigation |
|------|------------|
| Mixed npm/pnpm corrupts tree | One PM only; remove stray lockfile |
| `@prisma/client` postinstall warning | Ensure `prisma` devDependency present (already is); run `pnpm install` |

## Multi-model analysis note

Dual Codex/Gemini analyzer/architect passes **not run** (no `codeagent-wrapper` in this agent environment). Plan synthesized from repo facts + npm/pnpm behavior.

## SESSION_ID (for /ccg:execute)

- CODEX_SESSION: N/A (skipped)
- GEMINI_SESSION: N/A (skipped)
