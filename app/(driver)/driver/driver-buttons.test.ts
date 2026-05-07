import { describe, expect, it, vi } from "vitest";
import type { ReactElement, ReactNode } from "react";

const { claimOrderMock, publishFromBrowserMock, stateBox } = vi.hoisted(() => ({
  claimOrderMock: vi.fn(async () => ({ ok: true as const })),
  publishFromBrowserMock: vi.fn(),
  stateBox: { value: null as unknown },
}));

// Mock React hooks used by the client component so we can call it as a plain function.
vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    useTransition: () => {
      const start = (cb: () => void) => cb();
      return [false, start] as const;
    },
    // Simple state stub that tracks the latest value in `stateBox`
    useState: (initial: unknown) => {
      stateBox.value = initial;
      const setter = vi.fn((next: unknown) => {
        stateBox.value = next;
      });
      return [stateBox.value, setter] as const;
    },
  };
});

vi.mock("@/app/(driver)/driver/actions", () => ({
  claimOrder: claimOrderMock,
  markDelivered: vi.fn(),
  markPickedUp: vi.fn(),
}));

vi.mock("@/lib/realtime/browser", () => ({
  publishFromBrowser: publishFromBrowserMock,
}));

import { ClaimButton } from "@/app/(driver)/driver/driver-buttons";

describe("ClaimButton kitchen UX copy", () => {
  it('renders an "Accept" label and triggers claim behavior', async () => {
    type ButtonElement = ReactElement<{ children: ReactNode; onClick: () => unknown }>;

    const element = ClaimButton({ orderId: "order-1" }) as ReactElement<{ children: ReactNode }>;

    const children = element.props.children as ButtonElement | ButtonElement[];
    // The root element is a <div>; the first child is the Button.
    const buttonElement: ButtonElement =
      Array.isArray(children) && children.length > 0 ? children[0] : (children as ButtonElement);

    expect(buttonElement.props.children).toBe("Accept");

    await buttonElement.props.onClick();

    expect(claimOrderMock).toHaveBeenCalledWith("order-1");
    expect(publishFromBrowserMock).toHaveBeenCalledWith("order:order-1", {
      type: "driver-claim",
      orderId: "order-1",
      ok: true,
    });
  });

  it("sets failure state and publishes when claimOrder returns ok:false", async () => {
    type ButtonElement = ReactElement<{ children: ReactNode; onClick: () => unknown }>;

    (claimOrderMock as { mockResolvedValueOnce: (value: unknown) => unknown }).mockResolvedValueOnce({
      ok: false,
    });

    const element = ClaimButton({ orderId: "order-2" }) as ReactElement<{ children: ReactNode }>;
    const children = element.props.children as ButtonElement | ButtonElement[];
    const buttonElement: ButtonElement =
      Array.isArray(children) && children.length > 0 ? children[0] : (children as ButtonElement);

    await buttonElement.props.onClick();

    expect(claimOrderMock).toHaveBeenCalledWith("order-2");
    expect(publishFromBrowserMock).toHaveBeenCalledWith("order:order-2", {
      type: "driver-claim",
      orderId: "order-2",
      ok: false,
    });
    expect(stateBox.value).toBe(true);
  });
});

