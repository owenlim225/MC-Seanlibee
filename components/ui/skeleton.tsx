import type { HTMLAttributes } from "react";

function baseSkeletonClasses(className: string): string {
  return `animate-pulse rounded-md bg-[var(--surface-subtle)] ${className}`.trim();
}

export function Skeleton({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} aria-hidden="true" className={baseSkeletonClasses(className)} />;
}

export function SkeletonLine({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <Skeleton className={`h-4 ${className}`} {...props} />;
}

export function SkeletonButton({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <Skeleton className={`h-10 w-28 rounded-md ${className}`} {...props} />;
}

export function SkeletonCard({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      aria-hidden="true"
      className={`rounded-lg border border-[var(--border-default)] bg-[var(--surface-base)] p-4 ${className}`}
    >
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <SkeletonButton />
      </div>
    </div>
  );
}

export function SkeletonMenuSection({
  className = "",
  cardCount = 4,
  ...props
}: HTMLAttributes<HTMLDivElement> & { cardCount?: number }) {
  return (
    <section aria-hidden="true" {...props} className={`flex flex-col gap-3 ${className}`}>
      <Skeleton className="h-7 w-44" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: cardCount }).map((_, idx) => (
          <div key={idx} className="rounded-lg border border-[var(--border-default)] bg-[var(--surface-base)] p-3">
            <div className="flex flex-col gap-3">
              <Skeleton className="aspect-[4/3] w-full rounded-md" />
              <Skeleton className="h-5 w-2/3" />
              <SkeletonLine className="w-full" />
              <SkeletonLine className="w-5/6" />
              <div className="flex items-center justify-between gap-2">
                <SkeletonLine className="w-24" />
                <SkeletonButton className="w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function SkeletonOrderCard({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      aria-hidden="true"
      className={`rounded-lg border border-[var(--border-default)] bg-[var(--surface-base)] p-4 ${className}`}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-5 w-24" />
        <SkeletonLine className="w-2/3" />
        <SkeletonLine className="w-full" />
        <SkeletonLine className="w-5/6" />
        <SkeletonButton />
      </div>
    </div>
  );
}
