import { EventEmitter } from "events";

type RealtimeEvent = unknown;

const emitter = new EventEmitter();
emitter.setMaxListeners(200);

export function publish(channel: string, event: RealtimeEvent): void {
  // TODO(real-keys:realtime-supabase-001): Publish to Supabase Realtime channels using SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (server) and channel naming conventions documented in docs/follow-up.md.
  emitter.emit(channel, event);
  emitter.emit("__all__", { channel, event });
}

export function subscribe(channel: string, cb: (event: RealtimeEvent) => void): () => void {
  emitter.on(channel, cb);
  return () => emitter.off(channel, cb);
}
