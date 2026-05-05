import { OrderStatus, PrismaClient, Role } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { getGroupSlugsForSourceSlug, GROUPED_MENU_TAXONOMY } from "../lib/menu/grouped-taxonomy";

import bbqs from "./bbqs.json";
import bestFoods from "./best-foods.json";
import breads from "./breads.json";
import burgers from "./burgers.json";
import chocolates from "./chocolates.json";
import desserts from "./desserts.json";
import drinks from "./drinks.json";
import friedChicken from "./fried-chicken.json";
import iceCream from "./ice-cream.json";
import ourFoods from "./our-foods.json";
import pizzas from "./pizzas.json";
import porks from "./porks.json";
import sandwiches from "./sandwiches.json";
import sausages from "./sausages.json";
import steaks from "./steaks.json";

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

const FOOD_SOURCES: { sourceSlug: string; rows: FoodRow[] }[] = [
  { sourceSlug: "bbqs", rows: bbqs as FoodRow[] },
  { sourceSlug: "breads", rows: breads as FoodRow[] },
  { sourceSlug: "burgers", rows: burgers as FoodRow[] },
  { sourceSlug: "chocolates", rows: chocolates as FoodRow[] },
  { sourceSlug: "desserts", rows: desserts as FoodRow[] },
  { sourceSlug: "drinks", rows: drinks as FoodRow[] },
  { sourceSlug: "fried-chicken", rows: friedChicken as FoodRow[] },
  { sourceSlug: "ice-cream", rows: iceCream as FoodRow[] },
  { sourceSlug: "pizzas", rows: pizzas as FoodRow[] },
  { sourceSlug: "porks", rows: porks as FoodRow[] },
  { sourceSlug: "sandwiches", rows: sandwiches as FoodRow[] },
  { sourceSlug: "sausages", rows: sausages as FoodRow[] },
  { sourceSlug: "steaks", rows: steaks as FoodRow[] },
  { sourceSlug: "best-foods", rows: bestFoods as FoodRow[] },
  { sourceSlug: "our-foods", rows: ourFoods as FoodRow[] },
];

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
  await prisma.orderStatusEvent.deleteMany();
  await prisma.deliveryAssignment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.menuItemCategory.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.menuCategory.deleteMany();
  await prisma.user.deleteMany();

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
