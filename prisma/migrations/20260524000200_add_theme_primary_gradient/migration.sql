-- Per-store gradient override for --shop-primary-gradient. Accepts any valid
-- CSS background value (e.g. linear-gradient, radial-gradient, conic-gradient).
-- NULL = use the theme family's curated gradient (or stay undefined and rely
-- on the consuming theme's fallback to --shop-primary).
ALTER TABLE "Store" ADD COLUMN "themePrimaryGradient" TEXT;
