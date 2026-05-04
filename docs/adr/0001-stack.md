# ADR 0001 — Food MVP stack (Next.js + Prisma + Supabase-shaped mocks)

## Context

We need a fast, internally hosted MVP for multi-role food ordering with eventual deployment on Vercel and managed Postgres/auth/storage.

## Decision

- **Framework**: Next.js 16 App Router + React 19 + Tailwind 4  
- **Data**: Prisma ORM with SQLite locally; Supabase Postgres in production (`DATABASE_URL` swap only).  
- **Auth**: Contract-first sessions via HTTP-only cookie today; Supabase Auth with SSR adapters later (`TODO(real-keys:auth-mock-001)`).  
- **Payments**: Stripe-shaped mocks returning internal `/dev/mock-stripe`; real Stripe Checkout + signed webhooks later (`TODO(real-keys:stripe-checkout-001)`, `TODO(real-keys:stripe-webhook-002)`).  
- **Realtime**: In-process EventEmitter + `BroadcastChannel` for cross-tab demo; Supabase Realtime replaces (`TODO(real-keys:realtime-supabase-001/002)`).  
- **Storage**: Base64 data URLs for uploads today; Supabase Storage buckets replace (`TODO(real-keys:storage-supabase-001)`).

## Consequences

- Zero cloud provisioning required for local demos while preserving stable boundaries (`lib/auth`, `lib/payments`, `lib/realtime`, `lib/storage`).  
- Swapping providers requires touching indexes listed in `docs/follow-up.md` rather than rewriting UI flows.
