export const POLL_INTERVAL_MS = 1_000;
export const POLL_MAX_WAIT_MS = 30_000;
export const SUCCESS_DWELL_MS_DEFAULT = 700;
export const SUCCESS_DWELL_MS_REDUCED_MOTION = 200;

export type PollOutcome = "success" | "timeout" | "continue";

export function resolvePollOutcome(input: {
  found: boolean;
  elapsedMs: number;
}): PollOutcome {
  if (input.found) return "success";
  if (input.elapsedMs >= POLL_MAX_WAIT_MS) return "timeout";
  return "continue";
}

export function successDwellMs(input: { prefersReducedMotion: boolean }): number {
  return input.prefersReducedMotion
    ? SUCCESS_DWELL_MS_REDUCED_MOTION
    : SUCCESS_DWELL_MS_DEFAULT;
}

const TRACKING_PENDING_FLAG = "trackingPending=1";

export function appendTrackingPendingFlag(redirectUrl: string): string {
  const hashIndex = redirectUrl.indexOf("#");
  const path = hashIndex === -1 ? redirectUrl : redirectUrl.slice(0, hashIndex);
  const hash = hashIndex === -1 ? "" : redirectUrl.slice(hashIndex);
  if (path.includes(TRACKING_PENDING_FLAG)) return redirectUrl;
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}${TRACKING_PENDING_FLAG}${hash}`;
}
