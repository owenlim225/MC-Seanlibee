import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--brand-primary)] text-[var(--brand-primary-foreground)] shadow-sm hover:bg-[var(--brand-primary-hover)] active:bg-[var(--brand-primary-active)] disabled:opacity-50",
  secondary:
    "border border-[var(--border-default)] bg-[var(--surface-base)] text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] disabled:opacity-50",
  ghost:
    "text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] disabled:opacity-50",
  danger:
    "bg-[var(--danger)] text-[var(--danger-foreground)] hover:opacity-90 disabled:opacity-50",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      {...props}
      className={`inline-flex min-h-[40px] items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-[background-color,color,box-shadow,border-color] duration-[var(--motion-base)] ease-[var(--ease-standard)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-base)] disabled:pointer-events-none ${variants[variant]} ${className}`}
    />
  );
}
