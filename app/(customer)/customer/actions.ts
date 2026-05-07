"use server";

import { OrderStatus, Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRoleLite } from "@/lib/auth";
import { clearCart, readCart, writeCart } from "@/lib/cart-cookie";
import { computeCheckoutPricing, resolveDeliveryOption, resolveTipCents } from "@/lib/customer/checkout-pricing";
import { prisma } from "@/lib/prisma";
import { actionSuccess, type ActionFeedback } from "@/lib/actions/action-feedback";

export async function addToCart(menuItemId: string): Promise<ActionFeedback> {
  await requireRoleLite(Role.CUSTOMER);
  const cart = await readCart();
  const idx = cart.findIndex((l) => l.menuItemId === menuItemId);
  const nextCart =
    idx >= 0
      ? cart.map((line) => (line.menuItemId === menuItemId ? { menuItemId, qty: line.qty + 1 } : line))
      : [...cart, { menuItemId, qty: 1 }];
  await writeCart(nextCart);
  revalidatePath("/", "layout");
  revalidatePath("/customer");
  revalidatePath("/customer/cart");
  revalidatePath("/customer/checkout");
  return actionSuccess("Added to cart");
}

export async function setLineQty(menuItemId: string, qty: number): Promise<ActionFeedback> {
  await requireRoleLite(Role.CUSTOMER);
  let cart = await readCart();
  if (qty <= 0) cart = cart.filter((l) => l.menuItemId !== menuItemId);
  else cart = cart.map((l) => (l.menuItemId === menuItemId ? { menuItemId, qty } : l));
  await writeCart(cart);
  revalidatePath("/", "layout");
  revalidatePath("/customer/cart");
  revalidatePath("/customer/checkout");
  if (qty <= 0) {
    return actionSuccess("Removed from cart");
  }
  return actionSuccess("Cart updated");
}

export async function startCheckout(): Promise<void> {
  await requireRoleLite(Role.CUSTOMER);
  const cart = await readCart();
  if (cart.length === 0) redirect("/customer/cart");

  const items = await prisma.menuItem.findMany({
    where: { id: { in: cart.map((l) => l.menuItemId) }, isAvailable: true, deletedAt: null },
  });

  const hasUnavailable = cart.some((line) => !items.some((item) => item.id === line.menuItemId));
  if (hasUnavailable) {
    redirect("/customer/cart?error=invalid-item");
  }

  redirect("/customer/checkout");
}

type ExecutePlaceOrderSuccess = {
  kind: "success";
  orderId: string;
  redirectUrl: string;
};

type ExecutePlaceOrderRedirect = {
  kind: "redirect";
  url: string;
};

type ExecutePlaceOrderResult = ExecutePlaceOrderSuccess | ExecutePlaceOrderRedirect;

async function executePlaceOrder(formData: FormData): Promise<ExecutePlaceOrderResult> {
  const user = await requireRoleLite(Role.CUSTOMER);
  const cart = await readCart();
  if (cart.length === 0) {
    return { kind: "redirect", url: "/customer/cart" };
  }

  const fullName = String(formData.get("fullName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const addressLine1 = String(formData.get("addressLine1") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const postalCode = String(formData.get("postalCode") ?? "").trim();
  const consentRaw = String(formData.get("consent") ?? "");

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const hasInvalidLengths =
    fullName.length > 120 || phone.length > 40 || email.length > 160 || addressLine1.length > 200 || city.length > 120 || postalCode.length > 20;
  if (!fullName || !phone || !email || !addressLine1 || !city || !postalCode || !isEmailValid || hasInvalidLengths || consentRaw !== "on") {
    return { kind: "redirect", url: "/customer/checkout?error=missing-required" };
  }

  const rawDeliveryOption = formData.get("deliveryOption");
  const deliveryOption = resolveDeliveryOption(typeof rawDeliveryOption === "string" ? rawDeliveryOption : undefined);
  const tipCents = resolveTipCents(Number(formData.get("tipCents") ?? 0));

  const items = await prisma.menuItem.findMany({
    where: { id: { in: cart.map((l) => l.menuItemId) }, isAvailable: true, deletedAt: null },
    select: { id: true, priceCents: true },
  });
  const itemById = new Map(items.map((item) => [item.id, item]));

  const pricedLines = cart.map((line) => {
    const menuItem = itemById.get(line.menuItemId);
    if (!menuItem) return null;
    return {
      menuItemId: menuItem.id,
      quantity: line.qty,
      priceCentsAtOrder: menuItem.priceCents,
    };
  });

  if (pricedLines.some((line) => !line)) {
    return { kind: "redirect", url: "/customer/cart?error=invalid-item" };
  }

  const resolvedLines = pricedLines.filter((line): line is NonNullable<typeof line> => Boolean(line));
  const pricing = computeCheckoutPricing({
    lines: resolvedLines.map((line) => ({ priceCents: line.priceCentsAtOrder, qty: line.quantity })),
    deliveryOption,
    tipCents,
  });

  const order = await prisma.order.create({
    data: {
      customerId: user.id,
      status: OrderStatus.RECEIVED,
      totalCents: pricing.totalCents,
      paidAt: new Date(),
      items: { create: resolvedLines },
      events: {
        create: [{ fromStatus: null, toStatus: OrderStatus.RECEIVED, actorUserId: user.id }],
      },
    },
  });

  await clearCart();
  revalidatePath("/", "layout");
  revalidatePath("/customer/cart");
  revalidatePath("/customer/orders");
  revalidatePath(`/customer/orders/${order.id}`);

  const redirectUrl = `/customer/orders/${order.id}?paid=1`;
  return { kind: "success", orderId: order.id, redirectUrl };
}

export type PlaceOrderWithResultResponse =
  | { ok: true; orderId: string; redirectUrl: string }
  | { ok: false; redirectUrl: string };

export async function placeOrderWithResult(formData: FormData): Promise<PlaceOrderWithResultResponse> {
  const result = await executePlaceOrder(formData);
  if (result.kind === "success") {
    return { ok: true, orderId: result.orderId, redirectUrl: result.redirectUrl };
  }
  return { ok: false, redirectUrl: result.url };
}

export async function placeOrderMock(formData: FormData): Promise<void> {
  const result = await executePlaceOrder(formData);
  redirect(result.kind === "success" ? result.redirectUrl : result.url);
}
