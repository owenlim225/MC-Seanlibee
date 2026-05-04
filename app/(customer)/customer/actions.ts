"use server";

import { OrderStatus, Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { clearCart, readCart, writeCart } from "@/lib/cart-cookie";
import { createCheckoutSession } from "@/lib/payments";
import { prisma } from "@/lib/prisma";

export async function addToCart(menuItemId: string): Promise<void> {
  await requireRole(Role.CUSTOMER);
  const cart = await readCart();
  const idx = cart.findIndex((l) => l.menuItemId === menuItemId);
  if (idx >= 0) cart[idx] = { menuItemId, qty: cart[idx].qty + 1 };
  else cart.push({ menuItemId, qty: 1 });
  await writeCart(cart);
  revalidatePath("/customer");
  revalidatePath("/customer/cart");
}

export async function setLineQty(menuItemId: string, qty: number): Promise<void> {
  await requireRole(Role.CUSTOMER);
  let cart = await readCart();
  if (qty <= 0) cart = cart.filter((l) => l.menuItemId !== menuItemId);
  else cart = cart.map((l) => (l.menuItemId === menuItemId ? { menuItemId, qty } : l));
  await writeCart(cart);
  revalidatePath("/customer/cart");
}

export async function startCheckout(): Promise<void> {
  const user = await requireRole(Role.CUSTOMER);
  const cart = await readCart();
  if (cart.length === 0) redirect("/customer/cart");

  const items = await prisma.menuItem.findMany({
    where: { id: { in: cart.map((l) => l.menuItemId) }, isAvailable: true },
  });

  const pricedLines = cart
    .map((line) => {
      const mi = items.find((i) => i.id === line.menuItemId);
      if (!mi) return null;
      return {
        menuItemId: mi.id,
        quantity: line.qty,
        priceCentsAtOrder: mi.priceCents,
      };
    })
    .filter((x): x is NonNullable<typeof x> => Boolean(x));

  if (pricedLines.length !== cart.length) {
    redirect("/customer/cart?error=invalid-item");
  }

  const total = pricedLines.reduce((sum, l) => sum + l.priceCentsAtOrder * l.quantity, 0);

  const order = await prisma.order.create({
    data: {
      customerId: user.id,
      status: OrderStatus.PENDING_PAYMENT,
      totalCents: total,
      items: { create: pricedLines },
    },
  });

  await clearCart();

  const { url } = await createCheckoutSession({ orderId: order.id, amountCents: total });
  redirect(url);
}
