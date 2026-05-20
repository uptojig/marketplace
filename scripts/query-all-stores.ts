import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const stores = await prisma.store.findMany({
    select: {
      id: true,
      slug: true,
      name: true,
      templateId: true,
    }
  });
  console.log("All stores in DB:", JSON.stringify(stores, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
