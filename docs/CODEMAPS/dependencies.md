<!-- Generated: 2026-05-07 | Files scanned: 128 core / 708 tracked | Token estimate: ~700 -->
# Dependencies

## Runtime Dependencies
- `next@16.2.4` - app framework and routing/runtime
- `react@19.2.4`, `react-dom@19.2.4` - UI runtime
- `@prisma/client@6.19.0` - ORM client
- `@supabase/supabase-js@2.105.3` - Supabase platform client
- `@supabase/ssr@0.10.2` - SSR auth/session integration

## Build/Dev/Test Tooling
- `prisma@6.19.0` - migrations, schema, studio, generate
- `typescript@^5` - type checking
- `eslint@^9`, `eslint-config-next@16.2.4` - linting
- `vitest@^3.2.4` - unit/integration tests
- `@playwright/test@^1.59.1` - E2E tests
- `tsx@^4.21.0` - script runtime for TS utilities
- `tailwindcss@^4`, `@tailwindcss/postcss@^4` - styling pipeline

## External Service Integrations
- PostgreSQL (Supabase-hosted or local)
- Supabase services (auth/realtime/storage patterns present in code)
- Stripe-like payment boundary represented through mock/provider abstraction

## Internal Shared Libraries
- Auth/session: `lib/auth/*`
- Role policy: `lib/roles.ts`, `lib/rbac.ts`
- Realtime: `lib/realtime/*`
- Storage: `lib/storage/*`
- Payments: `lib/payments/*`
- Menu and checkout domain helpers: `lib/menu/*`, `lib/customer/*`

## Dependency Notes
- Prisma generation uses retry wrapper: `scripts/prisma-generate-retry.mjs`
- Build chain runs DB migrations before Next.js build (`package.json` build script)
- Test strategy spans both unit (`vitest`) and browser E2E (`playwright`)
