"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export type LiveRouterRefreshProps = {
  /** Default 3000ms. */
  intervalMs?: number;
  /** Default true. Set false to mount the component without polling. */
  enabled?: boolean;
};

/**
 * List-level live refresh for queue surfaces (kitchen, driver). Polls
 * `router.refresh()` on a fixed interval and pauses while the tab is hidden.
 */
export function LiveRouterRefresh({
  intervalMs = 3000,
  enabled = true,
}: LiveRouterRefreshProps) {
  const router = useRouter();

  useEffect(() => {
    if (!enabled) return;

    let timer: number | undefined;
    function start(): void {
      stop();
      timer = window.setInterval(() => router.refresh(), intervalMs);
    }
    function stop(): void {
      if (timer !== undefined) {
        window.clearInterval(timer);
        timer = undefined;
      }
    }
    function onVisibility(): void {
      if (document.visibilityState === "visible") {
        router.refresh();
        start();
      } else {
        stop();
      }
    }

    if (document.visibilityState === "visible") start();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [enabled, intervalMs, router]);

  return null;
}
