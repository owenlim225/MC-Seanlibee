export function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="rounded-lg border border-dashed border-[var(--border-default)] bg-[var(--surface-subtle)] p-8 text-center transition-colors duration-[var(--motion-base)] ease-[var(--ease-standard)]">
      <div className="text-sm font-semibold">{title}</div>
      {description ? <div className="mt-2 text-sm text-[var(--text-muted)]">{description}</div> : null}
    </div>
  );
}
