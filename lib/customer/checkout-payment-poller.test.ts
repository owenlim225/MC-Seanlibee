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
    expect(resolvePollOutcome({ found: true, elapsedMs: POLL_MAX_WAIT_MS + 5_000 })).toBe(
      "success",
    );
  });

  it("keeps polling while tracker reports missing inside the wait budget", () => {
    expect(resolvePollOutcome({ found: false, elapsedMs: 0 })).toBe("continue");
    expect(resolvePollOutcome({ found: false, elapsedMs: POLL_MAX_WAIT_MS - 1 })).toBe("continue");
  });

  it("times out once elapsed reaches the max wait budget without a found signal", () => {
    expect(resolvePollOutcome({ found: false, elapsedMs: POLL_MAX_WAIT_MS })).toBe("timeout");
    expect(resolvePollOutcome({ found: false, elapsedMs: POLL_MAX_WAIT_MS + 5_000 })).toBe(
      "timeout",
    );
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
