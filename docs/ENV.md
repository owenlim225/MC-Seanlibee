# Environment Variables

This project currently has no committed `.env.example`/`.env.template` source file.  
The table below is generated from runtime usage in application source (`app/`, `lib/`, `prisma/`).

<!-- AUTO-GENERATED: env:start -->
| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `AUTH_PROVIDER` | No | Selects auth backend (`mock` by default, `supabase-shadow` supported) | `supabase-shadow` |
| `DEMO_AUTH_ENABLED` | No | Enables demo auth in production when set to `"true"` | `true` |
| `DEMO_AUTH_PASSWORD` | Yes (prod demo auth) | Shared demo password for mock/demo login flows | `shared-demo-pw-9f8a` |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes (supabase-shadow mode) | Supabase project URL used by Supabase clients | `https://xyzcompany.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes (supabase-shadow mode) | Supabase public anon key used by Supabase clients | `eyJ...` |
| `NODE_ENV` | No | Runtime environment (`development`/`production`) | `production` |
| `REALTIME_PROVIDER` | No | Selects realtime backend (`mock` default, `supabase-shadow` optional) | `supabase-shadow` |
| `SEED_AUTH_PASSWORD` | Yes (prod seeding) | Password used by Prisma seed in production mode | `Demo123!` |
| `SESSION_SECRET` | Yes (production, min 32 chars) | Secret used for session signing/encryption | `replace-with-at-least-32-random-chars` |
| `STORAGE_PROVIDER` | No | Selects storage backend (`mock` default, `supabase-shadow` optional) | `supabase-shadow` |
<!-- AUTO-GENERATED: env:end -->

## Notes

- In production, `SESSION_SECRET` must be set to at least 32 characters.
- In production seeding workflows, `SEED_AUTH_PASSWORD` must be set.
- In development, `DEMO_AUTH_ENABLED` does not disable demo auth; non-production mode enables demo auth by default.
- To make this document fully source-of-truth generated, add a committed `.env.example`.
