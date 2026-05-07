"use client";

import { useState, useTransition } from "react";
import { advanceKitchenOrder } from "@/app/(kitchen)/kitchen/actions";
import { Button } from "@/components/ui/button";
import { publishFromBrowser } from "@/lib/realtime/browser";

function PendingButtonLabel() {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        aria-hidden="true"
        className="inline-block h-3 w-3 animate-pulse rounded-full bg-[var(--surface-subtle)]"
      />
      <span>Saving…</span>
    </span>
  );
}

export function KitchenAdvanceButton({
  orderId,
  label,
}: {
  orderId: string;
  label: string;
}) {
  const [pending, startTransition] = useTransition();
  const [failed, setFailed] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        variant="secondary"
        disabled={pending}
        aria-busy={pending}
        onClick={() =>
          startTransition(async () => {
            setFailed(false);
            try {
              await advanceKitchenOrder(orderId);
              publishFromBrowser(`order:${orderId}`, { type: "kitchen-advanced", orderId });
            } catch {
              setFailed(true);
            }
          })
        }
      >
        {pending ? <PendingButtonLabel /> : label}
      </Button>
      {failed ? (
        <div role="alert" className="text-xs text-red-700 dark:text-red-300">
          Could not update order.
        </div>
      ) : null}
    </div>
  );
}
