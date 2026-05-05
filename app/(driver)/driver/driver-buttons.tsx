"use client";

import { useState, useTransition } from "react";
import { claimOrder, markDelivered, markPickedUp } from "@/app/(driver)/driver/actions";
import { Button } from "@/components/ui/button";
import { publishFromBrowser } from "@/lib/realtime/browser";

export function ClaimButton({ orderId }: { orderId: string }) {
  const [pending, start] = useTransition();
  const [failed, setFailed] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        disabled={pending}
        variant="secondary"
        onClick={() =>
          start(async () => {
            setFailed(false);
            const res = await claimOrder(orderId);
            // #region agent log
            fetch("http://127.0.0.1:7817/ingest/c3fc8591-bb49-4618-b7bd-5aef2b04dae3",{method:"POST",headers:{"Content-Type":"application/json","X-Debug-Session-Id":"f8a007"},body:JSON.stringify({sessionId:"f8a007",runId:"pre-fix",hypothesisId:"H5",location:"app/(driver)/driver/driver-buttons.tsx:24",message:"claimOrder response in client",data:{orderId,ok:res.ok},timestamp:Date.now()})}).catch(()=>{});
            // #endregion
            publishFromBrowser(`order:${orderId}`, { type: "driver-claim", orderId, ok: res.ok });
            if (!res.ok) setFailed(true);
          })
        }
      >
        {pending ? "Claiming…" : "Claim"}
      </Button>
      {failed ? <div className="text-xs text-red-700 dark:text-red-300">Another driver claimed it.</div> : null}
    </div>
  );
}

export function PickupButton({ orderId }: { orderId: string }) {
  const [pending, start] = useTransition();
  return (
    <Button
      type="button"
      variant="secondary"
      disabled={pending}
      onClick={() =>
        start(async () => {
          await markPickedUp(orderId);
          publishFromBrowser(`order:${orderId}`, { type: "picked-up", orderId });
        })
      }
    >
      {pending ? "Saving…" : "Mark picked up"}
    </Button>
  );
}

export function DeliverButton({ orderId }: { orderId: string }) {
  const [pending, start] = useTransition();
  return (
    <Button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          await markDelivered(orderId);
          publishFromBrowser(`order:${orderId}`, { type: "delivered", orderId });
        })
      }
    >
      {pending ? "Saving…" : "Mark delivered"}
    </Button>
  );
}
