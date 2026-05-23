/**
 * One-off: set powerpuff678 brand colors to match the logo.
 *
 *   Primary  (CTA, FLASH SALE)     #FF458A  hot pink     (Power letters / heart)
 *   Accent   (icons, highlights)   #42A5F5  sky blue     (Puff letters / hair)
 *
 * Requires the migration `20260524000000_add_theme_accent_secondary` to be
 * applied first (adds `themeAccentSecondary` to Store).
 *
 * Run with:
 *   pnpm tsx scripts/set-powerpuff-brand-colors.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const updated = await prisma.store.update({
    where: { slug: 'powerpuff678' },
    data: {
      themeAccentOverride: '#FF458A',
      themeAccentSecondary: '#42A5F5',
    },
    select: {
      slug: true,
      name: true,
      themeAccentOverride: true,
      themeAccentSecondary: true,
    },
  });
  console.log('Updated:', updated);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
