// Seed the Coupon table with the vendor template's mockCoupons so the
// /coupons page + cart picker have real data to render. Idempotent —
// upserts by code so running multiple times is safe.
//
// Run inside the marketplace-control container:
//   docker exec marketplace-control sh -c 'cd /app && node scripts/seed-coupons.js'

const { PrismaClient } = require("@prisma/client");

const days = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
};

const coupons = [
  {
    code: "WELCOME100",
    scope: { type: "platform" },
    discount: { kind: "fixed", amount: 100 },
    minSpendTHB: 500,
    validTo: days(30),
    newUsersOnly: true,
    title: "ลด ฿100 สำหรับสมาชิกใหม่",
    description: "ขั้นต่ำ ฿500 ใช้ได้ครั้งเดียวต่อสมาชิก",
    issuer: "Basketplace",
    colorScheme: "amber",
  },
  {
    code: "SAVE10",
    scope: { type: "platform" },
    discount: { kind: "percent", percent: 10, maxDiscount: 200 },
    minSpendTHB: 300,
    validTo: days(14),
    title: "ลด 10% สูงสุด ฿200",
    description: "ทุกร้านในเว็บ ใช้ได้ทั้งหมด",
    issuer: "Basketplace",
    colorScheme: "blue",
  },
  {
    code: "FREESHIP",
    scope: { type: "platform" },
    discount: { kind: "free_shipping" },
    minSpendTHB: 200,
    validTo: days(7),
    title: "ส่งฟรี ขั้นต่ำ ฿200",
    description: "ส่งฟรีทุกร้านที่ผ่านขั้นต่ำ",
    issuer: "Basketplace",
    colorScheme: "green",
  },
  {
    code: "BIG500",
    scope: { type: "platform" },
    discount: { kind: "fixed", amount: 500 },
    minSpendTHB: 3000,
    validTo: days(45),
    title: "ลด ฿500 ขั้นต่ำ ฿3,000",
    description: "สำหรับการช้อปแบบจัดเต็ม",
    issuer: "Basketplace",
    colorScheme: "purple",
  },
  {
    code: "FIRST200",
    scope: { type: "platform" },
    discount: { kind: "fixed", amount: 200 },
    minSpendTHB: 1000,
    validTo: days(60),
    newUsersOnly: true,
    title: "ลด ฿200 ครั้งแรก",
    description: "สำหรับสมาชิกใหม่ที่ยังไม่เคยซื้อ",
    issuer: "Basketplace",
    colorScheme: "red",
  },
  {
    code: "PROMPTPAY50",
    scope: { type: "platform" },
    discount: { kind: "fixed", amount: 50 },
    minSpendTHB: 250,
    requiredPaymentMethod: "PROMPTPAY",
    validTo: days(20),
    title: "ลด ฿50 จ่าย PromptPay",
    description: "ใช้ได้เฉพาะชำระผ่าน PromptPay QR",
    issuer: "Basketplace",
    colorScheme: "blue",
  },
];

(async () => {
  const p = new PrismaClient();
  let upserted = 0;
  for (const c of coupons) {
    await p.coupon.upsert({
      where: { code: c.code },
      create: c,
      update: {
        scope: c.scope,
        discount: c.discount,
        minSpendTHB: c.minSpendTHB,
        validTo: c.validTo,
        newUsersOnly: c.newUsersOnly ?? false,
        requiredPaymentMethod: c.requiredPaymentMethod ?? null,
        title: c.title,
        description: c.description,
        issuer: c.issuer,
        colorScheme: c.colorScheme,
        isActive: true,
      },
    });
    upserted++;
  }
  console.log(`upserted ${upserted} coupons`);
  const count = await p.coupon.count();
  console.log(`total coupons in DB: ${count}`);
  await p.$disconnect();
})();
