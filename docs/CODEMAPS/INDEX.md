# mc-seanlibee Codemaps — Architecture Overview

**Last Updated:** 2026-05-06

This directory contains structured architecture documentation for the food ordering MVP. Each codemap focuses on a specific system layer.

## Quick Navigation

| Codemap | Purpose | Entry Points |
|---------|---------|--------------|
| **[Frontend](./FRONTEND.md)** | Next.js 16 + React 19 pages, components, and routing | `app/`, `lib/auth`, `lib/storage` |
| **[Backend & API](./BACKEND.md)** | Server actions, route handlers, session management | `app/*/actions.ts`, `lib/prisma.ts` |
| **[Database](./DATABASE.md)** | Prisma schema, migrations, indexing, and data models | `prisma/schema.prisma`, `prisma/migrations/` |
| **[Integrations](./INTEGRATIONS.md)** | Mocked Stripe, Supabase Auth, Realtime, and Storage | `lib/payments`, `lib/auth`, `lib/realtime`, `lib/storage` |
| **[Auth & RBAC](./AUTH.md)** | Session management, role-based access control, middleware | `lib/auth/`, `app/auth/` |
| **[Utils & Helpers](./UTILS.md)** | Shared utilities, validators, and menu logic | `lib/menu/`, `lib/customer/`, `lib/rbac.ts` |

## Project Summary

**Food ordering MVP** with four gated roles:

- **Customer**: Browse menu, add to cart, checkout, track orders
- **Kitchen**: Receive orders, mark as preparing/ready
- **Driver**: Accept deliveries, mark as picked up/delivered
- **Admin**: Manage menu, users, and audit order history

**Stack:** Next.js 16 + React 19 + Tailwind 4 + Prisma 6 + PostgreSQL (Supabase or local)

**Key characteristics:**
- App-managed session auth (`mc_session` cookie, scrypt-hashed passwords)
- Mocked integrations (Stripe, Supabase Auth, Realtime, Storage) — see `docs/follow-up.md`
- Performance-optimized queries with strategic indexes
- Multi-role development lab at `/dev/multi-role`

## File Structure

```
mc-seanlibee/
├── app/                    # Next.js 16 app router (route groups per role)
│   ├── (customer)/         # Customer routes (gated)
│   ├── (kitchen)/          # Kitchen routes (gated)
│   ├── (driver)/           # Driver routes (gated)
│   ├── (admin)/            # Admin routes (gated)
│   ├── auth/               # Auth pages (login, signup)
│   ├── dev/                # Development-only pages
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Landing hub
├── lib/                    # Shared utilities
│   ├── auth/               # Session & auth logic
│   ├── payments/           # Stripe mock
│   ├── realtime/           # Realtime mock
│   ├── storage/            # Storage mock
│   ├── supabase/           # Supabase client + middleware
│   ├── menu/               # Menu helpers
│   ├── customer/           # Customer-specific utils
│   ├── prisma.ts           # Prisma client singleton
│   ├── rbac.ts             # Role-based access control
│   ├── roles.ts            # Role definitions
│   └── cart-cookie.ts      # Cart state management
├── prisma/                 # Database
│   ├── schema.prisma       # Data models
│   ├── migrations/         # Migration history
│   ├── seed.ts             # Seed script
│   ├── data/               # Seed data (JSON)
│   └── scripts/            # Utility scripts
├── tests/                  # Vitest unit tests
├── e2e/                    # Playwright E2E tests
├── docs/                   # Documentation
│   ├── CODEMAPS/           # Architecture (this directory)
│   ├── follow-up.md        # Real key integration checklist
│   ├── adr/                # Architecture Decision Records
│   ├── perf/               # Performance baseline
│   └── superpowers/        # Feature specs and plans
└── package.json            # Dependencies
```

## Development Commands

```bash
# Setup
pnpm install
cp .env.example .env
pnpm prisma migrate deploy
pnpm db:seed

# Development
pnpm dev                    # Next.js dev server (http://localhost:3000)
pnpm db:migrate             # Create new migration interactively
pnpm db:studio              # Prisma Studio GUI
pnpm db:seed                # Seed demo data

# Testing & Quality
pnpm test                   # Vitest (unit tests)
pnpm test:e2e               # Playwright (E2E tests)
pnpm lint                   # ESLint
pnpm typecheck              # TypeScript --noEmit

# Build & Deploy
pnpm build                  # Build (runs migrations + Prisma generate)
pnpm start                  # Start production server
```

## Key URLs

| URL | Purpose |
|-----|---------|
| `/` | Landing hub with role descriptions |
| `/auth/login`, `/auth/signup` | Authentication pages |
| `/customer`, `/kitchen`, `/driver`, `/admin` | Role-gated dashboards |
| `/dev/role-switcher` | Legacy multi-role switcher (dev only) |
| `/dev/multi-role` | Four-pane iframe lab (dev only) |
| `/dev/mock-stripe` | Simulate Stripe webhooks (dev only) |
| `/dev/ui` | UI component gallery (dev only) |

## Performance Notes

- **Indexes:** Hot-path queries optimized with composite indexes on `Order` and `MenuItem`
- **Queries:** Use Prisma `select` to avoid fetching unnecessary relations
- **Auth:** Scrypt-hashed passwords; session stored in signed `mc_session` cookie
- **Realtime:** Currently mocked; ready for Supabase Realtime
- See `docs/perf/baseline.md` for detailed measurement protocol

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection string (pooled for serverless) |
| `DIRECT_URL` | Yes | Direct PostgreSQL URL for migrations |
| `SESSION_SECRET` | Yes | Secret for signing `mc_session` cookie |
| `SEED_AUTH_PASSWORD` | No | Password for seeded demo users (default: `Demo123!`) |
| `E2E_AUTH_PASSWORD` | No | Password for E2E test users |

## Next Steps & Follow-up

**Before production launch**, replace all mocked integrations:

1. **Supabase Auth** → `lib/auth/mock.ts` → Real Supabase with `@supabase/ssr`
2. **Stripe** → `lib/payments/mock.ts` → Stripe Checkout + Webhooks
3. **Realtime** → `lib/realtime/mock.ts` → Supabase Realtime channels
4. **Storage** → `lib/storage/mock.ts` → Supabase Storage signed URLs

See `docs/follow-up.md` for the complete integration checklist.

---

**Related Documentation:**
- `docs/adr/0001-stack.md` — Stack rationale
- `docs/adr/0002-postgresql-migration-baseline.md` — Migration strategy
- `docs/perf/baseline.md` — Performance measurement
- `docs/superpowers/specs/` — Active feature specifications
- `docs/superpowers/plans/` — Implementation plans
