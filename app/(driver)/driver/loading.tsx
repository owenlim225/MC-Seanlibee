import { Skeleton, SkeletonOrderCard } from "@/components/ui/skeleton";

function DriverSectionSkeleton({ titleWidth }: { titleWidth: string }) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <Skeleton className={`h-7 ${titleWidth}`} />
        <Skeleton className="h-4 w-6" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, idx) => (
          <SkeletonOrderCard key={idx} />
        ))}
      </div>
    </section>
  );
}

export default function DriverHomeLoading() {
  return (
    <div
      className="flex flex-col gap-8"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading driver orders"
    >
      <div className="flex flex-col gap-2">
        <Skeleton className="h-9 w-52" />
        <Skeleton className="h-5 w-80 max-w-full" />
      </div>
      <DriverSectionSkeleton titleWidth="w-48" />
      <DriverSectionSkeleton titleWidth="w-44" />
    </div>
  );
}
