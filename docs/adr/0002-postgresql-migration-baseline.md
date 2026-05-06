# ADR 0002: PostgreSQL migration baseline

## Context

Legacy migrations targeted SQLite (`migration_lock.toml`, SQLite DDL) while `schema.prisma` uses PostgreSQL. That mismatch prevented `prisma migrate deploy` on Supabase.

## Decision

Squash to a single baseline migration (`20260506120000_baseline_postgresql`) generated from the current schema. Historical SQLite revisions were discarded in Git history going forward; production-like databases should apply only this PostgreSQL chain.

## Consequences

- New environments (CI, Supabase, local Postgres) run `migrate deploy` once against the baseline SQL.
- Developers on old local SQLite files must recreate DB against Postgres (see README).
