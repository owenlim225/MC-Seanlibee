import { Skeleton, SkeletonOrderCard } from "@/components/ui/skeleton";

function KitchenColumnSkeleton() {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-6" />
      </div>
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, idx) => (
          <SkeletonOrderCard key={idx} />
        ))}
      </div>
    </section>
  );
}

export default function KitchenQueueLoading() {
  return (
    <div
      className="flex flex-col gap-6"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading kitchen queue"
    >
      <div className="flex flex-col gap-2">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-5 w-80 max-w-full" />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <KitchenColumnSkeleton />
        <KitchenColumnSkeleton />
        <KitchenColumnSkeleton />
      </div>
    </div>
  );
}
