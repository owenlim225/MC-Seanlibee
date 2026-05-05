"use server";

import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireRoleLite } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadImage } from "@/lib/storage";

function parseIntSafe(value: FormDataEntryValue | null, fallback: number): number {
  const n = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(n) ? n : fallback;
}

export async function createCategory(formData: FormData): Promise<void> {
  await requireRoleLite(Role.ADMIN);
  const name = String(formData.get("name") ?? "").trim();
  const sortOrder = parseIntSafe(formData.get("sortOrder"), 0);
  if (!name) return;
  await prisma.menuCategory.create({ data: { name, sortOrder } });
  revalidatePath("/admin/menu");
}

export async function createMenuItem(formData: FormData): Promise<void> {
  await requireRoleLite(Role.ADMIN);
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "").trim();
  const priceDollars = String(formData.get("price") ?? "").trim();
  const price = Number.parseFloat(priceDollars);
  if (!name || !categoryId || !Number.isFinite(price)) return;

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
      categoryId,
      priceCents: Math.round(price * 100),
      imageUrl,
      isAvailable: true,
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
