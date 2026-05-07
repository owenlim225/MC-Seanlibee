import { OrderStatus } from "@prisma/client";

const tone: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "bg-[#fff1f4] text-[#8f1630] dark:bg-[#4d0f1d] dark:text-[#ffd8e1]",
  RECEIVED: "bg-[#ffe3ea] text-[#89142d] dark:bg-[#5a1123] dark:text-[#ffd4df]",
  PREPARING: "bg-[#ffd4de] text-[#7c1228] dark:bg-[#68132a] dark:text-[#ffd0dc]",
  READY: "bg-[#ffc6d3] text-[#6c1023] dark:bg-[#77162f] dark:text-[#ffccda]",
  PICKED_UP: "bg-[#ffb6c8] text-[#5f0d1f] dark:bg-[#891934] dark:text-[#ffc8d8]",
  DELIVERED: "bg-[var(--brand-primary)] text-[var(--brand-primary-foreground)] dark:bg-[#e55773] dark:text-[#2a0710]",
  CANCELED: "bg-[#ffe8ed] text-[#9f1239] dark:bg-[#5d1329] dark:text-[#ffcddd]",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`rounded-full px-2 py-1 text-xs font-medium ${tone[status]}`}>
      {status.replaceAll("_", " ")}
    </span>
  );
}
