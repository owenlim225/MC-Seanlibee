# Database Codemap — Prisma + PostgreSQL Schema & Migrations

**Last Updated:** 2026-05-06  
**Engine:** PostgreSQL 14+ (Supabase or local)  
**ORM:** Prisma 6.19.0  
**Entry Points:** `prisma/schema.prisma`, `prisma/migrations/`

## Data Model Architecture

```
User (users)
├── Roles: CUSTOMER, KITCHEN, DRIVER, ADMIN
├── Relations:
│   ├── orders (CUSTOMER → Order)
│   ├── actedEvents (OrderStatusEvent)
│   └── deliveries (DeliveryAssignment)

MenuCategory (menu_categories)
├── Hierarchical menu taxonomy
├── Relations:
│   └── itemLinks (MenuItemCategory)

MenuItem (menu_items)
├── Menu products with pricing & availability
├── Relations:
│   ├── orderItems (OrderItem)
│   └── categoryLinks (MenuItemCategory)

MenuItemCategory (menu_item_categories)
├── Many-to-many: MenuItem ↔ MenuCategory
├── Indexes:
│   ├── (categoryId, menuItemId)
│   └── (menuItemId)

Order (orders)
├── Customer orders with status tracking
├── Status flow: PENDING_PAYMENT → RECEIVED → PREPARING → READY → PICKED_UP → DELIVERED | CANCELED
├── Relations:
│   ├── items (OrderItem)
│   ├── customer (User)
│   ├── events (OrderStatusEvent)
│   └── assignment (DeliveryAssignment)
├── Hot-path indexes:
│   ├── (status, createdAt) — fetch by status
│   └── (customerId, createdAt) — fetch customer orders

OrderItem (order_items)
├── Line items within orders
├── Relations:
│   ├── order (Order)
│   └── menuItem (MenuItem)
├── Indexes:
│   ├── (orderId)
│   └── (menuItemId)

OrderStatusEvent (order_status_events)
├── Immutable audit log of status transitions
├── Relations:
│   ├── order (Order)
│   └── actor (User)
├── Indexes:
│   ├── (orderId)
│   └── (at) — timeline queries

DeliveryAssignment (delivery_assignments)
├── Driver → Order mapping
├── Relations:
│   ├── order (Order)
│   └── driver (User)
├── Indexes:
│   └── (driverId)
```

## Schema Walkthrough (`prisma/schema.prisma`)

### Enums

```prisma
enum Role {
  CUSTOMER
  KITCHEN
  DRIVER
  ADMIN
}

enum OrderStatus {
  PENDING_PAYMENT      // Awaiting Stripe confirmation
  RECEIVED             // Payment confirmed, awaiting kitchen
  PREPARING            // Kitchen actively working
  READY                // Kitchen finished, awaiting pickup
  PICKED_UP            // Driver collected
  DELIVERED            // Customer received
  CANCELED             // Order canceled
}
```

### User Model

```prisma
model User {
  id           String             @id @default(cuid())
  authUserId   String?            @unique              // Supabase Auth UID (nullable for app-managed)
  email        String             @unique
  password     String                                  // Scrypt hash (app-managed)
  role         Role
  name         String
  orders       Order[]            @relation("CustomerOrders")
  actedEvents  OrderStatusEvent[]
  deliveries   DeliveryAssignment[]
}
```

**Notes:**
- `authUserId`: Link to Supabase Auth when wired; nullable for MVP (app-managed sessions)
- `password`: Scrypt-hashed; backfilled from seeded users or signup forms
- `role`: Assigned at signup or by admin; used for RBAC gates

### Menu Models

```prisma
model MenuCategory {
  id        String     @id @default(cuid())
  slug      String     @unique              // URL-safe identifier (e.g., "burgers")
  name      String                          // Display name (e.g., "Burgers")
  sortOrder Int        @default(0)          // Custom ordering
  itemLinks MenuItemCategory[]
}

model MenuItem {
  id          String             @id @default(cuid())
  name        String
  description String             @default("")     // Optional: "8 oz grilled patty, lettuce, tomato..."
  priceCents  Int                                 // Price in cents (e.g., 1599 = $15.99)
  imageUrl    String?                            // Menu item photo URL (Supabase Storage)
  isAvailable Boolean            @default(true)  // Soft delete for promotions
  orderItems  OrderItem[]
  categoryLinks MenuItemCategory[]
  
  @@index([isAvailable, name])  // Hot-path: fetch available items by name
}

model MenuItemCategory {
  menuItemId   String
  categoryId   String
  menuItem     MenuItem     @relation(fields: [menuItemId], references: [id], onDelete: Cascade)
  category     MenuCategory @relation(fields: [categoryId], references: [id], onDelete: Cascade)

  @@id([menuItemId, categoryId])
  @@index([categoryId, menuItemId])
  @@index([menuItemId])
}
```

**Indexing rationale:**
- `MenuItem(isAvailable, name)` — fetch available items for customer menu
- `MenuItemCategory(categoryId, menuItemId)` — fetch items in category
- `MenuItemCategory(menuItemId)` — fetch categories for an item

### Order Models

```prisma
model Order {
  id          String             @id @default(cuid())
  customerId  String
  customer    User               @relation("CustomerOrders", fields: [customerId], references: [id])
  status      OrderStatus        @default(PENDING_PAYMENT)
  totalCents  Int                                      // Order subtotal + tax + delivery
  createdAt   DateTime           @default(now())
  paidAt      DateTime?                               // When Stripe confirmed payment
  items       OrderItem[]
  events      OrderStatusEvent[]
  assignment  DeliveryAssignment?

  @@index([status, createdAt])           // Kitchen queue (by status)
  @@index([customerId, createdAt])       // Customer order history
}

model OrderItem {
  id                String   @id @default(cuid())
  orderId           String
  order             Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  menuItemId        String
  menuItem          MenuItem @relation(fields: [menuItemId], references: [id])
  quantity          Int                          // e.g., 2 burgers
  priceCentsAtOrder Int                          // Snapshot of price at time of order

  @@index([orderId])       // Fetch order items by order
  @@index([menuItemId])    // Analyze menu item popularity
}

model OrderStatusEvent {
  id          String       @id @default(cuid())
  orderId     String
  order       Order        @relation(fields: [orderId], references: [id], onDelete: Cascade)
  fromStatus  OrderStatus?                      // Nullable for creation event
  toStatus    OrderStatus
  actorUserId String?                           // Who triggered (kitchen, driver, admin)
  actor       User?        @relation(fields: [actorUserId], references: [id])
  at          DateTime     @default(now())

  @@index([orderId])       // Fetch timeline for order
  @@index([at])            // Audit log timeline queries
}

model DeliveryAssignment {
  id          String    @id @default(cuid())
  orderId     String    @unique           // One driver per order max
  order       Order     @relation(fields: [orderId], references: [id], onDelete: Cascade)
  driverId    String
  driver      User      @relation(fields: [driverId], references: [id])
  claimedAt   DateTime  @default(now())
  deliveredAt DateTime?                  // When marked complete

  @@index([driverId])     // Fetch driver's pending deliveries
}
```

## Migration History

### `20260506120000_baseline_postgresql`
- Initial schema: User, MenuCategory, MenuItem, MenuItemCategory, Order, OrderItem, OrderStatusEvent, DeliveryAssignment
- Hot-path indexes on Order and MenuItem

### `20260506141600_add_user_auth_user_id`
- Add nullable `User.authUserId` for future Supabase Auth integration

### `20260506170000_drop_user_password_default`
- Remove default on `User.password`; now explicit on signup

## Common Queries & Patterns

### Fetch Customer Order History (with count)

```typescript
// lib/customer/orders.ts
const orders = await prisma.order.findMany({
  where: {
    customerId: userId,
    createdAt: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } // Last 90 days
  },
  select: {
    id: true,
    status: true,
    totalCents: true,
    createdAt: true,
    _count: { select: { items: true } }
  },
  orderBy: { createdAt: "desc" },
  take: 50
})
```

**Why `select`:** Fetch only visible fields; avoid loading full relations (items, events).

### Fetch Kitchen Queue (RECEIVED → PREPARING)

```typescript
// lib/kitchen/queue.ts
const queue = await prisma.order.findMany({
  where: {
    status: { in: [OrderStatus.RECEIVED, OrderStatus.PREPARING] }
  },
  include: {
    items: {
      include: { menuItem: { select: { name: true } } }
    },
    customer: { select: { name: true } }
  },
  orderBy: { createdAt: "asc" },
  take: 100
})
```

### Fetch Pending Deliveries (for Driver)

```typescript
// lib/driver/pending.ts
const pending = await prisma.deliveryAssignment.findMany({
  where: { deliveredAt: null },
  include: {
    order: {
      select: {
        id: true,
        customer: { select: { name: true, email: true } },
        totalCents: true
      }
    }
  },
  orderBy: { claimedAt: "asc" }
})
```

### Create Order + Items (Transaction)

```typescript
// app/(customer)/customer/actions.ts
const order = await prisma.order.create({
  data: {
    customerId: userId,
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
```

**Why `createMany`:** Batch insert order items in single query (not N+1).

### Record Status Transition + Event Log

```typescript
// lib/orders/update-status.ts
const updated = await prisma.order.update({
  where: { id: orderId },
  data: {
    status: toStatus,
    events: {
      create: {
        fromStatus: currentStatus,
        toStatus,
        actorUserId: actorId,
        at: new Date()
      }
    }
  }
})
```

### Backfill `User.authUserId` (from seeded users)

```typescript
// prisma/scripts/backfill-auth-user-id.ts
const backfilled = await prisma.user.updateMany({
  where: { authUserId: null },
  data: { authUserId: generateCUID() }
})
console.log(`Backfilled ${backfilled.count} users`)
```

## Seed Strategy (`prisma/seed.ts`)

1. **Menu categories** (burgers, pizzas, desserts, etc.) from `prisma/data/*.json`
2. **Menu items** linked to categories via `MenuItemCategory`
3. **Demo users** (CUSTOMER, KITCHEN, DRIVER, ADMIN) with hashed passwords
4. **Sample orders** (optional) for development

**Idempotency:**
- Uses `upsert` for categories and items (by slug / name)
- Users created fresh; assumes clean state

Run:
```bash
pnpm db:seed
```

## Performance Tuning

### Index Strategy

| Index | Reason | Query |
|-------|--------|-------|
| `Order(status, createdAt)` | Kitchen queue by status | Kitchen page load |
| `Order(customerId, createdAt)` | Customer order history | Customer orders page |
| `MenuItem(isAvailable, name)` | Fetch available menu | Customer menu page |
| `OrderItem(orderId)` | Fetch items for order | Order detail page |
| `OrderItem(menuItemId)` | Menu item popularity analysis | Admin analytics |
| `OrderStatusEvent(orderId)` | Fetch timeline | Order detail page |
| `OrderStatusEvent(at)` | Audit log queries | Admin audit page |
| `DeliveryAssignment(driverId)` | Fetch driver's deliveries | Driver pending list |

### Query Patterns to Avoid

❌ **N+1 queries:**
```typescript
const orders = await prisma.order.findMany({ where: { customerId } })
for (const order of orders) {
  const items = await prisma.orderItem.findMany({ where: { orderId: order.id } })  // N queries!
}
```

✅ **Use `include` or batch:**
```typescript
const orders = await prisma.order.findMany({
  where: { customerId },
  include: { items: true }  // Joined query
})
```

## Testing the Schema

### Seed test data
```bash
pnpm db:seed
```

### Inspect in Prisma Studio
```bash
pnpm db:studio
```

### Run migrations in test
```bash
pnpm db:push  # Apply changes without history (for development)
pnpm db:migrate  # Create reversible migration
```

## Deployment Notes

1. **Build step:** `pnpm build` runs `prisma migrate deploy` (applies migrations)
2. **Environment:** Set `DATABASE_URL` (pooled) and `DIRECT_URL` (direct)
3. **Seed:** Run manually after first deploy: `pnpm db:seed` with production env
4. **Introspection:** If working with existing DB, run `prisma db pull` to reverse-engineer schema

## Related Codemaps

- **[Backend & API](./BACKEND.md)** — Server actions, Prisma usage
- **[Integrations](./INTEGRATIONS.md)** — Supabase Database, RLS
- **[ADR: PostgreSQL Migration Baseline](../../adr/0002-postgresql-migration-baseline.md)** — Migration rationale

---

**Next:** See [Auth & RBAC](./AUTH.md) for session management and access control.
