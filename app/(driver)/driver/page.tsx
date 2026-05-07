import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRoleLite } from "@/lib/auth";
import { Role } from "@prisma/client";
import { ClaimButton, DeliverButton, PickupButton } from "@/app/(driver)/driver/driver-buttons";
import { LiveRouterRefresh } from "@/components/live-router-refresh";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { MoneyText } from "@/components/ui/money-text";
import { PageHeader } from "@/components/ui/page-header";
import { RelativeTime } from "@/components/ui/relative-time";
import { StatusBadge } from "@/components/ui/status-badge";

const driverOrderSelect = {
  id: true,
  status: true,
  totalCents: true,
  createdAt: true,
  customer: { select: { email: true } },
  items: {
    select: {
      id: true,
      quantity: true,
      menuItem: { select: { name: true } },
    },
  },
} as const;

export default async function DriverHomePage() {
  const driver = await requireRoleLite(Role.DRIVER);

  const [readyUnclaimed, mine] = await Promise.all([
    prisma.order.findMany({
      where: { status: OrderStatus.READY, deletedAt: null, assignment: null },
      orderBy: { createdAt: "asc" },
      select: driverOrderSelect,
    }),
    prisma.order.findMany({
      where: {
        deletedAt: null,
        assignment: { driverId: driver.id },
        status: { in: [OrderStatus.READY, OrderStatus.PICKED_UP] },
      },
      orderBy: { createdAt: "asc" },
      select: driverOrderSelect,
    }),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <LiveRouterRefresh />
      <PageHeader title="Driver routes" description="Claim READY orders first — claims are race-safe." />

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Ready — available</h2>
          <span className="text-xs text-zinc-500">{readyUnclaimed.length}</span>
        </div>
        {readyUnclaimed.length === 0 ? (
          <EmptyState title="Nothing ready right now" />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {readyUnclaimed.map((order) => (
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
                <div data-testid={`driver-claim-${order.id}`}>
                  <ClaimButton orderId={order.id} />
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">My active deliveries</h2>
          <span className="text-xs text-zinc-500">{mine.length}</span>
        </div>
        {mine.length === 0 ? (
          <EmptyState title="No active deliveries" description="Claim an order from the READY list." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {mine.map((order) => (
              <Card key={order.id} className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <StatusBadge status={order.status} />
                  <div className="text-xs text-zinc-500">{order.id}</div>
                </div>
                <div className="text-sm font-semibold">
                  <MoneyText cents={order.totalCents} />
                </div>
                <div className="text-xs text-zinc-500">{order.customer.email}</div>
                {order.status === OrderStatus.READY ? <PickupButton orderId={order.id} /> : null}
                {order.status === OrderStatus.PICKED_UP ? <DeliverButton orderId={order.id} /> : null}
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
