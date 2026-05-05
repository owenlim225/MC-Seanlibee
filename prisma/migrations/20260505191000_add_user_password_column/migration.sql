-- Add password column for demo auth users.
ALTER TABLE "User"
ADD COLUMN "password" TEXT NOT NULL DEFAULT 'Demo123!';
