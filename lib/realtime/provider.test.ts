import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getRealtimeAdapter,
  getRealtimeProviderName,
  registerRealtimeAdapter,
  type RealtimeAdapter,
} from "@/lib/realtime/provider";

function createRealtimeAdapter(): RealtimeAdapter {
  return {
    publish: vi.fn(),
    subscribe: vi.fn(() => () => {}),
  };
}

describe("realtime provider selection", () => {
  afterEach(() => {
    delete process.env.REALTIME_PROVIDER;
  });

  it("defaults to mock provider", () => {
    registerRealtimeAdapter("mock", createRealtimeAdapter());
    registerRealtimeAdapter("supabase-shadow", createRealtimeAdapter());

    expect(getRealtimeProviderName()).toBe("mock");
    expect(getRealtimeAdapter().publish).toBeDefined();
  });

  it("supports independent shadow toggle", () => {
    registerRealtimeAdapter("mock", createRealtimeAdapter());
    const shadow = createRealtimeAdapter();
    registerRealtimeAdapter("supabase-shadow", shadow);
    process.env.REALTIME_PROVIDER = "supabase-shadow";

    expect(getRealtimeProviderName()).toBe("supabase-shadow");
    expect(getRealtimeAdapter()).toBe(shadow);
  });
});
