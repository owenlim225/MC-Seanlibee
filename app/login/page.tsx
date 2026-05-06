import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { PageHeader } from "@/components/ui/page-header";
import { signInAction, signUpAction } from "@/app/login/actions";
import { DEFAULT_DEMO_AUTH_PASSWORD } from "@/lib/auth/demo-password";

export const metadata = { title: "Sign in · Food Ordering MVP" };

const DEMO_ACCOUNTS: { email: string; role: string }[] = [
  { email: "customer1@example.com", role: "Customer" },
  { email: "customer2@example.com", role: "Customer" },
  { email: "kitchen@example.com", role: "Kitchen" },
  { email: "driver@example.com", role: "Driver" },
  { email: "admin@example.com", role: "Admin" },
];

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const demoPassword = process.env.DEMO_AUTH_PASSWORD ?? DEFAULT_DEMO_AUTH_PASSWORD;

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4">
      <PageHeader title="Sign in" description="Demo accounts use a single shared password (see deploy notes)." />

      {sp.error ? <ErrorState message={sp.error} /> : null}

      <Card className="flex flex-col gap-4">
        <h2 className="text-base font-semibold">Sign in</h2>
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

      <Card className="flex flex-col gap-4">
        <h2 className="text-base font-semibold">Sign up</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          Creates a new Customer account in app database. Uses same shared demo password.
        </p>
        <form action={signUpAction} className="flex flex-col gap-3">
          {sp.next ? <input type="hidden" name="next" value={sp.next} /> : null}
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Name</span>
            <input
              type="text"
              name="name"
              required
              autoComplete="name"
              className="min-h-[44px] rounded-md border border-zinc-300 bg-background px-3 py-2 text-sm dark:border-zinc-700"
            />
          </label>
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
              autoComplete="new-password"
              className="min-h-[44px] rounded-md border border-zinc-300 bg-background px-3 py-2 text-sm dark:border-zinc-700"
            />
          </label>
          <Button type="submit" className="min-h-[44px] w-full">
            Sign up
          </Button>
        </form>
      </Card>

      <details className="rounded-md border border-zinc-200 bg-background p-3 text-sm dark:border-zinc-800">
        <summary className="cursor-pointer font-medium">Demo accounts</summary>
        <ul className="mt-2 flex flex-col gap-1 text-zinc-700 dark:text-zinc-300">
          {DEMO_ACCOUNTS.map((a) => (
            <li key={a.email} className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-xs">{a.email}</span>
              <span className="text-xs text-zinc-500">{a.role}</span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-zinc-500">
          Shared password: <span className="font-mono">{demoPassword}</span>
        </p>
      </details>
    </div>
  );
}
