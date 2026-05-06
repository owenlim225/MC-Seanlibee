import { beforeEach, describe, expect, it, vi } from "vitest";
import { Role } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

const {
  requireRoleLiteMock,
  revalidatePathMock,
  userCreateMock,
  userUpdateMock,
} = vi.hoisted(() => ({
  requireRoleLiteMock: vi.fn(async () => ({ id: "admin-1", role: Role.ADMIN })),
  revalidatePathMock: vi.fn(),
  userCreateMock: vi.fn(),
  userUpdateMock: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  requireRoleLite: requireRoleLiteMock,
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      create: userCreateMock,
      update: userUpdateMock,
    },
    menuCategory: { create: vi.fn(), findMany: vi.fn() },
    menuItem: { create: vi.fn(), update: vi.fn(), delete: vi.fn() },
  },
}));

import {
  createUserForm,
  restoreUserForm,
  softDeleteUserForm,
  updateUserProfileForm,
} from "@/app/(admin)/admin/actions";

describe("admin user CRUD actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireRoleLiteMock.mockResolvedValue({ id: "admin-1", role: Role.ADMIN });
  });

  it("creates user with normalized email", async () => {
    const form = new FormData();
    form.set("name", "  New User ");
    form.set("email", "  New@Example.com ");
    form.set("role", Role.CUSTOMER);
    form.set("isActive", "true");

    await createUserForm(form);

    expect(userCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: "New User",
          email: "new@example.com",
          role: Role.CUSTOMER,
          isActive: true,
          password: expect.any(String),
        }),
      }),
    );
    expect(revalidatePathMock).toHaveBeenCalledWith("/admin/users");
  });

  it("ignores duplicate-email create", async () => {
    const form = new FormData();
    form.set("name", "Dup User");
    form.set("email", "dup@example.com");
    form.set("role", Role.CUSTOMER);
    userCreateMock.mockRejectedValueOnce(
      new PrismaClientKnownRequestError("duplicate", {
        code: "P2002",
        clientVersion: "test",
      }),
    );

    await createUserForm(form);

    expect(revalidatePathMock).not.toHaveBeenCalled();
  });

  it("updates existing user profile", async () => {
    const form = new FormData();
    form.set("userId", "u1");
    form.set("name", "Changed Name");
    form.set("email", "Changed@example.com");
    form.set("role", Role.DRIVER);
    form.set("isActive", "false");

    await updateUserProfileForm(form);

    expect(userUpdateMock).toHaveBeenCalledWith({
      where: { id: "u1" },
      data: expect.objectContaining({
        name: "Changed Name",
        email: "changed@example.com",
        role: Role.DRIVER,
        isActive: false,
      }),
    });
    expect(revalidatePathMock).toHaveBeenCalledWith("/admin/users");
  });

  it("blocks self soft-delete", async () => {
    const form = new FormData();
    form.set("userId", "admin-1");

    await softDeleteUserForm(form);

    expect(userUpdateMock).not.toHaveBeenCalled();
  });

  it("restores inactive user", async () => {
    const form = new FormData();
    form.set("userId", "u2");

    await restoreUserForm(form);

    expect(userUpdateMock).toHaveBeenCalledWith({
      where: { id: "u2" },
      data: { isActive: true, deletedAt: null },
    });
    expect(revalidatePathMock).toHaveBeenCalledWith("/admin/users");
  });
});
