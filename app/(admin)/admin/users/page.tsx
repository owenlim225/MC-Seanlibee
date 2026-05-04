import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { updateUserRoleForm } from "@/app/(admin)/admin/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({ orderBy: { email: "asc" } });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Users & roles" description="Promote seeded operators between mock roles." />

      <div className="flex flex-col gap-3">
        {users.map((user) => (
          <Card key={user.id} className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="font-medium">{user.name}</div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400">{user.email}</div>
              <div className="text-xs text-zinc-500">{user.id}</div>
            </div>
            <form className="flex flex-wrap items-center gap-2" action={updateUserRoleForm}>
              <input type="hidden" name="userId" value={user.id} />
              <select
                name="role"
                defaultValue={user.role}
                className="rounded-md border border-zinc-300 bg-transparent px-2 py-2 text-sm dark:border-zinc-700"
              >
                {(Object.values(Role) as Role[]).map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <Button type="submit" variant="secondary">
                Save
              </Button>
            </form>
          </Card>
        ))}
      </div>
    </div>
  );
}
