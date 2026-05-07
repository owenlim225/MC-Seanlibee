import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { PageHeader } from "@/components/ui/page-header";
import { signInAction } from "@/app/auth/actions";

export const metadata = { title: "Sign in · Food Ordering MVP" };
const DEMO_SHARED_PASSWORD_LABEL = "Demo123!";

const DEMO_ACCOUNTS: { email: string; role: string }[] = [
  { email: "ginalyn@customer.com", role: "Customer" },
  { email: "marvin@customer.com", role: "Customer" },
  { email: "rhene@customer.com", role: "Customer" },
  { email: "sean@driver.com", role: "Driver" },
  { email: "christian@kitchen.com", role: "Kitchen" },
  { email: "sherwin@admin.com", role: "Admin" },
];

function authPath(path: "/auth/login" | "/auth/signup", next?: string, error?: string): string {
  const params = new URLSearchParams();
  if (next) params.set("next", next);
  if (error) params.set("error", error);
  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

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
              className="min-h-[44px] rounded-md border border-[var(--border-default)] bg-[var(--surface-base)] px-3 py-2 text-sm transition-[border-color,box-shadow] duration-[var(--motion-base)] ease-[var(--ease-standard)] focus:border-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]/30"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Password</span>
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              className="min-h-[44px] rounded-md border border-[var(--border-default)] bg-[var(--surface-base)] px-3 py-2 text-sm transition-[border-color,box-shadow] duration-[var(--motion-base)] ease-[var(--ease-standard)] focus:border-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]/30"
            />
          </label>
          <Button type="submit" className="min-h-[44px] w-full">
            Sign in
          </Button>
        </form>
        <Link
          href={authPath("/auth/signup", sp.next)}
          className="inline-flex min-h-[44px] w-full items-center justify-center rounded-md border border-[var(--border-default)] bg-[var(--surface-base)] px-3 py-2 text-sm font-medium text-[var(--text-primary)] transition-[background-color,color,border-color] duration-[var(--motion-base)] ease-[var(--ease-standard)] hover:bg-[var(--surface-subtle)] hover:text-[var(--brand-primary)]"
        >
          Create account
        </Link>
      </Card>

      <details className="rounded-md border border-[var(--border-default)] bg-[var(--surface-base)] p-3 text-sm">
        <summary className="cursor-pointer font-medium">Demo accounts</summary>
        <ul className="mt-2 flex flex-col gap-1 text-[var(--text-muted)]">
          {DEMO_ACCOUNTS.map((a) => (
            <li key={a.email} className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-xs">{a.email}</span>
              <span className="text-xs text-[var(--text-muted)]">{a.role}</span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-[var(--text-muted)]">
          Shared password: <span className="font-mono">{DEMO_SHARED_PASSWORD_LABEL}</span>
        </p>
      </details>
    </div>
  );
}
