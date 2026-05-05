import Link from "next/link";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { placeOrderMock } from "@/app/(customer)/customer/actions";
import {
  DELIVERY_OPTIONS,
  TIP_OPTIONS_CENTS,
  computeCheckoutPricing,
  resolveDeliveryOption,
  resolveTipCents,
} from "@/lib/customer/checkout-pricing";
import { requireRoleLite } from "@/lib/auth";
import { readCart } from "@/lib/cart-cookie";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { MoneyText } from "@/components/ui/money-text";
import { PageHeader } from "@/components/ui/page-header";

export default async function CheckoutReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; delivery?: string; tip?: string }>;
}) {
  await requireRoleLite(Role.CUSTOMER);
  const sp = await searchParams;
  const cart = await readCart();
  if (cart.length === 0) redirect("/customer/cart");

  const items = await prisma.menuItem.findMany({
    where: { id: { in: cart.map((line) => line.menuItemId) }, isAvailable: true },
    select: { id: true, name: true, priceCents: true },
  });
  if (items.length !== cart.length) redirect("/customer/cart?error=invalid-item");

  const itemById = new Map(items.map((item) => [item.id, item]));
  const lines = cart.map((line) => ({
    ...line,
    menuItem: itemById.get(line.menuItemId)!,
  }));

  const deliveryOption = resolveDeliveryOption(sp.delivery);
  const tipCents = resolveTipCents(Number(sp.tip ?? "0"));
  const pricing = computeCheckoutPricing({
    lines: lines.map((line) => ({ priceCents: line.menuItem.priceCents, qty: line.qty })),
    deliveryOption,
    tipCents,
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Review payment and address"
        description="Mock checkout only. No real payment gateway is used."
        actions={
          <Link className="text-sm underline" href="/customer/cart">
            Back to cart
          </Link>
        }
      />

      {sp.error === "missing-required" ? (
        <ErrorState message="Fill all required fields and consent before placing your order." />
      ) : null}

      <form action={placeOrderMock} className="grid gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Card className="flex flex-col gap-3">
            <h2 className="text-base font-semibold">Delivery address</h2>
            <input name="addressLine1" required placeholder="Street address" className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700" />
            <input name="addressLine2" placeholder="Apartment, unit, etc. (optional)" className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700" />
            <div className="grid gap-3 sm:grid-cols-2">
              <input name="city" required placeholder="City" className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700" />
              <input name="postalCode" required placeholder="Postal code" className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700" />
            </div>
          </Card>

          <Card className="flex flex-col gap-3">
            <h2 className="text-base font-semibold">Delivery options</h2>
            {Object.entries(DELIVERY_OPTIONS).map(([key, option]) => (
              <label key={key} className="flex items-center justify-between gap-3 rounded-md border border-zinc-200 p-3 text-sm dark:border-zinc-800">
                <span>{option.label}</span>
                <span className="flex items-center gap-3">
                  <MoneyText cents={option.feeCents} />
                  <input type="radio" name="deliveryOption" value={key} defaultChecked={deliveryOption === key} />
                </span>
              </label>
            ))}
          </Card>

          <Card className="flex flex-col gap-3">
            <h2 className="text-base font-semibold">Personal details</h2>
            <input name="fullName" required placeholder="Full name" className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700" />
            <input name="phone" required placeholder="Phone number" className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700" />
            <input name="email" type="email" required placeholder="Email" className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700" />
          </Card>

          <Card className="flex flex-col gap-3">
            <h2 className="text-base font-semibold">Tip and consent</h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {TIP_OPTIONS_CENTS.map((tipOption) => (
                <label key={tipOption} className="flex items-center justify-between rounded-md border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800">
                  <span>{tipOption === 0 ? "No tip" : "Tip"}</span>
                  <span className="flex items-center gap-3">
                    <MoneyText cents={tipOption} />
                    <input type="radio" name="tipCents" value={tipOption} defaultChecked={tipCents === tipOption} />
                  </span>
                </label>
              ))}
            </div>
            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" name="consent" required />
              <span>I confirm this is a mock checkout and agree to place this order.</span>
            </label>
          </Card>
        </div>

        <Card className="flex h-fit flex-col gap-3 lg:sticky lg:top-4">
          <h2 className="text-base font-semibold">Order summary</h2>
          <ul className="flex flex-col gap-1 text-sm">
            {lines.map((line) => (
              <li key={line.menuItemId} className="flex items-center justify-between gap-2">
                <span>
                  {line.qty} × {line.menuItem.name}
                </span>
                <MoneyText cents={line.menuItem.priceCents * line.qty} />
              </li>
            ))}
          </ul>
          <div className="mt-2 grid gap-1 border-t border-zinc-200 pt-2 text-sm dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <MoneyText cents={pricing.subtotalCents} />
            </div>
            <div className="flex items-center justify-between">
              <span>Delivery</span>
              <MoneyText cents={pricing.deliveryFeeCents} />
            </div>
            <div className="flex items-center justify-between">
              <span>Service fee</span>
              <MoneyText cents={pricing.serviceFeeCents} />
            </div>
            <div className="flex items-center justify-between">
              <span>Tip</span>
              <MoneyText cents={pricing.tipCents} />
            </div>
            <div className="mt-1 flex items-center justify-between text-base font-semibold">
              <span>Total</span>
              <MoneyText cents={pricing.totalCents} />
            </div>
          </div>
          <Button type="submit">Place order (mock)</Button>
        </Card>
      </form>
    </div>
  );
}
