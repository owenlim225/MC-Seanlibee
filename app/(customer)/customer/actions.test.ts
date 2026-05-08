import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { OrderStatus, Role } from "@prisma/client";

const {
  requireRoleLiteMock,
  readCartMock,
  writeCartMock,
  sanitizeCartNoteInputMock,
  revalidatePathMock,
  orderFindFirstMock,
  orderUpdateMock,
  orderStatusEventCreateMock,
  transactionMock,
  realtimePublishMock,
} = vi.hoisted(() => ({
  requireRoleLiteMock: vi.fn(async () => ({ id: "cust-1", role: Role.CUSTOMER })),
  readCartMock: vi.fn(),
  writeCartMock: vi.fn(async () => undefined),
  sanitizeCartNoteInputMock: vi.fn((value: unknown) =>
    typeof value === "string" ? value.trim().slice(0, 500) || undefined : undefined,
  ),
  revalidatePathMock: vi.fn(),
  orderFindFirstMock: vi.fn(),
  orderUpdateMock: vi.fn(async () => undefined),
  orderStatusEventCreateMock: vi.fn(async () => undefined),
  transactionMock: vi.fn(async (cb: (tx: unknown) => Promise<unknown>) =>
    cb({
      order: { update: orderUpdateMock },
      orderStatusEvent: { create: orderStatusEventCreateMock },
    }),
  ),
  realtimePublishMock: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  requireRoleLite: requireRoleLiteMock,
}));

vi.mock("@/lib/cart-cookie", () => ({
  clearCart: vi.fn(),
  readCart: readCartMock,
  sanitizeCartNoteInput: sanitizeCartNoteInputMock,
  writeCart: writeCartMock,
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: transactionMock,
    menuItem: { findMany: vi.fn() },
    order: { create: vi.fn(), findFirst: orderFindFirstMock },
  },
}));

vi.mock("@/lib/realtime", () => ({
  realtime: {
    publish: realtimePublishMock,
  },
}));

import { addToCart, cancelOrder, setLineNotes, setLineQty } from "@/app/(customer)/customer/actions";

describe("customer cart actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns success feedback when adding cart item", async () => {
    readCartMock.mockResolvedValueOnce([{ menuItemId: "m-1", qty: 1, notes: "no onions" }]);

    const result = await addToCart("m-1");

    expect(writeCartMock).toHaveBeenCalledWith([{ menuItemId: "m-1", qty: 2, notes: "no onions" }]);
    expect(revalidatePathMock).toHaveBeenCalledWith("/customer/cart");
    expect(result).toEqual(expect.objectContaining({ ok: true, message: "Added to cart" }));
  });

  it("returns remove feedback when quantity is set to zero", async () => {
    readCartMock.mockResolvedValueOnce([
      { menuItemId: "m-1", qty: 2 },
      { menuItemId: "m-2", qty: 1 },
    ]);

    const result = await setLineQty("m-1", 0);

    expect(writeCartMock).toHaveBeenCalledWith([{ menuItemId: "m-2", qty: 1 }]);
    expect(result).toEqual(expect.objectContaining({ ok: true, message: "Removed from cart" }));
  });

  it("saves notes for an existing cart line", async () => {
    readCartMock.mockResolvedValueOnce([{ menuItemId: "m-1", qty: 2 }]);
    const formData = new FormData();
    formData.set("notes", "  no cilantro  ");

    const result = await setLineNotes("m-1", formData);

    expect(sanitizeCartNoteInputMock).toHaveBeenCalledWith("  no cilantro  ");
    expect(writeCartMock).toHaveBeenCalledWith([{ menuItemId: "m-1", qty: 2, notes: "no cilantro" }]);
    expect(result).toEqual(expect.objectContaining({ ok: true, message: "Notes saved" }));
  });
});

describe("customer order cancellation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireRoleLiteMock.mockResolvedValue({ id: "cust-1", role: Role.CUSTOMER });
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("rejects empty order id input", async () => {
    const result = await cancelOrder("   ");

    expect(result).toEqual(expect.objectContaining({ ok: false, code: "order-not-found" }));
    expect(orderFindFirstMock).not.toHaveBeenCalled();
  });

  it("customer can cancel own eligible order", async () => {
    orderFindFirstMock.mockResolvedValueOnce({
      id: "order-1",
      customerId: "cust-1",
      status: OrderStatus.PREPARING,
      deletedAt: null,
    });

    const result = await cancelOrder("order-1");

    expect(result).toEqual(expect.objectContaining({ ok: true, message: "Order canceled" }));
    expect(transactionMock).toHaveBeenCalledTimes(1);
  });

  it("cannot cancel DELIVERED order", async () => {
    orderFindFirstMock.mockResolvedValueOnce({
      id: "order-2",
      customerId: "cust-1",
      status: OrderStatus.DELIVERED,
      deletedAt: null,
    });

    const result = await cancelOrder("order-2");

    expect(result).toEqual(expect.objectContaining({ ok: false, code: "order-not-cancelable" }));
    expect(transactionMock).not.toHaveBeenCalled();
    expect(realtimePublishMock).not.toHaveBeenCalled();
  });

  it("cannot cancel another customer's order", async () => {
    orderFindFirstMock.mockResolvedValueOnce({
      id: "order-3",
      customerId: "cust-2",
      status: OrderStatus.RECEIVED,
      deletedAt: null,
    });

    const result = await cancelOrder("order-3");

    expect(result).toEqual(expect.objectContaining({ ok: false, code: "order-not-found" }));
    expect(transactionMock).not.toHaveBeenCalled();
    expect(realtimePublishMock).not.toHaveBeenCalled();
  });

  it("status event is recorded correctly", async () => {
    orderFindFirstMock.mockResolvedValueOnce({
      id: "order-4",
      customerId: "cust-1",
      status: OrderStatus.READY,
      deletedAt: null,
    });

    await cancelOrder("order-4");

    expect(orderUpdateMock).toHaveBeenCalledWith({
      where: { id: "order-4", status: OrderStatus.READY },
      data: { status: OrderStatus.CANCELED },
    });
    expect(orderStatusEventCreateMock).toHaveBeenCalledWith({
      data: {
        orderId: "order-4",
        fromStatus: OrderStatus.READY,
        toStatus: OrderStatus.CANCELED,
        actorUserId: "cust-1",
      },
    });
  });

  it("revalidates role views and publishes realtime update", async () => {
    orderFindFirstMock.mockResolvedValueOnce({
      id: "order-5",
      customerId: "cust-1",
      status: OrderStatus.RECEIVED,
      deletedAt: null,
    });

    await cancelOrder("order-5");

    expect(realtimePublishMock).toHaveBeenCalledWith("order:order-5", {
      type: "order-status",
      orderId: "order-5",
      status: OrderStatus.CANCELED,
    });
    expect(revalidatePathMock).toHaveBeenCalledWith("/customer/orders");
    expect(revalidatePathMock).toHaveBeenCalledWith("/customer/orders/order-5");
    expect(revalidatePathMock).toHaveBeenCalledWith("/admin");
    expect(revalidatePathMock).toHaveBeenCalledWith("/admin/audit");
    expect(revalidatePathMock).toHaveBeenCalledWith("/kitchen");
    expect(revalidatePathMock).toHaveBeenCalledWith("/driver");
  });

  it("returns non-cancelable when status changes before update", async () => {
    orderFindFirstMock.mockResolvedValueOnce({
      id: "order-6",
      customerId: "cust-1",
      status: OrderStatus.PREPARING,
      deletedAt: null,
    });
    orderUpdateMock.mockRejectedValueOnce(new Error("stale-status"));

    const result = await cancelOrder("order-6");

    expect(result).toEqual(expect.objectContaining({ ok: false, code: "order-not-cancelable" }));
    expect(orderStatusEventCreateMock).not.toHaveBeenCalled();
    expect(realtimePublishMock).not.toHaveBeenCalled();
  });

  it("still succeeds when realtime publish throws", async () => {
    orderFindFirstMock.mockResolvedValueOnce({
      id: "order-7",
      customerId: "cust-1",
      status: OrderStatus.RECEIVED,
      deletedAt: null,
    });
    realtimePublishMock.mockImplementationOnce(() => {
      throw new Error("publish-error");
    });

    const result = await cancelOrder("order-7");

    expect(result).toEqual(expect.objectContaining({ ok: true, message: "Order canceled" }));
    expect(revalidatePathMock).toHaveBeenCalledWith("/customer/orders");
    expect(revalidatePathMock).toHaveBeenCalledWith("/customer/orders/order-7");
  });
});
