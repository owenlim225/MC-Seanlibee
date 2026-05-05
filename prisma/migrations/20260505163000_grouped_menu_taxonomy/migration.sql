-- AlterTable
ALTER TABLE "MenuCategory" ADD COLUMN "slug" TEXT;

-- Backfill existing rows safely before making slug required.
UPDATE "MenuCategory"
SET "slug" = "id"
WHERE "slug" IS NULL;

-- CreateTable
CREATE TABLE "MenuItemCategory" (
    "menuItemId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    CONSTRAINT "MenuItemCategory_pkey" PRIMARY KEY ("menuItemId","categoryId"),
    CONSTRAINT "MenuItemCategory_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MenuItemCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "MenuCategory" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Copy current single-category links into join table.
INSERT INTO "MenuItemCategory" ("menuItemId", "categoryId")
SELECT "id", "categoryId" FROM "MenuItem";

-- DropIndex
DROP INDEX IF EXISTS "MenuItem_categoryId_isAvailable_idx";

-- AlterTable
ALTER TABLE "MenuCategory" ALTER COLUMN "slug" SET NOT NULL;
ALTER TABLE "MenuItem" DROP COLUMN "categoryId";

-- CreateIndex
CREATE UNIQUE INDEX "MenuCategory_slug_key" ON "MenuCategory"("slug");
CREATE INDEX "MenuItem_isAvailable_name_idx" ON "MenuItem"("isAvailable", "name");
CREATE INDEX "MenuItemCategory_categoryId_menuItemId_idx" ON "MenuItemCategory"("categoryId", "menuItemId");
CREATE INDEX "MenuItemCategory_menuItemId_idx" ON "MenuItemCategory"("menuItemId");
