import type { OrderStatus } from "@prisma/client";
import { StatusBadge } from "@/components/ui/status-badge";

export type StatusCountRow = { status: OrderStatus; count: number };

function statusLabel(status: OrderStatus): string {
  return status.replaceAll("_", " ");
}

export function StatusDistributionChart({ rows }: { rows: StatusCountRow[] }) {
  const total = rows.reduce((sum, row) => sum + row.count, 0);
  const segmentColors = [
    "#a20937",
    "#be123c",
    "#e11d48",
    "#f43f5e",
    "#fb7185",
    "#fda4af",
    "#1f2937",
  ];
  const rowsWithColor = rows.map((row, index) => ({
    ...row,
    color: segmentColors[index % segmentColors.length],
  }));

  return (
    <section className="flex flex-col gap-3" aria-labelledby="orders-by-status-heading">
      <h2 id="orders-by-status-heading" className="text-sm font-semibold">
        Orders by status (today)
      </h2>
      <p className="sr-only">
        Distribution of today&apos;s orders across statuses. A pie chart shows share of each non-zero status, followed by a list of status counts.
      </p>

      <div className="flex items-center justify-center py-2">
        <div className="relative h-52 w-52 rounded-full border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800">
          <div
            className="h-full w-full rounded-full"
            style={{
              backgroundColor: "rgba(197, 180, 180, 1)",
              background:
                "conic-gradient(from 0deg at 50% 50%, rgba(203, 26, 56, 1) 0%, rgba(203, 26, 56, 1) 80%, rgba(255, 255, 255, 1) 80%, rgba(253, 164, 175, 1) 100%)",
              color: "rgba(255, 255, 255, 1)",
            }}
            aria-hidden
          />
          <div className="absolute inset-8 flex flex-col items-center justify-center rounded-full bg-[rgba(255,250,250,1)] text-center text-black">
            <span className="text-xs uppercase tracking-wide text-[var(--text-meta)]">Orders</span>
            <span className="text-2xl font-semibold">{total}</span>
            <span className="text-xs text-[var(--text-meta)]">today</span>
          </div>
        </div>
      </div>

      <ul className="grid gap-2 sm:grid-cols-2">
        {rowsWithColor.map((row) => (
          <li
            key={row.status}
            className="flex items-center justify-between rounded-md border border-zinc-200 px-3 py-2 dark:border-zinc-700"
            aria-label={`${statusLabel(row.status)}: ${row.count} orders today`}
          >
            <div className="flex items-center gap-2">
              <span aria-hidden className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: row.count > 0 ? row.color : "#9ca3af" }} />
              <span aria-hidden>
                <StatusBadge status={row.status} />
              </span>
            </div>
            <div className="tabular-nums text-sm font-semibold text-[var(--text-meta)]" aria-hidden>
              {row.count}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
