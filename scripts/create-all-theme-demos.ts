import { PrismaClient, Role } from "@prisma/client";
import { templates } from "../lib/templates/registry";

const prisma = new PrismaClient();

async function main() {
  console.log("Creating demo stores for all templates in registry...");
  
  // Ensure we have a demo admin
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@demo.basketplace.co" },
    update: { role: Role.ADMIN },
    create: { email: "admin@demo.basketplace.co", name: "Demo Admin", role: Role.ADMIN },
  });

  const allTemplates = Object.values(templates);
  let createdCount = 0;

  for (const template of allTemplates) {
    const slug = `demo-${template.id}`;
    const name = `Demo: ${template.name}`;
    
    // Create a proxy user (vendor) for this store, so each store has a unique owner
    // which allows the admin to view it. 1 user = 1 store.
    const proxyOwner = await prisma.user.create({
      data: {
        email: `vendor-${template.id}@demo.basketplace.co`,
        name: name,
        role: Role.VENDOR,
      },
    });

    try {
      const store = await prisma.store.create({
        data: {
          ownerId: proxyOwner.id,
          slug,
          name,
          description: template.description,
          primaryColor: template.theme.colors.primary,
          niche: template.group,
          brandVoice: "formal",
          templateId: template.id as any,
          landingThemeVariant: null, 
          paletteId: "default",
          contactEmail: proxyOwner.email,
        },
      });

      // Seed 2 basic products for the theme demo
      await prisma.product.createMany({
        data: [
          {
            id: `seed-${store.id}-1`,
            storeId: store.id,
            supplier: "MOCK",
            externalProductId: `MOCK-${store.id}-1`,
            title: `Featured Product for ${template.name}`,
            priceTHB: 1290,
            imageUrl: "https://picsum.photos/seed/demo1/400/400",
            active: true,
          },
          {
            id: `seed-${store.id}-2`,
            storeId: store.id,
            supplier: "MOCK",
            externalProductId: `MOCK-${store.id}-2`,
            title: `Premium Item for ${template.name}`,
            priceTHB: 2590,
            imageUrl: "https://picsum.photos/seed/demo2/400/400",
            active: true,
          }
        ]
      });

      console.log(`✅ Created store: ${name} (slug: ${slug})`);
      createdCount++;
    } catch (e) {
      console.error(`❌ Failed to create store ${name}:`, e.message);
    }
  }

  console.log(`\n🎉 Done! Created ${createdCount} demo stores.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
