-- Two-color brand override: when set together with themeAccentOverride,
-- themeAccentOverride paints --shop-primary and themeAccentSecondary paints
-- --shop-accent. Backwards compatible — when secondary is NULL the existing
-- single-color override (paint both) is preserved.
ALTER TABLE "Store" ADD COLUMN "themeAccentSecondary" TEXT;
