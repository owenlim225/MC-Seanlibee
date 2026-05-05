# Supabase Hybrid Shadow Playbook (Phase N)

This file scaffolds staged provider cutovers with rollback-safe toggles. Current defaults keep all flows on mock/local behavior.

## Provider Flags (current scaffold)

- `AUTH_PROVIDER=mock|supabase-shadow` (default: `mock`)
- `REALTIME_PROVIDER=mock|supabase-shadow` (default: `mock`)
- `STORAGE_PROVIDER=mock|supabase-shadow` (default: `mock`)

## N.1 Auth Shadow Mode

- Set `AUTH_PROVIDER=supabase-shadow`.
- Keep `lib/auth/mock.ts` behavior as source of truth.
- Add shadow-only telemetry and parity checks before enabling real Supabase session issuance.
- Rollback: set `AUTH_PROVIDER=mock`.

## N.2 Realtime Shadow Mode

- Set `REALTIME_PROVIDER=supabase-shadow`.
- Keep in-process emitter as delivery source while validating Supabase channel/topic mapping and payload contracts.
- Rollback: set `REALTIME_PROVIDER=mock`.

## N.3 Storage Shadow Mode

- Set `STORAGE_PROVIDER=supabase-shadow`.
- Keep data URL mock upload path while validating bucket naming, object keys, and ACL/policy assumptions.
- Rollback: set `STORAGE_PROVIDER=mock`.

## Parity Guardrail

- Track role flows for `customer`, `kitchen`, `driver`, and `admin` during each shadow rollout.
- Do not change user-visible behavior until explicit cutover approval.
