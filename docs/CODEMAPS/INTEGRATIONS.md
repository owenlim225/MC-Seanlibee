# Integrations Codemap — Mocked External Services & API Patterns

**Last Updated:** 2026-05-06  
**Status:** MVP with mocked integrations (see `docs/follow-up.md` for real key wiring)  
**Entry Points:** `lib/payments/`, `lib/realtime/`, `lib/storage/`, `lib/supabase/`

## Mocked Integrations Overview

```
Production Integrations (TODO: Real Keys)
├── Stripe Payment Processing (Checkout, Webhooks)
├── Supabase Auth (Cookies, JWT, OAuth)
├── Supabase Realtime (Channel pub/sub)
└── Supabase Storage (File upload, signed URLs)

MVP Mocks (Currently Deployed)
├── lib/payments/mock.ts → Simulates successful payments
├── lib/auth/mock.ts → Uses app-managed sessions (Prisma User)
├── lib/realtime/mock.ts → In-memory channel simulation
└── lib/storage/mock.ts → Returns fake image URLs
```

## Payment Integration (`lib/payments/`)

### Current: Mock Implementation

```typescript
// lib/payments/mock.ts

export interface StripeCheckoutSession {
  success: boolean
  transactionId?: string
  error?: string
}

export async function simulateStripeCheckout(
  order: Order,
  token?: string
): Promise<StripeCheckoutSession> {
  // 1. Log payment attempt
  console.log(`[MOCK] Processing Stripe checkout for order ${order.id}`)
  
  // 2. Simulate 75% success rate (for testing error flows)
  const success = Math.random() > 0.25
  
  if (!success) {
    console.error(`[MOCK] Payment declined`)
    throw new Error("Payment declined by card issuer")
  }
  
  // 3. Mark order as RECEIVED (confirmed payment)
  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: OrderStatus.RECEIVED,
      paidAt: new Date()
    }
  })
  
  console.log(`[MOCK] Payment successful`)
  
  return {
    success: true,
    transactionId: `mock-tx-${order.id}`
  }
}

// TODO(stripe-checkout-001): Replace with real Stripe SDK
```

**Usage:**

```typescript
// app/(customer)/customer/actions.ts

export async function completeOrder(formData: CheckoutFormData) {
  const order = await prisma.order.create(...)
  
  try {
    await simulateStripeCheckout(order, formData.stripeToken)
    redirect(`/customer/orders/${order.id}`)
  } catch (err) {
    // Handle payment failure
    return { error: err.message }
  }
}
```

### Future: Real Stripe Integration

**Checklist (from `docs/follow-up.md`):**

| Tag | Location | Replace with |
|-----|----------|--------------|
| `stripe-checkout-001` | `lib/payments/mock.ts` | Stripe Checkout Sessions (`STRIPE_SECRET_KEY`) |
| `stripe-webhook-002` | `lib/payments/mock.ts` | Webhook handler verifying `STRIPE_WEBHOOK_SECRET` |

**Implementation sketch:**

```typescript
// lib/payments/index.ts (future)

import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "")

export async function createCheckoutSession(order: Order) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: `Order ${order.id}` },
          unit_amount: order.totalCents
        },
        quantity: 1
      }
    ],
    mode: "payment",
    success_url: `${process.env.NEXT_PUBLIC_URL}/customer/orders/${order.id}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/customer/cart`
  })
  
  return session
}

export async function handleWebhook(rawBody: Buffer, signature: string) {
  const event = stripe.webhooks.constructEvent(
    rawBody,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET || ""
  )
  
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session
    // Match to order, mark as paid
  }
}
```

**Setup:**
1. Add `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` to `.env`
2. Install Stripe SDK: `pnpm add stripe`
3. Create webhook endpoint: `app/api/webhooks/stripe/route.ts`
4. Update `lib/payments/index.ts` to call real Stripe

## Authentication Integration (`lib/auth/`)

### Current: App-Managed (Prisma User Table)

**Session flow:**
1. User submits email + password on login page
2. `app/auth/actions.ts` → `authenticate()` queries `Prisma.user.findUnique()`
3. Verify scrypt-hashed password
4. Sign JWT (using `SESSION_SECRET`) and store in `mc_session` cookie
5. Redirect to role dashboard

**No external service called** — all auth logic local.

### Future: Supabase Auth Integration

**Checklist (from `docs/follow-up.md`):**

| Tag | Location | Replace with |
|-----|----------|--------------|
| `auth-mock-001` | `lib/auth/mock.ts` | Supabase Auth + `@supabase/ssr` cookie adapters |

**Implementation sketch:**

```typescript
// lib/supabase/auth-provider.ts (future)

import { createBrowserClient } from "@supabase/ssr"

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function authenticateWithSupabase(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  
  if (error) throw error
  
  // data.session contains JWT + user info
  // Cookie adapter stores automatically
  return data.user
}

export async function signUpWithSupabase(
  email: string,
  password: string,
  metadata: { role: Role; name: string }
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata  // Store role + name in Supabase Auth metadata
    }
  })
  
  return data
}
```

**Setup:**
1. Create Supabase project at supabase.com
2. Add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env`
3. Update `lib/supabase/middleware.ts` to use `@supabase/ssr` adapter
4. Backfill existing users: `pnpm db:backfill:auth-user-id`

## Realtime Integration (`lib/realtime/`)

### Current: Mock Implementation

```typescript
// lib/realtime/mock.ts

interface MockChannel {
  name: string
  callbacks: Map<string, Function[]>
}

const channels = new Map<string, MockChannel>()

export function createRealtimeChannel(name: string): MockChannel {
  if (!channels.has(name)) {
    channels.set(name, { name, callbacks: new Map() })
  }
  return channels.get(name)!
}

export function subscribeToChannel(
  channel: MockChannel,
  event: string,
  callback: (payload: any) => void
) {
  if (!channel.callbacks.has(event)) {
    channel.callbacks.set(event, [])
  }
  channel.callbacks.get(event)!.push(callback)
}

export async function publishToChannel(
  channel: MockChannel,
  event: string,
  payload: any
) {
  console.log(`[MOCK] Published ${event} to ${channel.name}:`, payload)
  
  // Trigger all subscribed callbacks
  const callbacks = channel.callbacks.get(event) || []
  for (const callback of callbacks) {
    callback(payload)
  }
}

// TODO(realtime-supabase-001): Use supabaseClient.channel() + subscribe()
```

**Usage (server-side):**

```typescript
// lib/orders/publish-update.ts

export async function publishOrderUpdate(orderId: string, status: OrderStatus) {
  const channel = createRealtimeChannel(`order:${orderId}`)
  await publishToChannel(channel, "status-change", {
    orderId,
    newStatus: status,
    at: new Date()
  })
}
```

**Usage (browser-side):**

```typescript
// app/(customer)/customer/orders/[id]/page.tsx

useEffect(() => {
  const channel = createRealtimeChannel(`order:${orderId}`)
  subscribeToChannel(channel, "status-change", (payload) => {
    setOrder(prev => ({ ...prev, status: payload.newStatus }))
  })
  
  return () => {
    // Unsubscribe
  }
}, [orderId])
```

### Future: Supabase Realtime

**Checklist:**

| Tag | Location | Replace with |
|-----|----------|--------------|
| `realtime-supabase-001` | `lib/realtime/mock.ts` | Channel pub/sub via Supabase Realtime |
| `realtime-supabase-002` | `lib/realtime/browser.ts` | Remove `BroadcastChannel`; use Supabase JS client |

**Implementation sketch:**

```typescript
// lib/realtime/index.ts (future)

import { supabase } from "@/lib/supabase/server"

export async function publishOrderUpdate(orderId: string, status: OrderStatus) {
  await supabase
    .channel(`order:${orderId}`)
    .send("broadcast", {
      event: "status-change",
      payload: { newStatus: status, at: new Date() }
    })
}

// Browser side:
useEffect(() => {
  const channel = supabase
    .channel(`order:${orderId}`)
    .on("broadcast", { event: "status-change" }, (payload) => {
      setOrder(prev => ({ ...prev, status: payload.payload.newStatus }))
    })
    .subscribe()
  
  return () => {
    channel.unsubscribe()
  }
}, [orderId])
```

## File Storage Integration (`lib/storage/`)

### Current: Mock Implementation

```typescript
// lib/storage/mock.ts

export interface StorageUploadResult {
  url: string
  path: string
  error?: string
}

export async function uploadToStorage(
  bucket: string,
  path: string,
  file: File
): Promise<StorageUploadResult> {
  // 1. Validate file
  const maxSize = 5 * 1024 * 1024  // 5MB
  if (file.size > maxSize) {
    return { url: "", path: "", error: "File too large" }
  }
  
  // 2. Generate mock URL
  const mockUrl = `https://mock-cdn.example.com/${bucket}/${path}?t=${Date.now()}`
  
  console.log(`[MOCK] Uploaded ${file.name} to ${bucket}/${path}`)
  console.log(`[MOCK] URL: ${mockUrl}`)
  
  return {
    url: mockUrl,
    path: `${bucket}/${path}`
  }
}

// TODO(storage-supabase-001): Use Supabase Storage signed URLs + policies
```

**Usage:**

```typescript
// app/(admin)/admin/menu/actions.ts

export async function uploadMenuItemImage(file: File) {
  const result = await uploadToStorage(
    "menu-items",
    `${Date.now()}-${file.name}`,
    file
  )
  
  if (result.error) throw new Error(result.error)
  
  // Use result.url in database
  await prisma.menuItem.update({
    where: { id },
    data: { imageUrl: result.url }
  })
}
```

### Future: Supabase Storage

**Checklist:**

| Tag | Location | Replace with |
|-----|----------|--------------|
| `storage-supabase-001` | `lib/storage/mock.ts` | Supabase Storage with signed URLs + RLS policies |

**Implementation sketch:**

```typescript
// lib/storage/index.ts (future)

import { supabase } from "@/lib/supabase/server"

export async function uploadToStorage(
  bucket: string,
  path: string,
  file: File
): Promise<StorageUploadResult> {
  const buffer = await file.arrayBuffer()
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, buffer, {
      contentType: file.type,
      cacheControl: "3600"
    })
  
  if (error) return { url: "", path: "", error: error.message }
  
  // Generate signed URL (1-hour expiry)
  const { data: urlData } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, 3600)
  
  return {
    url: urlData?.signedUrl || "",
    path: data.path
  }
}
```

## Integration Checklist

All mocks are tagged with `TODO(real-keys:…)` markers:

```bash
# Find all integration TODOs
rg "TODO\\(real-keys:" --glob '!docs/follow-up.md'
```

**Current inventory:**

| Tag | File | Status |
|-----|------|--------|
| `auth-mock-001` | `lib/auth/mock.ts:15` | App-managed (ready for Supabase Auth) |
| `stripe-checkout-001` | `lib/payments/mock.ts:9` | Mock (ready for real Stripe) |
| `stripe-webhook-002` | `lib/payments/mock.ts:18` | Mock (ready for webhook handler) |
| `realtime-supabase-001` | `lib/realtime/mock.ts:9` | Mock (ready for Supabase Realtime) |
| `realtime-supabase-002` | `lib/realtime/browser.ts:9` | Mock (ready for Supabase JS client) |
| `storage-supabase-001` | `lib/storage/mock.ts:2` | Mock (ready for Supabase Storage) |

## Environment Variables for Real Integrations

When wiring real services, set these in `.env`:

```env
# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Storage
SUPABASE_STORAGE_BUCKET=menu-items
```

## Testing Integrations

### Mock Stripe Checkout
```bash
curl -X POST http://localhost:3000/dev/mock-stripe/actions \
  -H "Content-Type: application/json" \
  -d '{ "orderId": "...", "action": "checkout" }'
```

### Manual Testing URLs
- `/dev/mock-stripe` — Trigger fake Stripe webhooks
- `/dev/multi-role` — Four-pane dev lab (test across roles)
- `/dev/role-switcher` — Quick auth as each role

## Performance & Scalability

**Current (mocks):**
- In-memory channels → single-process bottleneck
- Mock uploads → no persistence

**With real integrations:**
- Supabase Realtime → distributed pub/sub (scales to 100k+ connections)
- Stripe → handles fraud detection, compliance, PCI
- Supabase Storage → CDN-backed, CORS-enabled

## Related Codemaps

- **[Backend & API](./BACKEND.md)** — Server action patterns
- **[Database](./DATABASE.md)** — Prisma schema
- **[Frontend](./FRONTEND.md)** — Form handling, async UI

## FAQ

**Q: When should I wire real integrations?**  
A: Before launch. Start with Stripe (payment), then Supabase Auth (identity), then Realtime (UX polish).

**Q: Can I test locally with real credentials?**  
A: Yes! Set `STRIPE_TEST_KEY`, `SUPABASE_DEV_URL`, etc. in `.env.local` for local testing.

**Q: How do I handle webhook retries?**  
A: Stripe/Supabase send webhooks to your `/api/webhooks/[service]/route.ts`; idempotence via `idempotencyKey`.

---

**Next:** See `docs/follow-up.md` for complete integration checklist.
