import { OrderStatus } from "@prisma/client";

const tone: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-100",
  RECEIVED: "bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-100",
  PREPARING: "bg-indigo-100 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-100",
  READY: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100",
  PICKED_UP: "bg-cyan-100 text-cyan-900 dark:bg-cyan-950 dark:text-cyan-100",
  DELIVERED: "bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100",
  CANCELED: "bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-100",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`rounded-full px-2 py-1 text-xs font-medium ${tone[status]}`}>
      {status.replaceAll("_", " ")}
    </span>
  );
}
