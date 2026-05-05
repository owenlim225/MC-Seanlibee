"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { OrderStatus } from "@prisma/client";
import { subscribeTabs } from "@/lib/realtime/browser";

const ACTIVE_INTERVAL_MS = 2500;
const TERMINAL_INTERVAL_MS = 15000;

const TERMINAL_STATUSES: ReadonlySet<OrderStatus> = new Set([
  OrderStatus.DELIVERED,
  OrderStatus.CANCELED,
]);

export function OrderTracker({
  orderId,
  status,
}: {
  orderId: string;
  status?: OrderStatus;
}) {
  const router = useRouter();

  useEffect(() => {
    const channel = `order:${orderId}`;
    const unsub = subscribeTabs((msg) => {
      if (msg.channel === channel) router.refresh();
    });

    let timer: number | undefined;
    const intervalMs =
      status && TERMINAL_STATUSES.has(status) ? TERMINAL_INTERVAL_MS : ACTIVE_INTERVAL_MS;

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
      unsub();
    };
  }, [orderId, status, router]);

  return null;
}
