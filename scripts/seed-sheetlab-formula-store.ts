// Idempotent seed for the sheetlab-formula sample store.
//
//   pnpm tsx scripts/seed-sheetlab-formula-store.ts
//
// Creates:
//   - vendor user  sheetlab@demo.basketplace.co
//   - store         sheetlab-th  ("เทมเพลตสูตร Excel โดย ชีตแล็บ")
//   - 6 DIGITAL/EXCEL products with promptSample disabled (file-based)
//
// Re-running is safe: store + products use unique constraints and are
// upserted, not duplicated. No DigitalAsset rows are seeded — the admin
// uploads the real .xlsx via /admin/products/[id] when ready.

import { PrismaClient, Role } from "@prisma/client";
import { templates } from "../lib/templates/registry";

const prisma = new PrismaClient();

const STORE_SLUG = "sheetlab-th";
const STORE_NAME = "Sheetlab — เทมเพลตสูตร Excel";
const VENDOR_EMAIL = "sheetlab@demo.basketplace.co";

const PRODUCTS: Array<{
  externalProductId: string;
  title: string;
  titleTh: string;
  descriptionTh: string;
  priceTHB: number;
  compareAtPriceTHB?: number;
  categoryName: string;
  imageUrl: string;
}> = [
  {
    externalProductId: "SHEETLAB-PNL-RETAIL",
    title: "Online Shop P&L Template",
    titleTh: "เทมเพลตบัญชี ร้านค้าออนไลน์ (P&L)",
    descriptionTh:
      "งบกำไรขาดทุนสำเร็จรูปสำหรับร้านค้าออนไลน์ขนาดเล็ก-กลาง · รองรับการบันทึกค่าโฆษณา ค่าส่ง ค่าธรรมเนียมแพลตฟอร์ม · กราฟสรุปอัตโนมัติ",
    priceTHB: 290,
    compareAtPriceTHB: 490,
    categoryName: "บัญชี · การเงิน",
    imageUrl: "https://picsum.photos/seed/sheetlab-pnl/600/400",
  },
  {
    externalProductId: "SHEETLAB-DASH-MULTI",
    title: "Multi-platform Sales Dashboard",
    titleTh: "Dashboard ติดตามยอดขาย Shopee/Lazada/TikTok Shop",
    descriptionTh:
      "รวมยอดขายจาก 3 แพลตฟอร์มในไฟล์เดียว · คำนวณ ROAS, ค่า GP, กำไรขั้นต้นอัตโนมัติ · มี Pivot Table พร้อมใช้",
    priceTHB: 590,
    compareAtPriceTHB: 890,
    categoryName: "แดชบอร์ด",
    imageUrl: "https://picsum.photos/seed/sheetlab-dash/600/400",
  },
  {
    externalProductId: "SHEETLAB-ROAS-CALC",
    title: "Ad ROAS Calculator",
    titleTh: "เครื่องคำนวณ ROAS โฆษณา (Meta + Google + TikTok)",
    descriptionTh:
      "กรอกค่าโฆษณา ยอดขาย และต้นทุนสินค้า · คำนวณ ROAS, BREAK-EVEN ROAS, ค่าโฆษณาต่อออเดอร์ (CPO) · ใช้ตัดสินใจสเกล/หยุดแคมเปญได้ทันที",
    priceTHB: 190,
    categoryName: "การตลาด",
    imageUrl: "https://picsum.photos/seed/sheetlab-roas/600/400",
  },
  {
    externalProductId: "SHEETLAB-INV-FIFO",
    title: "Inventory Tracker FIFO",
    titleTh: "Inventory tracker FIFO/LIFO · ติดตามสต็อกพร้อมต้นทุน",
    descriptionTh:
      "ระบบสต็อกแบบ FIFO ครบจบในไฟล์เดียว · บันทึกซื้อ-ขาย-โอน · คำนวณต้นทุนขายและสต็อกคงเหลือแบบ real-time · แจ้งเตือนสินค้าใกล้หมด",
    priceTHB: 390,
    categoryName: "คลังสินค้า",
    imageUrl: "https://picsum.photos/seed/sheetlab-inv/600/400",
  },
  {
    externalProductId: "SHEETLAB-TAX-WHT",
    title: "Thai Withholding Tax Calculator",
    titleTh: "เครื่องคำนวณ ภาษีหัก ณ ที่จ่าย (ภงด.3 / 53)",
    descriptionTh:
      "คำนวณภาษีหัก ณ ที่จ่ายตามประเภทเงินได้ · รองรับ ภงด.3, 53, 54 · สรุปยอดรายเดือนพร้อมเตรียมยื่นกรมสรรพากร · ใช้งานได้กับร้านค้านิติบุคคล",
    priceTHB: 250,
    categoryName: "ภาษี · บัญชี",
    imageUrl: "https://picsum.photos/seed/sheetlab-tax/600/400",
  },
  {
    externalProductId: "SHEETLAB-PAYROLL-SSO",
    title: "Payroll + Social Security Template",
    titleTh: "เทมเพลตคิดเงินเดือน + ประกันสังคม (สปส.1-10)",
    descriptionTh:
      "คำนวณเงินเดือน OT ค่าคอม หักประกันสังคม 5% (สูงสุด 750 บาท) · ภาษีบุคคลธรรมดาเบื้องต้น · พิมพ์ slip ออกจากไฟล์ได้เลย · เหมาะสำหรับ SME 1-30 คน",
    priceTHB: 490,
    compareAtPriceTHB: 790,
    categoryName: "HR · เงินเดือน",
    imageUrl: "https://picsum.photos/seed/sheetlab-payroll/600/400",
  },
];

async function main() {
  // Defensive check: template must be registered. Without it the store
  // would render the default chrome instead of sheetlab-formula's.
  if (!templates["sheetlab-formula"]) {
    throw new Error(
      "sheetlab-formula not registered in lib/templates/registry.ts",
    );
  }

  console.log(`Seeding sheetlab-formula store (slug: ${STORE_SLUG})…`);

  const vendor = await prisma.user.upsert({
    where: { email: VENDOR_EMAIL },
    update: { name: STORE_NAME, role: Role.VENDOR },
    create: { email: VENDOR_EMAIL, name: STORE_NAME, role: Role.VENDOR },
  });

  const store = await prisma.store.upsert({
    where: { slug: STORE_SLUG },
    update: {
      name: STORE_NAME,
      description:
        "เทมเพลตและสูตร Microsoft Excel สำเร็จรูปสำหรับเจ้าของร้านออนไลน์ ฟรีแลนซ์ และ SME · ดาวน์โหลดทันทีหลังชำระ · ปลดล็อกเซลล์ทุกช่อง แก้ไขได้เต็มที่",
      tagline: "Excel ที่พร้อมใช้ใน 1 นาที — ไม่ต้องเริ่มจากเซลล์ว่าง",
      templateId: "sheetlab-formula",
      primaryColor: "#107C41",
      contactEmail: "hello@sheetlab.demo",
      isActive: true,
      approvalStatus: "APPROVED",
      niche: "specialty",
      brandVoice: "formal",
    },
    create: {
      ownerId: vendor.id,
      slug: STORE_SLUG,
      name: STORE_NAME,
      description:
        "เทมเพลตและสูตร Microsoft Excel สำเร็จรูปสำหรับเจ้าของร้านออนไลน์ ฟรีแลนซ์ และ SME · ดาวน์โหลดทันทีหลังชำระ · ปลดล็อกเซลล์ทุกช่อง แก้ไขได้เต็มที่",
      tagline: "Excel ที่พร้อมใช้ใน 1 นาที — ไม่ต้องเริ่มจากเซลล์ว่าง",
      templateId: "sheetlab-formula",
      primaryColor: "#107C41",
      contactEmail: "hello@sheetlab.demo",
      isActive: true,
      approvalStatus: "APPROVED",
      niche: "specialty",
      brandVoice: "formal",
    },
  });

  console.log(`  store ${store.slug} ready (id: ${store.id})`);

  let created = 0;
  let updated = 0;
  for (const p of PRODUCTS) {
    const existing = await prisma.product.findFirst({
      where: { storeId: store.id, externalProductId: p.externalProductId },
      select: { id: true },
    });
    if (existing) {
      await prisma.product.update({
        where: { id: existing.id },
        data: {
          title: p.title,
          titleTh: p.titleTh,
          descriptionTh: p.descriptionTh,
          priceTHB: p.priceTHB,
          compareAtPriceTHB: p.compareAtPriceTHB ?? null,
          imageUrl: p.imageUrl,
          categoryName: p.categoryName,
          productType: "DIGITAL",
          digitalKind: "EXCEL",
          active: true,
        },
      });
      updated++;
      continue;
    }
    await prisma.product.create({
      data: {
        storeId: store.id,
        supplier: "MOCK",
        externalProductId: p.externalProductId,
        title: p.title,
        titleTh: p.titleTh,
        descriptionTh: p.descriptionTh,
        priceTHB: p.priceTHB,
        compareAtPriceTHB: p.compareAtPriceTHB ?? null,
        imageUrl: p.imageUrl,
        categoryName: p.categoryName,
        productType: "DIGITAL",
        digitalKind: "EXCEL",
        active: true,
      },
    });
    created++;
  }

  console.log(`  products: ${created} created, ${updated} updated`);
  console.log(`Done. Visit https://basketplace.co/stores/${STORE_SLUG}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
