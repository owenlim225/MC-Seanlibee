import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export type SessionUser = { id: string; role: Role };

export async function requireSession(): Promise<SessionUser> {
  const session = await getSession();
  if (!session.user) redirect("/dev/role-switcher");
  return session.user;
}

export async function assertRole(role: Role): Promise<SessionUser> {
  const user = await requireSession();
  if (user.role !== role) redirect("/dev/role-switcher");
  return user;
}
