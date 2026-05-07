import { describe, expect, it } from "vitest";
import {
  buildPersonalDetailsDefaults,
  computeCheckoutSummaryView,
  createCheckoutUiState,
  updateCheckoutUiState,
} from "./checkout-ui-state";

describe("checkout-ui-state", () => {
  it("prefills personal details from user credentials with safe phone fallback", () => {
    const defaults = buildPersonalDetailsDefaults({
      userName: "Sean Libee",
      userEmail: "sean@example.com",
      phone: null,
    });

    expect(defaults).toEqual({
      fullName: "Sean Libee",
      phone: "",
      email: "sean@example.com",
    });
  });

  it("updates delivery and tip totals in real time through immutable state transitions", () => {
    const lines = [{ priceCents: 10000, qty: 1 }];
    const initial = createCheckoutUiState({
      deliveryOption: "standard",
      tipCents: 0,
      consent: false,
    });

    const withPriority = updateCheckoutUiState(initial, {
      deliveryOption: "priority",
    });
    const withTip = updateCheckoutUiState(withPriority, { tipCents: 1500 });
    const summary = computeCheckoutSummaryView(lines, withTip);

    expect(withPriority).not.toBe(initial);
    expect(withTip).not.toBe(withPriority);
    expect(summary.deliveryFeeCents).toBe(1900);
    expect(summary.tipCents).toBe(1500);
    expect(summary.totalCents).toBe(13900);
  });

  it("toggles consent state used for submit readiness immediately", () => {
    const lines = [{ priceCents: 5000, qty: 1 }];
    const state = createCheckoutUiState();
    const blocked = computeCheckoutSummaryView(lines, state);
    const ready = computeCheckoutSummaryView(
      lines,
      updateCheckoutUiState(state, { consent: true }),
    );

    expect(blocked.canSubmit).toBe(false);
    expect(blocked.consentLabel).toBe("Required");
    expect(ready.canSubmit).toBe(true);
    expect(ready.consentLabel).toBe("Confirmed");
  });
});
