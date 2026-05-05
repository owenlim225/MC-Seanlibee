"use client";

import type { HTMLAttributes, ReactNode } from "react";

type HorizontalScrollerProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
};

/**
 * Horizontally scrollable row with scroll snapping; hides scrollbars for a clean rail.
 */
export function HorizontalScroller({
  children,
  className,
  "aria-label": ariaLabel,
  role: roleProp,
  ...rest
}: HorizontalScrollerProps) {
  return (
    <div
      role={roleProp ?? (ariaLabel ? "region" : undefined)}
      aria-label={ariaLabel}
      className={`flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className ?? ""}`}
      {...rest}
    >
      {children}
    </div>
  );
}
