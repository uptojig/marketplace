-- Adds nullable columns required by per-template themes (bikini-beach,
-- eco-pack, mega-store, fashion-beauty, trust, business-model, lifestyle,
-- electronics-tech, specialty, case-studio, pet-house, everyday, taobao,
-- packaging, community).
--
-- All columns are nullable or safely defaulted so existing rows keep
-- working with no backfill.

-- ── Store: vendor wizard + per-template dispatch ──
ALTER TABLE "Store"
  ADD COLUMN "niche"      TEXT,
  ADD COLUMN "brandVoice" TEXT DEFAULT 'casual',
  ADD COLUMN "templateId" TEXT,
  ADD COLUMN "paletteId"  TEXT;

-- ── Product: stock tracking + rich supplier metadata ──
ALTER TABLE "Product"
  ADD COLUMN "stockTotal"     INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "stockReserved"  INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "categorySlugs"  JSONB,
  ADD COLUMN "weightGrams"    INTEGER,
  ADD COLUMN "originCountry"  TEXT,
  ADD COLUMN "keyAttributes"  JSONB,
  ADD COLUMN "materials"      JSONB,
  ADD COLUMN "videoUrl"       TEXT,
  ADD COLUMN "hsCode"         TEXT;

-- ── ProductVariant: split labels + stock counters ──
ALTER TABLE "ProductVariant"
  ADD COLUMN "colorLabel"     TEXT,
  ADD COLUMN "sizeLabel"      TEXT,
  ADD COLUMN "materialLabel"  TEXT,
  ADD COLUMN "stockTotal"     INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "stockReserved"  INTEGER NOT NULL DEFAULT 0;
