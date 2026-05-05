import { OrderStatus, PrismaClient, Role } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { getGroupSlugsForSourceSlug, GROUPED_MENU_TAXONOMY } from "../lib/menu/grouped-taxonomy";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import seedManifest from "./seed-sources/manifest.json";

const prisma = new PrismaClient();

type FoodRow = {
  id: string;
  img: string;
  name: string;
  dsc: string;
  price: number;
  rate: number;
  country: string;
};

type SeedManifestRow = {
  sourceSlug: string;
  filePath: string;
};

type SeedSource = {
  sourceSlug: string;
  rows: FoodRow[];
};

function isFoodRow(value: unknown): value is FoodRow {
  if (typeof value !== "object" || value === null) return false;
  const row = value as Partial<FoodRow>;
  return (
    typeof row.id === "string" &&
    typeof row.img === "string" &&
    typeof row.name === "string" &&
    typeof row.dsc === "string" &&
    typeof row.price === "number" &&
    typeof row.rate === "number" &&
    typeof row.country === "string"
  );
}

function loadFoodRowsFromManifest(): SeedSource[] {
  const manifest = seedManifest as SeedManifestRow[];
  const seedScriptDir = path.dirname(fileURLToPath(import.meta.url));
  const manifestDir = path.join(seedScriptDir, "seed-sources");

  return manifest.map((entry) => {
    const filePath = path.resolve(manifestDir, entry.filePath);
    const parsed = JSON.parse(fs.readFileSync(filePath, "utf8")) as unknown;

    if (!Array.isArray(parsed)) {
      throw new Error(`Seed source "${entry.sourceSlug}" must be an array: ${filePath}`);
    }

    parsed.forEach((row, index) => {
      if (!isFoodRow(row)) {
        throw new Error(`Invalid food row at ${entry.sourceSlug}[${index}] in ${filePath}`);
      }
    });

    return { sourceSlug: entry.sourceSlug, rows: parsed as FoodRow[] };
  });
}

function rowToCreateInput(row: FoodRow): Prisma.MenuItemCreateManyInput {
  return {
    id: row.id,
    name: row.dsc,
    description: `${row.name} · ${row.country}`,
    priceCents: Math.round(row.price * 100),
    imageUrl: row.img,
    isAvailable: true,
  };
}

async function createItemsInChunks(items: Prisma.MenuItemCreateManyInput[]): Promise<number> {
  const chunkSize = 80;
  let created = 0;
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    const r = await prisma.menuItem.createMany({ data: chunk });
    created += r.count;
  }
  return created;
}

async function main() {
  // #region agent log
  await prisma.$queryRaw<Array<{ exists: boolean }>>`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'User'
        AND column_name = 'password'
    ) AS "exists"
  `
    .then((rows) =>
      fetch("http://127.0.0.1:7817/ingest/c3fc8591-bb49-4618-b7bd-5aef2b04dae3", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "b370d7" },
        body: JSON.stringify({
          sessionId: "b370d7",
          runId: "pre-fix",
          hypothesisId: "H1",
          location: "prisma/seed.ts:main:start",
          message: "Password column existence before seeding",
          data: { passwordColumnExists: rows[0]?.exists ?? false },
          timestamp: Date.now(),
        }),
      }).catch(() => {}),
    )
    .catch(() => {});
  // #endregion

  const foodSources = loadFoodRowsFromManifest();

  // #region agent log
  await prisma.user
    .count()
    .then((count) =>
      fetch("http://127.0.0.1:7817/ingest/c3fc8591-bb49-4618-b7bd-5aef2b04dae3", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "b370d7" },
        body: JSON.stringify({
          sessionId: "b370d7",
          runId: "pre-fix",
          hypothesisId: "H2",
          location: "prisma/seed.ts:main:before-delete",
          message: "Existing users before deleteMany",
          data: { userCountBeforeDelete: count },
          timestamp: Date.now(),
        }),
      }).catch(() => {}),
    )
    .catch(() => {});
  // #endregion

  await prisma.orderStatusEvent.deleteMany();
  await prisma.deliveryAssignment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.menuItemCategory.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.menuCategory.deleteMany();
  await prisma.user.deleteMany();

  // #region agent log
  fetch("http://127.0.0.1:7817/ingest/c3fc8591-bb49-4618-b7bd-5aef2b04dae3", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "b370d7" },
    body: JSON.stringify({
      sessionId: "b370d7",
      runId: "pre-fix",
      hypothesisId: "H3",
      location: "prisma/seed.ts:user:create-admin",
      message: "Creating admin user payload shape",
      data: { includesPassword: false, email: "admin@example.com", role: Role.ADMIN },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
  const admin = await prisma.user.create({
    data: { email: "admin@example.com", name: "Alex Admin", role: Role.ADMIN },
  });
  const kitchen = await prisma.user.create({
    data: { email: "kitchen@example.com", name: "Kim Kitchen", role: Role.KITCHEN },
  });
  const driver = await prisma.user.create({
    data: { email: "driver@example.com", name: "Dana Driver", role: Role.DRIVER },
  });
  const driverTwo = await prisma.user.create({
    data: { email: "driver2@example.com", name: "Drew Driver", role: Role.DRIVER },
  });

  const customers = await prisma.$transaction([
    prisma.user.create({
      data: { email: "customer1@example.com", name: "Chris Customer", role: Role.CUSTOMER },
    }),
    prisma.user.create({
      data: { email: "customer2@example.com", name: "Casey Customer", role: Role.CUSTOMER },
    }),
    prisma.user.create({
      data: { email: "customer3@example.com", name: "Cameron Customer", role: Role.CUSTOMER },
    }),
    prisma.user.create({
      data: { email: "customer4@example.com", name: "Cody Customer", role: Role.CUSTOMER },
    }),
    prisma.user.create({
      data: { email: "customer5@example.com", name: "Charlie Customer", role: Role.CUSTOMER },
    }),
  ]);

  const groupedCategories = await Promise.all(
    GROUPED_MENU_TAXONOMY.map((group) =>
      prisma.menuCategory.create({
        data: { slug: group.slug, name: group.name, sortOrder: group.sortOrder },
      }),
    ),
  );
  const categoryIdBySlug = groupedCategories.reduce<Record<string, string>>((acc, category) => {
    acc[category.slug] = category.id;
    return acc;
  }, {});

  const seenFoodIds = new Set<string>();
  const menuItemIdsByCategorySlug = new Map<string, Set<string>>();
  let menuItemCount = 0;

  for (const source of foodSources) {
    const pendingRows: FoodRow[] = [];
    for (const row of source.rows) {
      if (seenFoodIds.has(row.id)) continue;
      seenFoodIds.add(row.id);
      pendingRows.push(row);
    }
    if (pendingRows.length === 0) continue;
    const data = pendingRows.map((row) => rowToCreateInput(row));
    menuItemCount += await createItemsInChunks(data);

    const groupSlugs = getGroupSlugsForSourceSlug(source.sourceSlug);
    for (const groupSlug of groupSlugs) {
      const itemIds = menuItemIdsByCategorySlug.get(groupSlug) ?? new Set<string>();
      for (const row of pendingRows) {
        itemIds.add(row.id);
      }
      menuItemIdsByCategorySlug.set(groupSlug, itemIds);
    }
  }

  for (const [groupSlug, itemIds] of menuItemIdsByCategorySlug) {
    const categoryId = categoryIdBySlug[groupSlug];
    if (!categoryId || itemIds.size === 0) continue;
    await prisma.menuItemCategory.createMany({
      data: [...itemIds].map((menuItemId) => ({ menuItemId, categoryId })),
      skipDuplicates: true,
    });
  }

  const sampleCustomer = customers[0];
  if (sampleCustomer) {
    const demoItems = await prisma.menuItem.findMany({ take: 3 });
    let total = 0;
    const lineDefs = demoItems.map((mi, idx) => {
      const qty = idx + 1;
      const line = mi.priceCents * qty;
      total += line;
      return { menuItemId: mi.id, quantity: qty, priceCentsAtOrder: mi.priceCents };
    });

    await prisma.order.create({
      data: {
        customerId: sampleCustomer.id,
        status: OrderStatus.DELIVERED,
        totalCents: total,
        paidAt: new Date(Date.now() - 86_400_000),
        items: {
          create: lineDefs.map((l) => ({
            menuItemId: l.menuItemId,
            quantity: l.quantity,
            priceCentsAtOrder: l.priceCentsAtOrder,
          })),
        },
        events: {
          create: [
            {
              fromStatus: OrderStatus.PENDING_PAYMENT,
              toStatus: OrderStatus.RECEIVED,
              actorUserId: kitchen.id,
            },
            {
              fromStatus: OrderStatus.RECEIVED,
              toStatus: OrderStatus.PREPARING,
              actorUserId: kitchen.id,
            },
            {
              fromStatus: OrderStatus.PREPARING,
              toStatus: OrderStatus.READY,
              actorUserId: kitchen.id,
            },
            {
              fromStatus: OrderStatus.READY,
              toStatus: OrderStatus.PICKED_UP,
              actorUserId: driver.id,
            },
            {
              fromStatus: OrderStatus.PICKED_UP,
              toStatus: OrderStatus.DELIVERED,
              actorUserId: driver.id,
            },
          ],
        },
        assignment: {
          create: {
            driverId: driver.id,
            deliveredAt: new Date(Date.now() - 86_400_000),
          },
        },
      },
    });
  }

  const raceCustomer = customers[1] ?? customers[0];
  const raceMenuItem = await prisma.menuItem.findFirst({ orderBy: { name: "asc" } });
  if (raceCustomer && raceMenuItem) {
    const raceOrderId = "order-ready-playwright";
    await prisma.deliveryAssignment.deleteMany({ where: { orderId: raceOrderId } });
    await prisma.orderStatusEvent.deleteMany({ where: { orderId: raceOrderId } });
    await prisma.orderItem.deleteMany({ where: { orderId: raceOrderId } });
    await prisma.order.deleteMany({ where: { id: raceOrderId } });

    await prisma.order.create({
      data: {
        id: raceOrderId,
        customerId: raceCustomer.id,
        status: OrderStatus.READY,
        totalCents: raceMenuItem.priceCents,
        paidAt: new Date(),
        items: {
          create: [{ menuItemId: raceMenuItem.id, quantity: 1, priceCentsAtOrder: raceMenuItem.priceCents }],
        },
        events: {
          create: [
            {
              fromStatus: OrderStatus.PENDING_PAYMENT,
              toStatus: OrderStatus.RECEIVED,
              actorUserId: kitchen.id,
            },
            {
              fromStatus: OrderStatus.RECEIVED,
              toStatus: OrderStatus.PREPARING,
              actorUserId: kitchen.id,
            },
            {
              fromStatus: OrderStatus.PREPARING,
              toStatus: OrderStatus.READY,
              actorUserId: kitchen.id,
            },
          ],
        },
      },
    });
  }

  void admin;
  void driverTwo;

  console.log(
    `Seeded users (+ kitchen/drivers incl. ${driverTwo.email}), ${customers.length} customers, ${menuItemCount} menu items (${seenFoodIds.size} unique source ids)`,
  );
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    // #region agent log
    fetch("http://127.0.0.1:7817/ingest/c3fc8591-bb49-4618-b7bd-5aef2b04dae3", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "b370d7" },
      body: JSON.stringify({
        sessionId: "b370d7",
        runId: "pre-fix",
        hypothesisId: "H4",
        location: "prisma/seed.ts:main:catch",
        message: "Seed failed with Prisma error metadata",
        data: {
          name: e instanceof Error ? e.name : typeof e,
          message: e instanceof Error ? e.message : String(e),
          code: typeof e === "object" && e && "code" in e ? (e as { code?: unknown }).code : undefined,
          meta: typeof e === "object" && e && "meta" in e ? (e as { meta?: unknown }).meta : undefined,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
