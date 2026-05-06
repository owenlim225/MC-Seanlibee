# mc-seanlibee — Food ordering MVP

Multi-role Next.js 16 + React 19 + Tailwind 4 demo with **Prisma + PostgreSQL** (Supabase or local Postgres) and **mocked** Stripe/realtime/storage integrations (`TODO(real-keys:…)` markers).

## Quickstart

```bash
pnpm install
cp .env.example .env
# Set DATABASE_URL and DIRECT_URL to your Postgres instance (see below).
pnpm prisma migrate deploy
pnpm db:seed
pnpm dev
```

Useful URLs:

- `/` — landing hub  
- `/dev/role-switcher` — legacy mock personas (kept for dev only)  
- `/dev/mock-stripe` — completes mock payments (`payments.simulateWebhook`)  
- `/dev/multi-role` — four-pane iframe lab (`credentialless`, Chromium)  
- `/customer`, `/kitchen`, `/driver`, `/admin` — gated route groups  

See `docs/follow-up.md` for every real-key wiring task and `docs/adr/0001-stack.md` for stack rationale. Migration baseline rationale: `docs/adr/0002-postgresql-migration-baseline.md`.

## Scripts

| Script | Purpose |
| --- | --- |
| `pnpm dev` | Next dev server |
| `pnpm build` | `prisma migrate deploy` + `prisma generate` + `next build` |
| `pnpm lint` / `pnpm typecheck` | Static checks |
| `pnpm test` | Vitest unit tests |
| `pnpm db:migrate` | `prisma migrate dev` |
| `pnpm db:seed` | Seed demo catalog + users (idempotent upserts where applicable) |
| `pnpm test:e2e` | Playwright fleet (auto-starts web server locally; needs `DATABASE_URL`) |

## Performance

The `/customer`, `/kitchen`, `/driver`, and `/admin` routes use `select`-shaped Prisma queries and run independent reads in `Promise.all`. Hot-path indexes live in `prisma/schema.prisma` (`Order(status, createdAt)`, `Order(customerId, createdAt)`, `OrderItem(orderId)`, `OrderItem(menuItemId)`, `MenuItem(isAvailable, name)`, `DeliveryAssignment(driverId)`).

Auth uses an app-signed `mc_session` cookie and verifies credentials against Prisma `User` (scrypt-hashed passwords). `User.authUserId` is app-managed and can be backfilled locally.

See `docs/perf/baseline.md` for the measurement protocol.

## Deploy notes (Vercel + Supabase)

### Environment variables

| Variable | Purpose |
| -------- | ------- |
| `DATABASE_URL` | Pooled Supabase URL (e.g. `?pgbouncer=true&connection_limit=1`) for serverless runtime |
| `DIRECT_URL` | Direct Postgres URL for migrations / introspection (`datasource.directUrl`) |
| `SESSION_SECRET` | Secret used to sign and verify app auth cookie (`mc_session`) |

Optional (local/e2e only):

| Variable | Purpose |
| -------- | ------- |
| `SEED_AUTH_PASSWORD` | Password used when creating seeded users (`Demo123!` fallback if unset) |
| `E2E_AUTH_PASSWORD` | Password used by e2e provisioned users (defaults to a hardcoded dev-only value if unset) |

### Build and database

1. `pnpm build` runs **`prisma migrate deploy`** before `next build`, so Vercel applies migrations when `DATABASE_URL` / `DIRECT_URL` are configured for the project.
2. **Seed** is not part of the build. After the first deploy, run once (locally against prod URLs, `vercel env pull`, GitHub Action with secrets, or Supabase SQL) — `pnpm db:seed` with remote env — so demo users and catalog exist.
3. Replace mocks under `lib/auth`, `lib/payments`, `lib/realtime`, and `lib/storage` per `docs/follow-up.md` when moving beyond the MVP.

### Seeded role accounts (admin/kitchen/driver)

Seeding creates app users in Postgres (`User`) with role + email + hashed password.

If you have existing users with null `authUserId`, run:

```bash
pnpm db:backfill:auth-user-id
```

The backfill is idempotent: it only links rows with null `authUserId` and safely skips conflicts.

---

Bootstrapped from [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app); consult `node_modules/next/dist/docs/` when Next.js APIs diverge from older releases.
