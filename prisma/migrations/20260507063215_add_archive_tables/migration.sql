-- AlterTable
ALTER TABLE "DeliveryAssignment" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "MenuCategory" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "MenuItem" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "OrderStatusEvent" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "ArchivedUser" (
    "id" TEXT NOT NULL,
    "originalId" TEXT NOT NULL,
    "archivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archivedReason" TEXT,
    "archivedByUserId" TEXT,
    "authUserId" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ArchivedUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArchivedMenuCategory" (
    "id" TEXT NOT NULL,
    "originalId" TEXT NOT NULL,
    "archivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archivedReason" TEXT,
    "archivedByUserId" TEXT,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ArchivedMenuCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArchivedMenuItem" (
    "id" TEXT NOT NULL,
    "originalId" TEXT NOT NULL,
    "archivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archivedReason" TEXT,
    "archivedByUserId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "imageUrl" TEXT,
    "isAvailable" BOOLEAN NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ArchivedMenuItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArchivedOrder" (
    "id" TEXT NOT NULL,
    "originalId" TEXT NOT NULL,
    "archivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archivedReason" TEXT,
    "archivedByUserId" TEXT,
    "customerId" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL,
    "totalCents" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ArchivedOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArchivedOrderItem" (
    "id" TEXT NOT NULL,
    "originalId" TEXT NOT NULL,
    "archivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archivedReason" TEXT,
    "archivedByUserId" TEXT,
    "orderId" TEXT NOT NULL,
    "menuItemId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "priceCentsAtOrder" INTEGER NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ArchivedOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArchivedOrderStatusEvent" (
    "id" TEXT NOT NULL,
    "originalId" TEXT NOT NULL,
    "archivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archivedReason" TEXT,
    "archivedByUserId" TEXT,
    "orderId" TEXT NOT NULL,
    "fromStatus" "OrderStatus",
    "toStatus" "OrderStatus" NOT NULL,
    "actorUserId" TEXT,
    "at" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ArchivedOrderStatusEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArchivedDeliveryAssignment" (
    "id" TEXT NOT NULL,
    "originalId" TEXT NOT NULL,
    "archivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archivedReason" TEXT,
    "archivedByUserId" TEXT,
    "orderId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "claimedAt" TIMESTAMP(3) NOT NULL,
    "deliveredAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ArchivedDeliveryAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ArchivedUser_originalId_idx" ON "ArchivedUser"("originalId");

-- CreateIndex
CREATE INDEX "ArchivedUser_archivedAt_idx" ON "ArchivedUser"("archivedAt");

-- CreateIndex
CREATE INDEX "ArchivedUser_originalId_archivedAt_idx" ON "ArchivedUser"("originalId", "archivedAt");

-- CreateIndex
CREATE INDEX "ArchivedMenuCategory_originalId_idx" ON "ArchivedMenuCategory"("originalId");

-- CreateIndex
CREATE INDEX "ArchivedMenuCategory_archivedAt_idx" ON "ArchivedMenuCategory"("archivedAt");

-- CreateIndex
CREATE INDEX "ArchivedMenuCategory_originalId_archivedAt_idx" ON "ArchivedMenuCategory"("originalId", "archivedAt");

-- CreateIndex
CREATE INDEX "ArchivedMenuItem_originalId_idx" ON "ArchivedMenuItem"("originalId");

-- CreateIndex
CREATE INDEX "ArchivedMenuItem_archivedAt_idx" ON "ArchivedMenuItem"("archivedAt");

-- CreateIndex
CREATE INDEX "ArchivedMenuItem_originalId_archivedAt_idx" ON "ArchivedMenuItem"("originalId", "archivedAt");

-- CreateIndex
CREATE INDEX "ArchivedOrder_originalId_idx" ON "ArchivedOrder"("originalId");

-- CreateIndex
CREATE INDEX "ArchivedOrder_archivedAt_idx" ON "ArchivedOrder"("archivedAt");

-- CreateIndex
CREATE INDEX "ArchivedOrder_originalId_archivedAt_idx" ON "ArchivedOrder"("originalId", "archivedAt");

-- CreateIndex
CREATE INDEX "ArchivedOrderItem_originalId_idx" ON "ArchivedOrderItem"("originalId");

-- CreateIndex
CREATE INDEX "ArchivedOrderItem_archivedAt_idx" ON "ArchivedOrderItem"("archivedAt");

-- CreateIndex
CREATE INDEX "ArchivedOrderItem_originalId_archivedAt_idx" ON "ArchivedOrderItem"("originalId", "archivedAt");

-- CreateIndex
CREATE INDEX "ArchivedOrderStatusEvent_originalId_idx" ON "ArchivedOrderStatusEvent"("originalId");

-- CreateIndex
CREATE INDEX "ArchivedOrderStatusEvent_archivedAt_idx" ON "ArchivedOrderStatusEvent"("archivedAt");

-- CreateIndex
CREATE INDEX "ArchivedOrderStatusEvent_originalId_archivedAt_idx" ON "ArchivedOrderStatusEvent"("originalId", "archivedAt");

-- CreateIndex
CREATE INDEX "ArchivedDeliveryAssignment_originalId_idx" ON "ArchivedDeliveryAssignment"("originalId");

-- CreateIndex
CREATE INDEX "ArchivedDeliveryAssignment_archivedAt_idx" ON "ArchivedDeliveryAssignment"("archivedAt");

-- CreateIndex
CREATE INDEX "ArchivedDeliveryAssignment_originalId_archivedAt_idx" ON "ArchivedDeliveryAssignment"("originalId", "archivedAt");

-- CreateIndex
CREATE INDEX "DeliveryAssignment_deletedAt_idx" ON "DeliveryAssignment"("deletedAt");

-- CreateIndex
CREATE INDEX "MenuCategory_deletedAt_idx" ON "MenuCategory"("deletedAt");

-- CreateIndex
CREATE INDEX "MenuItem_deletedAt_idx" ON "MenuItem"("deletedAt");

-- CreateIndex
CREATE INDEX "Order_deletedAt_idx" ON "Order"("deletedAt");

-- CreateIndex
CREATE INDEX "OrderItem_deletedAt_idx" ON "OrderItem"("deletedAt");

-- CreateIndex
CREATE INDEX "OrderStatusEvent_deletedAt_idx" ON "OrderStatusEvent"("deletedAt");

-- Backfill: snapshot users already soft-deleted before archive tables existed
INSERT INTO "ArchivedUser" (
    "id",
    "originalId",
    "archivedAt",
    "archivedReason",
    "archivedByUserId",
    "authUserId",
    "email",
    "password",
    "role",
    "name",
    "isActive",
    "deletedAt"
)
SELECT
    gen_random_uuid()::text,
    "id",
    NOW(),
    'backfill-pre-archive-table',
    NULL,
    "authUserId",
    "email",
    "password",
    "role",
    "name",
    "isActive",
    "deletedAt"
FROM "User"
WHERE "deletedAt" IS NOT NULL;
