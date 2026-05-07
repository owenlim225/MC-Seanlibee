# Limitations and future work

**Audience:** Mixed technical panel.

Be explicit: this is an **MVP / teaching / demo** stack unless and until the items in `docs/follow-up.md` are implemented with real keys and policies.

---

## Current limitations (honest)

- **Payments:** No real card processing or signed Stripe webhooks — mock redirect + `simulateWebhook` only (`lib/payments/mock.ts`, `package.json` lacks Stripe SDK).
- **Auth provider:** Primary path is **email/password in Postgres** with `mc_session`; Supabase Auth is a documented swap, not the default (`docs/follow-up.md`, `lib/auth/provider.ts` shows adapter names `mock` | `supabase-shadow`).
- **No public REST/GraphQL API:** Integrations must go through the Next app or new routes would need to be added (no `route.ts` under `app/` today).
- **Cart durability:** Cart lives in cookies — lost if cleared, not shared across devices (`lib/cart-cookie` usage in customer actions).
- **Realtime & uploads:** Backed by mocks / in-process patterns per integration codemap (`docs/CODEMAPS/INTEGRATIONS.md`) — not production multi-tenant realtime or durable object storage without work.
- **Documentation drift risk:** Some codemap passages describe `middleware.ts` delegating to `lib/supabase/middleware.ts`; **actual** root `middleware.ts` uses `lib/auth/cookie` only. Treat **code** as authoritative for defense answers.
- **Operational depth:** Soft-delete and archive models exist in schema; full admin/audit behavior should be described only from code you have walked — not assumed from table names alone.

## Future work (already enumerated in-repo)

Use `docs/follow-up.md` as the checklist; high level:

- Wire **Supabase Auth** with SSR cookie adapters (`auth-mock-001`).
- Replace **mock realtime** with Supabase channels (`realtime-supabase-001/002`).
- Replace **mock storage** with bucket uploads + signed URLs (`storage-supabase-001`).
- Replace **mock Stripe** with Checkout + verified webhooks (`stripe-checkout-001`, `stripe-webhook-002`).

## Sensible “next steps” narrative for a panel

1. **Harden auth & sessions** — move from app-only users to IdP-backed auth if multi-device or OAuth is required.  
2. **Real payments** — checkout session + webhook-driven order state transitions (keeps `OrderStatus` machine but moves trust boundary to Stripe).  
3. **Observability** — structured logging around server actions and payment transitions (not deeply evidenced in schema; plan-level).  
4. **Optional API layer** — if a mobile client or partner integration appears, introduce explicit routes or tRPC/OpenAPI behind the same domain services.  

## Assumption callout

Listing “GDPR compliance” as the **purpose** of archive tables appears in internal codemap prose (`docs/CODEMAPS/DATABASE.md`); regulatory claims in a defense should stay **hypothetical** unless you implemented specific policies, retention jobs, and legal review — the schema supports snapshots; **it does not prove compliance.**
