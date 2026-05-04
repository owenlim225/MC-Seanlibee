import { publish as serverPublish, subscribe as serverSubscribe } from "@/lib/realtime/mock";

/** Server-side pub/sub (in-process). */
export const realtime = {
  publish: serverPublish,
  subscribe: serverSubscribe,
};
