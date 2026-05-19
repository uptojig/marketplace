-- S1_DGA_REVIEW: add provenance columns so we can show the original
-- OCR-extracted value alongside the (possibly edited) current value,
-- and log who/when changes happened. Cross-match continues to use the
-- current `value` column.
ALTER TABLE "dga_fields"
  ADD COLUMN "original_value"  TEXT,
  ADD COLUMN "edited_by_user"  BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "edited_at"       TIMESTAMP(3);
