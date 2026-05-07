import { OrderStatus } from "@prisma/client";

const tone: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "bg-amber-100 text-amber-900",
  RECEIVED: "bg-blue-100 text-blue-900",
  PREPARING: "bg-indigo-100 text-indigo-900",
  READY: "bg-emerald-100 text-emerald-900",
  PICKED_UP: "bg-cyan-100 text-cyan-900",
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
