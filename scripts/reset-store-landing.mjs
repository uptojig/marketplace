#!/usr/bin/env node
/**
 * Reset stuck landing-page generation state for a single store.
 *
 * Usage:
 *   node scripts/reset-store-landing.mjs <storeId>
 *
 * Use-case: the generation request timed out mid-flight, leaving
 * landingStatus="generating" with no agent to write the final state.
 * Admin UI then shows the spinner indefinitely. This clears every
 * landing field (blocks, status, error, brief, started_at,
 * generated_at, title, theme) so the form unblocks.
 */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const storeId = process.argv[2];
if (!storeId) {
  console.error("Usage: node scripts/reset-store-landing.mjs <storeId>");
  process.exit(1);
}

const before = await prisma.store.findUnique({
  where: { id: storeId },
  select: {
    id: true,
    name: true,
    slug: true,
    landingStatus: true,
    landingError: true,
    landingStartedAt: true,
    landingGeneratedAt: true,
  },
});
if (!before) {
  console.error(`Store ${storeId} not found.`);
  process.exit(1);
}
console.log("BEFORE:", JSON.stringify(before, null, 2));

const after = await prisma.store.update({
  where: { id: storeId },
  data: {
    landingBlocks: null,
    landingTitle: null,
    landingThemeVariant: null,
    landingGeneratedAt: null,
    landingStatus: null,
    landingError: null,
    landingBrief: null,
    landingStartedAt: null,
  },
  select: {
    id: true,
    landingStatus: true,
    landingStartedAt: true,
    landingGeneratedAt: true,
  },
});
console.log("\nAFTER:", JSON.stringify(after, null, 2));
console.log("\n✅ Cleared.");
await prisma.$disconnect();
