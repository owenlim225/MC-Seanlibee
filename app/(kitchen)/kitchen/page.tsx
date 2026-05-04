import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { KitchenAdvanceButton } from "@/app/(kitchen)/kitchen/kitchen-advance-button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { MoneyText } from "@/components/ui/money-text";
import { PageHeader } from "@/components/ui/page-header";
import { RelativeTime } from "@/components/ui/relative-time";
import { StatusBadge } from "@/components/ui/status-badge";

const buckets = [OrderStatus.RECEIVED, OrderStatus.PREPARING, OrderStatus.READY] as const;

export default async function KitchenQueuePage() {
  const orders = await prisma.order.findMany({
    where: { status: { in: [...buckets] } },
    orderBy: { createdAt: "asc" },
    include: { customer: true, items: { include: { menuItem: true } }, assignment: true },
  });

  const grouped = buckets.map((status) => ({
    status,
    rows: orders.filter((o) => o.status === status),
  }));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Kitchen queue" description="Advance orders from received → preparing → ready." />

      <div className="grid gap-4 lg:grid-cols-3">
        {grouped.map((col) => (
          <section key={col.status} className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">{col.status}</h2>
              <span className="text-xs text-zinc-500">{col.rows.length}</span>
            </div>
            {col.rows.length === 0 ? (
              <EmptyState title="No orders" />
            ) : (
              col.rows.map((order) => (
                <Card key={order.id} className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <StatusBadge status={order.status} />
                    <div className="text-xs text-zinc-500">
                      <RelativeTime date={order.createdAt} />
                    </div>
                  </div>
                  <div className="text-sm font-semibold">
                    <MoneyText cents={order.totalCents} />
                  </div>
                  <div className="text-xs text-zinc-500">{order.customer.email}</div>
                  <ul className="list-disc pl-5 text-sm">
                    {order.items.map((li) => (
                      <li key={li.id}>
                        {li.quantity} × {li.menuItem.name}
                      </li>
                    ))}
                  </ul>
                  {order.assignment ? (
                    <div className="text-xs text-emerald-700 dark:text-emerald-300">
                      Claimed by driver {order.assignment.driverId}
                    </div>
                  ) : null}
                  {order.status === OrderStatus.RECEIVED ? (
                    <KitchenAdvanceButton orderId={order.id} label="Start preparing" />
                  ) : null}
                  {order.status === OrderStatus.PREPARING ? (
                    <KitchenAdvanceButton orderId={order.id} label="Mark ready" />
                  ) : null}
                </Card>
              ))
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
