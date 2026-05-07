import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

const { prismaFindManyMock, LiveRouterRefreshMock } = vi.hoisted(() => ({
  prismaFindManyMock: vi.fn(),
  LiveRouterRefreshMock: vi.fn(() => null),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    orderStatusEvent: {
      findMany: prismaFindManyMock,
    },
  },
}));

vi.mock("@/components/live-router-refresh", () => ({
  LiveRouterRefresh: LiveRouterRefreshMock,
}));

import AdminAuditPage from "@/app/(admin)/admin/audit/page";

describe("AdminAuditPage realtime audit trail", () => {
  it("renders events and wires LiveRouterRefresh for realtime updates", async () => {
    prismaFindManyMock.mockResolvedValueOnce([
      {
        id: "ev1",
        at: new Date("2024-01-01T00:00:00Z"),
        fromStatus: null,
        toStatus: "RECEIVED",
        orderId: "order-1",
        order: { customer: { email: "cust@example.com" } },
        actor: { name: "System" },
      },
    ]);

    const html = renderToStaticMarkup(await AdminAuditPage());

    expect(prismaFindManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { deletedAt: null, order: { deletedAt: null } },
        orderBy: { at: "desc" },
        take: 150,
      }),
    );
    expect(html).toContain("Audit trail");
    expect(html).toContain("cust@example.com");
    expect(LiveRouterRefreshMock).toHaveBeenCalled();
  });
});

