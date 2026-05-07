export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
      <span
        aria-hidden="true"
        className="inline-block size-4 animate-spin rounded-full border-2 border-[var(--border-default)] border-t-[var(--brand-primary)]"
      />
      <span>{label}</span>
    </div>
  );
}
