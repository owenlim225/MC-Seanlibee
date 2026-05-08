import Image from "next/image";
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
import { resolveMenuImageUrl } from "@/lib/menu/resolve-menu-image-url";

export default async function CartPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  const cart = await readCart();
  const items = await prisma.menuItem.findMany({
    where: { id: { in: cart.map((l) => l.menuItemId) }, deletedAt: null },
    select: { id: true, name: true, priceCents: true, imageUrl: true },
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
            <Card key={line.menuItemId} className="flex flex-col gap-4 p-4 md:flex-row md:items-start">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-zinc-100">
                <Image
                  src={resolveMenuImageUrl(line.menuItem.id, line.menuItem.imageUrl)}
                  alt={line.menuItem.name}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="font-medium">{line.menuItem.name}</div>
                <div className="text-sm text-[var(--text-muted)]">
                  <MoneyText cents={line.menuItem.priceCents} /> each
                </div>
                <SuccessActionForm action={setLineNotes.bind(null, line.menuItemId)}>
                  <label className="sr-only" htmlFor={`cart-notes-${line.menuItemId}`}>
                    Kitchen notes for {line.menuItem.name}
                  </label>
                  <textarea
                    id={`cart-notes-${line.menuItemId}`}
                    name="notes"
                    maxLength={500}
                    defaultValue={line.notes ?? ""}
                    placeholder="Notes for kitchen (allergies, changes…)"
                    rows={2}
                    className="w-full rounded-md border border-zinc-200 bg-white p-2 text-sm"
                  />
                  <Button type="submit" variant="secondary" className="mt-1 min-h-8 w-fit px-2 py-1 text-xs">
                    Save note
                  </Button>
                </SuccessActionForm>
              </div>
              <div className="flex flex-col items-stretch gap-2 md:items-end">
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <SuccessActionForm action={setLineQty.bind(null, line.menuItemId, line.qty - 1)}>
                    <Button
                      type="submit"
                      className="h-9 min-h-9 w-9 shrink-0 bg-[#B11226] px-0 text-white shadow-sm hover:bg-[#8f0e1f] focus-visible:ring-[#B11226]"
                      aria-label={`Decrease quantity of ${line.menuItem.name}`}
                    >
                      −
                    </Button>
                  </SuccessActionForm>
                  <div className="min-w-10 text-center text-sm font-medium" aria-live="polite">
                    {line.qty}
                  </div>
                  <SuccessActionForm action={setLineQty.bind(null, line.menuItemId, line.qty + 1)}>
                    <Button
                      type="submit"
                      className="h-9 min-h-9 w-9 shrink-0 bg-emerald-600 px-0 text-white shadow-sm hover:bg-emerald-700 focus-visible:ring-emerald-600"
                      aria-label={`Increase quantity of ${line.menuItem.name}`}
                    >
                      +
                    </Button>
                  </SuccessActionForm>
                </div>
                <div className="text-sm font-semibold md:text-right">
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
