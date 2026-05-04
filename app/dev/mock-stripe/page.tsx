import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { completeMockPayment } from "@/app/dev/mock-stripe/actions";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { MoneyText } from "@/components/ui/money-text";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";

export default async function MockStripePage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const sp = await searchParams;
  if (!sp.orderId) notFound();

  const order = await prisma.order.findUnique({
    where: { id: sp.orderId },
    include: { items: { include: { menuItem: true } }, customer: true },
  });
  if (!order) notFound();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Mock Stripe Checkout"
        description="Simulates a hosted checkout — no network calls."
      />

      <Card className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>Order total</CardTitle>
            <CardDescription>Signed in customer: {order.customer.email}</CardDescription>
          </div>
          <div className="text-lg font-semibold">
            <MoneyText cents={order.totalCents} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={order.status} />
          <span className="text-xs text-zinc-500">{order.id}</span>
        </div>

        <ul className="list-disc pl-5 text-sm">
          {order.items.map((li) => (
            <li key={li.id}>
              {li.quantity} × {li.menuItem.name}{" "}
              <span className="text-zinc-500">
                (<MoneyText cents={li.priceCentsAtOrder * li.quantity} />)
              </span>
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap gap-3">
          <form action={completeMockPayment.bind(null, order.id)}>
            <Button type="submit">Pay now</Button>
          </form>
          <Link className="text-sm underline" href={`/customer/orders/${order.id}`}>
            View order
          </Link>
        </div>
      </Card>
    </div>
  );
}
