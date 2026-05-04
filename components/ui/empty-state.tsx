export function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="rounded-lg border border-dashed border-zinc-300 p-8 text-center dark:border-zinc-700">
      <div className="text-sm font-semibold">{title}</div>
      {description ? (
        <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{description}</div>
      ) : null}
    </div>
  );
}
