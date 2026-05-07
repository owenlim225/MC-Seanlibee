import { OrderStatus, PrismaClient, Role } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { getGroupSlugsForSourceSlug, GROUPED_MENU_TAXONOMY } from "../lib/menu/grouped-taxonomy";
import sourceManifest from "./seed-sources/manifest.json";

import bbqs from "./data/bbqs.json";
import breads from "./data/breads.json";
import burgers from "./data/burgers.json";
import chocolates from "./data/chocolates.json";
import desserts from "./data/desserts.json";
import drinks from "./data/drinks.json";
import friedChicken from "./data/fried-chicken.json";
import iceCream from "./data/ice-cream.json";
import pizzas from "./data/pizzas.json";
import porks from "./data/porks.json";
import sandwiches from "./data/sandwiches.json";
import sausages from "./data/sausages.json";
import steaks from "./data/steaks.json";
import { hashPassword } from "../lib/auth/password";

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

const APPROVED_SOURCE_SLUGS = [
  "bbqs",
  "breads",
  "burgers",
  "chocolates",
  "desserts",
  "drinks",
  "fried-chicken",
  "ice-cream",
  "pizzas",
  "porks",
  "sandwiches",
  "sausages",
  "steaks",
] as const;

type ApprovedSourceSlug = (typeof APPROVED_SOURCE_SLUGS)[number];

type SeedSourceManifestEntry = {
  sourceSlug: ApprovedSourceSlug;
  filePath: string;
};

const SOURCE_ROWS_BY_SLUG: Record<ApprovedSourceSlug, unknown> = {
  bbqs,
  breads,
  burgers,
  chocolates,
  desserts,
  drinks,
  "fried-chicken": friedChicken,
  "ice-cream": iceCream,
  pizzas,
  porks,
  sandwiches,
  sausages,
  steaks,
};

function isFoodRow(value: unknown): value is FoodRow {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.id === "string" &&
    typeof row.img === "string" &&
    typeof row.name === "string" &&
    typeof row.dsc === "string" &&
    typeof row.price === "number" &&
    Number.isFinite(row.price) &&
    typeof row.rate === "number" &&
    Number.isFinite(row.rate) &&
    typeof row.country === "string"
  );
}

function parseFoodRowsFromSource(rows: unknown, sourceSlug: string): FoodRow[] {
  if (!Array.isArray(rows)) {
    throw new Error(`Expected array rows for source "${sourceSlug}"`);
  }
  return rows.map((row, index) => {
    if (!isFoodRow(row)) {
      throw new Error(`Invalid FoodRow at source "${sourceSlug}" index ${index}`);
    }
    return row;
  });
}

function loadFoodSourcesFromManifest(): { sourceSlug: ApprovedSourceSlug; rows: FoodRow[] }[] {
  const manifest = sourceManifest as SeedSourceManifestEntry[];
  const manifestSlugSet = new Set(manifest.map((entry) => entry.sourceSlug));
  const expectedSlugSet = new Set<ApprovedSourceSlug>(APPROVED_SOURCE_SLUGS);

  if (manifest.length !== APPROVED_SOURCE_SLUGS.length) {
    throw new Error(
      `Seed source manifest must contain exactly ${APPROVED_SOURCE_SLUGS.length} sources; got ${manifest.length}`,
    );
  }
  for (const slug of APPROVED_SOURCE_SLUGS) {
    if (!manifestSlugSet.has(slug)) {
      throw new Error(`Seed source manifest missing required source slug "${slug}"`);
    }
  }
  for (const slug of manifestSlugSet) {
    if (!expectedSlugSet.has(slug)) {
      throw new Error(`Seed source manifest contains unsupported source slug "${slug}"`);
    }
  }

  return manifest.map(({ sourceSlug }) => {
    const parsedRows = parseFoodRowsFromSource(SOURCE_ROWS_BY_SLUG[sourceSlug], sourceSlug);
    const limitedRows = parsedRows.slice(0, 20);
    return { sourceSlug, rows: limitedRows };
  });
}

const FOOD_SOURCES = loadFoodSourcesFromManifest();
const SEED_PASSWORD = process.env.SEED_AUTH_PASSWORD ?? "Demo123!";

if (process.env.NODE_ENV === "production" && !process.env.SEED_AUTH_PASSWORD) {
  throw new Error("SEED_AUTH_PASSWORD is required in production.");
}

function rowToCreateInput(row: FoodRow): Prisma.MenuItemCreateManyInput {
  const normalizedImageUrl = row.img.trim();
  return {
    id: row.id,
    name: row.name,
    description: row.dsc,
    priceCents: Math.round(row.price * 100),
    imageUrl: normalizedImageUrl.length > 0 ? normalizedImageUrl : null,
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

async function createSeedUser(data: { email: string; name: string; role: Role }) {
  const created = await prisma.user.create({
    data: {
      ...data,
      password: hashPassword(SEED_PASSWORD),
    },
  });
  await prisma.user.update({
    where: { id: created.id },
    data: { authUserId: created.id },
  });
  return created;
}

async function main() {
  await prisma.archivedDeliveryAssignment.deleteMany();
  await prisma.archivedOrderStatusEvent.deleteMany();
  await prisma.archivedOrderItem.deleteMany();
  await prisma.archivedOrder.deleteMany();
  await prisma.archivedMenuItem.deleteMany();
  await prisma.archivedMenuCategory.deleteMany();
  await prisma.archivedUser.deleteMany();
  await prisma.orderStatusEvent.deleteMany();
  await prisma.deliveryAssignment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.menuItemCategory.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.menuCategory.deleteMany();
  await prisma.user.deleteMany();

  const admin = await createSeedUser({
    email: "admin@example.com",
    name: "Alex Admin",
    role: Role.ADMIN,
  });
  const kitchen = await createSeedUser({
    email: "kitchen@example.com",
    name: "Kim Kitchen",
    role: Role.KITCHEN,
  });
  const driver = await createSeedUser({
    email: "driver@example.com",
    name: "Dana Driver",
    role: Role.DRIVER,
  });
  const driverTwo = await createSeedUser({
    email: "driver2@example.com",
    name: "Drew Driver",
    role: Role.DRIVER,
  });

  const customers = await prisma.$transaction([
    prisma.user.create({
      data: {
        email: "customer1@example.com",
        name: "Chris Customer",
        role: Role.CUSTOMER,
        password: hashPassword(SEED_PASSWORD),
      },
    }),
    prisma.user.create({
      data: {
        email: "customer2@example.com",
        name: "Casey Customer",
        role: Role.CUSTOMER,
        password: hashPassword(SEED_PASSWORD),
      },
    }),
    prisma.user.create({
      data: {
        email: "customer3@example.com",
        name: "Cameron Customer",
        role: Role.CUSTOMER,
        password: hashPassword(SEED_PASSWORD),
      },
    }),
    prisma.user.create({
      data: {
        email: "customer4@example.com",
        name: "Cody Customer",
        role: Role.CUSTOMER,
        password: hashPassword(SEED_PASSWORD),
      },
    }),
    prisma.user.create({
      data: {
        email: "customer5@example.com",
        name: "Charlie Customer",
        role: Role.CUSTOMER,
        password: hashPassword(SEED_PASSWORD),
      },
    }),
  ]);

  await prisma.$transaction(
    customers.map((customer) =>
      prisma.user.update({
        where: { id: customer.id },
        data: { authUserId: customer.id },
      }),
    ),
  );

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

  for (const source of FOOD_SOURCES) {
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
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
