import { EventEmitter } from "events";
import { getRealtimeAdapter, registerRealtimeAdapter, type RealtimeEvent } from "@/lib/realtime/provider";

const emitter = new EventEmitter();
emitter.setMaxListeners(200);

function mockPublish(channel: string, event: RealtimeEvent): void {
  // TODO(real-keys:realtime-supabase-001): Publish to Supabase Realtime channels using SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (server) and channel naming conventions documented in docs/follow-up.md.
  emitter.emit(channel, event);
  emitter.emit("__all__", { channel, event });
}

function mockSubscribe(channel: string, cb: (event: RealtimeEvent) => void): () => void {
  emitter.on(channel, cb);
  return () => emitter.off(channel, cb);
}

registerRealtimeAdapter("mock", {
  publish: mockPublish,
  subscribe: mockSubscribe,
});

registerRealtimeAdapter("supabase-shadow", {
  // N.2 shadow mode scaffold: route to in-process emitter until Supabase wiring lands.
  publish: mockPublish,
  subscribe: mockSubscribe,
});

export function publish(channel: string, event: RealtimeEvent): void {
  getRealtimeAdapter().publish(channel, event);
}

export function subscribe(channel: string, cb: (event: RealtimeEvent) => void): () => void {
  return getRealtimeAdapter().subscribe(channel, cb);
}
