import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { readCart } from "@/lib/cart-cookie";
import { computeCheckoutPricing } from "@/lib/customer/checkout-pricing";
import { setLineQty, startCheckout } from "@/app/(customer)/customer/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { MoneyText } from "@/components/ui/money-text";
import { PageHeader } from "@/components/ui/page-header";

export default async function CartPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  const cart = await readCart();
  const items = await prisma.menuItem.findMany({
    where: { id: { in: cart.map((l) => l.menuItemId) } },
    select: { id: true, name: true, priceCents: true },
  });

  const lines = cart
    .map((line) => {
      const mi = items.find((i) => i.id === line.menuItemId);
      if (!mi) return null;
      return { ...line, menuItem: mi };
    })
    .filter((x): x is NonNullable<typeof x> => Boolean(x));

  const pricing = computeCheckoutPricing({
    lines: lines.map((line) => ({ priceCents: line.menuItem.priceCents, qty: line.qty })),
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Cart"
        actions={
          <Link className="text-sm underline" href="/customer">
            Continue shopping
          </Link>
        }
      />

      {sp.error === "invalid-item" ? (
        <ErrorState message="Your cart referenced unavailable items — it was cleared during checkout prep." />
      ) : null}

      {lines.length === 0 ? (
        <EmptyState title="Cart is empty" description="Browse the menu to add items." />
      ) : (
        <div className="flex flex-col gap-4">
          {lines.map((line) => (
            <Card key={line.menuItemId} className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="font-medium">{line.menuItem.name}</div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400">
                  <MoneyText cents={line.menuItem.priceCents} /> each
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <form action={setLineQty.bind(null, line.menuItemId, Math.max(1, line.qty - 1))}>
                  <Button type="submit" variant="secondary">
                    −
                  </Button>
                </form>
                <div className="w-10 text-center text-sm">{line.qty}</div>
                <form action={setLineQty.bind(null, line.menuItemId, line.qty + 1)}>
                  <Button type="submit" variant="secondary">
                    +
                  </Button>
                </form>
                <form action={setLineQty.bind(null, line.menuItemId, 0)}>
                  <Button type="submit" variant="ghost">
                    Remove
                  </Button>
                </form>
                <div className="text-sm font-semibold">
                  <MoneyText cents={line.menuItem.priceCents * line.qty} />
                </div>
              </div>
            </Card>
          ))}

          <Card className="flex flex-col gap-3">
            <div className="text-sm font-semibold">Billing summary</div>
            <div className="grid gap-1 text-sm">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <MoneyText cents={pricing.subtotalCents} />
              </div>
              <div className="flex items-center justify-between">
                <span>Delivery (standard)</span>
                <MoneyText cents={pricing.deliveryFeeCents} />
              </div>
              <div className="flex items-center justify-between">
                <span>Service fee</span>
                <MoneyText cents={pricing.serviceFeeCents} />
              </div>
              <div className="mt-2 flex items-center justify-between border-t border-zinc-200 pt-2 text-base font-semibold dark:border-zinc-800">
                <span>Total</span>
                <MoneyText cents={pricing.totalCents} />
              </div>
            </div>
            <form action={startCheckout}>
              <Button type="submit">Review payment and address</Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
