import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  createUserForm,
  restoreUserForm,
  softDeleteUserForm,
  updateUserProfileForm,
} from "@/app/(admin)/admin/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: [{ isActive: "desc" }, { email: "asc" }],
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Users & roles" description="Promote seeded operators between mock roles." />

      <Card className="flex flex-col gap-3">
        <h2 className="text-base font-semibold">Create user</h2>
        <form className="grid gap-2 md:grid-cols-5" action={createUserForm}>
          <input
            type="text"
            name="name"
            required
            placeholder="Name"
            className="rounded-md border border-zinc-300 bg-transparent px-2 py-2 text-sm dark:border-zinc-700"
          />
          <input
            type="email"
            name="email"
            required
            placeholder="Email"
            className="rounded-md border border-zinc-300 bg-transparent px-2 py-2 text-sm dark:border-zinc-700"
          />
          <select
            name="role"
            defaultValue={Role.CUSTOMER}
            className="rounded-md border border-zinc-300 bg-transparent px-2 py-2 text-sm dark:border-zinc-700"
          >
            {(Object.values(Role) as Role[]).map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <select
            name="isActive"
            defaultValue="true"
            className="rounded-md border border-zinc-300 bg-transparent px-2 py-2 text-sm dark:border-zinc-700"
          >
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
          <Button type="submit" variant="secondary">
            Create
          </Button>
        </form>
      </Card>

      <div className="flex flex-col gap-3">
        {users.map((user) => (
          <Card key={user.id} data-testid="user-row" className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="font-medium">
                {user.name}
                {!user.isActive ? (
                  <span className="ml-2 rounded bg-zinc-200 px-2 py-0.5 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    Inactive
                  </span>
                ) : null}
              </div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400">{user.email}</div>
              <div className="text-xs text-zinc-500">{user.id}</div>
            </div>
            <form className="flex flex-wrap items-center gap-2" action={updateUserProfileForm}>
              <input
                type="text"
                name="name"
                defaultValue={user.name}
                required
                className="rounded-md border border-zinc-300 bg-transparent px-2 py-2 text-sm dark:border-zinc-700"
              />
              <input
                type="email"
                name="email"
                defaultValue={user.email}
                required
                className="rounded-md border border-zinc-300 bg-transparent px-2 py-2 text-sm dark:border-zinc-700"
              />
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
              <select
                name="isActive"
                defaultValue={user.isActive ? "true" : "false"}
                className="rounded-md border border-zinc-300 bg-transparent px-2 py-2 text-sm dark:border-zinc-700"
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
              <input type="hidden" name="userId" value={user.id} />
              <Button type="submit" variant="secondary">
                Save
              </Button>
            </form>
            <form action={user.isActive ? softDeleteUserForm : restoreUserForm}>
              <input type="hidden" name="userId" value={user.id} />
              <Button type="submit" variant={user.isActive ? "danger" : "secondary"}>
                {user.isActive ? "Deactivate" : "Restore"}
              </Button>
            </form>
          </Card>
        ))}
      </div>
    </div>
  );
}
