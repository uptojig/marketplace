-- Server-driven UI config column.
--
-- When `uiConfig` is non-null, the per-store storefront renders via the
-- data-driven BlockRenderer chain (lib/registry/block-registry.tsx) and
-- the family-detector / bespoke-adapter chain is skipped.
--
-- Purely additive — no existing row needs backfill. Legacy stores keep
-- rendering via the existing chain until the operator opts in by saving
-- a uiConfig value through the admin / vendor editor or the seed script.

ALTER TABLE "StoreLandingContent"
  ADD COLUMN "uiConfig" JSONB;
