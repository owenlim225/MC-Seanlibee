import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { PageHeader } from "@/components/ui/page-header";
import { signUpAction } from "@/app/auth/actions";

export const metadata = { title: "Sign up · Food Ordering MVP" };

function authPath(path: "/auth/login" | "/auth/signup", next?: string, error?: string): string {
  const params = new URLSearchParams();
  if (next) params.set("next", next);
  if (error) params.set("error", error);
  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const sp = await searchParams;

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4">
      <PageHeader title="Sign up" description="Create a new customer account for the demo environment." />

      {sp.error ? <ErrorState message={sp.error} /> : null}

      <Card className="flex flex-col gap-4">
        <h2 className="text-base font-semibold">Sign up</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          Creates a new Customer account in app database.
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
        <Link
          href={authPath("/auth/login", sp.next, sp.error)}
          className="inline-flex min-h-[44px] w-full items-center justify-center rounded-md border border-zinc-300 bg-background px-3 py-2 text-sm font-medium transition hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          Back to sign in
        </Link>
      </Card>
    </div>
  );
}
