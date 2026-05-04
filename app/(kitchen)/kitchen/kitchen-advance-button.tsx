"use client";

import { useTransition } from "react";
import { advanceKitchenOrder } from "@/app/(kitchen)/kitchen/actions";
import { Button } from "@/components/ui/button";
import { publishFromBrowser } from "@/lib/realtime/browser";

export function KitchenAdvanceButton({
  orderId,
  label,
}: {
  orderId: string;
  label: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="secondary"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await advanceKitchenOrder(orderId);
          publishFromBrowser(`order:${orderId}`, { type: "kitchen-advanced", orderId });
        })
      }
    >
      {pending ? "Saving…" : label}
    </Button>
  );
}
