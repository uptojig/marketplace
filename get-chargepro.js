const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function main() {
  const store = await prisma.store.findUnique({ where: { slug: "chargepro" } });
  console.log(JSON.stringify(store.landingBlocks, null, 2));
}
main();
