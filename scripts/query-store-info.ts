import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const stores = await prisma.store.findMany({
    where: {
      slug: {
        in: ["volt-7-garage", "saidee-gadgets", "block-press"]
      }
    },
    select: {
      id: true,
      slug: true,
      name: true,
      templateId: true,
      landingThemeVariant: true,
    }
  });
  console.log("Stores found:", JSON.stringify(stores, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
