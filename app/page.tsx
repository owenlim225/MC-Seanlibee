import Link from "next/link";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Food ordering MVP</h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
          Each role lives under its own route prefix. Use the dev role switcher to impersonate mock users
          (never enabled in production builds).
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="flex flex-col gap-2">
          <CardTitle>Customer</CardTitle>
          <CardDescription>Browse the menu, checkout with mock Stripe, track deliveries.</CardDescription>
          <Link className="text-sm font-medium text-blue-700 underline dark:text-blue-300" href="/customer">
            Open customer app →
          </Link>
        </Card>
        <Card className="flex flex-col gap-2">
          <CardTitle>Kitchen</CardTitle>
          <CardDescription>Operate the live queue and advance order statuses.</CardDescription>
          <Link className="text-sm font-medium text-blue-700 underline dark:text-blue-300" href="/kitchen">
            Open kitchen console →
          </Link>
        </Card>
        <Card className="flex flex-col gap-2">
          <CardTitle>Driver</CardTitle>
          <CardDescription>Claim READY orders and complete pickup/delivery milestones.</CardDescription>
          <Link className="text-sm font-medium text-blue-700 underline dark:text-blue-300" href="/driver">
            Open driver app →
          </Link>
        </Card>
        <Card className="flex flex-col gap-2">
          <CardTitle>Admin</CardTitle>
          <CardDescription>Manage catalog, users, and audit events.</CardDescription>
          <Link className="text-sm font-medium text-blue-700 underline dark:text-blue-300" href="/admin">
            Open admin console →
          </Link>
        </Card>
      </div>
    </div>
  );
}
