import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { PageHeader } from "@/components/ui/page-header";
import { signInAction } from "@/app/login/actions";

export const metadata = { title: "Sign in · Food Ordering MVP" };

const DEMO_ACCOUNTS: { name: string; email: string; role: string }[] = [
  { name: "Sean", email: "sean@example.com", role: "Customer" },
  { name: "Ginalyn", email: "ginalyn@example.com", role: "Customer" },
  { name: "Christian", email: "christian@example.com", role: "Kitchen" },
  { name: "Sherwin", email: "sherwin@example.com", role: "Driver" },
  { name: "Marvin", email: "marvin@example.com", role: "Admin" },
];

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const sp = await searchParams;

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4">
      <PageHeader title="Sign in" description="Demo accounts use a single shared password (see deploy notes)." />

      {sp.error ? <ErrorState message={sp.error} /> : null}

      <Card className="flex flex-col gap-4">
        <form action={signInAction} className="flex flex-col gap-3">
          {sp.next ? <input type="hidden" name="next" value={sp.next} /> : null}
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Email</span>
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              inputMode="email"
              className="min-h-[44px] rounded-md border border-zinc-300 bg-background px-3 py-2 text-sm dark:border-zinc-700"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Password</span>
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              className="min-h-[44px] rounded-md border border-zinc-300 bg-background px-3 py-2 text-sm dark:border-zinc-700"
            />
          </label>
          <Button type="submit" className="min-h-[44px] w-full">
            Sign in
          </Button>
        </form>
      </Card>

      <details className="rounded-md border border-zinc-200 bg-background p-3 text-sm dark:border-zinc-800">
        <summary className="cursor-pointer font-medium">Demo accounts</summary>
        <ul className="mt-2 flex flex-col gap-1 text-zinc-700 dark:text-zinc-300">
          {DEMO_ACCOUNTS.map((a) => (
            <li key={a.email} className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-medium">{a.name}</span>
              <span className="font-mono text-xs">{a.email}</span>
              <span className="text-xs text-zinc-500">{a.role}</span>
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
