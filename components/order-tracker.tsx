"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { subscribeTabs } from "@/lib/realtime/browser";

export function OrderTracker({ orderId }: { orderId: string }) {
  const router = useRouter();

  useEffect(() => {
    const channel = `order:${orderId}`;
    const unsub = subscribeTabs((msg) => {
      if (msg.channel === channel) router.refresh();
    });
    const poll = window.setInterval(() => router.refresh(), 2500);
    return () => {
      unsub();
      window.clearInterval(poll);
    };
  }, [orderId, router]);

  return null;
}
