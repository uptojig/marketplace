-- Backfill Store.templateId, Store.landingThemeVariant, and Store.brandVoice
-- for stores created before the wizard v2 (and stores created via the admin
-- route) so the storefront stops falling through to the generic product grid
-- ("ดูเหมือนกันหมด" — every shop looked identical).
--
-- Sources of truth:
--   • prisma/schema.prisma (Store model, fields: templateId, paletteId, niche,
--     brandVoice, landingThemeVariant, landingBlocks).
--   • lib/templates/registry.ts — 26 templates with their `group` (used here as
--     the canonical landingThemeVariant value for the family-detector chain).
--   • lib/landing/legacy-slug-template.ts — LEGACY_SLUG_TEMPLATE map for the
--     four pre-wizard slugs (bikini551, powerpuff678, ergobodies, zugarbox).
--   • lib/landing/*.ts family detectors — each VARIANT_VALUES set lists the
--     variant strings we accept; we mirror those here for the variant→template
--     direction.
--
-- All UPDATEs are idempotent: every write is guarded by an IS NULL (or empty
-- string) predicate on the column being set, so re-running the migration is a
-- no-op for rows already configured correctly by an operator.
--
-- No DDL — pure data backfill. Columns stay nullable.

-- ── 1. Slug-based templateId backfill ─────────────────────────────────────
-- Four pre-wizard legacy slugs whose templates are pinned by URL (see
-- lib/landing/legacy-slug-template.ts → LEGACY_SLUG_TEMPLATE).

-- bikini551 is the original swimwear shop; force the bikini-beach template.
UPDATE "Store" SET "templateId" = 'bikini-beach' WHERE "slug" = 'bikini551'    AND "templateId" IS NULL;
-- powerpuff678 is the kids/toys shop; pin to the kids-toys template.
UPDATE "Store" SET "templateId" = 'kids-toys'    WHERE "slug" = 'powerpuff678' AND "templateId" IS NULL;
-- ergobodies sells sport/active gear; pin to the sport-active template.
UPDATE "Store" SET "templateId" = 'sport-active' WHERE "slug" = 'ergobodies'   AND "templateId" IS NULL;
-- zugarbox is a handmade/craft shop; pin to the handmade template.
UPDATE "Store" SET "templateId" = 'handmade'     WHERE "slug" = 'zugarbox'     AND "templateId" IS NULL;

-- ── 2. landingThemeVariant → templateId backfill ──────────────────────────
-- For stores where an operator (or the agent) set landingThemeVariant but
-- templateId is still NULL, pick a sensible representative template from the
-- variant's family so the renderer dispatches to a real template instead of
-- the generic product grid.
UPDATE "Store"
SET "templateId" = CASE "landingThemeVariant"
  WHEN 'fashion-beauty'   THEN 'lookbook'
  WHEN 'B'                THEN 'lookbook'
  WHEN 'trust'            THEN 'classic'
  WHEN 'C'                THEN 'classic'
  WHEN 'business-model'   THEN 'flash-deal'
  WHEN 'lifestyle'        THEN 'home-living'
  WHEN 'A'                THEN 'home-living'
  WHEN 'G'                THEN 'home-living'
  WHEN 'electronics-tech' THEN 'catalog-dense'
  WHEN 'E'                THEN 'catalog-dense'
  WHEN 'specialty'        THEN 'handmade'
  WHEN 'H'                THEN 'handmade'
  WHEN 'packaging'        THEN 'packaging-supply'
  WHEN 'taobao'           THEN 'taobao-style'
  WHEN 'community'        THEN 'storyteller'
  WHEN 'everyday'         THEN 'everyday-retail'
  WHEN 'minimal'          THEN 'classic'
  WHEN 'cute'             THEN 'kids-toys'
  -- Defensive: any future variant added to the IN-list below but not the
  -- CASE above keeps its current templateId instead of being NULLed.
  ELSE "templateId"
END
WHERE "templateId" IS NULL
  AND "landingThemeVariant" IN (
    'fashion-beauty', 'B',
    'trust', 'C',
    'business-model',
    'lifestyle', 'A', 'G',
    'electronics-tech', 'E',
    'specialty', 'H',
    'packaging',
    'taobao',
    'community',
    'everyday',
    'minimal',
    'cute'
  );

-- ── 3. templateId → landingThemeVariant backfill ──────────────────────────
-- Reverse direction: if templateId is set but landingThemeVariant is missing
-- (or an empty string), set the variant to the template's canonical group so
-- the family-detector chain in lib/landing/*.ts has a consistent fallback.
UPDATE "Store"
SET "landingThemeVariant" = CASE "templateId"
  -- group: trust
  WHEN 'classic'          THEN 'trust'
  WHEN 'official-brand'   THEN 'trust'
  WHEN 'premium-luxury'   THEN 'trust'
  -- group: fashion-beauty
  WHEN 'lookbook'         THEN 'fashion-beauty'
  WHEN 'beauty-swatch'    THEN 'fashion-beauty'
  WHEN 'boutique'         THEN 'fashion-beauty'
  WHEN 'bikini-beach'     THEN 'fashion-beauty'
  -- group: electronics-tech
  WHEN 'catalog-dense'    THEN 'electronics-tech'
  WHEN 'tech-compare'     THEN 'electronics-tech'
  WHEN 'single-product'   THEN 'electronics-tech'
  -- group: lifestyle
  WHEN 'home-living'      THEN 'lifestyle'
  WHEN 'sport-active'     THEN 'lifestyle'
  WHEN 'kids-toys'        THEN 'lifestyle'
  WHEN 'mega-store'       THEN 'lifestyle'
  -- group: community
  WHEN 'live-commerce'    THEN 'community'
  WHEN 'video-feed'       THEN 'community'
  WHEN 'storyteller'      THEN 'community'
  -- group: business-model
  WHEN 'wholesale-b2b'    THEN 'business-model'
  WHEN 'flash-deal'       THEN 'business-model'
  WHEN 'subscription'     THEN 'business-model'
  WHEN 'eco-pack'         THEN 'business-model'
  -- group: specialty
  WHEN 'handmade'         THEN 'specialty'
  WHEN 'vintage'          THEN 'specialty'
  -- group: everyday
  WHEN 'everyday-retail'  THEN 'everyday'
  -- group: taobao
  WHEN 'taobao-style'     THEN 'taobao'
  -- group: packaging
  WHEN 'packaging-supply' THEN 'packaging'
  -- Defensive: any future templateId added to the IN-list below but not
  -- the CASE above keeps its current variant instead of being NULLed.
  ELSE "landingThemeVariant"
END
WHERE ("landingThemeVariant" IS NULL OR "landingThemeVariant" = '')
  AND "templateId" IN (
    'classic', 'official-brand', 'premium-luxury',
    'lookbook', 'beauty-swatch', 'boutique', 'bikini-beach',
    'catalog-dense', 'tech-compare', 'single-product',
    'home-living', 'sport-active', 'kids-toys', 'mega-store',
    'live-commerce', 'video-feed', 'storyteller',
    'wholesale-b2b', 'flash-deal', 'subscription', 'eco-pack',
    'handmade', 'vintage',
    'everyday-retail',
    'taobao-style',
    'packaging-supply'
  );

-- ── 4. niche backfill — intentionally skipped ────────────────────────────
-- No clean deterministic signal exists for niche on legacy rows; leave NULL
-- so the wizard / admin UI prompts the operator next time.

-- ── 5. brandVoice default ────────────────────────────────────────────────
-- The column default ('casual') only applies to INSERTs; rows that pre-date
-- the column may have NULL. Normalize so downstream code can rely on a
-- non-null value without defensive coalescing.
UPDATE "Store" SET "brandVoice" = 'casual' WHERE "brandVoice" IS NULL;
