import { Role } from "@prisma/client";
import { requireRoleLite } from "@/lib/auth";

export default async function DriverLayout({ children }: { children: React.ReactNode }) {
  await requireRoleLite(Role.DRIVER);
  return <div className="flex flex-col gap-5">{children}</div>;
}
