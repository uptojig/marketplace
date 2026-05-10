#!/usr/bin/env node
/**
 * Apply a React template to a store's landing page.
 *
 * Saves a `react_template_v1` schema into Store.landingBlocks so that
 * /stores/<slug> renders via that template instead of the default grid.
 *
 * Usage:
 *   node scripts/apply-react-template.mjs <storeSlug> <templateId> [featuredProductId]
 *
 * Examples:
 *   node scripts/apply-react-template.mjs mini-mops mini-mops-v1
 *   node scripts/apply-react-template.mjs mini-mops mini-mops-v1 ckxyz123
 *
 * Available templates (must match keys in
 * components/storefront/templates/registry.ts):
 *   - mini-mops-v1
 *   - caselnw-v1
 *
 * To revert: use scripts/reset-store-landing.mjs <storeId>
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const KNOWN_TEMPLATES = new Set(["mini-mops-v1", "caselnw-v1"]);

const [, , slug, templateId, featuredProductId] = process.argv;

if (!slug || !templateId) {
  console.error(
    "Usage: node scripts/apply-react-template.mjs <storeSlug> <templateId> [featuredProductId]",
  );
  console.error(
    `Known templates: ${[...KNOWN_TEMPLATES].join(", ")}`,
  );
  process.exit(1);
}

if (!KNOWN_TEMPLATES.has(templateId)) {
  console.error(
    `❌ Unknown template "${templateId}". Known: ${[...KNOWN_TEMPLATES].join(", ")}`,
  );
  process.exit(1);
}

const store = await prisma.store.findUnique({
  where: { slug },
  select: { id: true, name: true, slug: true, landingBlocks: true },
});

if (!store) {
  console.error(`❌ Store with slug "${slug}" not found.`);
  process.exit(1);
}

// Validate the featured product belongs to this store, if provided
if (featuredProductId) {
  const product = await prisma.product.findFirst({
    where: { id: featuredProductId, storeId: store.id },
    select: { id: true, title: true, titleTh: true },
  });
  if (!product) {
    console.error(
      `❌ Product "${featuredProductId}" not found in store "${slug}".`,
    );
    process.exit(1);
  }
  console.log(
    `   Featured product: ${product.titleTh ?? product.title} (${product.id})`,
  );
}

const schema = {
  type: "react_template_v1",
  template: templateId,
  ...(featuredProductId ? { featuredProductId } : {}),
};

console.log(`\nStore : ${store.name} (${store.slug})`);
console.log(`Schema:`, JSON.stringify(schema, null, 2));

await prisma.store.update({
  where: { id: store.id },
  data: {
    landingBlocks: schema,
    landingThemeVariant: null,
    landingTitle: null,
    landingGeneratedAt: new Date(),
  },
});

console.log(`\n✅ Applied "${templateId}" template to /stores/${store.slug}`);
console.log(`   Visit: http://localhost:3000/stores/${store.slug}`);

await prisma.$disconnect();
