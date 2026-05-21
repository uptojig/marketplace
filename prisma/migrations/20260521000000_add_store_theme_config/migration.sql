-- Curated theme system (Phase 3): per-store section layout + intentional accent override.
-- Additive + nullable. Applied to production manually ahead of this file via a
-- one-off script (idempotent); `IF NOT EXISTS` keeps `prisma migrate deploy` a safe
-- no-op on prod while still creating the columns on a fresh database.
ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS "themeConfig" JSONB;
ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS "themeAccentOverride" TEXT;
