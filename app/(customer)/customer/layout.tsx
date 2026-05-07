import { Role } from "@prisma/client";
import { requireRoleLite } from "@/lib/auth";

export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  await requireRoleLite(Role.CUSTOMER);
  return <div className="flex flex-col gap-5">{children}</div>;
}
