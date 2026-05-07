import { OrderStatus } from "@prisma/client";

const tone: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-200",
  RECEIVED: "bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-200",
  PREPARING: "bg-indigo-100 text-indigo-900 dark:bg-indigo-900/30 dark:text-indigo-200",
  READY: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-200",
  PICKED_UP: "bg-cyan-100 text-cyan-900 dark:bg-cyan-900/30 dark:text-cyan-200",
  DELIVERED: "bg-[var(--surface-subtle)] text-[var(--text-primary)]",
  CANCELED: "bg-[var(--danger-surface)] text-[var(--danger)]",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`rounded-full px-2 py-1 text-xs font-medium ${tone[status]}`}>
      {status.replaceAll("_", " ")}
    </span>
  );
}
