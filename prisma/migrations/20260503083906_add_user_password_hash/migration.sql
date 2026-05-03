-- Add passwordHash for credential-based sign-in.
-- Existing OAuth + magic-link users have no password set; they continue
-- to authenticate via their linked Account row. Column is optional so
-- the migration is non-breaking.
ALTER TABLE "User" ADD COLUMN "passwordHash" TEXT;
