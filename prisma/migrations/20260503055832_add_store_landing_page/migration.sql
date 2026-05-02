-- Adds agent-generated landing-page columns to Store. Pure additive
-- migration — existing stores keep landingBlocks=NULL and continue
-- to render via the generic product grid until an operator triggers
-- a page generation.

ALTER TABLE "Store"
  ADD COLUMN "landingBlocks"       JSONB,
  ADD COLUMN "landingTitle"        TEXT,
  ADD COLUMN "landingThemeVariant" TEXT,
  ADD COLUMN "landingGeneratedAt"  TIMESTAMP(3);
