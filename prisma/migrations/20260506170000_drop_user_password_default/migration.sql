-- Remove insecure plaintext default password.
ALTER TABLE "User" ALTER COLUMN "password" DROP DEFAULT;
