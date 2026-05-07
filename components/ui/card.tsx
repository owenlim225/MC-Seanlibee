import type { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={`rounded-lg border border-[var(--border-default)] bg-[var(--surface-base)] p-4 shadow-[var(--shadow-card)] transition-[border-color,box-shadow,background-color] duration-[var(--motion-base)] ease-[var(--ease-standard)] hover:border-[var(--brand-primary)]/35 hover:shadow-[var(--shadow-card-hover)] focus-within:border-[var(--brand-primary)] ${className}`}
    />
  );
}

export function CardTitle({ className = "", ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 {...props} className={`text-base font-semibold ${className}`} />;
}

export function CardDescription({ className = "", ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p {...props} className={`text-sm text-[var(--text-muted)] ${className}`} />;
}
