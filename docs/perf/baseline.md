# Performance baseline

How to measure end-to-end latency for the role pages so you can verify the Wave 1–6 fixes empirically.

## Protocol

Run both a development build and a production build and record TTFB (time to first byte) for the same set of routes.

### Dev (warm)

```bash
pnpm dev --hostname 127.0.0.1 --port 3000
# In another shell, hit each route a few times to warm Turbopack, then:
for path in /customer /customer?category=BURGERS /customer/cart /customer/orders /kitchen /driver /admin; do
  curl -s -o /dev/null -w "$path %{time_starttransfer}s\n" "http://127.0.0.1:3000$path" \
    -b "mc_session=<paste signed cookie from a logged-in browser>"
done
```

### Production

```bash
pnpm build
pnpm start --hostname 127.0.0.1 --port 3000
# Repeat the same curl loop.
```

### Browser waterfall

Open Chrome DevTools → Network → record one navigation to `/customer` while throttling is set to "No throttling". Save HAR. Compare TTFB across waves.

## Pass criteria

Per the plan:

- p95 TTFB on `/customer` (warm, prod build, with one filtered category) under 250 ms locally.
- Zero `127.0.0.1:7817` references in source. Verify with `rg "127\.0\.0\.1:7817"`.

## Hot-path index verification (Postgres only)

When deployed on Postgres, run `EXPLAIN (ANALYZE, BUFFERS)` against the kitchen and driver queries; expect index scans on `Order_status_createdAt_idx` and an index lookup via `DeliveryAssignment_driverId_idx`. SQLite will use its own optimizer; the index is still beneficial there.

## Optional toggleable timing

Hot Prisma calls can be wrapped in `console.time(...)` behind `PERF_DEBUG=1` for one PR cycle. Avoid leaving timing instrumentation in long-lived code, and **never** ship a debug `fetch` to a local-only HTTP endpoint inside a request critical path — that pattern caused the original 13 s spikes.
