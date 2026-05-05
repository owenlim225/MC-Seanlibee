export type RealtimeEvent = unknown;

export type RealtimeAdapter = {
  publish(channel: string, event: RealtimeEvent): void;
  subscribe(channel: string, cb: (event: RealtimeEvent) => void): () => void;
};

export type RealtimeProviderName = "mock" | "supabase-shadow";

const adapters = new Map<RealtimeProviderName, RealtimeAdapter>();

export function registerRealtimeAdapter(name: RealtimeProviderName, adapter: RealtimeAdapter): void {
  adapters.set(name, adapter);
}

export function getRealtimeProviderName(): RealtimeProviderName {
  return process.env.REALTIME_PROVIDER === "supabase-shadow" ? "supabase-shadow" : "mock";
}

export function getRealtimeAdapter(): RealtimeAdapter {
  const selected = adapters.get(getRealtimeProviderName());
  const fallback = adapters.get("mock");
  if (selected) return selected;
  if (fallback) return fallback;
  throw new Error("Realtime adapter not registered");
}
