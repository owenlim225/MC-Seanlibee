# Features and user flows

**Audience:** Mixed technical panel.

Map: **story → likely screen/route** (from `app/**/page.tsx` and `README.md`).

---

## Identity and access

- **Sign up (customer only):** New user registers with name, email, password → user created with `Role.CUSTOMER` → session cookie set → redirect to role home (`app/auth/actions.ts`, `app/auth/signup/page.tsx`).
- **Sign in:** Email/password checked against `User` in DB → session cookie → redirect to `next` param if safe, else role home (`app/auth/actions.ts`, `app/auth/login/page.tsx`, `lib/roles.ts` `ROLE_HOME`).
- **Gatekeeping:** Paths under `/customer`, `/kitchen`, `/driver`, `/admin` require a valid `mc_session` or redirect to `/auth/login` (`middleware.ts`).

## Customer

- **Landing / marketing home:** Public `/` loads categories and featured content from Prisma (`app/page.tsx`).
- **Customer hub & menu discovery:** `/customer` — browse experience for logged-in customers (route group `(customer)`).
- **Item detail:** `/customer/items/[id]` — single menu item view.
- **Cart:** Line items live in a **cart cookie** (not the database); adjust quantities, clear lines (`app/(customer)/customer/actions.ts` uses `lib/cart-cookie`).
- **Checkout & place order:** `/customer/checkout` — pricing/tips/delivery options resolved in `lib/customer/checkout-pricing.ts`; order created in `Order` / `OrderItem` with status workflow starting at payment-pending (`prisma/schema.prisma` `OrderStatus`).
- **Mock payment:** Checkout session URL points to `/dev/mock-stripe`; completing flow calls `simulateWebhook` to mark paid or cancel (`lib/payments/mock.ts`).
- **Order list & detail:** `/customer/orders`, `/customer/orders/[id]` — history and tracking for the signed-in customer.

## Kitchen

- **Operations board:** `/kitchen` — work queue and status transitions implemented via `app/(kitchen)/kitchen/actions.ts` (per `docs/CODEMAPS/BACKEND.md`).

## Driver

- **Delivery work:** `/driver` — claim and complete deliveries via `app/(driver)/driver/actions.ts`; `DeliveryAssignment` links driver to order (`prisma/schema.prisma`).

## Admin

- **Dashboard:** `/admin` — admin entry.
- **Menu management:** `/admin/menu` — catalog operations (`app/(admin)/admin/actions.ts`).
- **Users:** `/admin/users` — user administration.
- **Audit:** `/admin/audit` — audit-oriented UI (page present at `app/(admin)/admin/audit/page.tsx`).

## Development / legacy helpers (not “product” features)

- **`/dev/role-switcher`:** Legacy mock personas (`README.md`).
- **`/dev/mock-stripe`:** Completes mock payment webhook simulation (`README.md`, `lib/payments/mock.ts`).
- **`/dev/multi-role`:** Four-pane lab (`README.md`).
- **`/login`:** Secondary login path with `app/login/actions.ts` listed in codemap (keep answer honest: exists for dev/legacy; primary auth UX is under `/auth/*`).

## Testing surface (evidence only)

- **Unit:** `pnpm test` → Vitest (`package.json`).
- **E2E:** `pnpm test:e2e` → Playwright (`package.json`).
