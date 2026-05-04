import { readFileSync, existsSync } from "node:fs";
import { OrderStatus, PrismaClient } from "@prisma/client";

function loadDatabaseUrl(): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const envPath = ".env";
  if (!existsSync(envPath)) return "file:./dev.db";
  const raw = readFileSync(envPath, "utf8");
  const match = raw.match(/^\s*DATABASE_URL\s*=\s*(.+)\s*$/m);
  if (!match?.[1]) return "file:./dev.db";
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
