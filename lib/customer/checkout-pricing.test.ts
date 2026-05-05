import { describe, expect, it } from "vitest";
import {
  DELIVERY_OPTIONS,
  SERVICE_FEE_CENTS,
  computeCheckoutPricing,
  resolveDeliveryOption,
  resolveTipCents,
} from "./checkout-pricing";

describe("checkout-pricing", () => {
  it("computes subtotal and fees for standard delivery", () => {
    const pricing = computeCheckoutPricing({
      lines: [
        { priceCents: 1200, qty: 2 },
        { priceCents: 900, qty: 1 },
      ],
      deliveryOption: "standard",
      tipCents: 500,
    });

    expect(pricing.subtotalCents).toBe(3300);
    expect(pricing.deliveryFeeCents).toBe(DELIVERY_OPTIONS.standard.feeCents);
    expect(pricing.serviceFeeCents).toBe(SERVICE_FEE_CENTS);
    expect(pricing.tipCents).toBe(500);
    expect(pricing.totalCents).toBe(4300);
  });

  it("uses priority delivery surcharge when selected", () => {
    const pricing = computeCheckoutPricing({
      lines: [{ priceCents: 1000, qty: 1 }],
      deliveryOption: "priority",
      tipCents: 0,
    });

    expect(pricing.deliveryFeeCents).toBe(DELIVERY_OPTIONS.priority.feeCents);
    expect(pricing.totalCents).toBe(3400);
  });

  it("falls back to safe defaults for invalid option and tip", () => {
    const pricing = computeCheckoutPricing({
      lines: [{ priceCents: 1000, qty: 1 }],
      deliveryOption: "express",
      tipCents: 999,
    });

    expect(pricing.deliveryOption).toBe("standard");
    expect(pricing.tipCents).toBe(0);
    expect(pricing.totalCents).toBe(1500);
  });

  it("resolves delivery option and tip helpers deterministically", () => {
    expect(resolveDeliveryOption("priority")).toBe("priority");
    expect(resolveDeliveryOption(undefined)).toBe("standard");
    expect(resolveDeliveryOption("other")).toBe("standard");
    expect(resolveTipCents(1500)).toBe(1500);
    expect(resolveTipCents(250)).toBe(0);
  });

  it("handles empty cart lines", () => {
    const pricing = computeCheckoutPricing({ lines: [] });
    expect(pricing.subtotalCents).toBe(0);
    expect(pricing.totalCents).toBe(SERVICE_FEE_CENTS);
  });
});
