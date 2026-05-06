# mc-seanlibee — Food ordering MVP

Multi-role Next.js 16 + React 19 + Tailwind 4 demo with **Prisma + PostgreSQL** (Supabase or local Postgres) and **mocked** Stripe/realtime/storage integrations (`TODO(real-keys:…)` markers).

## Quickstart

```bash
pnpm install
cp .env.example .env
# Set DATABASE_URL and DIRECT_URL to your Postgres instance (see below).
pnpm prisma migrate dev
pnpm db:seed
pnpm dev
```

Useful URLs:

- `/` — landing hub  
- `/dev/role-switcher` — pick mock personas (disabled in production builds)  
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

Auth uses a "lite" path that trusts the verified signed cookie payload (`requireRoleLite`) for hot reads, and a full DB-backed `requireRole` only when pages need user `email`/`name`.

See `docs/perf/baseline.md` for the measurement protocol.

## Deploy notes (Vercel + Supabase)

### Environment variables

| Variable | Purpose |
| -------- | ------- |
| `DATABASE_URL` | Pooled Supabase URL (e.g. `?pgbouncer=true&connection_limit=1`) for serverless runtime |
| `DIRECT_URL` | Direct Postgres URL for migrations / introspection (`datasource.directUrl`) |
| `SESSION_SECRET` | Long random string; must be stable across instances (no insecure default in prod) |
| `DEMO_AUTH_ENABLED` | Set `"true"` only if demo email/password sign-in should work on that deployment |
| `DEMO_AUTH_PASSWORD` | Password operators enter at `/login` when demo auth is enabled |

**Security:** Avoid enabling demo auth on a public marketing production URL; prefer Preview or a dedicated demo project.

### Build and database

1. `pnpm build` runs **`prisma migrate deploy`** before `next build`, so Vercel applies migrations when `DATABASE_URL` / `DIRECT_URL` are configured for the project.
2. **Seed** is not part of the build. After the first deploy, run once (locally against prod URLs, `vercel env pull`, GitHub Action with secrets, or Supabase SQL) — `pnpm db:seed` with remote env — so demo users and catalog exist.
3. Replace mocks under `lib/auth`, `lib/payments`, `lib/realtime`, and `lib/storage` per `docs/follow-up.md` when moving beyond the MVP.

---

Bootstrapped from [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app); consult `node_modules/next/dist/docs/` when Next.js APIs diverge from older releases.
