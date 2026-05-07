export function ErrorState({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="rounded-md border border-[var(--danger)]/40 bg-[var(--danger-surface)] p-3 text-sm text-[var(--danger)]"
    >
      {message}
    </div>
  );
}
