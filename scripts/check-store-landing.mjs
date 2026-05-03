#!/usr/bin/env node
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const id = process.argv[2];
if (!id) { console.error("Usage: node scripts/check-store-landing.mjs <storeId>"); process.exit(1); }
const s = await prisma.store.findUnique({
  where: { id },
  select: {
    id: true, name: true,
    landingStatus: true, landingError: true,
    landingBrief: true,
    landingStartedAt: true, landingGeneratedAt: true,
    landingTitle: true, landingThemeVariant: true,
  },
});
console.log(JSON.stringify(s, null, 2));
if (s?.landingStartedAt) {
  const ms = Date.now() - new Date(s.landingStartedAt).getTime();
  console.log(`landingStartedAt was ${Math.round(ms/1000)}s ago`);
}
await prisma.$disconnect();
