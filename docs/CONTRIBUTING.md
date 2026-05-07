# Contributing

Thanks for contributing to `mc-seanlibee`.

## Prerequisites

- A Node.js version compatible with Next.js 16
- `pnpm` (project uses `pnpm@10.33.2`)

## Development Setup

1. Install dependencies:
   - `pnpm install`
2. Configure environment values:
   - See `docs/ENV.md`
3. Start development server:
   - `pnpm dev`

<!-- AUTO-GENERATED: scripts:start -->
## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm postinstall` | Generate Prisma client with retry helper after install |
| `pnpm dev` | Start Next.js development server |
| `pnpm build` | Run Prisma deploy/generate, then create production build |
| `pnpm start` | Start Next.js production server |
| `pnpm lint` | Run ESLint checks |
| `pnpm typecheck` | Run TypeScript type checking without emit |
| `pnpm db:generate` | Generate Prisma client with retry helper |
| `pnpm db:migrate` | Run Prisma development migration flow |
| `pnpm db:push` | Push Prisma schema to database (skip client generation) |
| `pnpm db:seed` | Seed database with Prisma seed script |
| `pnpm db:backfill:auth-user-id` | Backfill auth user IDs in existing records |
| `pnpm db:studio` | Open Prisma Studio |
| `pnpm db:cleanup:broken-images` | Clean up seeded menu items with broken image links |
| `pnpm db:verify:broken-images` | Verify broken image cleanup results |
| `pnpm test` | Run unit/integration tests via Vitest |
| `pnpm test:e2e` | Run Playwright end-to-end tests |
| `pnpm test:e2e:install` | Install Playwright browsers and system deps |
<!-- AUTO-GENERATED: scripts:end -->

## Testing

- Run unit/integration tests: `pnpm test`
- Install E2E dependencies once: `pnpm test:e2e:install`
- Run E2E tests: `pnpm test:e2e`

## Code Style and Quality

- Lint: `pnpm lint`
- Types: `pnpm typecheck`
- Follow existing TypeScript and Next.js conventions in the repo

## Pull Request Checklist

- [ ] Change is scoped and documented
- [ ] `pnpm lint` passes
- [ ] `pnpm typecheck` passes
- [ ] `pnpm test` passes
- [ ] Relevant E2E tests pass (`pnpm test:e2e`)
- [ ] Database changes include corresponding migration/seed updates if needed
