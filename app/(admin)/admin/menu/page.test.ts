import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

const { menuCategoryFindManyMock, archivedMenuItemFindManyMock } = vi.hoisted(() => ({
  menuCategoryFindManyMock: vi.fn(),
  archivedMenuItemFindManyMock: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    menuCategory: { findMany: menuCategoryFindManyMock },
    archivedMenuItem: { findMany: archivedMenuItemFindManyMock },
  },
}));

vi.mock("@/app/(admin)/admin/actions", () => ({
  createCategory: vi.fn(),
  createMenuItem: vi.fn(),
  deleteMenuItem: vi.fn(),
  updateMenuItemAvailability: vi.fn(),
}));

import AdminMenuPage from "@/app/(admin)/admin/menu/page";

describe("AdminMenuPage", () => {
  it("renders archived menu items nav and section", async () => {
    menuCategoryFindManyMock.mockResolvedValueOnce([
      {
        id: "cat-1",
        name: "Burgers",
        sortOrder: 0,
        itemLinks: [],
      },
    ]);
    archivedMenuItemFindManyMock.mockResolvedValueOnce([
      {
        id: "arch-row-1",
        originalId: "menu-arch-1",
        name: "Old Burger",
        description: "Legacy recipe",
        priceCents: 1299,
        isAvailable: false,
        archivedAt: new Date("2026-01-01T00:00:00.000Z"),
      },
    ]);

    const html = renderToStaticMarkup(await AdminMenuPage());

    expect(archivedMenuItemFindManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { archivedAt: "desc" },
      }),
    );
    expect(html).toContain("Archived menu items");
    expect(html).toContain("Old Burger");
    expect(html).toContain("Original ID: menu-arch-1");
    expect(html).toContain("href=\"#archived-menu-items\"");
  });
});
