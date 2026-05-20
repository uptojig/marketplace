const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function main() {
  const stores = await prisma.store.findMany({ select: { slug: true } });
  console.log(stores.map(s => s.slug).join(", "));
}
main();
