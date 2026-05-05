"use server";

import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireRoleLite } from "@/lib/auth";
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
    where: { id: { in: categoryIds } },
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
  await prisma.menuItem.update({ where: { id: menuItemId }, data: { isAvailable } });
  revalidatePath("/admin/menu");
  revalidatePath("/customer");
}

export async function deleteMenuItem(menuItemId: string): Promise<void> {
  await requireRoleLite(Role.ADMIN);
  await prisma.menuItem.delete({ where: { id: menuItemId } });
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
