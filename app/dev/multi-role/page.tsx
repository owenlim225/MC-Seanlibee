import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

const panels = [
  { title: "Customer", src: "/customer" },
  { title: "Kitchen", src: "/kitchen" },
  { title: "Driver", src: "/driver" },
  { title: "Admin", src: "/admin" },
] as const;

export default function MultiRoleDemoPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Multi-role iframe lab"
        description="Uses credentialless iframes (Chromium) so each pane can sign in independently via /dev/role-switcher without sharing the root cookie jar."
      />

      <Card className="flex flex-col gap-2">
        <CardTitle>How to use</CardTitle>
        <CardDescription>
          Each iframe starts unauthenticated — use its embedded redirect to the role switcher, pick the matching persona,
          then navigate back to the app route. Run the full flow: customer checkout → kitchen advance → driver claim →
          delivered.
        </CardDescription>
      </Card>

      <div className="grid gap-3 lg:grid-cols-2">
        {panels.map((panel) => (
          <section key={panel.title} className="flex flex-col gap-2">
            <div className="text-xs font-semibold uppercase tracking-wide text-[var(--text-meta)]">{panel.title}</div>
            <iframe
              title={panel.title}
              src={panel.src}
              className="h-[520px] w-full rounded-lg border border-zinc-200 bg-white"
              // @ts-expect-error -- credentialless is supported in Chromium-powered browsers
              credentialless=""
            />
          </section>
        ))}
      </div>
    </div>
  );
}
