-- Editable storefront content (per-store, 1:1 with Store).
--
-- Adapters read each slot at render time and fall back to template
-- defaults when the column is NULL. Operators / owners edit via the
-- admin and vendor "Landing content" editors.
--
-- Purely additive: no existing rows are touched and no existing
-- code paths require this table to exist (legacy stores render the
-- generic catalog as before until they opt-in by saving content).

CREATE TABLE "StoreLandingContent" (
  "storeId" TEXT NOT NULL,

  -- Hero
  "heroHeadline"      TEXT,
  "heroSubheadline"   TEXT,
  "heroCtaLabel"      TEXT,
  "heroCtaUrl"        TEXT,
  "heroImageUrl"      TEXT,
  "heroVideoUrl"      TEXT,
  "heroAlignment"     TEXT DEFAULT 'center',

  -- Announcement strip
  "announcementMessage"       TEXT,
  "announcementMessageMobile" TEXT,
  "announcementLinkUrl"       TEXT,
  "announcementEnabled"       BOOLEAN NOT NULL DEFAULT true,

  -- About / brand story
  "aboutHeading"  TEXT,
  "aboutBody"     TEXT,
  "aboutImageUrl" TEXT,
  "aboutVideoUrl" TEXT,

  -- Repeatables (validated in app code via Zod schemas in lib/store/landing-content.ts)
  "featuredTiles" JSONB,
  "ctaBlocks"     JSONB,
  "faqItems"      JSONB,
  "testimonials"  JSONB,

  -- Fine-grain colour layer on top of paletteId
  "colorOverrides" JSONB,

  -- Bespoke per-template overflow bag
  "extras" JSONB,

  "updatedAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "StoreLandingContent_pkey" PRIMARY KEY ("storeId")
);

ALTER TABLE "StoreLandingContent"
  ADD CONSTRAINT "StoreLandingContent_storeId_fkey"
  FOREIGN KEY ("storeId") REFERENCES "Store"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
