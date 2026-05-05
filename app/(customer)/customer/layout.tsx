import { Role } from "@prisma/client";
import { requireRoleLite } from "@/lib/auth";
import { RoleNav } from "@/components/role/role-nav";

export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  await requireRoleLite(Role.CUSTOMER);
  return (
    <div className="flex flex-col gap-5">
      <RoleNav active={Role.CUSTOMER} />
      {children}
    </div>
  );
}
