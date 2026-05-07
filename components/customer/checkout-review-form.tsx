"use client";

import { useMemo, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import type { PlaceOrderWithResultResponse } from "@/app/(customer)/customer/actions";
import {
  DELIVERY_OPTIONS,
  TIP_OPTIONS_CENTS,
  type CheckoutDeliveryOption,
} from "@/lib/customer/checkout-pricing";
import {
  type CheckoutPricedLineInput,
  buildPersonalDetailsDefaults,
  computeCheckoutSummaryView,
  createCheckoutUiState,
  updateCheckoutUiState,
} from "@/lib/customer/checkout-ui-state";
import { CheckoutPaymentStatusModal } from "@/components/customer/checkout-payment-status-modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MoneyText } from "@/components/ui/money-text";

function pickSuccessDwellMs(): number {
  const baseMs = 900 + Math.floor(Math.random() * 301);
  const extraMs = 10000 + Math.floor(Math.random() * 5001); // +5s–10s
  return baseMs + extraMs;
}

type CheckoutReviewFormProps = {
  lines: Array<{
    menuItemId: string;
    qty: number;
    menuItem: { name: string; priceCents: number };
  }>;
  initialDeliveryOption?: string;
  initialTipCents?: number;
  defaultUser: { name?: string | null; email?: string | null; phone?: string | null };
  placeOrderWithResult: (formData: FormData) => Promise<PlaceOrderWithResultResponse>;
};

export function CheckoutReviewForm({
  lines,
  initialDeliveryOption,
  initialTipCents,
  defaultUser,
  placeOrderWithResult: placeOrderWithResultAction,
}: CheckoutReviewFormProps) {
  const router = useRouter();
  const [uiState, setUiState] = useState(() =>
    createCheckoutUiState({
      deliveryOption: initialDeliveryOption,
      tipCents: initialTipCents,
      consent: false,
    }),
  );
  const [modalPhase, setModalPhase] = useState<"processing" | "success" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitLockRef = useRef(false);

  const defaultDetails = useMemo(
    () =>
      buildPersonalDetailsDefaults({
        userName: defaultUser.name,
        userEmail: defaultUser.email,
        phone: defaultUser.phone,
      }),
    [defaultUser.email, defaultUser.name, defaultUser.phone],
  );

  const pricedLines = useMemo<CheckoutPricedLineInput[]>(
    () =>
      lines.map((line) => ({
        priceCents: line.menuItem.priceCents,
        qty: line.qty,
      })),
    [lines],
  );

  const summary = useMemo(
    () => computeCheckoutSummaryView(pricedLines, uiState),
    [pricedLines, uiState],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitLockRef.current || isSubmitting || !summary.canSubmit) return;

    const form = event.currentTarget;
    submitLockRef.current = true;
    setIsSubmitting(true);
    setModalPhase("processing");

    try {
      const formData = new FormData(form);
      const result = await placeOrderWithResultAction(formData);

      if (!result.ok) {
        setModalPhase(null);
        setIsSubmitting(false);
        submitLockRef.current = false;
        router.replace(result.redirectUrl);
        return;
      }

      setModalPhase("success");

      const prefersReduced =
        typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const dwellMs = prefersReduced ? Math.min(400, pickSuccessDwellMs()) : pickSuccessDwellMs();

      await new Promise((resolve) => setTimeout(resolve, dwellMs));
      router.push(result.redirectUrl);
    } catch {
      setModalPhase(null);
      setIsSubmitting(false);
      submitLockRef.current = false;
    }
  }

  return (
    <>
      <CheckoutPaymentStatusModal phase={modalPhase} />

      <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Card className="flex flex-col gap-3">
            <h2 className="text-base font-semibold">Delivery address</h2>
            <input
              name="addressLine1"
              required
              placeholder="Street address"
              disabled={isSubmitting}
              className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700 disabled:opacity-60"
            />
            <input
              name="addressLine2"
              placeholder="Apartment, unit, etc. (optional)"
              disabled={isSubmitting}
              className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700 disabled:opacity-60"
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                name="city"
                required
                placeholder="City"
                disabled={isSubmitting}
                className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700 disabled:opacity-60"
              />
              <input
                name="postalCode"
                required
                placeholder="Postal code"
                disabled={isSubmitting}
                className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700 disabled:opacity-60"
              />
            </div>
          </Card>

          <Card className="flex flex-col gap-3">
            <h2 className="text-base font-semibold">Delivery options</h2>
            {Object.entries(DELIVERY_OPTIONS).map(([key, option]) => {
              const isSelected = uiState.deliveryOption === key;
              return (
                <label
                  key={key}
                  className={`flex cursor-pointer items-center justify-between gap-3 rounded-md border p-3 text-sm transition-colors duration-200 focus-within:ring-2 focus-within:ring-[#B11226] ${
                    isSelected
                      ? "border-[#B11226] bg-[#B11226]/5"
                      : "border-zinc-200 dark:border-zinc-800"
                  }`}
                >
                  <span>{option.label}</span>
                  <span className="flex items-center gap-3">
                    <MoneyText cents={option.feeCents} />
                    <input
                      type="radio"
                      name="deliveryOption"
                      value={key}
                      checked={isSelected}
                      disabled={isSubmitting}
                      onChange={() =>
                        setUiState((prev) =>
                          updateCheckoutUiState(prev, {
                            deliveryOption: key as CheckoutDeliveryOption,
                          }),
                        )
                      }
                    />
                  </span>
                </label>
              );
            })}
          </Card>

          <Card className="flex flex-col gap-3">
            <h2 className="text-base font-semibold">Personal details</h2>
            <input
              name="fullName"
              required
              placeholder="Full name"
              defaultValue={defaultDetails.fullName}
              disabled={isSubmitting}
              className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700 disabled:opacity-60"
            />
            <input
              name="phone"
              required
              placeholder="Phone number"
              defaultValue={defaultDetails.phone}
              disabled={isSubmitting}
              className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700 disabled:opacity-60"
            />
            <input
              name="email"
              type="email"
              required
              placeholder="Email"
              defaultValue={defaultDetails.email}
              disabled={isSubmitting}
              className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700 disabled:opacity-60"
            />
          </Card>

          <Card className="flex flex-col gap-3">
            <h2 className="text-base font-semibold">Tip and consent</h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {TIP_OPTIONS_CENTS.map((tipOption) => {
                const isSelected = uiState.tipCents === tipOption;
                return (
                  <label
                    key={tipOption}
                    className={`flex cursor-pointer items-center justify-between rounded-md border px-3 py-2 text-sm transition-colors duration-200 focus-within:ring-2 focus-within:ring-[#B11226] ${
                      isSelected
                        ? "border-[#B11226] bg-[#B11226]/5"
                        : "border-zinc-200 dark:border-zinc-800"
                    }`}
                  >
                    <span>{tipOption === 0 ? "No tip" : "Tip"}</span>
                    <span className="flex items-center gap-3">
                      <MoneyText cents={tipOption} />
                      <input
                        type="radio"
                        name="tipCents"
                        value={tipOption}
                        checked={isSelected}
                        disabled={isSubmitting}
                        onChange={() =>
                          setUiState((prev) =>
                            updateCheckoutUiState(prev, { tipCents: tipOption }),
                          )
                        }
                      />
                    </span>
                  </label>
                );
              })}
            </div>
            <label className="flex cursor-pointer items-start gap-2 text-sm">
              <input
                type="checkbox"
                name="consent"
                required
                checked={uiState.consent}
                disabled={isSubmitting}
                onChange={(event) =>
                  setUiState((prev) =>
                    updateCheckoutUiState(prev, { consent: event.target.checked }),
                  )
                }
              />
              <span>I confirm this checkout and agree to place this order.</span>
            </label>
          </Card>
        </div>

        <Card className="flex h-fit flex-col gap-3 lg:sticky lg:top-4">
          <h2 className="text-base font-semibold">Order summary</h2>
          <ul className="flex flex-col gap-1 text-sm">
            {lines.map((line) => (
              <li key={line.menuItemId} className="flex items-center justify-between gap-2">
                <span>
                  {line.qty} × {line.menuItem.name}
                </span>
                <MoneyText cents={line.menuItem.priceCents * line.qty} />
              </li>
            ))}
          </ul>
          <div className="mt-2 grid gap-1 border-t border-zinc-200 pt-2 text-sm dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <MoneyText cents={summary.subtotalCents} />
            </div>
            <div className="flex items-center justify-between">
              <span>Delivery</span>
              <MoneyText cents={summary.deliveryFeeCents} />
            </div>
            <div className="flex items-center justify-between">
              <span>Service fee</span>
              <MoneyText cents={summary.serviceFeeCents} />
            </div>
            <div className="flex items-center justify-between">
              <span>Tip</span>
              <MoneyText cents={summary.tipCents} />
            </div>
            <div className="flex items-center justify-between">
              <span>Consent</span>
              <span>{summary.consentLabel}</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-base font-semibold">
              <span>Total</span>
              <MoneyText cents={summary.totalCents} />
            </div>
          </div>
          <Button type="submit" disabled={!summary.canSubmit || isSubmitting}>
            Place order
          </Button>
        </Card>
      </form>
    </>
  );
}
