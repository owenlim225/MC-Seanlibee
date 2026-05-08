import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { readCart } from "@/lib/cart-cookie";
import { computeCheckoutPricing } from "@/lib/customer/checkout-pricing";
import { setLineNotes, setLineQty, startCheckout } from "@/app/(customer)/customer/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { MoneyText } from "@/components/ui/money-text";
import { PageHeader } from "@/components/ui/page-header";
import { SuccessActionForm } from "@/components/feedback/success-action-form";

export default async function CartPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  const cart = await readCart();
  const items = await prisma.menuItem.findMany({
    where: { id: { in: cart.map((l) => l.menuItemId) }, deletedAt: null },
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
              <div className="flex-1">
                <div className="font-medium">{line.menuItem.name}</div>
                <div className="text-sm text-[var(--text-muted)]">
                  <MoneyText cents={line.menuItem.priceCents} /> each
                </div>
                <SuccessActionForm action={setLineNotes.bind(null, line.menuItemId)} className="mt-3 flex flex-col gap-2">
                  <label className="text-xs font-medium uppercase tracking-wide text-[var(--text-meta)]" htmlFor={`line-note-${line.menuItemId}`}>
                    Notes for kitchen (optional)
                  </label>
                  <textarea
                    id={`line-note-${line.menuItemId}`}
                    name="notes"
                    rows={2}
                    maxLength={500}
                    defaultValue={line.notes ?? ""}
                    placeholder="Add preferences or allergy notes"
                    className="w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
                  />
                  <div className="flex justify-end">
                    <Button type="submit" variant="secondary">
                      Save notes
                    </Button>
                  </div>
                </SuccessActionForm>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <SuccessActionForm action={setLineQty.bind(null, line.menuItemId, Math.max(1, line.qty - 1))}>
                  <Button type="submit" variant="danger">
                    −
                  </Button>
                </SuccessActionForm>
                <div className="w-10 text-center text-sm">{line.qty}</div>
                <SuccessActionForm action={setLineQty.bind(null, line.menuItemId, line.qty + 1)}>
                  <Button type="submit" variant="secondary">
                    +
                  </Button>
                </SuccessActionForm>
                <SuccessActionForm action={setLineQty.bind(null, line.menuItemId, 0)}>
                  <Button type="submit" variant="danger">
                    Remove
                  </Button>
                </SuccessActionForm>
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
              <div className="mt-2 flex items-center justify-between border-t border-zinc-200 pt-2 text-base font-semibold">
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
