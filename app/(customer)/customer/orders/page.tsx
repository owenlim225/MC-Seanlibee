import Link from "next/link";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRoleLite } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { MoneyText } from "@/components/ui/money-text";
import { PageHeader } from "@/components/ui/page-header";
import { RelativeTime } from "@/components/ui/relative-time";
import { StatusBadge } from "@/components/ui/status-badge";

export default async function OrdersHistoryPage() {
  const user = await requireRoleLite(Role.CUSTOMER);
  const orders = await prisma.order.findMany({
    where: { customerId: user.id, deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: { id: true, status: true, totalCents: true, createdAt: true },
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Order history"
        actions={
          <Link className="text-sm underline" href="/customer">
            Menu
          </Link>
        }
      />

      {orders.length === 0 ? (
        <EmptyState title="No orders yet" description="Complete checkout to see receipts here." />
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((o) => (
            <Link key={o.id} href={`/customer/orders/${o.id}`} className="block">
              <Card className="transition hover:border-zinc-400">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <div className="text-sm font-semibold">
                      <RelativeTime date={o.createdAt} />
                    </div>
                    <div className="text-xs text-[var(--text-meta)]">{o.id}</div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <StatusBadge status={o.status} />
                    <div className="text-sm font-semibold">
                      <MoneyText cents={o.totalCents} />
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
