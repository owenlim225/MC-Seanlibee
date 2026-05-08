import Link from "next/link";
import { notFound } from "next/navigation";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRoleLite } from "@/lib/auth";
import { OrderTracker } from "@/components/order-tracker";
import { Card } from "@/components/ui/card";
import { MoneyText } from "@/components/ui/money-text";
import { PageHeader } from "@/components/ui/page-header";
import { RelativeTime } from "@/components/ui/relative-time";
import { StatusBadge } from "@/components/ui/status-badge";
import { CancelOrderButton } from "@/app/(customer)/customer/cancel-order-button";

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ paid?: string }>;
}) {
  const user = await requireRoleLite(Role.CUSTOMER);
  const { id } = await params;
  const sp = await searchParams;

  const order = await prisma.order.findFirst({
    where: { id, deletedAt: null },
    include: {
      items: { where: { deletedAt: null }, include: { menuItem: true } },
      events: { where: { deletedAt: null }, orderBy: { at: "asc" }, include: { actor: true } },
    },
  });

  if (!order || order.customerId !== user.id) notFound();

  return (
    <div className="flex flex-col gap-6">
      <OrderTracker orderId={order.id} status={order.status} />

      <PageHeader
        title="Order tracking"
        description={sp.paid ? "Payment captured — kitchen will pick this up shortly." : undefined}
        actions={
          <Link className="text-sm underline" href="/customer/orders">
            All orders
          </Link>
        }
      />

      <Card className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm text-[var(--text-muted)]">
              Placed <RelativeTime date={order.createdAt} />
            </div>
            <div className="text-xs text-[var(--text-meta)]">{order.id}</div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <CancelOrderButton orderId={order.id} status={order.status} />
            <StatusBadge status={order.status} />
            <div className="text-lg font-semibold">
              <MoneyText cents={order.totalCents} />
            </div>
          </div>
        </div>

        <div>
          <div className="text-sm font-semibold">Items</div>
          <ul className="mt-2 list-disc pl-5 text-sm">
            {order.items.map((li) => (
              <li key={li.id}>
                {li.quantity} × {li.menuItem.name}{" "}
                <span className="text-[var(--text-meta)]">
                  (<MoneyText cents={li.priceCentsAtOrder * li.quantity} />)
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Card>

      <Card className="flex flex-col gap-3">
        <div className="text-sm font-semibold">Timeline</div>
        <ol className="flex flex-col gap-2 text-sm">
          {order.events.map((ev) => (
            <li key={ev.id} className="rounded-md border border-zinc-200 p-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span>
                  {ev.fromStatus ? `${ev.fromStatus} → ` : ""}
                  {ev.toStatus}
                </span>
                <span className="text-xs text-[var(--text-meta)]">
                  <RelativeTime date={ev.at} />
                  {ev.actor ? ` · ${ev.actor.name}` : ""}
                </span>
              </div>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}
