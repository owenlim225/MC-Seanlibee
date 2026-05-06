# Utils & Helpers Codemap — Shared Utilities, Validators, and Business Logic

**Last Updated:** 2026-05-06  
**Entry Points:** `lib/menu/`, `lib/customer/`, `lib/rbac.ts`, `lib/roles.ts`

## Utilities Organization

```
lib/
├── menu/                       [Menu-related utilities]
│   ├── grouped-taxonomy.ts     [Organize menu by category]
│   ├── select-popular-items.ts [Fetch trending items]
│   ├── resolve-menu-image-url.ts [Handle image optimization]
│   └── featured-menu-image-quality.ts [Image quality config]
├── customer/                   [Customer-specific logic]
│   └── checkout-pricing.ts     [Calculate totals + tax]
├── rbac.ts                     [Role-based access checks]
├── roles.ts                    [Role definitions]
├── cart-cookie.ts              [Cart state management]
└── prisma.ts                   [Prisma client singleton]
```

## Menu Utilities (`lib/menu/`)

### Grouped Taxonomy (`lib/menu/grouped-taxonomy.ts`)

Fetch and organize menu items by category:

```typescript
export interface GroupedMenu {
  categories: MenuCategory[]
  itemsByCategory: Record<string, MenuItem[]>
}

export async function getGroupedMenuTaxonomy(): Promise<GroupedMenu> {
  // 1. Fetch categories sorted by custom order
  const categories = await prisma.menuCategory.findMany({
    orderBy: { sortOrder: "asc" },
    select: { id: true, slug: true, name: true, sortOrder: true }
  })
  
  // 2. Fetch items linked to each category
  const itemsByCategory: Record<string, MenuItem[]> = {}
  
  for (const category of categories) {
    const items = await prisma.menuItemCategory.findMany({
      where: { categoryId: category.id },
      include: {
        menuItem: {
          select: {
            id: true,
            name: true,
            description: true,
            priceCents: true,
            imageUrl: true,
            isAvailable: true
          }
        }
      },
      orderBy: { menuItem: { name: "asc" } }
    })
    
    itemsByCategory[category.slug] = items.map(link => link.menuItem)
  }
  
  return { categories, itemsByCategory }
}
```

**Usage:**

```typescript
// app/(customer)/customer/page.tsx

export default async function CustomerPage() {
  const { categories, itemsByCategory } = await getGroupedMenuTaxonomy()
  
  return (
    <div>
      {categories.map(cat => (
        <section key={cat.id}>
          <h2>{cat.name}</h2>
          <div className="grid">
            {itemsByCategory[cat.slug].map(item => (
              <MenuItem key={item.id} item={item} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
```

### Popular Items (`lib/menu/select-popular-items.ts`)

Fetch trending menu items (based on order frequency):

```typescript
export interface PopularItem {
  menuItemId: string
  name: string
  priceCents: number
  imageUrl?: string
  orderCount: number
}

export async function getPopularMenuItems(limit: number = 6): Promise<PopularItem[]> {
  // 1. Group order items by menu item
  const aggregated = await prisma.orderItem.groupBy({
    by: ["menuItemId"],
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: limit
  })
  
  // 2. Join with menu items for display info
  const itemIds = aggregated.map(a => a.menuItemId)
  const items = await prisma.menuItem.findMany({
    where: { id: { in: itemIds } },
    select: { id: true, name: true, priceCents: true, imageUrl: true }
  })
  
  // 3. Merge counts
  return aggregated.map(agg => {
    const item = items.find(i => i.id === agg.menuItemId)!
    return {
      menuItemId: item.id,
      name: item.name,
      priceCents: item.priceCents,
      imageUrl: item.imageUrl,
      orderCount: agg._count.id
    }
  })
}
```

**Usage:**

```typescript
// Components: Featured section on landing page
const popularItems = await getPopularMenuItems(5)
```

### Image URL Resolution (`lib/menu/resolve-menu-image-url.ts`)

Handle CDN, fallback, and optimization:

```typescript
const FALLBACK_IMAGE = "/images/placeholder-menu-item.png"

export function resolveMenuImageUrl(imageUrl?: string): string {
  if (!imageUrl) return FALLBACK_IMAGE
  
  // If already a full URL, return as-is
  if (imageUrl.startsWith("http")) return imageUrl
  
  // If relative path, prepend CDN/bucket base
  return `${process.env.NEXT_PUBLIC_STORAGE_URL}/${imageUrl}`
}

export function getOptimizedImageUrl(url: string, width: number = 300): string {
  if (url.includes("mock-cdn")) {
    // Mock CDN: add query params for width
    return `${url}&w=${width}`
  }
  
  // Real CDN (e.g., Supabase): use transform params
  return `${url}?width=${width}&quality=80`
}
```

**Usage:**

```typescript
// Component: Menu item card
<img
  src={getOptimizedImageUrl(resolveMenuImageUrl(item.imageUrl), 300)}
  alt={item.name}
/>
```

### Image Quality Config (`lib/menu/featured-menu-image-quality.ts`)

```typescript
export const MENU_IMAGE_SIZES = {
  thumbnail: 150,  // 150px for list/cart
  detail: 500,     // 500px for product detail
  hero: 1200       // 1200px for featured banner
}

export const MENU_IMAGE_QUALITY = {
  thumbnail: 70,
  detail: 85,
  hero: 90
}

export function getMenuImageUrl(
  baseUrl: string,
  size: keyof typeof MENU_IMAGE_SIZES
): string {
  const width = MENU_IMAGE_SIZES[size]
  const quality = MENU_IMAGE_QUALITY[size]
  return `${baseUrl}?w=${width}&q=${quality}`
}
```

## Customer Utilities (`lib/customer/`)

### Checkout Pricing (`lib/customer/checkout-pricing.ts`)

Calculate order total with tax, delivery, discounts:

```typescript
export interface PricingBreakdown {
  subtotalCents: number
  taxCents: number
  deliveryFeeCents: number
  discountCents: number
  totalCents: number
}

const TAX_RATE = 0.08  // 8% sales tax
const DELIVERY_FEE = 500  // $5.00 delivery fee

export function calculateCheckoutTotal(
  items: Array<{ priceCents: number; quantity: number }>,
  options?: {
    applyCoupon?: string
    waiveDelivery?: boolean
  }
): PricingBreakdown {
  // 1. Subtotal
  const subtotalCents = items.reduce(
    (sum, item) => sum + item.priceCents * item.quantity,
    0
  )
  
  // 2. Tax
  const taxCents = Math.round(subtotalCents * TAX_RATE)
  
  // 3. Delivery
  const deliveryFeeCents = options?.waiveDelivery ? 0 : DELIVERY_FEE
  
  // 4. Discount (example: SUMMER2024 = $10 off)
  let discountCents = 0
  if (options?.applyCoupon === "SUMMER2024") {
    discountCents = 1000  // $10 off
  }
  
  // 5. Total
  const totalCents = subtotalCents + taxCents + deliveryFeeCents - discountCents
  
  return {
    subtotalCents,
    taxCents,
    deliveryFeeCents,
    discountCents,
    totalCents
  }
}
```

**Usage:**

```typescript
// app/(customer)/customer/checkout/page.tsx

const cart = parseCartCookie(cookies().get("cart"))
const pricing = calculateCheckoutTotal(cart.items, {
  applyCoupon: formData.coupon
})

return (
  <div>
    <p>Subtotal: ${pricing.subtotalCents / 100}</p>
    <p>Tax: ${pricing.taxCents / 100}</p>
    <p>Delivery: ${pricing.deliveryFeeCents / 100}</p>
    {pricing.discountCents > 0 && (
      <p>Discount: -${pricing.discountCents / 100}</p>
    )}
    <h3>Total: ${pricing.totalCents / 100}</h3>
  </div>
)
```

## Role-Based Access Control (`lib/rbac.ts`)

Role checkers (complements `lib/roles.ts`):

```typescript
import { Role } from "@prisma/client"
import { getSession } from "@/lib/auth"

export async function requireRole(...roles: Role[]): Promise<SessionData> {
  const session = await getSession()
  if (!session) throw new Error("Unauthorized")
  if (!roles.includes(session.role)) throw new Error("Forbidden")
  return session
}

export async function requireAnyRole(...roles: Role[]): Promise<SessionData> {
  return requireRole(...roles)
}

export async function requireAdmin(): Promise<SessionData> {
  return requireRole(Role.ADMIN)
}

export async function isCustodian(): Promise<boolean> {
  const session = await getSession()
  return session?.role !== Role.CUSTOMER ?? false
}

export async function canDeleteMenuItem(userId: string): Promise<boolean> {
  const session = await requireRole(Role.ADMIN)
  return session.userId === userId || (await isAdmin(userId))
}

async function isAdmin(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  })
  return user?.role === Role.ADMIN
}
```

**Usage in server actions:**

```typescript
// app/(admin)/admin/actions.ts

"use server"

export async function deleteMenuItem(id: string) {
  await requireAdmin()  // Throws if not admin
  
  // Safe to proceed
  await prisma.menuItem.delete({ where: { id } })
}
```

## Roles Definition (`lib/roles.ts`)

```typescript
export enum Role {
  CUSTOMER = "CUSTOMER",
  KITCHEN = "KITCHEN",
  DRIVER = "DRIVER",
  ADMIN = "ADMIN"
}

export const ROLE_LABELS: Record<Role, string> = {
  [Role.CUSTOMER]: "Customer",
  [Role.KITCHEN]: "Kitchen Staff",
  [Role.DRIVER]: "Delivery Driver",
  [Role.ADMIN]: "Administrator"
}

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  [Role.CUSTOMER]: "Browse menu, order, track deliveries",
  [Role.KITCHEN]: "Receive orders, manage preparation",
  [Role.DRIVER]: "Pick up orders, deliver to customers",
  [Role.ADMIN]: "Manage menu, users, and audit log"
}

export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  [Role.CUSTOMER]: [
    "browse_menu",
    "create_order",
    "view_own_orders",
    "track_delivery"
  ],
  [Role.KITCHEN]: [
    "view_queue",
    "update_order_status",
    "view_customer_details"
  ],
  [Role.DRIVER]: [
    "view_pending_deliveries",
    "claim_delivery",
    "mark_delivered"
  ],
  [Role.ADMIN]: [
    "manage_menu",
    "manage_users",
    "change_user_roles",
    "view_audit_log"
  ]
}

export function hasPermission(role: Role, permission: string): boolean {
  return ROLE_PERMISSIONS[role].includes(permission)
}

export function getRoleLabel(role: Role): string {
  return ROLE_LABELS[role] ?? "Unknown"
}
```

## Cart Cookie Management (`lib/cart-cookie.ts`)

```typescript
export interface CartItem {
  menuItemId: string
  quantity: number
}

export interface Cart {
  items: CartItem[]
  lastUpdated: number
}

const CART_MAX_ITEMS = 100
const CART_MAX_BYTES = 4000  // Cookies have ~4KB limit

export function parseCartCookie(cookie?: { value: string }): Cart {
  if (!cookie?.value) {
    return { items: [], lastUpdated: Date.now() }
  }
  
  try {
    const decoded = JSON.parse(Buffer.from(cookie.value, "base64").toString())
    return {
      items: decoded.items || [],
      lastUpdated: decoded.lastUpdated || Date.now()
    }
  } catch {
    return { items: [], lastUpdated: Date.now() }
  }
}

export function serializeCart(cart: Cart): string {
  const json = JSON.stringify(cart)
  if (json.length > CART_MAX_BYTES) {
    console.warn(`Cart exceeds ${CART_MAX_BYTES} bytes`)
  }
  return Buffer.from(json).toString("base64")
}

export function addToCart(cart: Cart, menuItemId: string, quantity: number): Cart {
  const existing = cart.items.find(i => i.menuItemId === menuItemId)
  
  if (existing) {
    existing.quantity += quantity
  } else {
    cart.items.push({ menuItemId, quantity })
  }
  
  cart.lastUpdated = Date.now()
  return cart
}

export function removeFromCart(cart: Cart, menuItemId: string): Cart {
  cart.items = cart.items.filter(i => i.menuItemId !== menuItemId)
  cart.lastUpdated = Date.now()
  return cart
}

export function clearCart(): Cart {
  return { items: [], lastUpdated: Date.now() }
}
```

**Usage:**

```typescript
// Component: Add to cart button

"use client"

import { addToCart, parseCartCookie, serializeCart } from "@/lib/cart-cookie"

export function AddToCartButton({ menuItemId }: { menuItemId: string }) {
  const handleClick = () => {
    const cartCookie = document.cookie
      .split("; ")
      .find(row => row.startsWith("cart="))
    
    let cart = parseCartCookie(cartCookie ? { value: cartCookie.split("=")[1] } : undefined)
    cart = addToCart(cart, menuItemId, 1)
    
    document.cookie = `cart=${serializeCart(cart)}; path=/`
  }
  
  return <button onClick={handleClick}>Add to Cart</button>
}
```

## Testing Utilities

### Test helpers:

```typescript
// __tests__/helpers.ts

import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/auth/password"
import { Role } from "@prisma/client"

export async function createTestUser(
  role: Role = Role.CUSTOMER,
  email: string = `test-${Date.now()}@example.com`
) {
  return prisma.user.create({
    data: {
      email,
      password: hashPassword("Test123!"),
      role,
      name: "Test User"
    }
  })
}

export async function createTestMenuItem(
  name: string = "Test Item",
  priceCents: number = 1599
) {
  return prisma.menuItem.create({
    data: { name, priceCents, description: "Test" }
  })
}

export async function createTestOrder(userId: string) {
  return prisma.order.create({
    data: {
      customerId: userId,
      totalCents: 1599,
      status: "RECEIVED"
    }
  })
}
```

## Performance Considerations

1. **Menu loading:** Cache `getGroupedMenuTaxonomy()` for 1 hour (ISR)
2. **Popular items:** Recalculate daily (cron job or scheduled Vercel Function)
3. **Cart cookie:** Limit to 100 items or 4KB (validate on checkout)
4. **Image URLs:** Pre-compute in batch; cache in Redis if using real CDN

## Related Codemaps

- **[Backend & API](./BACKEND.md)** — Server action patterns
- **[Database](./DATABASE.md)** — Query optimization
- **[Frontend](./FRONTEND.md)** — Component usage of utilities

## FAQ

**Q: Why is cart stored in cookies instead of database?**  
A: Cookies don't require auth to read; useful for abandoned cart recovery. Downside: 4KB limit. Use sessions if you have larger carts.

**Q: How do I add new roles?**  
A: Update `Role` enum in `prisma/schema.prisma`, add to `ROLE_LABELS` / `ROLE_PERMISSIONS` in `lib/roles.ts`, then add RBAC checks in layout components.

**Q: Can I use these utilities in client components?**  
A: No—utilities use `prisma` and `getSession()` (server-only). Wrap in server actions if needed.

---

**Next:** See [Frontend](./FRONTEND.md) to see utilities in action.
