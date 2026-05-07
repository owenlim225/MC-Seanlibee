"use server";

import { OrderStatus, Role } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireRoleLite } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { realtime } from "@/lib/realtime";

export async function claimOrder(orderId: string): Promise<{ ok: boolean }> {
  const driver = await requireRoleLite(Role.DRIVER);
  try {
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { assignment: true },
      });
      if (!order || order.status !== OrderStatus.READY || order.assignment || order.deletedAt) {
        throw new Error("unavailable");
      }
      await tx.deliveryAssignment.create({
        data: { orderId, driverId: driver.id },
      });
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { ok: false };
    }
    return { ok: false };
  }

  realtime.publish(`order:${orderId}`, { type: "assignment", orderId });
  revalidatePath("/driver");
  return { ok: true };
}

export async function markPickedUp(orderId: string): Promise<void> {
  const driver = await requireRoleLite(Role.DRIVER);
  const assignment = await prisma.deliveryAssignment.findUnique({
    where: { orderId },
    include: { order: true },
  });
  if (!assignment || assignment.driverId !== driver.id) return;
  if (assignment.order.deletedAt || assignment.deletedAt) return;
  if (assignment.order.status !== OrderStatus.READY) return;

  await prisma.$transaction(async (tx) => {
    await tx.order.update({ where: { id: orderId }, data: { status: OrderStatus.PICKED_UP } });
    await tx.orderStatusEvent.create({
      data: {
        orderId,
        fromStatus: OrderStatus.READY,
        toStatus: OrderStatus.PICKED_UP,
        actorUserId: driver.id,
      },
    });
  });

  realtime.publish(`order:${orderId}`, { type: "order-status", orderId, status: OrderStatus.PICKED_UP });
  revalidatePath("/driver");
}

export async function markDelivered(orderId: string): Promise<void> {
  const driver = await requireRoleLite(Role.DRIVER);
  const assignment = await prisma.deliveryAssignment.findUnique({
    where: { orderId },
    include: { order: true },
  });
  if (!assignment || assignment.driverId !== driver.id) return;
  if (assignment.order.deletedAt || assignment.deletedAt) return;
  if (assignment.order.status !== OrderStatus.PICKED_UP) return;

  await prisma.$transaction(async (tx) => {
    await tx.order.update({ where: { id: orderId }, data: { status: OrderStatus.DELIVERED } });
    await tx.deliveryAssignment.update({
      where: { orderId },
      data: { deliveredAt: new Date() },
    });
    await tx.orderStatusEvent.create({
      data: {
        orderId,
        fromStatus: OrderStatus.PICKED_UP,
        toStatus: OrderStatus.DELIVERED,
        actorUserId: driver.id,
      },
    });
  });

  realtime.publish(`order:${orderId}`, { type: "order-status", orderId, status: OrderStatus.DELIVERED });
  revalidatePath("/driver");
}
