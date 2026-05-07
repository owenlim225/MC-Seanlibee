import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import { MoneyText } from "@/components/ui/money-text";
import { PageHeader } from "@/components/ui/page-header";
import { RelativeTime } from "@/components/ui/relative-time";
import { StatusBadge } from "@/components/ui/status-badge";
import { OrderStatus } from "@prisma/client";

export default function UiKitDemoPage() {
  const demoDate = new Date("2026-05-04T12:00:00Z");

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        title="UI kit demos"
        description="Storybook-free previews referenced by the Wave 1 shared kit."
        actions={
          <Button type="button" variant="ghost">
            Header action
          </Button>
        }
      />

      <Card className="flex flex-col gap-3">
        <CardTitle>Buttons</CardTitle>
        <CardDescription>Variants mirror brand design tokens.</CardDescription>
        <div className="flex flex-wrap gap-2">
          <Button type="button">Primary</Button>
          <Button type="button" variant="secondary">
            Secondary
          </Button>
          <Button type="button" variant="ghost">
            Ghost
          </Button>
          <Button type="button" variant="danger">
            Danger
          </Button>
        </div>
      </Card>

      <Card className="flex flex-col gap-3">
        <CardTitle>Money & time</CardTitle>
        <div className="flex flex-col gap-2 text-sm">
          <div>
            Total <MoneyText cents={2499} />
          </div>
          <div>
            Relative <RelativeTime date={demoDate} />
          </div>
        </div>
      </Card>

      <Card className="flex flex-col gap-3">
        <CardTitle>Status badges</CardTitle>
        <div className="flex flex-wrap gap-2">
          {(Object.values(OrderStatus) as OrderStatus[]).map((status) => (
            <StatusBadge key={status} status={status} />
          ))}
        </div>
      </Card>

      <Card className="flex flex-col gap-3">
        <CardTitle>States</CardTitle>
        <div className="flex flex-col gap-4">
          <LoadingState />
          <ErrorState message="Something went sideways." />
          <EmptyState title="Nothing here" description="Try changing filters." />
        </div>
      </Card>
    </div>
  );
}
