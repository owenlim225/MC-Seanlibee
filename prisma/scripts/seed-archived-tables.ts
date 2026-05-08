import { OrderStatus, PrismaClient, Role } from "@prisma/client";
import { randomUUID } from "node:crypto";

const prisma = new PrismaClient();

const ARCHIVE_ROW_COUNT = 10;

const archiveReasons = [
  "manual-admin-cleanup",
  "expired-record-retention",
  "user-requested-deletion",
  "automated-nightly-archive",
] as const;

function pick<T>(values: readonly T[], index: number): T {
  return values[index % values.length] as T;
}

function id(prefix: string, index: number): string {
  return `${prefix}-${index + 1}-${randomUUID()}`;
}

async function main(): Promise<void> {
  const archivedAtBase = Date.now();

  await prisma.$transaction([
    prisma.archivedDeliveryAssignment.deleteMany(),
    prisma.archivedOrderStatusEvent.deleteMany(),
    prisma.archivedOrderItem.deleteMany(),
    prisma.archivedOrder.deleteMany(),
    prisma.archivedMenuItem.deleteMany(),
    prisma.archivedMenuCategory.deleteMany(),
    prisma.archivedUser.deleteMany(),
  ]);

  await prisma.archivedUser.createMany({
    data: Array.from({ length: ARCHIVE_ROW_COUNT }, (_, index) => ({
      id: id("arch-user", index),
      originalId: `user-${index + 1}`,
      archivedAt: new Date(archivedAtBase - index * 60_000),
      archivedReason: pick(archiveReasons, index),
      archivedByUserId: `admin-${(index % 2) + 1}`,
      authUserId: `auth-user-${index + 1}`,
      email: `archived.user.${index + 1}@example.com`,
      password: `fake-hash-${index + 1}`,
      role: pick([Role.CUSTOMER, Role.DRIVER, Role.KITCHEN, Role.ADMIN] as const, index),
      name: `Archived User ${index + 1}`,
      isActive: index % 3 === 0,
      deletedAt: new Date(archivedAtBase - index * 120_000),
    })),
  });

  await prisma.archivedMenuCategory.createMany({
    data: Array.from({ length: ARCHIVE_ROW_COUNT }, (_, index) => ({
      id: id("arch-category", index),
      originalId: `menu-category-${index + 1}`,
      archivedAt: new Date(archivedAtBase - index * 70_000),
      archivedReason: pick(archiveReasons, index),
      archivedByUserId: `admin-${(index % 2) + 1}`,
      slug: `archived-category-${index + 1}`,
      name: `Archived Category ${index + 1}`,
      sortOrder: index,
      deletedAt: new Date(archivedAtBase - index * 130_000),
    })),
  });

  await prisma.archivedMenuItem.createMany({
    data: Array.from({ length: ARCHIVE_ROW_COUNT }, (_, index) => ({
      id: id("arch-item", index),
      originalId: `menu-item-${index + 1}`,
      archivedAt: new Date(archivedAtBase - index * 80_000),
      archivedReason: pick(archiveReasons, index),
      archivedByUserId: `admin-${(index % 2) + 1}`,
      name: `Archived Menu Item ${index + 1}`,
      description: `Seeded archived menu item ${index + 1}`,
      priceCents: 500 + index * 75,
      imageUrl: `https://picsum.photos/seed/archived-item-${index + 1}/640/480`,
      isAvailable: index % 2 === 0,
      deletedAt: new Date(archivedAtBase - index * 140_000),
    })),
  });

  await prisma.archivedOrder.createMany({
    data: Array.from({ length: ARCHIVE_ROW_COUNT }, (_, index) => ({
      id: id("arch-order", index),
      originalId: `order-${index + 1}`,
      archivedAt: new Date(archivedAtBase - index * 90_000),
      archivedReason: pick(archiveReasons, index),
      archivedByUserId: `admin-${(index % 2) + 1}`,
      customerId: `user-${(index % ARCHIVE_ROW_COUNT) + 1}`,
      status: pick(
        [
          OrderStatus.PENDING_PAYMENT,
          OrderStatus.RECEIVED,
          OrderStatus.PREPARING,
          OrderStatus.READY,
          OrderStatus.PICKED_UP,
          OrderStatus.DELIVERED,
          OrderStatus.CANCELED,
        ] as const,
        index,
      ),
      totalCents: 1500 + index * 200,
      createdAt: new Date(archivedAtBase - index * 210_000),
      paidAt: index % 2 === 0 ? new Date(archivedAtBase - index * 180_000) : null,
      deletedAt: new Date(archivedAtBase - index * 230_000),
    })),
  });

  await prisma.archivedOrderItem.createMany({
    data: Array.from({ length: ARCHIVE_ROW_COUNT }, (_, index) => ({
      id: id("arch-order-item", index),
      originalId: `order-item-${index + 1}`,
      archivedAt: new Date(archivedAtBase - index * 95_000),
      archivedReason: pick(archiveReasons, index),
      archivedByUserId: `admin-${(index % 2) + 1}`,
      orderId: `order-${(index % ARCHIVE_ROW_COUNT) + 1}`,
      menuItemId: `menu-item-${(index % ARCHIVE_ROW_COUNT) + 1}`,
      quantity: (index % 4) + 1,
      priceCentsAtOrder: 500 + index * 60,
      notes: index % 3 === 0 ? "No onions" : null,
      deletedAt: new Date(archivedAtBase - index * 240_000),
    })),
  });

  await prisma.archivedOrderStatusEvent.createMany({
    data: Array.from({ length: ARCHIVE_ROW_COUNT }, (_, index) => ({
      id: id("arch-order-event", index),
      originalId: `order-event-${index + 1}`,
      archivedAt: new Date(archivedAtBase - index * 100_000),
      archivedReason: pick(archiveReasons, index),
      archivedByUserId: `admin-${(index % 2) + 1}`,
      orderId: `order-${(index % ARCHIVE_ROW_COUNT) + 1}`,
      fromStatus: index % 3 === 0 ? null : OrderStatus.RECEIVED,
      toStatus: pick(
        [OrderStatus.PREPARING, OrderStatus.READY, OrderStatus.PICKED_UP, OrderStatus.DELIVERED] as const,
        index,
      ),
      actorUserId: `user-${(index % ARCHIVE_ROW_COUNT) + 1}`,
      at: new Date(archivedAtBase - index * 250_000),
      deletedAt: new Date(archivedAtBase - index * 260_000),
    })),
  });

  await prisma.archivedDeliveryAssignment.createMany({
    data: Array.from({ length: ARCHIVE_ROW_COUNT }, (_, index) => ({
      id: id("arch-delivery", index),
      originalId: `delivery-assignment-${index + 1}`,
      archivedAt: new Date(archivedAtBase - index * 105_000),
      archivedReason: pick(archiveReasons, index),
      archivedByUserId: `admin-${(index % 2) + 1}`,
      orderId: `order-${(index % ARCHIVE_ROW_COUNT) + 1}`,
      driverId: `user-${((index + 1) % ARCHIVE_ROW_COUNT) + 1}`,
      claimedAt: new Date(archivedAtBase - index * 270_000),
      deliveredAt: index % 2 === 0 ? new Date(archivedAtBase - index * 280_000) : null,
      deletedAt: new Date(archivedAtBase - index * 290_000),
    })),
  });

  const [
    archivedUserCount,
    archivedMenuCategoryCount,
    archivedMenuItemCount,
    archivedOrderCount,
    archivedOrderItemCount,
    archivedOrderStatusEventCount,
    archivedDeliveryAssignmentCount,
  ] = await prisma.$transaction([
    prisma.archivedUser.count(),
    prisma.archivedMenuCategory.count(),
    prisma.archivedMenuItem.count(),
    prisma.archivedOrder.count(),
    prisma.archivedOrderItem.count(),
    prisma.archivedOrderStatusEvent.count(),
    prisma.archivedDeliveryAssignment.count(),
  ]);

  console.log("Archive table seeding complete:");
  console.log(`- ArchivedUser: ${archivedUserCount}`);
  console.log(`- ArchivedMenuCategory: ${archivedMenuCategoryCount}`);
  console.log(`- ArchivedMenuItem: ${archivedMenuItemCount}`);
  console.log(`- ArchivedOrder: ${archivedOrderCount}`);
  console.log(`- ArchivedOrderItem: ${archivedOrderItemCount}`);
  console.log(`- ArchivedOrderStatusEvent: ${archivedOrderStatusEventCount}`);
  console.log(`- ArchivedDeliveryAssignment: ${archivedDeliveryAssignmentCount}`);
}

main()
  .catch((error: unknown) => {
    console.error("Failed to seed archive tables.", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
