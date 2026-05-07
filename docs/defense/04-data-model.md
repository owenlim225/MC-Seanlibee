# Data model (plain language)

**Audience:** Mixed technical panel.

**Source of truth:** `prisma/schema.prisma` (PostgreSQL). This section **summarizes**; it does not replace the schema file.

---

## Core idea

- **People (`User`)** have a **role** (customer, kitchen staff, driver, admin), contact fields, and a **hashed password**.
- **Menu** is **categories** and **items** with many-to-many links (an item can appear in multiple categories).
- **Orders** belong to a **customer**, contain **line items** that **snapshot price** at order time, move through a **status pipeline**, log every transition in an **event table**, and optionally have one **delivery assignment** to a driver.
- **Archives** store point-in-time copies of important rows for audit/recovery **without foreign keys** back to live data.

## Enums

- **`Role`:** Who the user is in the system — `CUSTOMER` | `KITCHEN` | `DRIVER` | `ADMIN`.
- **`OrderStatus`:** Where an order sits in fulfillment — from `PENDING_PAYMENT` through `RECEIVED` → `PREPARING` → `READY` → `PICKED_UP` → `DELIVERED`, or `CANCELED`.

## Live entities (conceptual)

| Model | Plain language | Notable fields / links |
|-------|----------------|-------------------------|
| **User** | Account | `email` unique; `password` (hash at rest); `role`; `isActive`; soft-delete `deletedAt`; optional `authUserId` for future external auth linkage |
| **MenuCategory** | Section of the menu (e.g. “Mains”) | `slug` unique; `sortOrder`; soft-delete |
| **MenuItem** | Sellable dish | `priceCents`; `isAvailable`; optional `imageUrl`; soft-delete |
| **MenuItemCategory** | Join table | Pairing `(menuItemId, categoryId)` — many-to-many |
| **Order** | Customer’s purchase | **Belongs to** `User` (customer); `status`; `totalCents`; `paidAt` when paid; timestamps; soft-delete |
| **OrderItem** | One line on an order | Quantity; `priceCentsAtOrder` preserves menu price at purchase time; links `Order` + `MenuItem` |
| **OrderStatusEvent** | Audit trail for status changes | `fromStatus` optional, `toStatus` required; optional `actor` user; timestamp `at` |
| **DeliveryAssignment** | Driver claim on an order | **One per order** (`orderId` unique); `driver` user; `claimedAt`, `deliveredAt` |

**Consistency with architecture:** Server actions mutate these tables directly through Prisma; the cart **before** `Order` exists is cookie-based (`lib/cart-cookie`), not mirrored as a `Cart` table in the schema.

## Archive snapshots

Models prefixed **`Archived*`** mirror the operational tables plus metadata:

- **`originalId`** — ID of the source row **at archive time**.
- **`archivedAt`**, **`archivedReason`**, **`archivedByUserId`** — who/when/why.

They intentionally **omit foreign keys** to live rows so snapshots stay immutable even if source rows move or disappear.

## Indexing (why it matters, briefly)

Indexes on `(status, createdAt)` for orders, `(customerId, createdAt)`, and join keys like `orderId`/`menuItemId` support dashboards and history queries without scanning full tables (`prisma/schema.prisma` `@@index` blocks).

## What this schema does **not** show

- **Row Level Security (RLS):** Not expressed in Prisma models; access control is **application-layer** (middleware + role checks). If Postgres RLS policies exist on a hosted instance, they are **outside** this schema file — not verified here.
