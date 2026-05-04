"use client";

const CHANNEL_NAME = "mc-realtime";

export type TabMessage = { channel: string; event: unknown };

/** Cross-tab fan-out for mock realtime (kitchen/driver tabs -> customer tab). */
export function publishFromBrowser(channel: string, event: unknown): void {
  // TODO(real-keys:realtime-supabase-002): Remove BroadcastChannel bridge; Supabase client subscriptions replace this in production.
  if (typeof window === "undefined") return;
  const bc = new BroadcastChannel(CHANNEL_NAME);
  bc.postMessage({ channel, event } satisfies TabMessage);
  bc.close();
}

export function subscribeTabs(onMessage: (msg: TabMessage) => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  const bc = new BroadcastChannel(CHANNEL_NAME);
  bc.onmessage = (ev: MessageEvent<TabMessage>) => {
    onMessage(ev.data);
  };
  return () => bc.close();
}
