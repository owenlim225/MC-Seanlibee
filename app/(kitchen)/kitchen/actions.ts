"use server";

import { OrderStatus, Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireRoleLite } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { realtime } from "@/lib/realtime";

export async function advanceKitchenOrder(orderId: string): Promise<void> {
  const actor = await requireRoleLite(Role.KITCHEN);
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.deletedAt) return;

  let next: OrderStatus | null = null;
  if (order.status === OrderStatus.RECEIVED) next = OrderStatus.PREPARING;
  else if (order.status === OrderStatus.PREPARING) next = OrderStatus.READY;
  if (!next) return;

  await prisma.$transaction(async (tx) => {
    await tx.order.update({ where: { id: orderId }, data: { status: next } });
    await tx.orderStatusEvent.create({
      data: {
        orderId,
        fromStatus: order.status,
        toStatus: next,
        actorUserId: actor.id,
      },
    });
  });

  realtime.publish(`order:${orderId}`, { type: "order-status", orderId, status: next });
  revalidatePath("/kitchen");
}
