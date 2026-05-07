import { beforeEach, describe, expect, it, vi } from "vitest";
import { Role } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

const {
  requireRoleLiteMock,
  revalidatePathMock,
  userCreateMock,
  userUpdateMock,
  userFindUniqueMock,
  transactionMock,
  archivedUserCreateMock,
  menuItemFindUniqueMock,
  archivedMenuItemCreateMock,
  menuItemUpdateMock,
} = vi.hoisted(() => ({
  requireRoleLiteMock: vi.fn(async () => ({ id: "admin-1", role: Role.ADMIN })),
  revalidatePathMock: vi.fn(),
  userCreateMock: vi.fn(),
  userUpdateMock: vi.fn(),
  userFindUniqueMock: vi.fn(),
  transactionMock: vi.fn(async (arg: unknown) => {
    if (Array.isArray(arg)) {
      await Promise.all(arg as Promise<unknown>[]);
    }
  }),
  archivedUserCreateMock: vi.fn().mockResolvedValue({}),
  archivedMenuItemCreateMock: vi.fn().mockResolvedValue({}),
  menuItemFindUniqueMock: vi.fn(),
  menuItemUpdateMock: vi.fn().mockResolvedValue({}),
}));

vi.mock("@/lib/auth", () => ({
  requireRoleLite: requireRoleLiteMock,
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: transactionMock,
    archivedUser: { create: archivedUserCreateMock },
    archivedMenuItem: { create: archivedMenuItemCreateMock },
    user: {
      create: userCreateMock,
      update: userUpdateMock,
      findUnique: userFindUniqueMock,
    },
    menuCategory: { create: vi.fn(), findMany: vi.fn() },
    menuItem: {
      create: vi.fn(),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      update: menuItemUpdateMock,
      findUnique: menuItemFindUniqueMock,
    },
  },
}));

import {
  createUserForm,
  deleteMenuItem,
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
    form.set("password", "supersecure123");

    const result = await createUserForm(form);

    expect(userCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: "New User",
          email: "new@example.com",
          role: Role.CUSTOMER,
          isActive: true,
          password: expect.stringMatching(/^scrypt\$/),
        }),
      }),
    );
    expect(revalidatePathMock).toHaveBeenCalledWith("/admin/users");
    expect(result).toEqual(expect.objectContaining({ ok: true, message: "User created" }));
  });

  it("ignores duplicate-email create", async () => {
    const form = new FormData();
    form.set("name", "Dup User");
    form.set("email", "dup@example.com");
    form.set("role", Role.CUSTOMER);
    form.set("password", "supersecure123");
    userCreateMock.mockRejectedValueOnce(
      new PrismaClientKnownRequestError("duplicate", {
        code: "P2002",
        clientVersion: "test",
      }),
    );

    const result = await createUserForm(form);

    expect(revalidatePathMock).not.toHaveBeenCalled();
    expect(result).toEqual(expect.objectContaining({ ok: false, code: "duplicate-user" }));
  });

  it("skips create when password is missing", async () => {
    const form = new FormData();
    form.set("name", "No Password");
    form.set("email", "nopassword@example.com");
    form.set("role", Role.CUSTOMER);
    form.set("isActive", "true");

    await createUserForm(form);

    expect(userCreateMock).not.toHaveBeenCalled();
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });

  it("skips create when password is too short", async () => {
    const form = new FormData();
    form.set("name", "Short Password");
    form.set("email", "short@example.com");
    form.set("role", Role.CUSTOMER);
    form.set("password", "short");

    await createUserForm(form);

    expect(userCreateMock).not.toHaveBeenCalled();
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

    const result = await softDeleteUserForm(form);

    expect(userFindUniqueMock).not.toHaveBeenCalled();
    expect(transactionMock).not.toHaveBeenCalled();
    expect(userUpdateMock).not.toHaveBeenCalled();
    expect(result).toEqual(expect.objectContaining({ ok: false }));
  });

  it("soft-deletes active user via archive snapshot and transaction", async () => {
    userFindUniqueMock.mockResolvedValue({
      id: "u-target",
      isActive: true,
      deletedAt: null,
      authUserId: "auth-1",
      email: "t@example.com",
      password: "hashed",
      role: Role.CUSTOMER,
      name: "Target",
    });
    const form = new FormData();
    form.set("userId", "u-target");

    await softDeleteUserForm(form);

    expect(userFindUniqueMock).toHaveBeenCalledWith({ where: { id: "u-target" } });
    expect(transactionMock).toHaveBeenCalledTimes(1);
    expect(archivedUserCreateMock).toHaveBeenCalledWith({
      data: {
        originalId: "u-target",
        archivedReason: "admin-soft-delete",
        archivedByUserId: "admin-1",
        authUserId: "auth-1",
        email: "t@example.com",
        password: "hashed",
        role: Role.CUSTOMER,
        name: "Target",
        isActive: true,
        deletedAt: null,
      },
    });
    expect(userUpdateMock).toHaveBeenCalledWith({
      where: { id: "u-target" },
      data: { isActive: false, deletedAt: expect.any(Date) },
    });
    expect(revalidatePathMock).toHaveBeenCalledWith("/admin/users");
  });

  it("skips soft-delete when user already deleted", async () => {
    userFindUniqueMock.mockResolvedValue({
      id: "u-old",
      isActive: false,
      deletedAt: new Date(),
      authUserId: null,
      email: "old@example.com",
      password: "x",
      role: Role.CUSTOMER,
      name: "Old",
    });
    const form = new FormData();
    form.set("userId", "u-old");

    await softDeleteUserForm(form);

    expect(transactionMock).not.toHaveBeenCalled();
  });

  it("restores inactive user", async () => {
    const form = new FormData();
    form.set("userId", "u2");

    const result = await restoreUserForm(form);

    expect(userUpdateMock).toHaveBeenCalledWith({
      where: { id: "u2" },
      data: { isActive: true, deletedAt: null },
    });
    expect(revalidatePathMock).toHaveBeenCalledWith("/admin/users");
    expect(result).toEqual(expect.objectContaining({ ok: true, message: "User restored" }));
  });
});

describe("admin menu archive actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireRoleLiteMock.mockResolvedValue({ id: "admin-1", role: Role.ADMIN });
  });

  it("archives menu item instead of hard delete", async () => {
    menuItemFindUniqueMock.mockResolvedValue({
      id: "mi-1",
      name: "Burger",
      description: "Good",
      priceCents: 999,
      imageUrl: null,
      isAvailable: true,
      deletedAt: null,
    });

    const result = await deleteMenuItem("mi-1");

    expect(menuItemFindUniqueMock).toHaveBeenCalledWith({ where: { id: "mi-1" } });
    expect(transactionMock).toHaveBeenCalledTimes(1);
    expect(archivedMenuItemCreateMock).toHaveBeenCalledWith({
      data: {
        originalId: "mi-1",
        archivedReason: "admin-archive-menu-item",
        archivedByUserId: "admin-1",
        name: "Burger",
        description: "Good",
        priceCents: 999,
        imageUrl: null,
        isAvailable: true,
        deletedAt: null,
      },
    });
    expect(menuItemUpdateMock).toHaveBeenCalledWith({
      where: { id: "mi-1" },
      data: { deletedAt: expect.any(Date) },
    });
    expect(revalidatePathMock).toHaveBeenCalledWith("/admin/menu");
    expect(revalidatePathMock).toHaveBeenCalledWith("/customer");
    expect(result).toEqual(expect.objectContaining({ ok: true, message: "Menu item archived" }));
  });

  it("no-op deleteMenuItem when already archived", async () => {
    menuItemFindUniqueMock.mockResolvedValue({
      id: "mi-2",
      name: "Gone",
      description: "",
      priceCents: 100,
      imageUrl: null,
      isAvailable: false,
      deletedAt: new Date(),
    });

    await deleteMenuItem("mi-2");

    expect(transactionMock).not.toHaveBeenCalled();
  });
});
