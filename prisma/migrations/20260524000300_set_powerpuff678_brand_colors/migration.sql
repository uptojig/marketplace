-- Apply powerpuff678 logo + design-mock brand colors:
--   primary   #FF458A  hot pink   (logo "Power" letters + heart + search btn)
--   accent    #FFD600  golden yellow  (FLASH SALE / CTA / lightning icon)
--   gradient  pink -> purple  (hero / section header strips / chips)
--
-- Re-running this migration is a no-op (prisma migration tracking + WHERE clause).
UPDATE "Store"
SET "themeAccentOverride"   = '#FF458A',
    "themeAccentSecondary"  = '#FFD600',
    "themePrimaryGradient"  = 'linear-gradient(135deg, #FF458A 0%, #C026D3 50%, #9333EA 100%)'
WHERE "slug" = 'powerpuff678';
