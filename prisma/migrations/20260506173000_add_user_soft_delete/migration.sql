ALTER TABLE "User"
ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "deletedAt" TIMESTAMP(3);

CREATE INDEX "User_isActive_email_idx" ON "User"("isActive", "email");
