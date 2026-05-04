import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { RelativeTime } from "@/components/ui/relative-time";
import { StatusBadge } from "@/components/ui/status-badge";

export default async function AdminAuditPage() {
  const events = await prisma.orderStatusEvent.findMany({
    orderBy: { at: "desc" },
    take: 150,
    include: { order: { include: { customer: true } }, actor: true },
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Audit trail" description="Latest OrderStatusEvent rows across all actors." />

      <Card className="flex flex-col gap-3">
        {events.map((ev) => (
          <div key={ev.id} className="flex flex-col gap-2 border-b border-zinc-100 pb-3 last:border-b-0 dark:border-zinc-900">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs text-zinc-500">{ev.order.customer.email}</div>
              <RelativeTime date={ev.at} />
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              {ev.fromStatus ? (
                <>
                  <StatusBadge status={ev.fromStatus} />
                  <span>→</span>
                </>
              ) : (
                <span className="text-xs text-zinc-500">start →</span>
              )}
              <StatusBadge status={ev.toStatus} />
            </div>
            <div className="text-xs text-zinc-500">
              Order {ev.orderId}
              {ev.actor ? ` · ${ev.actor.name}` : ""}
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
