"use client";

import { useEffect, useState } from "react";

function formatRelative(ms: number): string {
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 48) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d}d ago`;
}

export function RelativeTime({ date }: { date: Date | string }) {
  const parsed = typeof date === "string" ? new Date(date) : date;
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const delta = Math.max(0, now - parsed.getTime());
  return <span title={parsed.toISOString()}>{formatRelative(delta)}</span>;
}
