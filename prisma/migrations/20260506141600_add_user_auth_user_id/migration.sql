-- Add Supabase Auth user linkage to app users.
-- Nullable to allow existing seeded/demo users without Supabase Auth accounts yet.
ALTER TABLE "User" ADD COLUMN "authUserId" text;

CREATE UNIQUE INDEX "User_authUserId_key" ON "User" ("authUserId");

