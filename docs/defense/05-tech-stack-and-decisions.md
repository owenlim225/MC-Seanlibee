# Tech stack and decisions

**Audience:** Mixed technical panel.

---

## Stack table (from `package.json` + `prisma/schema.prisma`)

| Layer | Choice | Evidence |
|-------|--------|----------|
| Framework | Next.js **16** App Router | `package.json` `"next": "16.2.4"` |
| UI | React **19**, Tailwind **4** | `package.json` |
| Language | TypeScript **5** | `package.json` |
| Package manager | pnpm **10** | `package.json` `packageManager` |
| Database | **PostgreSQL** | `prisma/schema.prisma` `datasource db { provider = "postgresql" }` |
| ORM | Prisma **6.19** | `package.json` |
| Auth (current) | App-managed users + signed cookie session | `README.md`, `middleware.ts`, `app/auth/actions.ts` |
| Supabase (current) | Client libraries present; full auth/storage/realtime switch is **follow-up work** | `@supabase/ssr`, `@supabase/supabase-js` in `package.json`; `docs/follow-up.md` |
| Payments (current) | Mock / dev page | `lib/payments/mock.ts`, `README.md` (no `stripe` dependency in `package.json`) |
| Unit tests | Vitest **3** | `package.json` |
| E2E tests | Playwright | `package.json` |

## Key decisions / tradeoffs (evidenced)

1. **PostgreSQL + Prisma migrations as the contract**  
   Schema and `pnpm build` → `prisma migrate deploy` make environments reproducible (`package.json`, `docs/adr/0002-postgresql-migration-baseline.md`). *Tradeoff:* ADR 0001 still mentions SQLite historically; the **live** baseline is Postgres-only.

2. **Server Actions instead of a first-class HTTP API**  
   Backend codemap lists action entry points per role; there are no `app/api/**/route.ts` handlers here (`docs/CODEMAPS/BACKEND.md`, repo search). *Tradeoff:* Simple for a monolith MVP; mobile or third-party clients would need new surface area.

3. **Cookie cart vs normalized `Cart` table**  
   Pre-checkout state is ephemeral in `lib/cart-cookie`; persistence starts at order creation (`app/(customer)/customer/actions.ts`). *Tradeoff:* No server-side abandoned-cart analytics without changing design.

4. **Mock integrations behind stable `lib/` boundaries**  
   Payments/realtime/storage are swappable modules with explicit TODO tags (`docs/follow-up.md`, `docs/adr/0001-stack.md`). *Tradeoff:* Demo-ready without secrets; production needs verification, webhooks, and policies.

5. **Fulfillment auditability**  
   `OrderStatusEvent` plus archived snapshot models support timelines and compliance-style retention patterns (`prisma/schema.prisma`). *Tradeoff:* More writes per transition; archive tables add migration and query surface.

6. **Edge session gate in root middleware**  
   Protected prefixes checked with `verifySession` before pages run (`middleware.ts`). *Tradeoff:* Must keep cookie verification fast and correct; role checks still belong in server actions for defense in depth.

## Prisma engine note

`schema.prisma` sets `engineType = "binary"` with a comment about Windows DLL locking — operational quality-of-life on dev machines, not a product feature.
