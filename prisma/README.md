# Prisma Data Boundaries

## Runtime-Critical

- `schema.prisma` and `migrations/` are authoritative database inputs.
- `seed.ts` is the runtime seed entrypoint.
- `seed-sources/manifest.json` is the declared list of seed data sources.

## Runtime Data Sources

- Seed JSON sources are declared in `seed-sources/manifest.json`.
- Seed and validation scripts must read data through this manifest (not broad `prisma/*.json` scans).

## Artifacts and Reference Outputs

- `unified-menu-taxonomy.json` and `unified-menu-taxonomy-summary.md` are treated as taxonomy artifacts/reference docs, not runtime seed dependencies.

## Maintenance Checklist

- When adding a new seed source, append it to `seed-sources/manifest.json`.
- Keep `migrations/` immutable; add new migrations instead of editing old ones.
- Run `pnpm db:seed` and `node scripts/check-food-images.mjs` after seed source updates.
