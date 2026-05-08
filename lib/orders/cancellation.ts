import { OrderStatus } from "@prisma/client";

const NON_CANCELLABLE_STATUSES: ReadonlySet<OrderStatus> = new Set([
  OrderStatus.DELIVERED,
  OrderStatus.CANCELED,
]);

export function isOrderCancellable(status: OrderStatus): boolean {
  return !NON_CANCELLABLE_STATUSES.has(status);
}
