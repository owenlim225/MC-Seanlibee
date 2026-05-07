"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { Loader2 } from "lucide-react";

import { Card } from "@/components/ui/card";

export type CheckoutPaymentModalPhase = "processing" | "success";

type CheckoutPaymentStatusModalProps = {
  phase: CheckoutPaymentModalPhase | null;
};

const LIVE_MESSAGES: Record<CheckoutPaymentModalPhase, string> = {
  processing: "Processing payment.",
  success: "Payment successful.",
};

function subscribeReducedMotion(onStoreChange: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

function reducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function reducedMotionServerSnapshot() {
  return false;
}

export function CheckoutPaymentStatusModal({ phase }: CheckoutPaymentStatusModalProps) {
  const open = phase !== null;
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const [mounted, setMounted] = useState(false);

  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    reducedMotionSnapshot,
    reducedMotionServerSnapshot,
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- document.body is unavailable until after SSR; portal must mount on client only (matches admin modal pattern).
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const container = dialogRef.current;
    if (!container) return;

    const focusable = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const target = focusable[0] ?? container;
    target.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        return;
      }
      if (event.key !== "Tab") return;
      const container = dialogRef.current;
      if (!container) return;
      const focusable = Array.from(
        container.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => !element.hasAttribute("disabled"));
      if (focusable.length === 0) {
        event.preventDefault();
        container.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open || !mounted || phase === null) return null;

  const liveMessage = LIVE_MESSAGES[phase];
  const title = phase === "processing" ? "Processing payment" : "Payment successful";

  const motionTransition = reducedMotion
    ? ""
    : "transition-opacity duration-[var(--motion-base)] ease-[var(--ease-standard)] motion-safe:duration-[var(--motion-slow)]";

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-payment-modal-title"
      tabIndex={-1}
      className={`fixed inset-0 z-[100] flex items-start justify-center bg-zinc-950/60 p-4 pt-16 backdrop-blur-sm ${motionTransition}`}
    >
      <span className="sr-only" aria-live="polite">
        {liveMessage}
      </span>
      <Card className={`w-full max-w-md p-6 shadow-lg ${motionTransition}`}>
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 id="checkout-payment-modal-title" className="text-lg font-semibold text-[var(--text-primary)]">
            {title}
          </h2>
          {phase === "processing" ? (
            <div className="flex flex-col items-center gap-3 py-2">
              <Loader2
                className={`size-10 text-[#B11226] ${reducedMotion ? "" : "motion-safe:animate-spin"}`}
                aria-hidden
              />
              <p className="text-sm text-[var(--text-muted)]">Processing payment…</p>
            </div>
          ) : (
            <p className="text-sm text-[var(--text-muted)]">Your order is confirmed. Redirecting…</p>
          )}
        </div>
      </Card>
    </div>,
    document.body,
  );
}
