import { Role } from "@prisma/client";
import Link from "next/link";
import { requireRoleLite } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRoleLite(Role.ADMIN);
  return (
    <div className="flex flex-col gap-5">
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
