"use client";

import { useState, useTransition } from "react";
import { OrderStatus } from "@prisma/client";
import { cancelOrder } from "@/app/(customer)/customer/actions";
import { Button } from "@/components/ui/button";
import { publishFromBrowser } from "@/lib/realtime/browser";
import { isOrderCancellable } from "@/lib/orders/cancellation";

export function CancelOrderButton({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const canCancel = isOrderCancellable(status);
  if (!canCancel) return null;

  return (
    <div className="flex flex-col items-end gap-2">
      <Button
        type="button"
        variant="danger"
        disabled={pending}
        aria-busy={pending}
        onClick={() =>
          start(async () => {
            setError(null);
            const res = await cancelOrder(orderId);
            if (!res.ok) {
              setError("Order can no longer be canceled.");
              return;
            }
            publishFromBrowser(`order:${orderId}`, { type: "order-status", orderId, status: OrderStatus.CANCELED });
          })
        }
      >
        {pending ? "Canceling..." : "Cancel order"}
      </Button>
      {error ? (
        <div role="alert" className="text-xs text-red-700 dark:text-red-300">
          {error}
        </div>
      ) : null}
    </div>
  );
}
