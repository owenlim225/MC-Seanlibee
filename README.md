# mc-seanlibee — Food ordering MVP

Multi-role Next.js 16 + React 19 + Tailwind 4 demo with **Prisma + SQLite** locally and **mocked** Supabase/Stripe integrations (`TODO(real-keys:…)` markers).

## Quickstart

```bash
pnpm install
cp .env.example .env
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

See `docs/follow-up.md` for every real-key wiring task and `docs/adr/0001-stack.md` for stack rationale.

## Scripts

| Script | Purpose |
| --- | --- |
| `pnpm dev` | Next dev server |
| `pnpm build` | `prisma generate` + `next build` |
| `pnpm lint` / `pnpm typecheck` | Static checks |
| `pnpm test` | Vitest unit tests |
| `pnpm db:migrate` | `prisma migrate dev` |
| `pnpm db:seed` | Seed demo catalog + users |
| `pnpm test:e2e` | Playwright fleet (auto-starts web server locally) |

## Performance

The `/customer`, `/kitchen`, `/driver`, and `/admin` routes use `select`-shaped Prisma queries and run independent reads in `Promise.all`. Hot-path indexes live in `prisma/schema.prisma` (`Order(status, createdAt)`, `Order(customerId, createdAt)`, `OrderItem(orderId)`, `OrderItem(menuItemId)`, `MenuItem(categoryId, isAvailable)`, `DeliveryAssignment(driverId)`).

Auth uses a "lite" path that trusts the verified signed cookie payload (`requireRoleLite`) for hot reads, and a full DB-backed `requireRole` only when pages need user `email`/`name`.

See `docs/perf/baseline.md` for the measurement protocol.

## Deploy notes (Vercel + Supabase)

1. In `prisma/schema.prisma`, switch `provider` from `"sqlite"` to `"postgresql"`.
2. In Vercel, set:
   - `DATABASE_URL` — pooled URL (`?pgbouncer=true&connection_limit=1`) for runtime
   - `DIRECT_URL` — direct connection URL for migrations
   - `SESSION_SECRET` — long random string
   - `DEMO_AUTH_ENABLED="true"` and `DEMO_AUTH_PASSWORD` — only if you want demo sign-in in production
3. Build runs `prisma generate && next build`. Add `prisma migrate deploy` to your deploy step (e.g. Vercel `buildCommand` or a CI step).
4. Replace mocks under `lib/auth`, `lib/payments`, `lib/realtime`, and `lib/storage` per `docs/follow-up.md`.

---

Bootstrapped from [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app); consult `node_modules/next/dist/docs/` when Next.js APIs diverge from older releases.
