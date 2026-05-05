# Implementation Plan: Prisma Folder Cleanup and Data Asset Governance

## Task Type
- [ ] Frontend
- [x] Backend
- [ ] Fullstack

## Objective
Reduce clutter in `prisma/` while preserving runtime behavior, CI reliability, and migration integrity.

The plan is intentionally **non-destructive first** and introduces cleanup through gated phases.

## Current-State Summary
- `prisma/seed.ts` directly imports the category JSON files (`bbqs.json`, `burgers.json`, etc.).
- Seed execution is active (`package.json` -> `prisma.seed: tsx prisma/seed.ts`; `db:seed` used in CI and E2E).
- `scripts/check-food-images.mjs` scans all `prisma/*.json`.
- `lib/menu/grouped-taxonomy.ts` drives grouped category mapping used by seed.
- `prisma/unified-menu-taxonomy.json` and `prisma/unified-menu-taxonomy-summary.md` appear to be artifact/document files (not in active runtime seed path).
- `prisma/migrations/**` and `prisma/migrations/migration_lock.toml` are migration-critical.

## Technical Solution
Adopt a two-tier data layout:
1. **Runtime-critical Prisma assets**: schema, migrations, active seed sources.
2. **Derived/artifact/reference assets**: generated taxonomy outputs and documentation.

Execute with phased gates:
- Phase 0: Audit baseline and freeze behavior.
- Phase 1: Introduce clear folder boundaries without behavior changes.
- Phase 2: Wire seed/image checks to explicit source paths.
- Phase 3: Optionally consolidate many source JSON files into canonical dataset(s).
- Phase 4: Archive or move unused artifacts with rollback guarantees.

## Target Folder Model (Proposed)
- `prisma/schema.prisma`
- `prisma/seed.ts`
- `prisma/migrations/**`
- `prisma/data/seed-sources/*.json` (runtime seed inputs)
- `prisma/data/artifacts/*.json` (derived outputs, optional)
- `docs/data/*.md` (human-readable summaries, optional move target)
- `prisma/README.md` (ownership, data contracts, update workflow)

## File Strategy (Keep / Consolidate / Archive)
### Keep (required)
- `prisma/schema.prisma`
- `prisma/seed.ts`
- `prisma/migrations/**`
- `prisma/migrations/migration_lock.toml`
- Category JSON seed sources currently imported by `seed.ts`

### Consolidate (planned)
- Move seed source JSON files into `prisma/data/seed-sources/`
- Replace broad directory scans in `scripts/check-food-images.mjs` with explicit seed-source directory (or explicit manifest)
- Optional later-phase consolidation into canonical source dataset

### Archive/Relocate Candidates (after validation)
- `prisma/unified-menu-taxonomy-summary.md` -> docs location
- `prisma/unified-menu-taxonomy.json` -> artifacts location (if not consumed elsewhere)

## Risk Matrix and Mitigations
| Risk | Impact | Likelihood | Mitigation | Rollback |
|------|--------|------------|------------|----------|
| Seed import paths break after moves | High | Medium | Phase gate with dry-run + `pnpm db:seed` in CI parity env | Revert path changes and restore old file locations |
| Image check script silently misses files | Medium | Medium | Add explicit source directory/config + output count assertions | Revert script and restore directory scan |
| Hidden external dependency on taxonomy artifact | Medium | Low-Med | Pre-change repo/global reference scan + stakeholder confirmation | Keep compatibility copy for one release cycle |
| Migration chain integrity compromised | High | Low | Do not edit/delete migration files; treat as immutable | Restore from VCS and lock file |
| Data schema drift between source JSON and seed expectations | Medium | Medium | Introduce JSON shape validation in pre-seed checks | Revert validation gate or patch data files |

## Implementation Steps
1. **Baseline Inventory and Contract Freeze**
   - Deliverable: inventory table of all `prisma/` files with classification (runtime, migration, artifact, docs).
   - Deliverable: baseline execution snapshot (`db:seed`, tests, e2e seed hook behavior).
   - Gate: no behavior changes yet.

2. **Establish Folder Boundaries**
   - Deliverable: proposed structure doc (`prisma/README.md`) with ownership and lifecycle rules.
   - Deliverable: move plan matrix (source path -> target path), no file removal.
   - Gate: stakeholder sign-off on boundaries.

3. **Path-Safe Refactor for Seed Inputs**
   - Deliverable: update `seed.ts` imports (or import index/manifest) to new seed source location.
   - Deliverable: preserve exact seeded row counts and category mappings.
   - Gate: `pnpm db:seed` passes locally + CI.

4. **Path-Safe Refactor for Auxiliary Scripts**
   - Deliverable: update `scripts/check-food-images.mjs` to explicit runtime source scope.
   - Deliverable: deterministic script output counts before/after.
   - Gate: no regression in bad URL detection coverage.

5. **Artifact Isolation**
   - Deliverable: move `unified-menu-taxonomy*.{json,md}` into artifact/docs area.
   - Deliverable: keep compatibility alias/copy for one transition window if needed.
   - Gate: no references found post-move; docs updated.

6. **Optional Canonical Data Consolidation (Phase 2 Initiative)**
   - Deliverable: ADR-style decision on single canonical data model vs multi-file sources.
   - Deliverable: migration strategy for seed logic if canonicalization approved.
   - Gate: zero behavior drift in seeded categories/item counts.

7. **Final Hygiene Gate**
   - Deliverable: final classification report + cleanup checklist closed.
   - Deliverable: rollback instructions validated.
   - Gate: release readiness sign-off.

## Verification Strategy
### Required checks per phase
- `pnpm typecheck`
- `pnpm test`
- `pnpm db:seed`
- `pnpm test:e2e` (or at minimum E2E setup stage that invokes seeding)

### Data Integrity Assertions
- Seeded menu item total count unchanged (unless intentionally changed and documented).
- Category slug mapping from `GROUPED_MENU_TAXONOMY` unchanged.
- No duplicate/omitted item IDs introduced by path/data move.
- Image check script still processes the same source dataset coverage.

### Operational Checks
- CI pipeline still runs `db:seed` successfully.
- Playwright pre-test setup remains green.
- Local `dev` startup unchanged from data-loading perspective.

## Acceptance Criteria
- `prisma/` has clear runtime-vs-artifact boundaries.
- All runtime seed inputs are explicitly scoped and documented.
- No migration assets are modified or deleted.
- All verification checks pass.
- Unused artifact/doc files are relocated or marked with explicit retention policy.

## Governance and Maintenance Conventions
- Add `prisma/README.md` with:
  - file ownership
  - how to add new seed source files
  - where generated artifacts belong
  - mandatory checks before merge
- Add lint/check script to flag stray JSON directly under `prisma/` (except approved files).
- Require PR checklist item: "Seed path + artifact boundary reviewed."

## Communication and Rollout Plan
1. Announce planned structure change and non-destructive policy.
2. Share before/after tree and migration-safe guarantee.
3. Run one release cycle with compatibility notes for moved artifacts.
4. Remove compatibility fallback only after zero-reference confirmation.

## Pseudo-code (Plan-Level)
```ts
// pseudo: seed source contract
type SeedSource = { sourceSlug: string; filePath: string };

const seedSources: SeedSource[] = loadSeedManifest("prisma/data/seed-sources/index.json");

for (const src of seedSources) {
  const rows = readJson(src.filePath);
  validateFoodRows(rows);
  ingestRows(rows, src.sourceSlug);
}

// pseudo: artifact guard
assertNoRuntimeImportFrom("prisma/data/artifacts");
```

## Key Files
| File | Operation | Description |
|------|-----------|-------------|
| `prisma/seed.ts` | Modify (future execution phase) | Update JSON source path strategy |
| `scripts/check-food-images.mjs` | Modify (future execution phase) | Scope to canonical seed-source set |
| `prisma/schema.prisma` | No change expected | Keep as-is; verify no accidental edits |
| `prisma/migrations/**` | No change allowed | Immutable history |
| `prisma/unified-menu-taxonomy.json` | Move/retain decision | Artifact classification outcome |
| `prisma/unified-menu-taxonomy-summary.md` | Move/archive decision | Documentation artifact outcome |
| `prisma/README.md` | Add | Data governance + conventions |

## Execution Gates (Stop-Loss)
- Do not proceed to next phase unless:
  - prior phase deliverables complete,
  - required checks pass,
  - risk review signed off.

## SESSION_ID (for /ccg:execute use)
- CODEX_SESSION: `c11e2f75-2f98-419d-861a-f2a8e99051dd`
- GEMINI_SESSION: `adc0c3e3-c76f-42c2-99ae-9a9794979cf1`

Note: Session IDs above are active planning backends launched for this planning run.
