import { OrderStatus, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { MoneyText } from "@/components/ui/money-text";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function AdminDashboardPage() {
  const today = startOfToday();

  const [statusGroups, paidRevenue, todaysCount, recent, customerCount] = await Promise.all([
    prisma.order.groupBy({
      by: ["status"],
      where: { createdAt: { gte: today }, deletedAt: null },
      _count: { _all: true },
    }),
    prisma.order.aggregate({
      where: { createdAt: { gte: today }, paidAt: { not: null }, deletedAt: null },
      _sum: { totalCents: true },
    }),
    prisma.order.count({ where: { createdAt: { gte: today }, deletedAt: null } }),
    prisma.order.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        status: true,
        totalCents: true,
        customer: { select: { email: true } },
      },
    }),
    prisma.user.count({ where: { role: Role.CUSTOMER, deletedAt: null } }),
  ]);

  const revenue = paidRevenue._sum.totalCents ?? 0;
  const countByStatus = new Map(statusGroups.map((g) => [g.status, g._count._all]));
  const statusCounts = Object.values(OrderStatus).map((status) => ({
    status,
    count: countByStatus.get(status) ?? 0,
  }));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Operations dashboard" description="Counts are scoped to orders created today (local time)." />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="flex flex-col gap-1">
          <div className="text-xs uppercase text-zinc-500">Orders today</div>
          <div className="text-3xl font-semibold">{todaysCount}</div>
        </Card>
        <Card className="flex flex-col gap-1">
          <div className="text-xs uppercase text-zinc-500">Paid revenue today</div>
          <div className="text-3xl font-semibold">
            <MoneyText cents={revenue} />
          </div>
        </Card>
        <Card className="flex flex-col gap-1">
          <div className="text-xs uppercase text-zinc-500">Customers</div>
          <div className="text-3xl font-semibold">{customerCount}</div>
        </Card>
      </div>

      <Card className="flex flex-col gap-3">
        <div className="text-sm font-semibold">Status mix (today)</div>
        <div className="flex flex-wrap gap-2">
          {statusCounts.map((row) => (
            <div key={row.status} className="flex items-center gap-2 rounded-full border border-zinc-200 px-3 py-1 text-xs dark:border-zinc-800">
              <StatusBadge status={row.status} />
              <span className="font-semibold">{row.count}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="flex flex-col gap-3">
        <div className="text-sm font-semibold">Recent orders</div>
        <div className="flex flex-col gap-2 text-sm">
          {recent.map((o) => (
            <div key={o.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 pb-2 last:border-b-0 dark:border-zinc-900">
              <div className="text-xs text-zinc-500">{o.id}</div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={o.status} />
                <MoneyText cents={o.totalCents} />
                <span className="text-xs text-zinc-500">{o.customer.email}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
