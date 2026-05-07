"use client";

import { useState, useTransition } from "react";
import { claimOrder, markDelivered, markPickedUp } from "@/app/(driver)/driver/actions";
import { Button } from "@/components/ui/button";
import { publishFromBrowser } from "@/lib/realtime/browser";

function PendingButtonLabel({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        aria-hidden="true"
        className="inline-block h-3 w-3 animate-pulse rounded-full bg-[var(--surface-subtle)]"
      />
      <span>{label}</span>
    </span>
  );
}

export function ClaimButton({ orderId }: { orderId: string }) {
  const [pending, start] = useTransition();
  const [failed, setFailed] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        disabled={pending}
        variant="secondary"
        aria-busy={pending}
        onClick={() =>
          start(async () => {
            setFailed(false);
            const res = await claimOrder(orderId);
            publishFromBrowser(`order:${orderId}`, { type: "driver-claim", orderId, ok: res.ok });
            if (!res.ok) setFailed(true);
          })
        }
      >
        {pending ? <PendingButtonLabel label="Accepting…" /> : "Accept"}
      </Button>
      {failed ? (
        <div role="alert" className="text-xs text-red-700 dark:text-red-300">
          Another driver claimed it.
        </div>
      ) : null}
    </div>
  );
}

export function PickupButton({ orderId }: { orderId: string }) {
  const [pending, start] = useTransition();
  const [failed, setFailed] = useState(false);
  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        variant="secondary"
        disabled={pending}
        aria-busy={pending}
        onClick={() =>
          start(async () => {
            setFailed(false);
            try {
              await markPickedUp(orderId);
              publishFromBrowser(`order:${orderId}`, { type: "picked-up", orderId });
            } catch {
              setFailed(true);
            }
          })
        }
      >
        {pending ? <PendingButtonLabel label="Saving…" /> : "Mark picked up"}
      </Button>
      {failed ? (
        <div role="alert" className="text-xs text-red-700 dark:text-red-300">
          Could not update order.
        </div>
      ) : null}
    </div>
  );
}

export function DeliverButton({ orderId }: { orderId: string }) {
  const [pending, start] = useTransition();
  const [failed, setFailed] = useState(false);
  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        disabled={pending}
        aria-busy={pending}
        onClick={() =>
          start(async () => {
            setFailed(false);
            try {
              await markDelivered(orderId);
              publishFromBrowser(`order:${orderId}`, { type: "delivered", orderId });
            } catch {
              setFailed(true);
            }
          })
        }
      >
        {pending ? <PendingButtonLabel label="Saving…" /> : "Mark delivered"}
      </Button>
      {failed ? (
        <div role="alert" className="text-xs text-red-700 dark:text-red-300">
          Could not update order.
        </div>
      ) : null}
    </div>
  );
}
