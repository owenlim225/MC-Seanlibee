"use server";

import { OrderStatus, Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRoleLite } from "@/lib/auth";
import { clearCart, readCart, writeCart } from "@/lib/cart-cookie";
import { computeCheckoutPricing, resolveDeliveryOption, resolveTipCents } from "@/lib/customer/checkout-pricing";
import { prisma } from "@/lib/prisma";

export async function addToCart(menuItemId: string): Promise<void> {
  await requireRoleLite(Role.CUSTOMER);
  const cart = await readCart();
  const idx = cart.findIndex((l) => l.menuItemId === menuItemId);
  const nextCart =
    idx >= 0
      ? cart.map((line) => (line.menuItemId === menuItemId ? { menuItemId, qty: line.qty + 1 } : line))
      : [...cart, { menuItemId, qty: 1 }];
  await writeCart(nextCart);
  revalidatePath("/customer");
  revalidatePath("/customer/cart");
  revalidatePath("/customer/checkout");
}

export async function setLineQty(menuItemId: string, qty: number): Promise<void> {
  await requireRoleLite(Role.CUSTOMER);
  let cart = await readCart();
  if (qty <= 0) cart = cart.filter((l) => l.menuItemId !== menuItemId);
  else cart = cart.map((l) => (l.menuItemId === menuItemId ? { menuItemId, qty } : l));
  await writeCart(cart);
  revalidatePath("/customer/cart");
  revalidatePath("/customer/checkout");
}

export async function startCheckout(): Promise<void> {
  await requireRoleLite(Role.CUSTOMER);
  const cart = await readCart();
  if (cart.length === 0) redirect("/customer/cart");

  const items = await prisma.menuItem.findMany({
    where: { id: { in: cart.map((l) => l.menuItemId) }, isAvailable: true },
  });

  const hasUnavailable = cart.some((line) => !items.some((item) => item.id === line.menuItemId));
  if (hasUnavailable) {
    redirect("/customer/cart?error=invalid-item");
  }

  redirect("/customer/checkout");
}

export async function placeOrderMock(formData: FormData): Promise<void> {
  const user = await requireRoleLite(Role.CUSTOMER);
  const cart = await readCart();
  if (cart.length === 0) redirect("/customer/cart");

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
    redirect("/customer/checkout?error=missing-required");
  }

  const rawDeliveryOption = formData.get("deliveryOption");
  const deliveryOption = resolveDeliveryOption(typeof rawDeliveryOption === "string" ? rawDeliveryOption : undefined);
  const tipCents = resolveTipCents(Number(formData.get("tipCents") ?? 0));

  const items = await prisma.menuItem.findMany({
    where: { id: { in: cart.map((l) => l.menuItemId) }, isAvailable: true },
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

  if (pricedLines.some((line) => !line)) redirect("/customer/cart?error=invalid-item");

  const resolvedLines = pricedLines.filter((line): line is NonNullable<typeof line> => Boolean(line));
  const pricing = computeCheckoutPricing({
    lines: resolvedLines.map((line) => ({ priceCents: line.priceCentsAtOrder, qty: line.quantity })),
    deliveryOption,
    tipCents,
  });

  // #region agent log
  const dbCustomer = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, role: true },
  });
  fetch("http://127.0.0.1:7817/ingest/c3fc8591-bb49-4618-b7bd-5aef2b04dae3", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "d15bfd" },
    body: JSON.stringify({
      sessionId: "d15bfd",
      runId: "pre-fix",
      hypothesisId: "H1",
      location: "app/(customer)/customer/actions.ts:placeOrderMock",
      message: "session user vs prisma User row",
      data: {
        sessionUserIdLen: user.id.length,
        sessionUserIdPrefix: user.id.slice(0, 12),
        sessionRole: user.role,
        dbUserFound: Boolean(dbCustomer),
        dbRole: dbCustomer?.role ?? null,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});

  // #region agent log (debug mode: evidence-first)
  fetch("http://127.0.0.1:7817/ingest/c3fc8591-bb49-4618-b7bd-5aef2b04dae3", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "490896" },
    body: JSON.stringify({
      sessionId: "490896",
      runId: "pre-fix",
      hypothesisId: "H1",
      location: "app/(customer)/customer/actions.ts:placeOrderMock",
      message: "pre-create: session user.id existence in User table",
      data: {
        sessionUserIdLen: user.id.length,
        sessionUserIdPrefix: user.id.slice(0, 12),
        sessionRole: user.role,
        dbUserFound: Boolean(dbCustomer),
        dbUserIdPrefix: dbCustomer?.id ? dbCustomer.id.slice(0, 12) : null,
        willWriteCustomerIdPrefix: user.id.slice(0, 12),
        willWriteCustomerIdEqDbUser: dbCustomer?.id ? dbCustomer.id === user.id : false,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
  // #endregion

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
  revalidatePath("/customer/cart");
  revalidatePath("/customer/orders");
  revalidatePath(`/customer/orders/${order.id}`);
  redirect(`/customer/orders/${order.id}?paid=1`);
}
