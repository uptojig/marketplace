import { PrismaClient, Supplier, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Demo vendors
  const alice = await prisma.user.upsert({
    where: { email: "alice@vendor.local" },
    update: { role: Role.VENDOR },
    create: { email: "alice@vendor.local", name: "Alice", role: Role.VENDOR },
  });

  const bob = await prisma.user.upsert({
    where: { email: "bob@vendor.local" },
    update: { role: Role.VENDOR },
    create: { email: "bob@vendor.local", name: "Bob", role: Role.VENDOR },
  });

  const aliceStore = await prisma.store.upsert({
    where: { ownerId: alice.id },
    update: {},
    create: {
      ownerId: alice.id,
      slug: "alice-gadgets",
      name: "Alice Gadgets",
      description: "Curated gadgets shipped from China.",
    },
  });

  const bobStore = await prisma.store.upsert({
    where: { ownerId: bob.id },
    update: {},
    create: {
      ownerId: bob.id,
      slug: "bob-fashion",
      name: "Bob Fashion",
      description: "Trendy apparel direct from suppliers.",
    },
  });

  const seedProducts = [
    { storeId: aliceStore.id, supplier: Supplier.MOCK, externalProductId: "MOCK-G001", title: "Wireless Earbuds Pro", priceTHB: 590, imageUrl: "https://picsum.photos/seed/g001/400/400" },
    { storeId: aliceStore.id, supplier: Supplier.MOCK, externalProductId: "MOCK-G002", title: "USB-C Fast Charger 65W", priceTHB: 390, imageUrl: "https://picsum.photos/seed/g002/400/400" },
    { storeId: aliceStore.id, supplier: Supplier.MOCK, externalProductId: "MOCK-G003", title: "Smart Watch Lite", priceTHB: 990, imageUrl: "https://picsum.photos/seed/g003/400/400" },
    { storeId: bobStore.id, supplier: Supplier.MOCK, externalProductId: "MOCK-F001", title: "Oversized Linen Shirt", priceTHB: 490, imageUrl: "https://picsum.photos/seed/f001/400/400" },
    { storeId: bobStore.id, supplier: Supplier.MOCK, externalProductId: "MOCK-F002", title: "Canvas Tote Bag", priceTHB: 290, imageUrl: "https://picsum.photos/seed/f002/400/400" },
    { storeId: bobStore.id, supplier: Supplier.MOCK, externalProductId: "MOCK-F003", title: "Minimal Sneakers", priceTHB: 1290, imageUrl: "https://picsum.photos/seed/f003/400/400" },
  ];

  for (const p of seedProducts) {
    await prisma.product.upsert({
      where: {
        // composite manual lookup: title within store is unique enough for seed
        id: `seed-${p.externalProductId}`,
      },
      update: {},
      create: {
        id: `seed-${p.externalProductId}`,
        storeId: p.storeId,
        supplier: p.supplier,
        externalProductId: p.externalProductId,
        title: p.title,
        priceTHB: p.priceTHB,
        imageUrl: p.imageUrl,
        description: `Demo seed product (${p.externalProductId}).`,
      },
    });
  }

  // Bulk-buyer coupon ladder — surfaced on BusinessModelCouponStrip on
  // every business-model storefront homepage. validTo set ~1 year out so
  // dev/preview envs don't expire mid-test; production should rotate.
  const oneYearOut = new Date();
  oneYearOut.setFullYear(oneYearOut.getFullYear() + 1);
  const bulkCoupons = [
    { code: "BULK10", percent: 10, minSpend: 0,     title: "ลด 10% ทุกออเดอร์ขายส่ง" },
    { code: "BULK15", percent: 15, minSpend: 5000,  title: "ลด 15% เมื่อยอดถึง ฿5,000" },
    { code: "BULK20", percent: 20, minSpend: 20000, title: "ลด 20% เมื่อยอดถึง ฿20,000" },
  ];
  for (const c of bulkCoupons) {
    await prisma.coupon.upsert({
      where: { code: c.code },
      update: {
        discount: { kind: "percent", percent: c.percent },
        minSpendTHB: c.minSpend || null,
        validTo: oneYearOut,
        isActive: true,
        title: c.title,
      },
      create: {
        code: c.code,
        scope: { type: "platform" },
        discount: { kind: "percent", percent: c.percent },
        minSpendTHB: c.minSpend || null,
        validTo: oneYearOut,
        title: c.title,
        issuer: "Basketplace",
        colorScheme: "red",
        isActive: true,
      },
    });
  }

  console.log("Seeded:", { alice: alice.email, bob: bob.email, products: seedProducts.length, coupons: bulkCoupons.length });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
