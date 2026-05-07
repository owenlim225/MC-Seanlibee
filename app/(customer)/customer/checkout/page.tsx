import Link from "next/link";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { placeOrderWithResult } from "@/app/(customer)/customer/actions";
import { CheckoutReviewForm } from "@/components/customer/checkout-review-form";
import {
  resolveDeliveryOption,
  resolveTipCents,
} from "@/lib/customer/checkout-pricing";
import { requireRole } from "@/lib/auth";
import { readCart } from "@/lib/cart-cookie";
import { prisma } from "@/lib/prisma";
import { ErrorState } from "@/components/ui/error-state";
import { PageHeader } from "@/components/ui/page-header";

export default async function CheckoutReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; delivery?: string; tip?: string }>;
}) {
  const user = await requireRole(Role.CUSTOMER);
  const sp = await searchParams;
  const cart = await readCart();
  if (cart.length === 0) redirect("/customer/cart");

  const items = await prisma.menuItem.findMany({
    where: { id: { in: cart.map((line) => line.menuItemId) }, isAvailable: true, deletedAt: null },
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

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Review payment and address"
        description="Review your details before placing the order."
        actions={
          <Link className="text-sm underline" href="/customer/cart">
            Back to cart
          </Link>
        }
      />

      {sp.error === "missing-required" ? (
        <ErrorState message="Fill all required fields and consent before placing your order." />
      ) : null}

      <CheckoutReviewForm
        lines={lines}
        initialDeliveryOption={deliveryOption}
        initialTipCents={tipCents}
        defaultUser={{ name: user.name, email: user.email, phone: null }}
        placeOrderWithResult={placeOrderWithResult}
      />
    </div>
  );
}
