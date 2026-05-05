# Login page, role-based redirect, and demo credentials

**Status:** Approved for implementation  
**Date:** 2026-05-05  
**Scope:** Replace the single-page “all roles” dev experience with a dedicated login flow; after authentication, send users to their role home. Provide five named demo accounts (two customers). Ensure behavior is safe for local development and deployable to **Vercel** with **Supabase (PostgreSQL)** as the database.

---

## 1. Goals

1. Unauthenticated access to role-scoped routes (`/customer`, `/kitchen`, `/driver`, `/admin`) redirects to a **login** page with optional `next` query preservation.
2. Successful login establishes the existing **signed HTTP-only session cookie** (`mc_session`) and redirects the user to the correct destination for their **Prisma `Role`**.
3. Demo personas use the names **Sean**, **Ginalyn**, **Christian**, **Sherwin**, and **Marvin** with documented credentials for QA and demos.
4. Production deployments on **Vercel** using **Supabase Postgres** work when required environment variables and database migrations are applied; demo login must not rely on “development-only” code paths that throw in `NODE_ENV === "production"` without an explicit override.

## 2. Non-goals

- Replacing the cookie session with **Supabase Auth** (JWT / OAuth) in this iteration. A short **follow-up** subsection references migrating to Supabase Auth when product-ready.
- Full account registration, password reset email flows, or MFA.

## 3. Personas and demo credentials

These five users must exist after `pnpm db:seed` (or equivalent). Display names and emails are stable for documentation and UI copy.

| Display name | Role      | Email               | Password (demo) |
|--------------|-----------|---------------------|-----------------|
| Sean         | CUSTOMER  | `sean@demo.local`   | `Demo123!`      |
| Ginalyn      | CUSTOMER  | `ginalyn@demo.local`| `Demo123!`      |
| Christian    | KITCHEN   | `christian@demo.local` | `Demo123!`   |
| Sherwin      | DRIVER    | `sherwin@demo.local`| `Demo123!`      |
| Marvin       | ADMIN     | `marvin@demo.local` | `Demo123!`      |

**Rules:**

- Use a **single shared demo password** for all accounts unless product later requires per-user secrets; if implemented via env, use **`DEMO_AUTH_PASSWORD`** (or equivalent) so Vercel can set one value for staging/demo.
- Validation compares submitted password to the env-configured value using a **constant-time** comparison for strings (e.g. `crypto.timingSafeEqual` on equal-length buffers) to avoid trivial timing leaks.
- Documented passwords belong in **this spec** and in a non-secret **README / demo** section; production-like environments should still treat them as **low-trust demo only** and restrict exposure (see §7).

**Seed ordering / data integrity:**

- **Sean** remains the **first** seeded customer (`customers[0]`) so existing sample orders that attach to the first customer stay consistent unless deliberately migrated.
- **Ginalyn** is the **second** customer (`customers[1]`) for flows that depend on that index (e.g. deterministic Playwright / race-order fixtures).
- Trim redundant generic seeded users **only if** tests and seeds are updated in the same change set so counts and foreign keys remain valid.

## 4. Routes and redirects

| Path | Behavior |
|------|----------|
| `/login` | Public. Renders email + password form; optional `next` query (same-origin relative path only). |
| Protected prefixes | Middleware continues to require session + matching role for `/customer/*`, `/kitchen/*`, `/driver/*`, `/admin/*`. |
| Unauthenticated | Redirect to `/login?next=<encoded path>` instead of `/dev/role-switcher`. |
| Wrong role for `next` | Redirect to the **role default home** for the signed-in user (below); optionally show a brief flash that the target was not allowed. |
| Role default homes | `CUSTOMER` → `/customer`, `KITCHEN` → `/kitchen`, `DRIVER` → `/driver`, `ADMIN` → `/admin`. |

**`requireRole` / server guards:** Any redirect that today sends unauthenticated users to `/dev/role-switcher` must send them to **`/login`** (with safe `next` where applicable).

## 5. Login UI

- Single-column layout consistent with existing app shell (reuse existing UI primitives).
- Fields: email, password, submit; loading and error states without leaking whether email exists vs password wrong (generic message for failures; optional dev-only detail behind env flag).
- Link or collapsible “Demo accounts” listing the table from §3 for local QA (no giant grid of all roles on one page).
- **Logout:** Clear session cookie and redirect to `/login` (or home if product prefers).

## 6. Authentication mechanics (implementation constraints)

**Session:** Keep the existing signed cookie pipeline (`signSession` / `verifySession`, `SESSION_SECRET`, TTL). Same cookie name and HTTP-only, `SameSite=Lax`, `Path=/` unless products requires `Secure` in production (see §7).

**Signing in after password validation:** Today `devSignInAs` throws when `NODE_ENV === "production"`. Implement **production-safe demo sign-in** that:

1. Runs only when **`DEMO_AUTH_ENABLED=true`** (or similarly named) **and** password validation succeeds **or** when `NODE_ENV !== "production"` for local dev parity.
2. After verifying email/password against Prisma user + env password, sets the same session cookie payload `{ uid, role, exp }` as today’s mock flow.

This avoids shipping “development-only” throws on Vercel while keeping demo login **off** unless explicitly enabled.

**`/dev/role-switcher`:** Either remove from primary flows or restrict to **`NODE_ENV !== "production"`** (and optionally a second env flag). Middleware must never send end users there by default.

## 7. Vercel + Supabase deployment

### 7.1 Database (Supabase PostgreSQL)

- Production/staging must use **`provider = "postgresql"`** in `schema.prisma` with **`DATABASE_URL`** pointing at Supabase.
- Use Supabase’s **connection pooler** URL for serverless (Vercel) workloads unless documentation dictates otherwise; Prisma docs recommend the **pooled** string for high concurrency.
- Run **`prisma migrate deploy`** (or equivalent CI step) on deploy so schema matches.
- **Local SQLite** may remain for developers until the team standardizes on Postgres everywhere; document any dual-env caveat.

### 7.2 Vercel environment variables

Set in the Vercel project **Settings → Environment Variables** (Production / Preview as appropriate):

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Supabase Postgres connection string (pooled recommended for serverless). |
| `SESSION_SECRET` | Long random string for signing `mc_session`. **Required** in production; never commit. |
| `DEMO_AUTH_ENABLED` | `true` only if demo email/password login should work on that deployment. |
| `DEMO_AUTH_PASSWORD` | Shared password matching §3 when demo login is enabled. |
| `NEXT_PUBLIC_*` | Only if the client needs non-secret config; no secrets in `NEXT_PUBLIC_`. |

### 7.3 Cookies on HTTPS

- On Vercel, production uses HTTPS. Session cookies should set **`Secure`** when `NODE_ENV === "production"` so browsers reject plain HTTP transmission.

### 7.4 Edge compatibility

- If middleware or auth runs on the Edge, ensure Prisma / Node APIs used are supported in that runtime; otherwise keep DB lookups in **Node** route handlers or server actions only.

## 8. Secrets the maintainer will obtain (ask the project owner)

Before going live, confirm you have:

1. **Supabase → Settings → Database:** Connection string (pooler/direct as chosen). You will paste this into Vercel as **`DATABASE_URL`**.
2. **Supabase:** Project ref and region noted for troubleshooting (not necessarily in env).
3. **Vercel:** Generated **`SESSION_SECRET`** (e.g. `openssl rand -hex 32`) stored only in Vercel env.
4. **Demo mode decision:** Whether Preview/Production should set **`DEMO_AUTH_ENABLED=true`**. If **false**, demo passwords do nothing on that deployment (recommended for a public marketing production URL unless intentionally a demo site).

The implementation phase may ask you to paste or confirm values **only in Vercel / Supabase dashboards**, not in chat or git.

## 9. Testing

- **Unit:** Password verification helper (success, wrong password, missing user), redirect URL allowlist for `next`.
- **Integration:** Server action or route sets cookie and returns redirect target.
- **E2E:** Unauthenticated visit to `/customer` → `/login?next=...` → sign in as Sean → `/customer`; repeat stub for Christian, Sherwin, Marvin; Ginalyn as second customer; denied-role attempt navigates to correct home.

## 10. Follow-up: Supabase Auth (optional later)

When replacing demo cookie auth:

- Use `@supabase/ssr` (or current recommended package) with Prisma user rows linked by `auth.users` id or email.
- Remove `DEMO_AUTH_*` paths or gate them to non-production preview only.

## 11. Spec self-review checklist

- [x] No contradictory requirement: demo login works on Vercel when env flags and DB are set; raw `devSignInAs` production throw is superseded by gated demo sign-in.
- [x] Scope is one feature: login, redirects, seed/docs, deployment envs.
- [x] Ambiguity reduced: single shared password + env; five users fixed.
- [x] Supabase transition noted: Postgres `DATABASE_URL`, migrations, pooler.

---

**Next step:** After you review this file, implementation planning follows **`.cursor/skills/writing-plans/SKILL.md`** → `docs/superpowers/plans/` before code changes.
