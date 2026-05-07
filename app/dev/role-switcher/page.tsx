import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { signInRole, signOut } from "@/app/dev/role-switcher/actions";

export default async function RoleSwitcherPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; denied?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const users = await prisma.user.findMany({ orderBy: { email: "asc" } });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Dev role switcher"
        description="Mock-only impersonation via signed cookies. Disabled when NODE_ENV=production."
      />

      {sp.denied ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          That route requires a different role — pick the matching profile below.
        </div>
      ) : null}
      {sp.error === "no-user" ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-900">
          No seeded user exists for that role yet. Run `pnpm db:seed`.
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {(Object.values(Role) as Role[]).map((role) => (
          <Card key={role} className="flex flex-col gap-3">
            <div>
              <CardTitle>{role}</CardTitle>
              <CardDescription>Sign in as any seeded {role.toLowerCase()} user.</CardDescription>
            </div>
            <div className="flex flex-col gap-2">
              {users
                .filter((u) => u.role === role)
                .map((u) => (
                  <form key={u.id} action={signInRole.bind(null, role, u.id, sp.next)}>
                    <Button type="submit" variant="secondary" className="w-full justify-between">
                      <span className="truncate text-left">{u.name}</span>
                      <span className="text-xs text-[var(--text-meta)]">{u.email}</span>
                    </Button>
                  </form>
                ))}
              {users.filter((u) => u.role === role).length === 0 ? (
                <div className="text-sm text-[var(--text-muted)]">No users for this role.</div>
              ) : null}
            </div>
          </Card>
        ))}
      </div>

      <form action={signOut.bind(null, "/dev/role-switcher")}>
        <Button type="submit" variant="ghost">
          Clear session cookie
        </Button>
      </form>
    </div>
  );
}
