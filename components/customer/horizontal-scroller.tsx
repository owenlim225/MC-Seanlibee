"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";

type HorizontalScrollerProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
  /** Render accessible left/right scroll buttons overlaid on the rail. */
  showControls?: boolean;
  /** Pixels to scroll per control click. Defaults to 320 (≈ one card width). */
  scrollStepPx?: number;
};

const DEFAULT_SCROLL_STEP_PX = 320;

const CONTROL_BUTTON_CLASSES =
  "absolute top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-200 bg-white/90 text-zinc-900 shadow-sm backdrop-blur transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white/90 dark:border-zinc-800 dark:bg-zinc-900/90 dark:text-zinc-50 dark:hover:bg-zinc-900 dark:focus-visible:ring-offset-zinc-950 dark:disabled:hover:bg-zinc-900/90";

const SCROLLER_BASE_CLASSES =
  "flex snap-x snap-mandatory items-center gap-3 overflow-x-auto py-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

/**
 * Horizontally scrollable row with scroll snapping; hides scrollbars for a clean rail.
 *
 * When `showControls` is true, renders accessible left/right buttons that scroll the
 * rail by `scrollStepPx` and disable themselves at the start/end of the scroll range.
 */
export function HorizontalScroller({
  children,
  className,
  "aria-label": ariaLabel,
  role: roleProp,
  showControls = false,
  scrollStepPx = DEFAULT_SCROLL_STEP_PX,
  ...rest
}: HorizontalScrollerProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateBounds = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 1);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
  }, []);

  useEffect(() => {
    if (!showControls) return;
    const el = scrollRef.current;
    if (!el) return;

    updateBounds();
    el.addEventListener("scroll", updateBounds, { passive: true });

    const resizeObserver =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(updateBounds) : null;
    resizeObserver?.observe(el);
    window.addEventListener("resize", updateBounds);

    return () => {
      el.removeEventListener("scroll", updateBounds);
      resizeObserver?.disconnect();
      window.removeEventListener("resize", updateBounds);
    };
  }, [showControls, updateBounds]);

  function scrollByStep(direction: 1 | -1): void {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * scrollStepPx, behavior: "smooth" });
  }

  const scrollerClassName = `${SCROLLER_BASE_CLASSES} ${className ?? ""}`.trim();

  const scrollerNode = (
    <div
      ref={scrollRef}
      role={roleProp ?? (ariaLabel ? "region" : undefined)}
      aria-label={ariaLabel}
      className={scrollerClassName}
      {...rest}
    >
      {children}
    </div>
  );

  if (!showControls) return scrollerNode;

  return (
    <div className="relative">
      {scrollerNode}
      <button
        type="button"
        aria-label="Scroll left"
        onClick={() => scrollByStep(-1)}
        disabled={!canScrollLeft}
        className={`${CONTROL_BUTTON_CLASSES} left-1`}
      >
        <ChevronGlyph direction="left" />
      </button>
      <button
        type="button"
        aria-label="Scroll right"
        onClick={() => scrollByStep(1)}
        disabled={!canScrollRight}
        className={`${CONTROL_BUTTON_CLASSES} right-1`}
      >
        <ChevronGlyph direction="right" />
      </button>
    </div>
  );
}

function ChevronGlyph({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      aria-hidden="true"
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {direction === "left" ? (
        <polyline points="10,3 5,8 10,13" />
      ) : (
        <polyline points="6,3 11,8 6,13" />
      )}
    </svg>
  );
}
