import { PrismaClient, Role } from "@prisma/client";
import { templates } from "../lib/templates/registry";

const prisma = new PrismaClient();

async function main() {
  console.log("Creating demo stores for all templates in registry...\n");

  const allTemplates = Object.values(templates);
  let createdCount = 0;
  let skippedCount = 0;

  for (const template of allTemplates) {
    const slug = `demo-${template.id}`;
    const name = `Demo: ${template.name}`;
    const vendorEmail = `vendor-${template.id}@demo.basketplace.co`;

    // Check if store already exists
    const existing = await prisma.store.findUnique({ where: { slug } });
    if (existing) {
      console.log(`  ↻ ${slug} already exists, skipping`);
      skippedCount++;
      continue;
    }

    // Upsert proxy vendor (1 user = 1 store)
    const proxyOwner = await prisma.user.upsert({
      where: { email: vendorEmail },
      update: { name, role: Role.VENDOR },
      create: { email: vendorEmail, name, role: Role.VENDOR },
    });

    // Check if this user already owns a store
    const existingOwnerStore = await prisma.store.findUnique({
      where: { ownerId: proxyOwner.id },
    });
    if (existingOwnerStore) {
      console.log(`  ↻ ${vendorEmail} already owns store ${existingOwnerStore.slug}, skipping`);
      skippedCount++;
      continue;
    }

    try {
      const store = await prisma.store.create({
        data: {
          ownerId: proxyOwner.id,
          slug,
          name,
          description: template.description,
          primaryColor: template.theme?.colors?.primary ?? "#2563eb",
          niche: template.group,
          brandVoice: "formal",
          templateId: template.id as any,
          landingThemeVariant: null,
          paletteId: "default",
          contactEmail: proxyOwner.email,
          approvalStatus: "APPROVED",
          isActive: true,
        },
      });

      // Seed sample products for the theme demo
      await prisma.product.createMany({
        data: [
          {
            storeId: store.id,
            supplier: "MOCK",
            externalProductId: `MOCK-${store.id}-1`,
            title: `สินค้าแนะนำ ${template.name}`,
            priceTHB: 1290,
            imageUrl: `https://picsum.photos/seed/${template.id}-1/400/400`,
            active: true,
          },
          {
            storeId: store.id,
            supplier: "MOCK",
            externalProductId: `MOCK-${store.id}-2`,
            title: `สินค้าพรีเมียม ${template.name}`,
            priceTHB: 2590,
            imageUrl: `https://picsum.photos/seed/${template.id}-2/400/400`,
            active: true,
          },
          {
            storeId: store.id,
            supplier: "MOCK",
            externalProductId: `MOCK-${store.id}-3`,
            title: `สินค้ายอดนิยม ${template.name}`,
            priceTHB: 890,
            imageUrl: `https://picsum.photos/seed/${template.id}-3/400/400`,
            active: true,
          },
          {
            storeId: store.id,
            supplier: "MOCK",
            externalProductId: `MOCK-${store.id}-4`,
            title: `สินค้าใหม่ ${template.name}`,
            priceTHB: 1790,
            imageUrl: `https://picsum.photos/seed/${template.id}-4/400/400`,
            active: true,
          },
        ],
      });

      console.log(`  ✅ ${slug}  →  /stores/${slug}`);
      createdCount++;
    } catch (e: any) {
      console.error(`  ❌ ${slug}: ${e.message}`);
    }
  }

  console.log(
    `\n🎉 Done! Created ${createdCount} demo stores, skipped ${skippedCount} existing.`
  );
  console.log(`   Total templates in registry: ${allTemplates.length}`);
  console.log(`   Browse at: http://localhost:3000/stores/demo-<template-id>`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
