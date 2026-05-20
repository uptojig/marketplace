import { prisma } from "./lib/prisma";
async function test() {
  const stores = await prisma.store.findMany({ select: { slug: true, name: true, id: true } });
  console.log(stores);
}
test();
