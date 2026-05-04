"use server";

import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { clearSession, devSignInAs } from "@/lib/auth";

export async function signInRole(role: Role, userId?: string, next?: string): Promise<void> {
  await devSignInAs(role, userId);
  redirect(next && next.startsWith("/") ? next : "/");
}

export async function signOut(next?: string): Promise<void> {
  await clearSession();
  redirect(next && next.startsWith("/") ? next : "/dev/role-switcher");
}
