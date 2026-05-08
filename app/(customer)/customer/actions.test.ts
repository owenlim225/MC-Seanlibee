import { beforeEach, describe, expect, it, vi } from "vitest";
import { Role } from "@prisma/client";

const {
  requireRoleLiteMock,
  readCartMock,
  writeCartMock,
  revalidatePathMock,
  orderFindFirstMock,
} = vi.hoisted(() => ({
  requireRoleLiteMock: vi.fn(async () => ({ id: "cust-1", role: Role.CUSTOMER })),
  readCartMock: vi.fn(),
  writeCartMock: vi.fn(async () => undefined),
  revalidatePathMock: vi.fn(),
  orderFindFirstMock: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  requireRoleLite: requireRoleLiteMock,
}));

vi.mock("@/lib/cart-cookie", () => ({
  clearCart: vi.fn(),
  readCart: readCartMock,
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
    menuItem: { findMany: vi.fn() },
    order: { create: vi.fn(), findFirst: orderFindFirstMock },
  },
}));

import {
  addToCart,
  getOrderTrackingStatus,
  setLineQty,
} from "@/app/(customer)/customer/actions";

describe("customer cart actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns success feedback when adding cart item", async () => {
    readCartMock.mockResolvedValueOnce([{ menuItemId: "m-1", qty: 1 }]);

    const result = await addToCart("m-1");

    expect(writeCartMock).toHaveBeenCalledWith([{ menuItemId: "m-1", qty: 2 }]);
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
});

describe("getOrderTrackingStatus", () => {
  beforeEach(() => {
    orderFindFirstMock.mockReset();
    requireRoleLiteMock.mockClear();
  });

  it("requires the customer role before reading the database", async () => {
    orderFindFirstMock.mockResolvedValueOnce({ id: "order-1" });

    await getOrderTrackingStatus("order-1");

    expect(requireRoleLiteMock).toHaveBeenCalledWith(Role.CUSTOMER);
  });

  it("returns found=true when the order exists for the calling customer", async () => {
    orderFindFirstMock.mockResolvedValueOnce({ id: "order-1" });

    const result = await getOrderTrackingStatus("order-1");

    expect(result).toEqual({ found: true });
  });

  it("returns found=false when the order is missing or owned by another customer", async () => {
    orderFindFirstMock.mockResolvedValueOnce(null);

    const result = await getOrderTrackingStatus("order-1");

    expect(result).toEqual({ found: false });
  });

  it("scopes the database read to the calling customer to prevent cross-account probing", async () => {
    orderFindFirstMock.mockResolvedValueOnce(null);

    await getOrderTrackingStatus("order-1");

    expect(orderFindFirstMock).toHaveBeenCalledWith({
      where: { id: "order-1", customerId: "cust-1", deletedAt: null },
      select: { id: true },
    });
  });
});
