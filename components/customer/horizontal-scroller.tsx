"use client";

import type { ReactNode } from "react";

type HorizontalScrollerProps = {
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
};

/**
 * Horizontally scrollable row with scroll snapping; hides scrollbars for a clean rail.
 */
export function HorizontalScroller({ children, className, "aria-label": ariaLabel }: HorizontalScrollerProps) {
  return (
    <div
      role={ariaLabel ? "region" : undefined}
      aria-label={ariaLabel}
      className={`flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className ?? ""}`}
    >
      {children}
    </div>
  );
}
