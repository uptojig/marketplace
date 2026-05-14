-- Rich CJ product metadata + split-out variant labels.
--
-- All columns are nullable / defaulted so the migration is purely
-- additive — existing rows (created before this migration) load
-- unchanged. The admin-triggered backfill (lib/admin/backfill-cj-images.ts)
-- and the re-run of enrich are how operators populate them for already-
-- imported products; new imports get them filled at write time.
--
-- DO NOT run this against prod via `prisma migrate deploy` until the
-- PR is reviewed. The migration is generated with `--create-only`
-- (per the project convention used in earlier additive migrations);
-- production application is handled by the deploy workflow once the
-- PR ships.

-- ─────────────────────────────────────────────────────────────
-- 1. Product — rich CJ metadata
-- ─────────────────────────────────────────────────────────────
ALTER TABLE "Product"
  ADD COLUMN "weightGrams"   INTEGER,
  ADD COLUMN "originCountry" TEXT,
  ADD COLUMN "keyAttributes" JSONB,
  ADD COLUMN "materials"     JSONB,
  ADD COLUMN "videoUrl"      TEXT,
  ADD COLUMN "hsCode"        TEXT;

-- ─────────────────────────────────────────────────────────────
-- 2. ProductVariant — split color / size / material out of the
--    `attributes` blob so the PDP picker can render them in
--    separate UI rows. `attributes` is kept for back-compat.
-- ─────────────────────────────────────────────────────────────
ALTER TABLE "ProductVariant"
  ADD COLUMN "colorLabel"    TEXT,
  ADD COLUMN "sizeLabel"     TEXT,
  ADD COLUMN "materialLabel" TEXT;
