export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
      <span className="inline-block size-4 animate-spin rounded-full border-2 border-zinc-300 border-t-transparent dark:border-zinc-700" />
      <span>{label}</span>
    </div>
  );
}
