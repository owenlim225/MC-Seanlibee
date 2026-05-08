"use server";
import { Role } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { revalidatePath } from "next/cache";
import { requireRoleLite } from "@/lib/auth";
import { hashPassword } from "@/lib/auth/password";
import { isGroupedCategorySlug } from "@/lib/menu/grouped-taxonomy";
import { prisma } from "@/lib/prisma";
import { uploadImage } from "@/lib/storage";
import { actionNoop, actionSuccess, type ActionFeedback } from "@/lib/actions/action-feedback";

function parseIntSafe(value: FormDataEntryValue | null, fallback: number): number {
  const n = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(n) ? n : fallback;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const SIMPLE_EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseRole(value: FormDataEntryValue | null): Role | null {
  const role = String(value ?? "").trim();
  if (!(Object.values(Role) as string[]).includes(role)) return null;
  return role as Role;
}

function parseEmail(value: FormDataEntryValue | null): string | null {
  const email = String(value ?? "").trim().toLowerCase();
  if (!email || !SIMPLE_EMAIL_RE.test(email)) return null;
  return email;
}

function parseName(value: FormDataEntryValue | null): string | null {
  const name = String(value ?? "").trim();
  if (!name) return null;
  return name;
}

function parseBoolean(value: FormDataEntryValue | null, fallback: boolean): boolean {
  if (value === null) return fallback;
  const normalized = String(value).trim().toLowerCase();
  if (normalized === "true" || normalized === "1" || normalized === "on") return true;
  if (normalized === "false" || normalized === "0" || normalized === "off") return false;
  return fallback;
}

function parsePassword(value: FormDataEntryValue | null): string | null {
  const password = String(value ?? "").trim();
  if (password.length < 8) return null;
  return password;
}

export async function createCategory(formData: FormData): Promise<ActionFeedback> {
  await requireRoleLite(Role.ADMIN);
  const name = String(formData.get("name") ?? "").trim();
  const sortOrder = parseIntSafe(formData.get("sortOrder"), 0);
  const slug = slugify(name);
  if (!name || !slug) return actionNoop("invalid-category");
  await prisma.menuCategory.create({
    data: { name, sortOrder, slug: `${slug}-${Date.now()}` },
  });
  revalidatePath("/admin/menu");
  return actionSuccess("Category created");
}

export async function createMenuItem(formData: FormData): Promise<ActionFeedback> {
  await requireRoleLite(Role.ADMIN);
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const legacyCategoryId = String(formData.get("categoryId") ?? "").trim();
  const selectedCategoryIds = formData
    .getAll("categoryIds")
    .map((entry) => String(entry).trim())
    .filter((value) => value.length > 0);
  const categoryIds = selectedCategoryIds.length > 0 ? selectedCategoryIds : legacyCategoryId ? [legacyCategoryId] : [];
  const priceDollars = String(formData.get("price") ?? "").trim();
  const price = Number.parseFloat(priceDollars);
  if (!name || categoryIds.length === 0 || !Number.isFinite(price) || price <= 0) return actionNoop("invalid-menu-item");

  const groupedCategories = await prisma.menuCategory.findMany({
    where: { id: { in: categoryIds }, deletedAt: null },
    select: { id: true, slug: true },
  });
  if (
    groupedCategories.length !== categoryIds.length ||
    groupedCategories.some((category) => !isGroupedCategorySlug(category.slug))
  ) {
    return actionNoop("invalid-categories");
  }

  const file = formData.get("image");
  let imageUrl: string | null = null;
  if (file instanceof File && file.size > 0) {
    const uploaded = await uploadImage(file);
    imageUrl = uploaded.url;
  }

  await prisma.menuItem.create({
    data: {
      name,
      description,
      priceCents: Math.round(price * 100),
      imageUrl,
      isAvailable: true,
      categoryLinks: {
        create: groupedCategories.map((category) => ({ categoryId: category.id })),
      },
    },
  });
  revalidatePath("/admin/menu");
  revalidatePath("/customer");
  return actionSuccess("Menu item created");
}

export async function updateMenuItemAvailability(menuItemId: string, isAvailable: boolean): Promise<ActionFeedback> {
  await requireRoleLite(Role.ADMIN);
  const updated = await prisma.menuItem.updateMany({
    where: { id: menuItemId, deletedAt: null },
    data: { isAvailable },
  });
  if (updated.count === 0) return actionNoop("menu-item-not-found");
  revalidatePath("/admin/menu");
  revalidatePath("/customer");
  return actionSuccess(isAvailable ? "Menu item enabled" : "Menu item disabled");
}

export async function deleteMenuItem(menuItemId: string): Promise<ActionFeedback> {
  const session = await requireRoleLite(Role.ADMIN);
  const item = await prisma.menuItem.findUnique({ where: { id: menuItemId } });
  if (!item || item.deletedAt) return actionNoop("menu-item-unavailable");

  await prisma.$transaction([
    prisma.archivedMenuItem.create({
      data: {
        originalId: item.id,
        archivedReason: "admin-archive-menu-item",
        archivedByUserId: session.id,
        name: item.name,
        description: item.description,
        priceCents: item.priceCents,
        imageUrl: item.imageUrl,
        isAvailable: item.isAvailable,
        deletedAt: item.deletedAt,
      },
    }),
    prisma.menuItem.update({
      where: { id: menuItemId },
      data: { deletedAt: new Date() },
    }),
  ]);
  revalidatePath("/admin/menu");
  revalidatePath("/customer");
  return actionSuccess("Menu item archived");
}

export async function restoreMenuItemFromArchive(menuItemId: string): Promise<ActionFeedback> {
  await requireRoleLite(Role.ADMIN);
  const targetId = String(menuItemId ?? "").trim();
  if (!targetId) return actionNoop("invalid-menu-item-restore");

  const archived = await prisma.archivedMenuItem.findFirst({
    where: { originalId: targetId },
    orderBy: { archivedAt: "desc" },
  });
  if (!archived) return actionNoop("archived-menu-item-not-found");

  await prisma.menuItem.upsert({
    where: { id: targetId },
    create: {
      id: targetId,
      name: archived.name,
      description: archived.description,
      priceCents: archived.priceCents,
      imageUrl: archived.imageUrl,
      isAvailable: archived.isAvailable,
      deletedAt: null,
    },
    update: {
      name: archived.name,
      description: archived.description,
      priceCents: archived.priceCents,
      imageUrl: archived.imageUrl,
      isAvailable: archived.isAvailable,
      deletedAt: null,
    },
  });

  revalidatePath("/admin/menu");
  revalidatePath("/customer");
  return actionSuccess("Archived menu item restored");
}

export async function updateUserRoleForm(formData: FormData): Promise<ActionFeedback> {
  const session = await requireRoleLite(Role.ADMIN);
  const userId = String(formData.get("userId") ?? "").trim();
  const roleRaw = String(formData.get("role") ?? "").trim();
  if (!userId || !(Object.values(Role) as string[]).includes(roleRaw)) return actionNoop("invalid-user-role");
  if (userId === session.id && roleRaw !== Role.ADMIN) return actionNoop("self-admin-demotion-blocked");
  await prisma.user.update({ where: { id: userId }, data: { role: roleRaw as Role } });
  revalidatePath("/admin/users");
  return actionSuccess("User role updated");
}

export async function createUserForm(formData: FormData): Promise<ActionFeedback> {
  await requireRoleLite(Role.ADMIN);
  const email = parseEmail(formData.get("email"));
  const name = parseName(formData.get("name"));
  const role = parseRole(formData.get("role"));
  const isActive = parseBoolean(formData.get("isActive"), true);
  const password = parsePassword(formData.get("password"));
  if (!email || !name || !role || !password) return actionNoop("invalid-user-create");

  try {
    await prisma.user.create({
      data: {
        email,
        name,
        role,
        password: hashPassword(password),
        isActive,
      },
    });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === "P2002") return actionNoop("duplicate-user");
    throw error;
  }
  revalidatePath("/admin/users");
  return actionSuccess("User created");
}

export async function updateUserProfileForm(formData: FormData): Promise<ActionFeedback> {
  const session = await requireRoleLite(Role.ADMIN);
  const userId = String(formData.get("userId") ?? "").trim();
  const email = parseEmail(formData.get("email"));
  const name = parseName(formData.get("name"));
  const role = parseRole(formData.get("role"));
  const isActive = parseBoolean(formData.get("isActive"), true);
  if (!userId || !email || !name || !role) return actionNoop("invalid-user-update");
  if (userId === session.id && role !== Role.ADMIN) return actionNoop("self-admin-demotion-blocked");

  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        email,
        name,
        role,
        isActive,
        ...(isActive ? { deletedAt: null } : {}),
      },
    });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === "P2002") return actionNoop("duplicate-user");
    throw error;
  }
  revalidatePath("/admin/users");
  return actionSuccess("User profile updated");
}

export async function softDeleteUserForm(formData: FormData): Promise<ActionFeedback> {
  const session = await requireRoleLite(Role.ADMIN);
  const userId = String(formData.get("userId") ?? "").trim();
  if (!userId || userId === session.id) return actionNoop("invalid-user-archive");

  const existing = await prisma.user.findUnique({ where: { id: userId } });
  if (!existing || !existing.isActive || existing.deletedAt) return actionNoop("user-not-active");

  await prisma.$transaction([
    prisma.archivedUser.create({
      data: {
        originalId: existing.id,
        archivedReason: "admin-soft-delete",
        archivedByUserId: session.id,
        authUserId: existing.authUserId,
        email: existing.email,
        password: existing.password,
        role: existing.role,
        name: existing.name,
        isActive: existing.isActive,
        deletedAt: existing.deletedAt,
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { isActive: false, deletedAt: new Date() },
    }),
  ]);
  revalidatePath("/admin/users");
  return actionSuccess("User archived");
}

export async function restoreUserForm(formData: FormData): Promise<ActionFeedback> {
  await requireRoleLite(Role.ADMIN);
  const userId = String(formData.get("userId") ?? "").trim();
  if (!userId) return actionNoop("invalid-user-restore");
  await prisma.user.update({
    where: { id: userId },
    data: { isActive: true, deletedAt: null },
  });
  revalidatePath("/admin/users");
  return actionSuccess("User restored");
}

export async function restoreUserFromArchive(userId: string): Promise<ActionFeedback> {
  await requireRoleLite(Role.ADMIN);
  const targetId = String(userId ?? "").trim();
  if (!targetId) return actionNoop("invalid-user-restore");

  const archived = await prisma.archivedUser.findFirst({
    where: { originalId: targetId },
    orderBy: { archivedAt: "desc" },
  });
  if (!archived) return actionNoop("archived-user-not-found");

  await prisma.user.upsert({
    where: { id: targetId },
    create: {
      id: targetId,
      authUserId: archived.authUserId,
      email: archived.email,
      password: archived.password,
      role: archived.role,
      name: archived.name,
      isActive: true,
      deletedAt: null,
    },
    update: {
      authUserId: archived.authUserId,
      email: archived.email,
      password: archived.password,
      role: archived.role,
      name: archived.name,
      isActive: true,
      deletedAt: null,
    },
  });

  revalidatePath("/admin/users");
  return actionSuccess("Archived user restored");
}

