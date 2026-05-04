import { OrderStatus, PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.orderStatusEvent.deleteMany();
  await prisma.deliveryAssignment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
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

  const mains = await prisma.menuCategory.create({
    data: { name: "Mains", sortOrder: 10 },
  });
  const drinks = await prisma.menuCategory.create({
    data: { name: "Drinks", sortOrder: 20 },
  });

  const items = await prisma.menuItem.createMany({
    data: [
      {
        categoryId: mains.id,
        name: "Margherita Pizza",
        description: "Tomato, mozzarella, basil",
        priceCents: 1299,
        isAvailable: true,
      },
      {
        categoryId: mains.id,
        name: "Garden Salad",
        description: "Greens, vinaigrette",
        priceCents: 899,
        isAvailable: true,
      },
      {
        categoryId: mains.id,
        name: "Chicken Sandwich",
        description: "Grilled chicken, pickles",
        priceCents: 1099,
        isAvailable: true,
      },
      {
        categoryId: mains.id,
        name: "Veggie Bowl",
        description: "Rice, roasted veg, tahini",
        priceCents: 1199,
        isAvailable: true,
      },
      {
        categoryId: drinks.id,
        name: "Sparkling Water",
        description: "500ml",
        priceCents: 249,
        isAvailable: true,
      },
      {
        categoryId: drinks.id,
        name: "Cold Brew",
        description: "16oz",
        priceCents: 449,
        isAvailable: true,
      },
      {
        categoryId: drinks.id,
        name: "Orange Juice",
        description: "12oz",
        priceCents: 399,
        isAvailable: true,
      },
      {
        categoryId: drinks.id,
        name: "House Lemonade",
        description: "16oz",
        priceCents: 349,
        isAvailable: true,
      },
    ],
  });

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
  void items;

  console.log(
    `Seeded users (+ kitchen/drivers incl. ${driverTwo.email}), ${customers.length} customers, categories, menu items`,
  );
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
