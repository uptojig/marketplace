-- Slice 2: agent-generation lifecycle columns. Pure additive.
ALTER TABLE "Store"
  ADD COLUMN "landingStatus"     TEXT,
  ADD COLUMN "landingError"      TEXT,
  ADD COLUMN "landingBrief"      TEXT,
  ADD COLUMN "landingStartedAt"  TIMESTAMP(3);
