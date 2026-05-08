import { describe, expect, it } from "vitest";
import { OrderStatus } from "@prisma/client";
import { isOrderCancellable } from "@/lib/orders/cancellation";

describe("isOrderCancellable", () => {
  it("allows cancellation before delivered", () => {
    expect(isOrderCancellable(OrderStatus.RECEIVED)).toBe(true);
    expect(isOrderCancellable(OrderStatus.PREPARING)).toBe(true);
    expect(isOrderCancellable(OrderStatus.READY)).toBe(true);
    expect(isOrderCancellable(OrderStatus.PICKED_UP)).toBe(true);
  });

  it("blocks cancellation for terminal statuses", () => {
    expect(isOrderCancellable(OrderStatus.DELIVERED)).toBe(false);
    expect(isOrderCancellable(OrderStatus.CANCELED)).toBe(false);
  });
});
