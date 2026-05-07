import { describe, expect, it, vi } from "vitest";
import { Role } from "@prisma/client";
import { renderToStaticMarkup } from "react-dom/server";

const { userFindManyMock, archivedUserFindManyMock } = vi.hoisted(() => ({
  userFindManyMock: vi.fn(),
  archivedUserFindManyMock: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findMany: userFindManyMock },
    archivedUser: { findMany: archivedUserFindManyMock },
  },
}));

vi.mock("@/app/(admin)/admin/actions", () => ({
  createUserForm: vi.fn(),
  restoreUserForm: vi.fn(),
  softDeleteUserForm: vi.fn(),
  updateUserProfileForm: vi.fn(),
}));

import AdminUsersPage from "@/app/(admin)/admin/users/page";

describe("AdminUsersPage", () => {
  it("renders archived users section and password input", async () => {
    userFindManyMock.mockResolvedValueOnce([
      {
        id: "u1",
        name: "Active User",
        email: "active@example.com",
        role: Role.CUSTOMER,
        isActive: true,
      },
    ]);
    archivedUserFindManyMock.mockResolvedValueOnce([
      {
        originalId: "arch-1",
        name: "Archived User",
        email: "archived@example.com",
        role: Role.DRIVER,
        isActive: false,
        archivedAt: new Date("2026-01-01T00:00:00.000Z"),
      },
    ]);

    const html = renderToStaticMarkup(await AdminUsersPage());

    expect(userFindManyMock).toHaveBeenCalledWith({
      orderBy: [{ isActive: "desc" }, { email: "asc" }],
    });
    expect(archivedUserFindManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { archivedAt: "desc" },
      }),
    );
    expect(html).toContain("Active users");
    expect(html).toContain("Archived users");
    expect(html).toContain("archived@example.com");
    expect(html).toContain("Original ID: arch-1");
    expect(html).toContain('type="password"');
    expect(html).toContain('name="password"');
  });
});
