import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { RoleNav } from "@/components/role/role-nav";

export default async function DriverLayout({ children }: { children: React.ReactNode }) {
  await requireRole(Role.DRIVER);
  return (
    <div className="flex flex-col gap-5">
      <RoleNav active={Role.DRIVER} />
      {children}
    </div>
  );
}
