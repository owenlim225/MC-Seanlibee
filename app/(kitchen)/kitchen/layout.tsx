import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { RoleNav } from "@/components/role/role-nav";

export default async function KitchenLayout({ children }: { children: React.ReactNode }) {
  await requireRole(Role.KITCHEN);
  return (
    <div className="flex flex-col gap-5">
      <RoleNav active={Role.KITCHEN} />
      {children}
    </div>
  );
}
