import { readFileSync, existsSync } from "node:fs";
import { OrderStatus, PrismaClient } from "@prisma/client";

function loadDatabaseUrl(): string {
  if (process.env.DATABASE_URL?.trim()) return process.env.DATABASE_URL;
  const envPath = ".env";
  if (!existsSync(envPath)) {
    throw new Error(
      'Playwright globalSetup requires DATABASE_URL (environment or ".env"). PostgreSQL is required.',
    );
  }
  const raw = readFileSync(envPath, "utf8");
  const match = raw.match(/^\s*DATABASE_URL\s*=\s*(.+)\s*$/m);
  if (!match?.[1]) {
    throw new Error('Playwright globalSetup: DATABASE_URL missing from ".env".');
  }
  return match[1].replace(/^["']|["']$/g, "");
}

export default async function globalSetup() {
  process.env.DATABASE_URL = loadDatabaseUrl();

  const prisma = new PrismaClient();
  try {
    await prisma.deliveryAssignment.deleteMany({ where: { orderId: "order-ready-playwright" } });
    await prisma.order.updateMany({
      where: { id: "order-ready-playwright" },
      data: { status: OrderStatus.READY },
    });
  } finally {
    await prisma.$disconnect();
  }
}
