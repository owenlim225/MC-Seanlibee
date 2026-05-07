import { Skeleton, SkeletonCard, SkeletonMenuSection } from "@/components/ui/skeleton";

export default function CustomerMenuLoading() {
  return (
    <div className="flex flex-col gap-6" role="status" aria-live="polite" aria-busy="true" aria-label="Loading menu">
      <section className="flex flex-col items-center gap-2 text-center">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-9 w-64 max-w-full" />
      </section>

      <section className="flex flex-col gap-3">
        <Skeleton className="h-7 w-44" />
        <div className="flex gap-3 overflow-hidden py-1">
          {Array.from({ length: 5 }).map((_, idx) => (
            <Skeleton key={idx} className="h-11 w-24 shrink-0 rounded-full" />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <Skeleton className="h-7 w-36" />
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 4 }).map((_, idx) => (
            <SkeletonCard key={idx} className="min-w-[240px] max-w-[280px] shrink-0 p-3" />
          ))}
        </div>
      </section>

      <SkeletonMenuSection cardCount={8} />
    </div>
  );
}
