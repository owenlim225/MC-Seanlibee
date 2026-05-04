# Follow-up: replacing mocks with real providers

This file mirrors every `TODO(real-keys:…)` comment in the repo. Before launch, wire real credentials and swap implementations in each `lib/*/index.ts` as noted below.

## Supabase Auth

| Tag | Location | Replace with |
| --- | --- | --- |
| `auth-mock-001` | `lib/auth/mock.ts` | Supabase Auth + `@supabase/ssr` cookie adapters; env `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`; docs: https://supabase.com/docs/guides/auth/server-side/nextjs |

## Supabase Postgres

| Tag | Location | Replace with |
| --- | --- | --- |
| *(migration)* | `prisma/schema.prisma`, migrations | Point `DATABASE_URL` at Supabase Postgres connection string; run `pnpm prisma migrate deploy` |

## Supabase Realtime

| Tag | Location | Replace with |
| --- | --- | --- |
| `realtime-supabase-001` | `lib/realtime/mock.ts` | Channel publish/subscribe via Supabase Realtime; server uses service role where appropriate |
| `realtime-supabase-002` | `lib/realtime/browser.ts` | Remove `BroadcastChannel`; subscribe with Supabase JS client |

## Supabase Storage

| Tag | Location | Replace with |
| --- | --- | --- |
| `storage-supabase-001` | `lib/storage/mock.ts` | Upload to bucket with signed URLs / policies; env bucket name + keys |

## Stripe

| Tag | Location | Replace with |
| --- | --- | --- |
| `stripe-checkout-001` | `lib/payments/mock.ts` | Stripe Checkout Sessions (`STRIPE_SECRET_KEY`) |
| `stripe-webhook-002` | `lib/payments/mock.ts` | Webhook handler route verifying `STRIPE_WEBHOOK_SECRET` |

---

Use:

```bash
rg "TODO\\(real-keys:" --glob '!docs/follow-up.md'
```

…to enumerate tags whenever this checklist changes.

## Last verified inventory (`rg`)

| Tag | File |
| --- | --- |
| `auth-mock-001` | `lib/auth/mock.ts:15` |
| `stripe-checkout-001` | `lib/payments/mock.ts:9` |
| `stripe-webhook-002` | `lib/payments/mock.ts:18` |
| `realtime-supabase-001` | `lib/realtime/mock.ts:9` |
| `realtime-supabase-002` | `lib/realtime/browser.ts:9` |
| `storage-supabase-001` | `lib/storage/mock.ts:2` |
