import { Role } from "@prisma/client";
import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { RoleNav } from "@/components/role/role-nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole(Role.ADMIN);
  return (
    <div className="flex flex-col gap-5">
      <RoleNav active={Role.ADMIN} />
      <nav className="flex flex-wrap gap-3 text-sm">
        <Link className="underline" href="/admin">
          Dashboard
        </Link>
        <Link className="underline" href="/admin/menu">
          Menu
        </Link>
        <Link className="underline" href="/admin/users">
          Users
        </Link>
        <Link className="underline" href="/admin/audit">
          Audit
        </Link>
      </nav>
      {children}
    </div>
  );
}
