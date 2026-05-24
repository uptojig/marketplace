-- Apply powerpuff678 logo brand colors:
--   primary  #FF458A  hot pink   (logo "Power" letter face + heart)
--   accent   #42A5F5  sky blue   (logo "Puff" letter face + character hair)
--
-- Idempotent: if the row does not exist the UPDATE is a no-op. Re-running
-- this migration cannot apply twice (prisma migrations are tracked).
UPDATE "Store"
SET "themeAccentOverride"  = '#FF458A',
    "themeAccentSecondary" = '#42A5F5'
WHERE "slug" = 'powerpuff678';
