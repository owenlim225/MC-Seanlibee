import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { realtime } from "@/lib/realtime";

export async function createCheckoutSession(input: {
  orderId: string;
  amountCents: number;
}): Promise<{ url: string }> {
  // TODO(real-keys:stripe-checkout-001): Create a real Stripe Checkout Session with STRIPE_SECRET_KEY and success/cancel URLs.
  const order = await prisma.order.findUnique({ where: { id: input.orderId } });
  if (!order || order.deletedAt) throw new Error("Order not found");
  if (order.totalCents !== input.amountCents) throw new Error("Amount mismatch");
  const url = `/dev/mock-stripe?orderId=${encodeURIComponent(input.orderId)}`;
  return { url };
}

export async function simulateWebhook(orderId: string, status: "paid" | "failed"): Promise<void> {
  // TODO(real-keys:stripe-webhook-002): Verify Stripe signature with STRIPE_WEBHOOK_SECRET and map event types to order transitions.
  if (status !== "paid") {
    await prisma.order.updateMany({
      where: { id: orderId, deletedAt: null },
      data: { status: OrderStatus.CANCELED },
    });
    return;
  }

  const updated = await prisma.$transaction(async (tx) => {
    const current = await tx.order.findUnique({ where: { id: orderId } });
    if (!current || current.deletedAt || current.status !== OrderStatus.PENDING_PAYMENT) return null;
    return tx.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.RECEIVED, paidAt: new Date() },
    });
  });

  if (!updated) return;

  await prisma.orderStatusEvent.create({
    data: {
      orderId,
      fromStatus: OrderStatus.PENDING_PAYMENT,
      toStatus: OrderStatus.RECEIVED,
      actorUserId: updated.customerId,
    },
  });

  realtime.publish(`order:${orderId}`, {
    type: "order-status",
    orderId,
    status: OrderStatus.RECEIVED,
  });
}
