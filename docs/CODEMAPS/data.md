<!-- Generated: 2026-05-07 | Files scanned: 128 core / 708 tracked | Token estimate: ~950 -->
# Data

## Database Stack
- ORM: Prisma (`prisma/schema.prisma`)
- Engine: PostgreSQL (`DATABASE_URL`, `DIRECT_URL`)
- Client boundary: `lib/prisma.ts`

## Core Tables (Live)
- `User` (role, auth linkage, soft-delete fields)
- `MenuCategory`, `MenuItem`, `MenuItemCategory` (menu taxonomy and M:N bridge)
- `Order`, `OrderItem` (transaction + line items)
- `OrderStatusEvent` (status timeline/audit)
- `DeliveryAssignment` (driver assignment)

## Archive Tables (Snapshots)
- `ArchivedUser`
- `ArchivedMenuCategory`
- `ArchivedMenuItem`
- `ArchivedOrder`
- `ArchivedOrderItem`
- `ArchivedOrderStatusEvent`
- `ArchivedDeliveryAssignment`

## Relationship Map
```text
User (customer) 1 -> N Order
Order 1 -> N OrderItem
Order 1 -> N OrderStatusEvent
Order 1 -> 0..1 DeliveryAssignment
User (driver) 1 -> N DeliveryAssignment
MenuItem N <-> N MenuCategory (via MenuItemCategory)
```

## Index/Performance Highlights
- Hot-path order queues: `Order(status, createdAt)`
- Customer history: `Order(customerId, createdAt)`
- Menu browse: `MenuItem(isAvailable, name)`
- Soft-delete filters indexed across live transactional tables via `deletedAt`

## Migration History (Detected)
- `20260506120000_baseline_postgresql`
- `20260506141600_add_user_auth_user_id`
- `20260506170000_drop_user_password_default`
- `20260506173000_add_user_soft_delete`
- `20260507063215_add_archive_tables` (new archival snapshot layer)

## Data Lifecycle
- Active records retain `deletedAt` for soft-delete semantics
- Archival models preserve historical snapshots with `originalId` + `archivedAt`
- Seed and maintenance scripts live under `prisma/seed.ts` and `prisma/scripts/`
