import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { readSessionPayload } from "@/lib/auth/mock";

export type Session = {
  user: { id: string; role: Role; email: string; name: string } | null;
};

export async function getSession(): Promise<Session> {
  const payload = await readSessionPayload();
  if (!payload) return { user: null };
  const user = await prisma.user.findUnique({ where: { id: payload.uid } });
  if (!user || user.role !== payload.role) return { user: null };
  return { user: { id: user.id, role: user.role, email: user.email, name: user.name } };
}

export async function requireRole(role: Role): Promise<NonNullable<Session["user"]>> {
  const session = await getSession();
  if (!session.user) redirect("/dev/role-switcher");
  if (session.user.role !== role) redirect("/dev/role-switcher");
  return session.user;
}

export { devSignInAs, clearSession } from "@/lib/auth/mock";
