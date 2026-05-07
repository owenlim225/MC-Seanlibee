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
import { SuccessActionForm } from "@/components/feedback/success-action-form";
import { PageHeader } from "@/components/ui/page-header";

export default async function AdminUsersPage() {
  const [users, archivedUsers] = await Promise.all([
    prisma.user.findMany({
      orderBy: [{ isActive: "desc" }, { email: "asc" }],
    }),
    prisma.archivedUser.findMany({
      orderBy: { archivedAt: "desc" },
      select: {
        originalId: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        archivedAt: true,
      },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Users & roles" description="Promote seeded operators between mock roles." />

      <Card className="flex flex-col gap-3">
        <h2 className="text-base font-semibold">Create user</h2>
        <SuccessActionForm className="grid gap-2 md:grid-cols-6" action={createUserForm}>
          <input
            type="text"
            name="name"
            required
            placeholder="Name"
            className="rounded-md border border-zinc-300 bg-transparent px-2 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
          />
          <input
            type="email"
            name="email"
            required
            placeholder="Email"
            className="rounded-md border border-zinc-300 bg-transparent px-2 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
          />
          <select
            name="role"
            defaultValue={Role.CUSTOMER}
            className="rounded-md border border-zinc-300 bg-transparent px-2 py-2 text-sm text-[var(--text-primary)]"
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
            className="rounded-md border border-zinc-300 bg-transparent px-2 py-2 text-sm text-[var(--text-primary)]"
          >
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
          <input
            type="password"
            name="password"
            required
            minLength={8}
            placeholder="Password (min 8 chars)"
            className="rounded-md border border-zinc-300 bg-transparent px-2 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
          />
          <Button type="submit" variant="secondary">
            Create
          </Button>
        </SuccessActionForm>
      </Card>

      <nav aria-label="User sections" className="flex flex-wrap gap-2 text-sm">
        <a
          href="#active-users"
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-[var(--text-primary)] transition-colors hover:bg-zinc-100"
        >
          Active users
        </a>
        <a
          href="#archived-users"
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-[var(--text-primary)] transition-colors hover:bg-zinc-100"
        >
          Archived users
        </a>
      </nav>

      <section id="active-users" className="flex flex-col gap-3 scroll-mt-20">
        <h2 className="text-base font-semibold">Active users</h2>
        {users.map((user) => (
          <Card key={user.id} data-testid="user-row" className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="font-medium">
                {user.name}
                {!user.isActive ? (
                  <span className="ml-2 rounded bg-zinc-200 px-2 py-0.5 text-xs text-[var(--text-primary)]">
                    Inactive
                  </span>
                ) : null}
              </div>
              <div className="text-sm text-[var(--text-muted)]">{user.email}</div>
              <div className="text-xs text-[var(--text-meta)]">{user.id}</div>
            </div>
            <SuccessActionForm className="flex flex-wrap items-center gap-2" action={updateUserProfileForm}>
              <input
                type="text"
                name="name"
                defaultValue={user.name}
                required
                className="rounded-md border border-zinc-300 bg-transparent px-2 py-2 text-sm text-[var(--text-primary)]"
              />
              <input
                type="email"
                name="email"
                defaultValue={user.email}
                required
                className="rounded-md border border-zinc-300 bg-transparent px-2 py-2 text-sm text-[var(--text-primary)]"
              />
              <select
                name="role"
                defaultValue={user.role}
                className="rounded-md border border-zinc-300 bg-transparent px-2 py-2 text-sm text-[var(--text-primary)]"
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
                className="rounded-md border border-zinc-300 bg-transparent px-2 py-2 text-sm text-[var(--text-primary)]"
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
              <input type="hidden" name="userId" value={user.id} />
              <Button type="submit" variant="secondary">
                Save
              </Button>
            </SuccessActionForm>
            <SuccessActionForm action={user.isActive ? softDeleteUserForm : restoreUserForm}>
              <input type="hidden" name="userId" value={user.id} />
              <Button type="submit" variant={user.isActive ? "danger" : "secondary"}>
                {user.isActive ? "Deactivate" : "Restore"}
              </Button>
            </SuccessActionForm>
          </Card>
        ))}
      </section>

      <section id="archived-users" className="flex flex-col gap-3 scroll-mt-20">
        <h2 className="text-base font-semibold">Archived users</h2>
        {archivedUsers.length === 0 ? (
          <Card className="text-sm text-[var(--text-muted)]">No archived users yet.</Card>
        ) : (
          archivedUsers.map((user) => (
            <Card key={user.originalId} className="flex flex-col gap-1">
              <div className="font-medium">{user.name}</div>
              <div className="text-sm text-[var(--text-muted)]">{user.email}</div>
              <div className="text-xs text-[var(--text-meta)]">
                Role: {user.role} · Status: {user.isActive ? "Active" : "Inactive"}
              </div>
              <div className="text-xs text-[var(--text-meta)]">
                Archived: {user.archivedAt.toLocaleString()} · Original ID: {user.originalId}
              </div>
            </Card>
          ))
        )}
      </section>
    </div>
  );
}
