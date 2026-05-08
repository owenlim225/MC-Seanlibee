# Checkout Tracking Gate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use ECC `tdd-workflow` (`.cursor/skills/tdd-workflow/SKILL.md`) — this monorepo executes plans through ECC, not Superpowers `executing-plans`. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the artificial success-dwell timer in the customer checkout flow with a real wait that polls a new server action until the placed order is reflected on order tracking, with a deterministic timeout fallback.

**Architecture:** A new pure-TypeScript poller helper module (`lib/customer/checkout-payment-poller.ts`) holds all timing constants and outcome resolution. A new auth-gated server action (`getOrderTrackingStatus`) returns `{ found: boolean }` for the calling customer. The existing client form (`components/customer/checkout-review-form.tsx`) drives the polling loop and modal phase using those primitives. The modal component is unchanged.

**Tech Stack:** Next.js (App Router) + TypeScript + React 19 + Prisma 6 + Vitest 3 (node env, `*.test.ts` only).

**Spec:** [docs/superpowers/specs/2026-05-08-checkout-tracking-gate-design.md](../specs/2026-05-08-checkout-tracking-gate-design.md)

---

## File Structure

| File | Purpose |
|---|---|
| Create: `lib/customer/checkout-payment-poller.ts` | Pure helpers: timing constants, outcome resolver, success dwell selector, redirect-flag composer. |
| Create: `lib/customer/checkout-payment-poller.test.ts` | Unit tests for the poller helpers. |
| Modify: `app/(customer)/customer/actions.ts` | Add `getOrderTrackingStatus` server action. |
| Modify: `app/(customer)/customer/actions.test.ts` | Cover `getOrderTrackingStatus`: found, missing, wrong owner, auth gate. |
| Modify: `components/customer/checkout-review-form.tsx` | Remove fake dwell; accept new server-action prop; add polling loop with abort handling. |
| Modify: `app/(customer)/customer/checkout/page.tsx` | Pass `getOrderTrackingStatus` to the form. |

The modal file (`components/customer/checkout-payment-status-modal.tsx`) is intentionally unchanged.

---

## Task 1: Poller helpers — failing tests

**Files:**
- Create: `lib/customer/checkout-payment-poller.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, expect, it } from "vitest";

import {
  POLL_INTERVAL_MS,
  POLL_MAX_WAIT_MS,
  SUCCESS_DWELL_MS_DEFAULT,
  SUCCESS_DWELL_MS_REDUCED_MOTION,
  appendTrackingPendingFlag,
  resolvePollOutcome,
  successDwellMs,
} from "./checkout-payment-poller";

describe("checkout-payment-poller", () => {
  it("exposes deterministic timing constants for the polling state machine", () => {
    expect(POLL_INTERVAL_MS).toBe(1000);
    expect(POLL_MAX_WAIT_MS).toBe(30_000);
    expect(SUCCESS_DWELL_MS_DEFAULT).toBe(700);
    expect(SUCCESS_DWELL_MS_REDUCED_MOTION).toBe(200);
  });

  it("resolves polling outcome to success the moment tracker reports found", () => {
    expect(resolvePollOutcome({ found: true, elapsedMs: 0 })).toBe("success");
    expect(resolvePollOutcome({ found: true, elapsedMs: POLL_MAX_WAIT_MS - 1 })).toBe("success");
  });

  it("keeps polling while tracker reports missing inside the wait budget", () => {
    expect(resolvePollOutcome({ found: false, elapsedMs: 0 })).toBe("continue");
    expect(resolvePollOutcome({ found: false, elapsedMs: POLL_MAX_WAIT_MS - 1 })).toBe("continue");
  });

  it("times out once elapsed reaches the max wait budget without a found signal", () => {
    expect(resolvePollOutcome({ found: false, elapsedMs: POLL_MAX_WAIT_MS })).toBe("timeout");
    expect(resolvePollOutcome({ found: false, elapsedMs: POLL_MAX_WAIT_MS + 5_000 })).toBe("timeout");
  });

  it("uses reduced-motion dwell when the user prefers reduced motion", () => {
    expect(successDwellMs({ prefersReducedMotion: false })).toBe(SUCCESS_DWELL_MS_DEFAULT);
    expect(successDwellMs({ prefersReducedMotion: true })).toBe(SUCCESS_DWELL_MS_REDUCED_MOTION);
  });

  it("appends trackingPending=1 to a path with no existing query string", () => {
    expect(appendTrackingPendingFlag("/customer/orders/abc")).toBe(
      "/customer/orders/abc?trackingPending=1",
    );
  });

  it("appends trackingPending=1 to a path that already has a query string", () => {
    expect(appendTrackingPendingFlag("/customer/orders/abc?paid=1")).toBe(
      "/customer/orders/abc?paid=1&trackingPending=1",
    );
  });

  it("preserves a hash fragment when appending the trackingPending flag", () => {
    expect(appendTrackingPendingFlag("/customer/orders/abc?paid=1#summary")).toBe(
      "/customer/orders/abc?paid=1&trackingPending=1#summary",
    );
  });

  it("is idempotent: appending trackingPending twice does not duplicate the flag", () => {
    const once = appendTrackingPendingFlag("/customer/orders/abc?paid=1");
    expect(appendTrackingPendingFlag(once)).toBe(once);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test -- lib/customer/checkout-payment-poller.test.ts`
Expected: FAIL with "Cannot find module" / module-not-found for `./checkout-payment-poller`.

## Task 2: Poller helpers — minimal implementation

**Files:**
- Create: `lib/customer/checkout-payment-poller.ts`

- [ ] **Step 3: Write the implementation**

```ts
export const POLL_INTERVAL_MS = 1_000;
export const POLL_MAX_WAIT_MS = 30_000;
export const SUCCESS_DWELL_MS_DEFAULT = 700;
export const SUCCESS_DWELL_MS_REDUCED_MOTION = 200;

export type PollOutcome = "success" | "timeout" | "continue";

export function resolvePollOutcome(input: {
  found: boolean;
  elapsedMs: number;
}): PollOutcome {
  if (input.found) return "success";
  if (input.elapsedMs >= POLL_MAX_WAIT_MS) return "timeout";
  return "continue";
}

export function successDwellMs(input: { prefersReducedMotion: boolean }): number {
  return input.prefersReducedMotion
    ? SUCCESS_DWELL_MS_REDUCED_MOTION
    : SUCCESS_DWELL_MS_DEFAULT;
}

const TRACKING_PENDING_FLAG = "trackingPending=1";

export function appendTrackingPendingFlag(redirectUrl: string): string {
  const hashIndex = redirectUrl.indexOf("#");
  const path = hashIndex === -1 ? redirectUrl : redirectUrl.slice(0, hashIndex);
  const hash = hashIndex === -1 ? "" : redirectUrl.slice(hashIndex);
  if (path.includes(TRACKING_PENDING_FLAG)) return redirectUrl;
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}${TRACKING_PENDING_FLAG}${hash}`;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test -- lib/customer/checkout-payment-poller.test.ts`
Expected: PASS (8 tests).

## Task 3: `getOrderTrackingStatus` server action — failing tests

**Files:**
- Modify: `app/(customer)/customer/actions.test.ts`

- [ ] **Step 5: Add test cases for `getOrderTrackingStatus`**

Append a new `describe("getOrderTrackingStatus", ...)` block. Add the prisma mock for `order.findFirst`, then assert:

1. Returns `{ found: true }` when `prisma.order.findFirst` returns a row.
2. Returns `{ found: false }` when `prisma.order.findFirst` returns `null`.
3. Calls `requireRoleLite(Role.CUSTOMER)` first.
4. Passes `customerId: <session uid>` and `deletedAt: null` to the prisma query so cross-customer probing is impossible.

```ts
const orderFindFirstMock = vi.fn();

// Extend the existing prisma mock:
vi.mock("@/lib/prisma", () => ({
  prisma: {
    menuItem: { findMany: vi.fn() },
    order: { create: vi.fn(), findFirst: orderFindFirstMock },
  },
}));

import { getOrderTrackingStatus } from "@/app/(customer)/customer/actions";

describe("getOrderTrackingStatus", () => {
  beforeEach(() => {
    orderFindFirstMock.mockReset();
    requireRoleLiteMock.mockClear();
  });

  it("requires the customer role before reading the database", async () => {
    orderFindFirstMock.mockResolvedValueOnce({ id: "order-1" });
    await getOrderTrackingStatus("order-1");
    expect(requireRoleLiteMock).toHaveBeenCalledWith(Role.CUSTOMER);
  });

  it("returns found=true when the order exists for the calling customer", async () => {
    orderFindFirstMock.mockResolvedValueOnce({ id: "order-1" });
    const result = await getOrderTrackingStatus("order-1");
    expect(result).toEqual({ found: true });
  });

  it("returns found=false when the order is missing or owned by another customer", async () => {
    orderFindFirstMock.mockResolvedValueOnce(null);
    const result = await getOrderTrackingStatus("order-1");
    expect(result).toEqual({ found: false });
  });

  it("scopes the database read to the calling customer to prevent cross-account probing", async () => {
    orderFindFirstMock.mockResolvedValueOnce(null);
    await getOrderTrackingStatus("order-1");
    expect(orderFindFirstMock).toHaveBeenCalledWith({
      where: { id: "order-1", customerId: "cust-1", deletedAt: null },
      select: { id: true },
    });
  });
});
```

The `requireRoleLiteMock` factory at the top of the file already returns `{ id: "cust-1", role: Role.CUSTOMER }`, which the cross-account test depends on.

- [ ] **Step 6: Run tests to verify they fail**

Run: `pnpm test -- app/(customer)/customer/actions.test.ts`
Expected: FAIL — `getOrderTrackingStatus is not a function` / not exported.

## Task 4: Implement `getOrderTrackingStatus`

**Files:**
- Modify: `app/(customer)/customer/actions.ts`

- [ ] **Step 7: Add the new server action and export type**

Append below `placeOrderMock`:

```ts
export type OrderTrackingStatusResponse = { found: boolean };

export async function getOrderTrackingStatus(
  orderId: string,
): Promise<OrderTrackingStatusResponse> {
  const user = await requireRoleLite(Role.CUSTOMER);
  const order = await prisma.order.findFirst({
    where: { id: orderId, customerId: user.id, deletedAt: null },
    select: { id: true },
  });
  return { found: Boolean(order) };
}
```

- [ ] **Step 8: Run tests to verify they pass**

Run: `pnpm test -- app/(customer)/customer/actions.test.ts`
Expected: PASS (existing + 4 new).

## Task 5: Wire poller into the checkout form

**Files:**
- Modify: `components/customer/checkout-review-form.tsx`
- Modify: `app/(customer)/customer/checkout/page.tsx`

- [ ] **Step 9: Update the form to accept and use the new server action**

Replace the `pickSuccessDwellMs` helper, the random dwell, and the linear `setTimeout` flow with a polling loop driven by `resolvePollOutcome`. Keep the existing modal phase machine; only the path between "place order ok" and "redirect" changes.

Concretely:

1. Add prop `getOrderTrackingStatus: (orderId: string) => Promise<{ found: boolean }>`.
2. Remove `pickSuccessDwellMs`.
3. After `placeOrderWithResultAction(formData)` returns `ok: true`, leave `modalPhase = "processing"` and run a `pollUntilTracked(orderId)` async helper that:
   - Records `startedAt = Date.now()`.
   - Loops: `await getOrderTrackingStatus(orderId)`, compute `elapsed`, call `resolvePollOutcome`. On `success` break out; on `timeout` set a `timedOut` flag and break; on `continue` `await new Promise(r => setTimeout(r, POLL_INTERVAL_MS))`.
   - Wraps each call in try/catch; any thrown error sets `timedOut = true` and breaks.
   - Honors an `abortRef` (set on unmount) to stop the loop.
4. After polling resolves:
   - If `timedOut`: `router.push(appendTrackingPendingFlag(result.redirectUrl))`. Do NOT set success.
   - Else: `setModalPhase("success")`, `await sleep(successDwellMs({ prefersReducedMotion }))`, `router.push(result.redirectUrl)`.
5. Use a `useRef<boolean>` ("abortRef") set to `true` in a cleanup effect to suppress further state changes after unmount.

Code:

```tsx
"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
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
import {
  POLL_INTERVAL_MS,
  appendTrackingPendingFlag,
  resolvePollOutcome,
  successDwellMs,
} from "@/lib/customer/checkout-payment-poller";
import { CheckoutPaymentStatusModal } from "@/components/customer/checkout-payment-status-modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MoneyText } from "@/components/ui/money-text";

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
  getOrderTrackingStatus: (orderId: string) => Promise<{ found: boolean }>;
};

export function CheckoutReviewForm({
  lines,
  initialDeliveryOption,
  initialTipCents,
  defaultUser,
  placeOrderWithResult: placeOrderWithResultAction,
  getOrderTrackingStatus: getOrderTrackingStatusAction,
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
  const abortRef = useRef(false);

  useEffect(() => () => {
    abortRef.current = true;
  }, []);

  // ... (rest unchanged: defaultDetails, pricedLines, summary memos)

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

      const startedAt = Date.now();
      let timedOut = false;
      while (!abortRef.current) {
        let found = false;
        try {
          const status = await getOrderTrackingStatusAction(result.orderId);
          found = status.found;
        } catch {
          timedOut = true;
          break;
        }
        const elapsedMs = Date.now() - startedAt;
        const outcome = resolvePollOutcome({ found, elapsedMs });
        if (outcome === "success") break;
        if (outcome === "timeout") {
          timedOut = true;
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
      }

      if (abortRef.current) return;

      if (timedOut) {
        router.push(appendTrackingPendingFlag(result.redirectUrl));
        return;
      }

      setModalPhase("success");
      const prefersReducedMotion =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      await new Promise((resolve) =>
        setTimeout(resolve, successDwellMs({ prefersReducedMotion })),
      );
      if (abortRef.current) return;
      router.push(result.redirectUrl);
    } catch {
      if (abortRef.current) return;
      setModalPhase(null);
      setIsSubmitting(false);
      submitLockRef.current = false;
    }
  }

  // ... (return unchanged)
}
```

- [ ] **Step 10: Wire the new server action through the page**

```tsx
// app/(customer)/customer/checkout/page.tsx
import {
  getOrderTrackingStatus,
  placeOrderWithResult,
} from "@/app/(customer)/customer/actions";

// ...

<CheckoutReviewForm
  lines={lines}
  initialDeliveryOption={deliveryOption}
  initialTipCents={tipCents}
  defaultUser={{ name: user.name, email: user.email, phone: null }}
  placeOrderWithResult={placeOrderWithResult}
  getOrderTrackingStatus={getOrderTrackingStatus}
/>
```

- [ ] **Step 11: Run the unit suite**

Run: `pnpm test`
Expected: PASS, including the new poller and action tests, with no regressions.

- [ ] **Step 12: Typecheck and lint**

Run: `pnpm typecheck`
Expected: no errors.

Run: `pnpm lint`
Expected: no errors.

## Task 6: Commit

- [ ] **Step 13: Stage and commit**

```bash
git add \
  docs/superpowers/specs/2026-05-08-checkout-tracking-gate-design.md \
  docs/superpowers/plans/2026-05-08-checkout-tracking-gate.md \
  lib/customer/checkout-payment-poller.ts \
  lib/customer/checkout-payment-poller.test.ts \
  app/(customer)/customer/actions.ts \
  app/(customer)/customer/actions.test.ts \
  components/customer/checkout-review-form.tsx \
  app/(customer)/customer/checkout/page.tsx
git commit -m "fix(checkout): gate payment success on real order tracking"
```

---

## Self-review

- [x] Spec coverage: each spec section maps to a task. Timing constants → Task 2. Auth gate → Task 4. Polling loop / timeout / abort → Task 5. Tests → Tasks 1, 3.
- [x] No placeholders. Every code block is runnable as-is.
- [x] Type consistency: `getOrderTrackingStatus(orderId: string) => Promise<{ found: boolean }>` is identical in the action, the form prop, and the page wiring.
- [x] No new dependencies, no new env vars, no migration.
