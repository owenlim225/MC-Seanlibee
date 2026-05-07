"use server";

import { randomUUID } from "node:crypto";
import { Role } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { revalidatePath } from "next/cache";
import { requireRoleLite } from "@/lib/auth";
import { hashPassword } from "@/lib/auth/password";
import { isGroupedCategorySlug } from "@/lib/menu/grouped-taxonomy";
import { prisma } from "@/lib/prisma";
import { uploadImage } from "@/lib/storage";

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

export async function createCategory(formData: FormData): Promise<void> {
  await requireRoleLite(Role.ADMIN);
  const name = String(formData.get("name") ?? "").trim();
  const sortOrder = parseIntSafe(formData.get("sortOrder"), 0);
  const slug = slugify(name);
  if (!name || !slug) return;
  await prisma.menuCategory.create({
    data: { name, sortOrder, slug: `${slug}-${Date.now()}` },
  });
  revalidatePath("/admin/menu");
}

export async function createMenuItem(formData: FormData): Promise<void> {
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
  if (!name || categoryIds.length === 0 || !Number.isFinite(price)) return;

  const groupedCategories = await prisma.menuCategory.findMany({
    where: { id: { in: categoryIds }, deletedAt: null },
    select: { id: true, slug: true },
  });
  if (
    groupedCategories.length !== categoryIds.length ||
    groupedCategories.some((category) => !isGroupedCategorySlug(category.slug))
  ) {
    return;
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
}

export async function updateMenuItemAvailability(menuItemId: string, isAvailable: boolean): Promise<void> {
  await requireRoleLite(Role.ADMIN);
  const updated = await prisma.menuItem.updateMany({
    where: { id: menuItemId, deletedAt: null },
    data: { isAvailable },
  });
  if (updated.count === 0) return;
  revalidatePath("/admin/menu");
  revalidatePath("/customer");
}

export async function deleteMenuItem(menuItemId: string): Promise<void> {
  const session = await requireRoleLite(Role.ADMIN);
  const item = await prisma.menuItem.findUnique({ where: { id: menuItemId } });
  if (!item || item.deletedAt) return;

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
}

export async function updateUserRoleForm(formData: FormData): Promise<void> {
  await requireRoleLite(Role.ADMIN);
  const userId = String(formData.get("userId") ?? "").trim();
  const roleRaw = String(formData.get("role") ?? "").trim();
  if (!userId || !(Object.values(Role) as string[]).includes(roleRaw)) return;
  await prisma.user.update({ where: { id: userId }, data: { role: roleRaw as Role } });
  revalidatePath("/admin/users");
}

export async function createUserForm(formData: FormData): Promise<void> {
  await requireRoleLite(Role.ADMIN);
  const email = parseEmail(formData.get("email"));
  const name = parseName(formData.get("name"));
  const role = parseRole(formData.get("role"));
  const isActive = parseBoolean(formData.get("isActive"), true);
  if (!email || !name || !role) return;

  try {
    await prisma.user.create({
      data: {
        email,
        name,
        role,
        // Password out of admin CRUD scope: generate non-guessable hash.
        password: hashPassword(randomUUID()),
        isActive,
      },
    });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === "P2002") return;
    throw error;
  }
  revalidatePath("/admin/users");
}

export async function updateUserProfileForm(formData: FormData): Promise<void> {
  const session = await requireRoleLite(Role.ADMIN);
  const userId = String(formData.get("userId") ?? "").trim();
  const email = parseEmail(formData.get("email"));
  const name = parseName(formData.get("name"));
  const role = parseRole(formData.get("role"));
  const isActive = parseBoolean(formData.get("isActive"), true);
  if (!userId || !email || !name || !role) return;
  if (userId === session.id && role !== Role.ADMIN) return;

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
    if (error instanceof PrismaClientKnownRequestError && error.code === "P2002") return;
    throw error;
  }
  revalidatePath("/admin/users");
}

export async function softDeleteUserForm(formData: FormData): Promise<void> {
  const session = await requireRoleLite(Role.ADMIN);
  const userId = String(formData.get("userId") ?? "").trim();
  if (!userId || userId === session.id) return;

  const existing = await prisma.user.findUnique({ where: { id: userId } });
  if (!existing || !existing.isActive || existing.deletedAt) return;

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
}

export async function restoreUserForm(formData: FormData): Promise<void> {
  await requireRoleLite(Role.ADMIN);
  const userId = String(formData.get("userId") ?? "").trim();
  if (!userId) return;
  await prisma.user.update({
    where: { id: userId },
    data: { isActive: true, deletedAt: null },
  });
  revalidatePath("/admin/users");
}
