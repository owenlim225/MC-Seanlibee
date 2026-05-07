import { Role } from "@prisma/client";
import { requireRoleLite } from "@/lib/auth";

export default async function KitchenLayout({ children }: { children: React.ReactNode }) {
  await requireRoleLite(Role.KITCHEN);
  return <div className="flex flex-col gap-5">{children}</div>;
}
