-- ============================================================================
-- Backfill landingThemeVariant for stores created before PR #102 + targeted
-- overrides for the operator-flagged stores (minimop24, petworld11, aowbao).
--
-- Run via:
--   psql "<connection-string>" -f scripts/backfill-theme-variant.sql
-- or paste into the DigitalOcean console → Database → Query tab.
--
-- Safe to re-run — each UPDATE is scoped by WHERE clause and idempotent.
-- ============================================================================

\echo '── BEFORE ──────────────────────────────────────────────'
SELECT
  slug,
  "templateId",
  "landingThemeVariant",
  "createdAt"::date AS created
FROM "Store"
WHERE "templateId" IS NOT NULL
ORDER BY "createdAt" DESC
LIMIT 30;

\echo ''
\echo '── 1. Backfill landingThemeVariant from templateId.group ──'

-- Trust group
UPDATE "Store" SET "landingThemeVariant" = 'trust'
 WHERE "landingThemeVariant" IS NULL
   AND "templateId" IN ('classic', 'official-brand', 'premium-luxury');

-- Fashion-beauty group
UPDATE "Store" SET "landingThemeVariant" = 'fashion-beauty'
 WHERE "landingThemeVariant" IS NULL
   AND "templateId" IN ('lookbook', 'beauty-swatch', 'boutique');

-- Electronics-tech group
UPDATE "Store" SET "landingThemeVariant" = 'electronics-tech'
 WHERE "landingThemeVariant" IS NULL
   AND "templateId" IN ('catalog-dense', 'tech-compare', 'single-product');

-- Lifestyle group
UPDATE "Store" SET "landingThemeVariant" = 'lifestyle'
 WHERE "landingThemeVariant" IS NULL
   AND "templateId" IN ('home-living', 'sport-active', 'kids-toys');

-- Community group
UPDATE "Store" SET "landingThemeVariant" = 'community'
 WHERE "landingThemeVariant" IS NULL
   AND "templateId" IN ('live-commerce', 'video-feed', 'storyteller');

-- Business-model group
UPDATE "Store" SET "landingThemeVariant" = 'business-model'
 WHERE "landingThemeVariant" IS NULL
   AND "templateId" IN ('wholesale-b2b', 'flash-deal', 'subscription');

-- Specialty group
UPDATE "Store" SET "landingThemeVariant" = 'specialty'
 WHERE "landingThemeVariant" IS NULL
   AND "templateId" IN ('handmade', 'vintage');

-- New themes (in case any store already picked them via templateId)
UPDATE "Store" SET "landingThemeVariant" = 'everyday'
 WHERE "landingThemeVariant" IS NULL
   AND "templateId" IN ('everyday-retail', 'consumer-retail');

UPDATE "Store" SET "landingThemeVariant" = 'taobao'
 WHERE "landingThemeVariant" IS NULL
   AND "templateId" IN ('taobao-style', 'marketplace-hot');

UPDATE "Store" SET "landingThemeVariant" = 'packaging'
 WHERE "landingThemeVariant" IS NULL
   AND "templateId" IN ('packaging-supply', 'packhub');

\echo ''
\echo '── 2. Targeted operator-confirmed overrides ──'

-- minimop24 → everyday (consumer-retail Shopee-style)
UPDATE "Store"
   SET "landingThemeVariant" = 'everyday'
 WHERE slug = 'minimop24';

-- petworld11 → pet-house (cute pink/cream kawaii)
UPDATE "Store"
   SET "landingThemeVariant" = 'pet-house'
 WHERE slug = 'petworld11';

-- aowbao → taobao (bold marketplace gradient — name match)
UPDATE "Store"
   SET "landingThemeVariant" = 'taobao'
 WHERE slug = 'aowbao';

\echo ''
\echo '── AFTER ──────────────────────────────────────────────'
SELECT
  slug,
  "templateId",
  "landingThemeVariant",
  CASE
    WHEN "landingThemeVariant" IS NULL THEN '⚠️  null'
    ELSE '✓ ' || "landingThemeVariant"
  END AS status
FROM "Store"
ORDER BY "createdAt" DESC
LIMIT 30;

\echo ''
\echo '── Variant distribution ──'
SELECT
  COALESCE("landingThemeVariant", '(null)') AS variant,
  COUNT(*) AS stores
FROM "Store"
GROUP BY "landingThemeVariant"
ORDER BY stores DESC;
