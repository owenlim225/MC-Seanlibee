<!-- Generated: 2026-05-07 | Files scanned: 128 core / 708 tracked | Token estimate: ~650 -->
# Architecture

## System Shape
- Type: single Next.js app (App Router), Prisma data layer, role-based vertical slices
- Runtime: server actions + middleware, no dedicated API route layer yet
- Primary boundaries: `app/` (UI + route orchestration), `lib/` (domain/service helpers), `prisma/` (schema + migrations)

## High-Level Flow
```text
Browser
  -> Next.js App Router (`app/**/page.tsx`)
  -> Server Actions (`app/**/actions.ts`)
  -> Domain helpers (`lib/**`)
  -> Prisma client (`lib/prisma.ts`)
  -> PostgreSQL (Supabase/local)
```

## Role Domains
- Customer: browse menu, cart, checkout, order tracking
- Kitchen: queue + status transitions
- Driver: claim + complete deliveries
- Admin: menu/user/audit operations

## Core Entry Points
- App boot: `app/layout.tsx`, `app/page.tsx`
- Auth/session: `app/auth/actions.ts`, `lib/auth/index.ts`, `middleware.ts`
- DB access: `lib/prisma.ts`
- Schema: `prisma/schema.prisma`

## Major Cross-Cutting Concerns
- AuthN/AuthZ: cookie session (`mc_session`) + role checks in route flow
- Data integrity: normalized order and menu schema with event timeline
- Integration abstraction: payments/realtime/storage providers in `lib/`
- Safety + recoverability: soft-delete and archive snapshot models
