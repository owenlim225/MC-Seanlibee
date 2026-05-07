# Project overview — mc-seanlibee

**Audience:** Mixed technical panel (instructors plus reviewers who may not live in this codebase daily).

**What this doc is:** Memorization notes for defense Q&A — not marketing copy.

---

## Source inventory (what these notes rely on)

| Source | Role in this overview |
|--------|----------------------|
| `README.md` | Product framing (“food ordering MVP”), quickstart URLs, scripts, deploy/env table, auth summary |
| `package.json` | Confirmed stack: Next.js 16, React 19, Prisma → PostgreSQL, Vitest + Playwright; no Stripe SDK dependency |
| `prisma/schema.prisma` | Roles, order lifecycle, menu model, archives — single source of truth for data shapes |
| `docs/CODEMAPS/architecture.md`, `AUTH.md`, `DATABASE.md`, `INTEGRATIONS.md`, `BACKEND.md` | High-level codemap narrative (cross-checked against `middleware.ts` and `package.json`) |
| `docs/adr/0001-stack.md`, `docs/adr/0002-postgresql-migration-baseline.md` | Recorded tradeoffs; note ADR0001 still mentions SQLite while the live schema/README center PostgreSQL |

**Not verified from a deep read:** Every Playwright/Vitest spec file; exhaustive behavior of archive/soft-delete code paths (schema shows intent; implementation spread across actions/libs).

---

## Problem

Demonstrate an end-to-end **multi-role food ordering flow** — customer browse → cart → checkout → operational roles (kitchen, driver, admin) — with a persistence layer suitable for demos and deployment rehearsal (PostgreSQL via Prisma), without requiring full production integrations on day one.

## Goals

- **Role-separated experiences:** Customer vs kitchen vs driver vs admin each have dedicated App Router areas under `app/(customer)`, `app/(kitchen)`, `app/(driver)`, `app/(admin)` (see `README.md` route list).
- **Durable orders and menu:** Orders, line items, status history, and delivery assignment modeled in PostgreSQL (`prisma/schema.prisma`).
- **Authentication for real sessions:** Email/password stored on `User` with scrypt hashing; session carried in signed HTTP-only cookie `mc_session` (`README.md`, `middleware.ts`).
- **Swappable integrations (MVP mocks):** Payments, realtime, and storage abstracted under `lib/payments`, `lib/realtime`, `lib/storage` with `TODO(real-keys:…)` inventory in `docs/follow-up.md`.

## Who it’s for

- **Learners / demo viewers:** Walk through a credible food-ordering product shape.
- **Deploy rehearsal:** README documents Vercel + Supabase-style env (`DATABASE_URL`, `DIRECT_URL`, `SESSION_SECRET`).

## Non-goals (evidenced by repo, not by ambition)

- **Production Stripe:** No Stripe package in `package.json`; mock checkout + dev page (`lib/payments/mock.ts`, `README.md`).
- **Supabase Auth as source of truth today:** Supabase client packages exist for future SSR wiring; sign-in/sign-up are app actions against Prisma `User` (`app/auth/actions.ts`, `docs/follow-up.md`).
- **Public HTTP API layer:** No `route.ts` handlers under `app/` in this repo — server mutations go through **Server Actions** (`docs/CODEMAPS/BACKEND.md`).

## Glossary (minimal)

| Term | One line |
|------|----------|
| **Server Action** | A server-only function the UI can call like a form action or RPC; replaces a separate JSON API for many Next.js apps. |
| **Migration** | Versioned SQL generated from the Prisma schema so every environment can apply the same database shape (`pnpm build` runs `prisma migrate deploy` per `package.json`). |
| **Soft delete** | Rows kept with `deletedAt` set instead of removed, so history and queries can filter “active” rows (`prisma/schema.prisma` on several models). |
