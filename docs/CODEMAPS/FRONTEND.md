<!-- Generated: 2026-05-07 | Files scanned: 128 core / 708 tracked | Token estimate: ~850 -->
# Frontend

## Page Tree
- Public:
  - `app/page.tsx`
  - `app/auth/login/page.tsx`
  - `app/auth/signup/page.tsx`
- Customer:
  - `app/(customer)/customer/page.tsx`
  - `app/(customer)/customer/items/[id]/page.tsx`
  - `app/(customer)/customer/cart/page.tsx`
  - `app/(customer)/customer/checkout/page.tsx`
  - `app/(customer)/customer/orders/page.tsx`
  - `app/(customer)/customer/orders/[id]/page.tsx`
- Kitchen: `app/(kitchen)/kitchen/page.tsx`
- Driver: `app/(driver)/driver/page.tsx`
- Admin:
  - `app/(admin)/admin/page.tsx`
  - `app/(admin)/admin/menu/page.tsx`
  - `app/(admin)/admin/users/page.tsx`
  - `app/(admin)/admin/audit/page.tsx`
- Dev tools:
  - `app/dev/role-switcher/page.tsx`
  - `app/dev/multi-role/page.tsx`
  - `app/dev/mock-stripe/page.tsx`
  - `app/dev/ui/page.tsx`

## Component/State Hierarchy
- Layout root: `app/layout.tsx` -> global shell + route children
- Route-group layouts: role-specific wrappers and navigation
- Mutation pattern: form submit -> server action -> re-render/redirect
- Local state: mostly UI state + cookie-backed cart (`lib/cart-cookie.ts`)

## Frontend Data Flow
```text
Page render
  -> server component fetches Prisma-backed data
  -> user submits form/button action
  -> server action mutation
  -> redirect/revalidate and render updated state
```

## Shared UI/Data Helpers
- Menu shaping: `lib/menu/grouped-taxonomy.ts`, `lib/menu/select-popular-items.ts`
- Media hygiene: `lib/menu/resolve-menu-image-url.ts`, `lib/menu/featured-menu-image-quality.ts`
- Checkout totals: `lib/customer/checkout-pricing.ts`

## Notes
- App follows role-sliced page ownership instead of centralized feature modules
- No dedicated client-side global store; server actions are the primary mutation boundary
# Frontend Codemap — Next.js 16 + React 19

**Last Updated:** 2026-05-07  
**Framework:** Next.js 16.2.4, React 19.2.4, Tailwind CSS 4, TypeScript 5  
**Entry Points:** `app/layout.tsx`, `app/page.tsx`

## Architecture

```
app/
├── layout.tsx              [Root layout, session provider, middleware]
├── page.tsx                [Landing hub with role descriptions]
├── (customer)/             [Route group: customer role]
│   ├── layout.tsx          [Customer sidebar layout]
│   ├── customer/
│   │   ├── page.tsx        [Home: menu + cart preview]
│   │   ├── items/[id]/     [Item detail + add to cart]
│   │   ├── cart/           [Cart review + total pricing]
│   │   ├── checkout/       [Payment form, address collection]
│   │   ├── orders/         [Order history list]
│   │   ├── orders/[id]/    [Order detail + delivery tracking]
│   │   └── actions.ts      [Server actions: order submit, payment]
│   └── customer/layout.tsx [Customer section wrapper]
├── (kitchen)/              [Route group: kitchen role]
│   ├── layout.tsx          [Kitchen sidebar + status bar]
│   ├── kitchen/
│   │   ├── page.tsx        [Order queue, status transitions]
│   │   └── actions.ts      [Server actions: mark ready, etc.]
│   └── kitchen/layout.tsx
├── (driver)/               [Route group: driver role]
│   ├── layout.tsx          [Driver navigation]
│   ├── driver/
│   │   ├── page.tsx        [Pending deliveries list]
│   │   ├── driver-buttons.tsx [Claim & complete delivery buttons]
│   │   └── actions.ts      [Server actions: claim, deliver]
│   └── driver/layout.tsx
├── (admin)/                [Route group: admin role]
│   ├── layout.tsx          [Admin sidebar]
│   ├── admin/
│   │   ├── page.tsx        [Dashboard: metrics, quick links]
│   │   ├── menu/           [Menu item CRUD]
│   │   ├── users/          [User management, role assignment]
│   │   ├── audit/          [Order history audit, event log]
│   │   └── actions.ts      [Server actions: menu updates, user mgmt]
│   └── admin/layout.tsx
├── auth/                   [No route group: public auth pages]
│   ├── login/page.tsx      [Email + password login form]
│   ├── signup/page.tsx     [Email + password + role signup]
│   ├── actions.ts          [Server actions: auth submit]
│   └── login/actions.ts    [Duplicate of auth/actions.ts?]
└── dev/                    [Development-only, no auth gate]
    ├── role-switcher/page.tsx   [Legacy multi-role switcher]
    ├── role-switcher/actions.ts [Mock auth for testing]
    ├── multi-role/page.tsx      [Four-pane iframe lab]
    ├── mock-stripe/page.tsx     [Webhook simulator]
    ├── mock-stripe/actions.ts   [Stripe event triggers]
    └── ui/page.tsx              [UI component gallery]
```

## Key Components & Page Hierarchy

### Public Pages
| Page | File | Purpose |
|------|------|---------|
| Landing Hub | `app/page.tsx` | Entry point, role descriptions, login link |
| Login | `app/auth/login/page.tsx` | Credential validation |
| Signup | `app/auth/signup/page.tsx` | New user registration (role selection) |

### Customer Pages (Gated)
| Page | File | Purpose |
|------|------|---------|
| Menu & Cart | `app/(customer)/customer/page.tsx` | Browse items, view cart items |
| Item Detail | `app/(customer)/customer/items/[id]/page.tsx` | View description, nutrition, reviews; add to cart |
| Cart Review | `app/(customer)/customer/cart/page.tsx` | Line items, qty adjust, remove, subtotal |
| Checkout | `app/(customer)/customer/checkout/page.tsx` | Address form, payment method, confirm order |
| Order History | `app/(customer)/customer/orders/page.tsx` | List of user's orders (paginated) |
| Order Detail | `app/(customer)/customer/orders/[id]/page.tsx` | Status timeline, delivery tracking, receipt |

### Kitchen Pages (Gated)
| Page | File | Purpose |
|------|------|---------|
| Order Queue | `app/(kitchen)/kitchen/page.tsx` | Live orders, status transitions (received → preparing → ready) |

### Driver Pages (Gated)
| Page | File | Purpose |
|------|------|---------|
| Pending Deliveries | `app/(driver)/driver/page.tsx` | Unassigned orders, "Claim" button, assigned orders list |

### Admin Pages (Gated)
| Page | File | Purpose |
|------|------|---------|
| Dashboard | `app/(admin)/admin/page.tsx` | KPI cards, recent orders, action links |
| Menu Management | `app/(admin)/admin/menu/page.tsx` | Add/edit/delete menu items, toggle availability |
| User Management | `app/(admin)/admin/users/page.tsx` | List users, change roles, reset passwords |
| Audit Log | `app/(admin)/admin/audit/page.tsx` | Order history, event timeline, actor audit trail |

### Dev Pages (Unprotected)
| Page | File | Purpose |
|------|------|---------|
| Role Switcher | `app/dev/role-switcher/page.tsx` | Quick auth as each role (dev only) |
| Multi-Role Lab | `app/dev/multi-role/page.tsx` | Four iframes (customer, kitchen, driver, admin) side-by-side |
| Mock Stripe | `app/dev/mock-stripe/page.tsx` | Trigger fake webhook events |
| UI Gallery | `app/dev/ui/page.tsx` | Storybook-like component showcase |

## Layout Hierarchy & Session Guard

```
app/layout.tsx (root)
├── Supabase middleware applied via lib/supabase/middleware.ts
├── Session cookie decoded from mc_session
├── Role RBAC check in each route group layout
└── Renders children

app/(customer)/layout.tsx
├── Checks session.user.role === 'CUSTOMER'
├── If not authorized, redirects to /auth/login
└── Renders sidebar + customer-specific UI

[Similar pattern for kitchen, driver, admin]
```

## Styling & Component Strategy

- **Tailwind CSS 4**: Utility-first styling
- **Next.js Image**: Optimized image serving for menu items
- **Custom Components**: Minimal custom components; mostly semantic HTML + Tailwind
- **Form Handling**: Native `<form>` elements with server actions (no client-side form libraries)
- **State Management**: React `useState` for UI-only state; server actions for mutations

## Data Flow: Order Submission

```
Customer Item Card
    ↓ (add to cart)
Cookie: cart JSON (items array)
    ↓ (checkout)
Checkout Form
    ↓ (form submit)
app/(customer)/customer/actions.ts → completeOrder()
    ↓
Prisma: create Order + OrderItems
    ↓
lib/payments/mock.ts → simulateStripeCheckout()
    ↓
Redirect to /customer/orders/[id]
    ↓
Order Detail Page (display status + delivery tracking)
```

## Auth & Session Flow

```
Login Page → /auth/actions.ts → verifyPassword()
    ↓
If valid:
  - Create session in cookies (lib/auth/cookie.ts)
  - Sign mc_session with SESSION_SECRET
  - Redirect to role-specific dashboard
  
If invalid:
  - Show error, stay on login page
  
On logout:
  - Delete mc_session cookie
  - Clear app-side session state
  - Redirect to login or landing
```

## Key Files & Responsibilities

| File | Responsibility |
|------|-----------------|
| `app/layout.tsx` | Root wrapper, session provider initialization |
| `app/page.tsx` | Landing hub, public entry point |
| `app/auth/actions.ts` | Login/signup server actions |
| `app/(customer)/customer/actions.ts` | Order submit, payment, cart operations |
| `app/(kitchen)/kitchen/actions.ts` | Status transitions (received → preparing → ready) |
| `app/(driver)/driver/actions.ts` | Claim delivery, mark delivered |
| `app/(admin)/admin/actions.ts` | Menu CRUD, user management |
| `app/(customer)/customer/layout.tsx` | Customer role guard + sidebar |
| `app/(kitchen)/kitchen/layout.tsx` | Kitchen role guard + sidebar |
| `app/(driver)/driver/layout.tsx` | Driver role guard + sidebar |
| `app/(admin)/admin/layout.tsx` | Admin role guard + sidebar |

## Server Actions

All mutations run as server actions (in `app/*/actions.ts` files):

- `completeOrder()` — Create order, validate items, apply pricing
- `addToCart()` — Append item to cart cookie
- `updateOrderStatus()` — Transition order state (kitchen/driver only)
- `claimDelivery()` — Assign delivery to driver
- `markDelivered()` — Complete delivery
- `createMenuItem()` / `updateMenuItem()` — Admin menu CRUD
- `createUser()` / `updateUser()` — Admin user management

## Development Notes

1. **Client-side cart:** Stored in signed cookie, not state. Survives page refreshes.
2. **Image optimization:** Menu item images served through Supabase Storage (mocked) or CDN.
3. **Real-time updates:** Currently mocked via polling; ready for Supabase Realtime.
4. **Route guards:** Role checks happen in layout components before rendering pages.
5. **Error handling:** Server actions return `{ error?: string }` for client-side toast display.

## Related Codemaps

- **[Backend & API](./BACKEND.md)** — Server actions, route handlers
- **[Auth & RBAC](./AUTH.md)** — Session management, role checks
- **[Integrations](./INTEGRATIONS.md)** — Supabase, Stripe, Realtime

## Performance Considerations

- **ISR/SSG:** Pages revalidate on content changes (e.g., menu updates)
- **Image optimization:** Lazy-loaded menu item images with responsive srcset
- **Query optimization:** Customer page uses `select` to fetch only visible order fields
- **Cookie size:** Cart cookie kept under 4KB (typically 20–50 items max)

---

**Next:** See [Backend & API](./BACKEND.md) for server-side implementation details.
