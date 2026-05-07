<!-- Generated: 2026-05-07 | Files scanned: 128 core / 708 tracked | Token estimate: ~900 -->
# Backend

## Route Surface (App Router + Server Actions)
- `app/auth/actions.ts` -> login/signup/session setup
- `app/(customer)/customer/actions.ts` -> checkout/order mutations
- `app/(kitchen)/kitchen/actions.ts` -> kitchen status transitions
- `app/(driver)/driver/actions.ts` -> claim/deliver actions
- `app/(admin)/admin/actions.ts` -> admin menu/user management
- Dev-only: `app/dev/mock-stripe/actions.ts`, `app/dev/role-switcher/actions.ts`, `app/login/actions.ts`

## Middleware Chain
- `middleware.ts` -> delegates to `lib/supabase/middleware.ts`
- `lib/supabase/middleware.ts` -> request/session update and protected path handling
- Protected prefixes: `/customer`, `/kitchen`, `/driver`, `/admin`

## Service -> Repository Mapping
- Auth/session service: `lib/auth/*` -> Prisma `User` via actions
- Order workflows: action files -> `lib/customer/checkout-pricing.ts` + Prisma `Order*` models
- RBAC guard: `lib/rbac.ts` -> session provider `lib/auth/provider.ts`
- Payments abstraction: `lib/payments/index.ts` -> mock adapter `lib/payments/mock.ts`
- Realtime abstraction: `lib/realtime/index.ts` -> provider/mock/browser adapters
- Storage abstraction: `lib/storage/index.ts` -> provider/mock adapters
- Repository layer: direct Prisma client usage through `lib/prisma.ts` (no separate repo classes)

## Key Files
- `lib/prisma.ts` (Prisma singleton boundary)
- `lib/auth/provider.ts` (session decoding + user context)
- `lib/auth/password.ts` (hash/verify primitives)
- `lib/supabase/middleware.ts` (edge auth propagation)
- `lib/roles.ts`, `lib/rbac.ts` (role policy helpers)

## Integration Boundaries
- Payments: Stripe-like flow abstracted, currently mock-backed
- Realtime: provider interface + browser binding, currently mock-supported
- Storage: upload/provider interface, mock and provider tests present

## Observed Backend Pattern
```text
Server Action
  -> validate session/role
  -> compute/validate domain input
  -> Prisma mutation/query
  -> optional integration call (payments/realtime/storage)
  -> redirect or action result
```
# Backend & API Codemap — Server Actions, Handlers, and Middleware

**Last Updated:** 2026-05-06  
**Stack:** Next.js 16 server actions, middleware, edge runtime  
**Entry Points:** `lib/prisma.ts`, `app/*/actions.ts`, `lib/supabase/middleware.ts`

## Architecture

```
lib/
├── prisma.ts                   [Prisma client singleton]
├── auth/
│   ├── provider.ts             [Session provider: decode/validate cookie]
│   ├── index.ts                [Public: getSession, logout, etc.]
│   ├── cookie.ts               [Cookie sign/verify logic]
│   ├── password.ts             [Scrypt hash/verify]
│   ├── safe-next-path.ts       [Validate redirect URLs]
│   ├── session-secret.ts       [SESSION_SECRET loader]
│   └── mock.ts                 [Mock auth for dev]
├── supabase/
│   ├── server.ts               [Supabase server client (mocked)]
│   ├── middleware.ts           [Edge middleware: session extraction]
│   ├── env.ts                  [Environment variable validators]
│   └── provider.ts             [Realtime provider interface]
├── payments/
│   ├── index.ts                [Payment interface (mock)]
│   └── mock.ts                 [Mock Stripe checkout]
├── realtime/
│   ├── index.ts                [Realtime publish/subscribe]
│   ├── mock.ts                 [Mock in-memory channels]
│   ├── browser.ts              [Client-side subscribe]
│   └── provider.ts             [Type definitions]
├── storage/
│   ├── index.ts                [Storage upload interface (mock)]
│   └── mock.ts                 [Mock file upload]
├── rbac.ts                     [Role-based access checks]
└── roles.ts                    [Role definitions + helpers]

app/
├── auth/
│   └── actions.ts              [authenticate, signUp server actions]
├── (customer)/customer/
│   └── actions.ts              [completeOrder, etc.]
├── (kitchen)/kitchen/
│   └── actions.ts              [updateOrderStatus server actions]
├── (driver)/driver/
│   └── actions.ts              [claimDelivery, markDelivered]
└── (admin)/admin/
    └── actions.ts              [menu/user CRUD server actions]
```

## Execution Flow: Server Actions

### Authentication Server Action (Login)

```typescript
// app/auth/actions.ts

async function authenticate(email: string, password: string) {
  // 1. Query Prisma User table
  const user = await prisma.user.findUnique({ where: { email } })
  
  // 2. Verify password with scrypt
  const passwordValid = await verifyPassword(password, user.password)
  if (!passwordValid) throw new Error("Invalid credentials")
  
  // 3. Create session cookie (signed)
  const session = { userId: user.id, role: user.role, email: user.email }
  const signedCookie = signSession(session, SESSION_SECRET)
  
  // 4. Set mc_session cookie in response
  cookies().set("mc_session", signedCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  })
  
  // 5. Redirect to role dashboard
  redirect(`/${user.role.toLowerCase()}`)
}
```

### Order Submission Server Action

```typescript
// app/(customer)/customer/actions.ts

async function completeOrder(formData: CheckoutFormData) {
  // 1. Validate session
  const session = await getSession()
  if (!session?.user) throw new Error("Unauthorized")
  
  // 2. Check CUSTOMER role
  if (session.user.role !== Role.CUSTOMER) throw new Error("Forbidden")
  
  // 3. Parse cart from cookie
  const cart = parseCartCookie(cookies().get("cart"))
  if (!cart.items.length) throw new Error("Empty cart")
  
  // 4. Fetch current menu item prices (validate against price changes)
  const menuItems = await prisma.menuItem.findMany({
    where: { id: { in: cart.items.map(i => i.menuItemId) } },
    select: { id: true, priceCents: true, isAvailable: true }
  })
  
  // 5. Calculate total and create order + order items
  const order = await prisma.order.create({
    data: {
      customerId: session.user.id,
      totalCents: calculateTotal(cart, menuItems),
      items: {
        createMany: {
          data: cart.items.map(item => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            priceCentsAtOrder: menuItems.find(m => m.id === item.menuItemId)?.priceCents || 0
          }))
        }
      }
    },
    include: { items: true }
  })
  
  // 6. Mock Stripe payment
  await simulateStripeCheckout(order, formData.stripeToken)
  
  // 7. Clear cart cookie
  cookies().delete("cart")
  
  // 8. Redirect to order detail
  redirect(`/customer/orders/${order.id}`)
}
```

### Order Status Transition (Kitchen)

```typescript
// app/(kitchen)/kitchen/actions.ts

async function updateOrderStatus(orderId: string, toStatus: OrderStatus) {
  // 1. Validate session
  const session = await getSession()
  if (!session?.user) throw new Error("Unauthorized")
  
  // 2. Check KITCHEN role
  if (session.user.role !== Role.KITCHEN) throw new Error("Forbidden")
  
  // 3. Fetch current order state
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { events: { orderBy: { at: "desc" }, take: 1 } }
  })
  
  // 4. Validate transition (RECEIVED → PREPARING → READY)
  const fromStatus = order.status
  if (!isValidTransition(fromStatus, toStatus)) {
    throw new Error(`Cannot transition from ${fromStatus} to ${toStatus}`)
  }
  
  // 5. Update order status + log event
  const updated = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: toStatus,
      events: {
        create: {
          fromStatus,
          toStatus,
          actorUserId: session.user.id,
          at: new Date()
        }
      }
    }
  })
  
  // 6. Notify in real-time (if Supabase Realtime wired)
  await publishOrderUpdate(orderId, toStatus)
  
  return updated
}
```

## Key Modules

### Session Management (`lib/auth/`)

| Module | Purpose |
|--------|---------|
| `provider.ts` | Decode + validate `mc_session` cookie; return typed session object |
| `cookie.ts` | Sign session with SESSION_SECRET; verify signature on decode |
| `password.ts` | Scrypt hash/verify for password storage |
| `safe-next-path.ts` | Validate redirect URLs (prevent open redirects) |
| `index.ts` | Public API: `getSession()`, `logout()`, `createSession()` |

**Example:**

```typescript
// lib/auth/provider.ts
export async function getSession(): Promise<SessionType | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get("mc_session")?.value
  
  if (!sessionCookie) return null
  
  try {
    const session = verifySession(sessionCookie, SESSION_SECRET)
    return session // { userId, role, email, iat, exp }
  } catch (e) {
    console.error("Invalid session cookie:", e)
    return null
  }
}
```

### Prisma Client Singleton (`lib/prisma.ts`)

```typescript
// lib/prisma.ts
import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
```

**Why:** Prevents multiple Prisma instances in development (Next.js hot reload).

### RBAC (`lib/rbac.ts`)

```typescript
// lib/rbac.ts
export async function requireRole(...roles: Role[]) {
  const session = await getSession()
  if (!session) throw new Error("Unauthorized")
  if (!roles.includes(session.user.role)) throw new Error("Forbidden")
  return session
}

// Usage in server action:
async function deleteMenuItem(id: string) {
  const session = await requireRole(Role.ADMIN)
  // ... now safe to delete
}
```

### Middleware (`lib/supabase/middleware.ts`)

Runs on **every request** (before Next.js routing):

```typescript
// lib/supabase/middleware.ts
export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // 1. Decode session from mc_session cookie
  const session = await getSession()
  
  // 2. Attach session to request (accessible in route handlers, server actions)
  response.headers.set("X-Session", JSON.stringify(session))
  
  // 3. Check route access
  const pathname = request.nextUrl.pathname
  
  if (pathname.startsWith("/customer") && session?.user.role !== Role.CUSTOMER) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }
  
  // [Similar for /kitchen, /driver, /admin]
  
  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}
```

## Mocked Integrations

### Stripe Mock (`lib/payments/mock.ts`)

```typescript
// lib/payments/mock.ts
export async function simulateStripeCheckout(order: Order, token?: string) {
  // 1. Log payment attempt
  console.log(`[MOCK] Processing payment for order ${order.id}...`)
  
  // 2. Simulate webhook (75% success)
  const success = Math.random() > 0.25
  
  if (!success) {
    throw new Error("[MOCK] Stripe declined payment")
  }
  
  // 3. Update order to RECEIVED
  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: OrderStatus.RECEIVED,
      paidAt: new Date()
    }
  })
  
  return { success: true }
}
```

**TODO:** Replace with `STRIPE_SECRET_KEY` in `lib/payments/index.ts`.

### Supabase Auth Mock (`lib/auth/mock.ts`)

Currently, login/signup use **Prisma User** table directly (app-managed sessions).

**TODO:** Wire real Supabase Auth + `@supabase/ssr` cookie adapters.

### Realtime Mock (`lib/realtime/mock.ts`)

```typescript
// lib/realtime/mock.ts
class MockRealtimeChannel {
  constructor(private channelName: string) {}
  
  subscribe() { /* noop */ }
  
  on(event: string, callback: Function) {
    // In-memory BroadcastChannel simulation
    return this
  }
  
  send(event: string, payload: any) {
    // Mock publish to in-memory store
    console.log(`[MOCK] Published to ${this.channelName}:`, payload)
  }
}

export function createRealtimeChannel(name: string) {
  return new MockRealtimeChannel(name)
}
```

**TODO:** Replace with `supabaseClient.channel()` + `subscribe()`.

## Error Handling in Server Actions

```typescript
async function safeServerAction(fn: () => Promise<T>): Promise<{ data?: T; error?: string }> {
  try {
    const data = await fn()
    return { data }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error(message, err)
    return { error: message }
  }
}

// Usage:
const result = await safeServerAction(() => completeOrder(formData))
if (result.error) {
  // Show toast: result.error
} else {
  // Redirect or update UI
}
```

## Testing Server Actions

**Vitest + MSW (mock service worker):**

```typescript
// __tests__/actions.test.ts
import { describe, it, expect, beforeEach } from "vitest"
import { authenticate } from "@/app/auth/actions"
import { prisma } from "@/lib/prisma"

describe("authenticate", () => {
  beforeEach(() => {
    // Mock prisma.user.findUnique
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "user-123",
      email: "test@example.com",
      password: hashPassword("Demo123!"),
      role: Role.CUSTOMER,
      // ...
    })
  })
  
  it("should return session on valid credentials", async () => {
    const session = await authenticate("test@example.com", "Demo123!")
    expect(session).toBeDefined()
    expect(session.role).toBe(Role.CUSTOMER)
  })
  
  it("should throw on invalid password", async () => {
    await expect(
      authenticate("test@example.com", "WrongPassword")
    ).rejects.toThrow("Invalid credentials")
  })
})
```

## Related Codemaps

- **[Frontend](./FRONTEND.md)** — UI pages, forms, server action invocation
- **[Database](./DATABASE.md)** — Prisma schema, data models
- **[Auth & RBAC](./AUTH.md)** — Session + role-based access control
- **[Integrations](./INTEGRATIONS.md)** — Stripe, Supabase, Realtime

## Performance Optimizations

1. **Connection pooling:** Use `pgbouncer=true` in `DATABASE_URL` for serverless
2. **Query optimization:** Prisma `select` to avoid fetching unnecessary relations
3. **Caching:** Consider HTTP cache headers on read-only endpoints
4. **Batch operations:** Use `createMany` for bulk inserts (order items)

## Deployment Notes

1. **Vercel:** `pnpm build` runs `prisma migrate deploy` before `next build`
2. **Database:** Set `DATABASE_URL` (pooled) and `DIRECT_URL` (direct) in Vercel env
3. **Secrets:** `SESSION_SECRET` must be set and match across deployments
4. **Seed:** Run `pnpm db:seed` once after first deploy to populate demo data

---

**Next:** See [Database](./DATABASE.md) for schema and migration strategy.
