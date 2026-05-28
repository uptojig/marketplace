/**
 * One-shot seed: create the 5 EduClassroom worksheet-set products on the
 * `level99` store from an extracted folder tree.
 *
 *   pnpm tsx scripts/seed-level99.ts <rootDir>
 *
 * Expected layout (one sub-folder per product, ~10 PDFs + ~10 PNGs):
 *   <rootDir>/พยัญชนะไทย ก-ฮ/พยัญชนะไทย ก-ฮ_1.pdf ... _10.pdf + _1.png ...
 *   <rootDir>/แบบฝึกอ่าน ABC/...
 *   ...
 *
 * Modeling: 1 folder = 1 DIGITAL product (digitalKind=EBOOK).
 *   - PDFs   → private DigitalAssets (the paid download — the full set).
 *   - PNG_1  → public product cover image.
 *   - PNG_2.. → public gallery images (capped at 5).
 *
 * Idempotent: products keyed by externalProductId, assets by
 * (productId, fileName), images by fixedKey — re-running updates rather
 * than duplicating.
 *
 * Requires env: DATABASE_URL, SPACES_ENDPOINT/REGION/BUCKET/KEY/SECRET.
 * Designed to run inside the marketplace container on the droplet so it
 * inherits production env (same as seed-bulk-excel-templates.ts).
 */
import { readdir, readFile, stat } from "node:fs/promises";
import * as path from "node:path";
import { PrismaClient } from "@prisma/client";
import { uploadBuffer, isSpacesConfigured } from "../lib/storage/spaces";

const prisma = new PrismaClient();

const STORE_SLUG = "level99";
const MAX_GALLERY = 5;

interface ProductEntry {
  /** Exact sub-folder name in the zip. */
  folder: string;
  externalProductId: string; // stable idempotency key
  title: string;
  titleTh: string;
  descriptionTh: string;
  categoryName: string;
  priceTHB: number;
}

const CATALOG: ProductEntry[] = [
  {
    folder: "พยัญชนะไทย ก-ฮ",
    externalProductId: "level99-th-consonants",
    title: "Thai Consonants ก-ฮ Worksheet Set",
    titleTh: "พยัญชนะไทย ก-ฮ (ชุดฝึก 10 แผ่น)",
    descriptionTh:
      "ชุดใบงานฝึกเขียน-อ่านพยัญชนะไทย ก-ฮ 10 แผ่น ไฟล์ PDF พร้อมพิมพ์ A4 เหมาะกับอนุบาล–ป.1 ดาวน์โหลดได้ทันทีหลังชำระเงิน",
    categoryName: "ภาษาไทย",
    priceTHB: 49,
  },
  {
    folder: "แบบฝึกอ่าน ABC",
    externalProductId: "level99-abc-reading",
    title: "ABC Reading Practice Worksheet Set",
    titleTh: "แบบฝึกอ่าน ABC (ชุด 10 แผ่น)",
    descriptionTh:
      "ชุดแบบฝึกอ่านตัวอักษรภาษาอังกฤษ A-Z 10 แผ่น ไฟล์ PDF พร้อมพิมพ์ ฝึกอ่าน-ออกเสียง เหมาะกับอนุบาล–ป.2",
    categoryName: "ภาษาอังกฤษ",
    priceTHB: 45,
  },
  {
    folder: "40 คำศัพท์ผลไม้",
    externalProductId: "level99-fruit-vocab",
    title: "40 Fruit Vocabulary Flashcards",
    titleTh: "40 คำศัพท์ผลไม้ (ชุด 10 แผ่น)",
    descriptionTh:
      "บัตรคำ-ใบงานคำศัพท์ผลไม้ภาษาอังกฤษ 40 คำ 10 แผ่น ไฟล์ PDF พร้อมพิมพ์ ภาพประกอบสีสันสดใส",
    categoryName: "ภาษาอังกฤษ",
    priceTHB: 39,
  },
  {
    folder: "คำศัพท์สัตว์ป่า",
    externalProductId: "level99-wildanimal-vocab",
    title: "Wild Animal Vocabulary Flashcards",
    titleTh: "คำศัพท์สัตว์ป่า (ชุด 10 แผ่น)",
    descriptionTh:
      "บัตรคำ-ใบงานคำศัพท์สัตว์ป่าภาษาอังกฤษ 10 แผ่น ไฟล์ PDF พร้อมพิมพ์ ภาพประกอบน่ารัก",
    categoryName: "ภาษาอังกฤษ",
    priceTHB: 39,
  },
  {
    folder: "สูตรคูณ",
    externalProductId: "level99-multiplication",
    title: "Multiplication Tables Worksheet Set",
    titleTh: "สูตรคูณ (ชุดฝึก 10 แผ่น)",
    descriptionTh:
      "ชุดใบงานฝึกท่องและเขียนสูตรคูณ แม่ 2-12 10 แผ่น ไฟล์ PDF พร้อมพิมพ์ A4 เหมาะกับ ป.2–ป.4",
    categoryName: "คณิตศาสตร์",
    priceTHB: 35,
  },
];

/** Natural numeric sort: name_1, name_2, ..., name_10. */
function naturalSort(a: string, b: string): number {
  const na = parseInt(a.match(/(\d+)(?=\.\w+$)/)?.[1] ?? "0", 10);
  const nb = parseInt(b.match(/(\d+)(?=\.\w+$)/)?.[1] ?? "0", 10);
  return na - nb || a.localeCompare(b);
}

/** Real files only — drop macOS resource forks (._x) and .DS_Store. */
function isRealFile(name: string): boolean {
  return !name.startsWith("._") && name !== ".DS_Store";
}

async function listFiles(dir: string, ext: RegExp): Promise<string[]> {
  const entries = await readdir(dir);
  return entries.filter((f) => isRealFile(f) && ext.test(f)).sort(naturalSort);
}

async function main() {
  const rootDir = process.argv[2];
  if (!rootDir) {
    console.error("Usage: pnpm tsx scripts/seed-level99.ts <rootDir>");
    process.exit(1);
  }
  if (!isSpacesConfigured()) {
    console.error("Spaces not configured — need SPACES_* env");
    process.exit(1);
  }

  const store = await prisma.store.findUnique({
    where: { slug: STORE_SLUG },
    select: { id: true, slug: true },
  });
  if (!store) {
    console.error(`Store "${STORE_SLUG}" not found`);
    process.exit(1);
  }
  console.log(`Store: ${store.slug} (${store.id})`);

  let created = 0;
  let updated = 0;
  let assetsUploaded = 0;
  let assetsSkipped = 0;

  for (const entry of CATALOG) {
    const dir = path.join(rootDir, entry.folder);
    try {
      const s = await stat(dir);
      if (!s.isDirectory()) throw new Error("not a dir");
    } catch {
      console.warn(`! Skipping "${entry.folder}" — folder not found in ${rootDir}`);
      continue;
    }

    const pdfs = await listFiles(dir, /\.pdf$/i);
    const pngs = await listFiles(dir, /\.png$/i);
    if (pdfs.length === 0) {
      console.warn(`! Skipping "${entry.folder}" — no PDF files`);
      continue;
    }
    console.log(`\n→ ${entry.titleTh} (${pdfs.length} pdf, ${pngs.length} png)`);

    // ── Cover + gallery images (public) ──
    let imageUrl: string | null = null;
    const galleryUrls: string[] = [];
    for (let i = 0; i < Math.min(pngs.length, 1 + MAX_GALLERY); i++) {
      const buf = await readFile(path.join(dir, pngs[i]));
      const { publicUrl } = await uploadBuffer({
        prefix: `products/${STORE_SLUG}`,
        filename: `${entry.externalProductId}-${i}.png`,
        contentType: "image/png",
        body: buf,
        fixedKey: `products/${STORE_SLUG}/${entry.externalProductId}-${i}.png`,
      });
      if (i === 0) imageUrl = publicUrl;
      else galleryUrls.push(publicUrl);
    }

    // ── Upsert product ──
    const existing = await prisma.product.findFirst({
      where: { storeId: store.id, externalProductId: entry.externalProductId },
      select: { id: true },
    });
    const data = {
      title: entry.title,
      titleTh: entry.titleTh,
      descriptionTh: entry.descriptionTh,
      priceTHB: entry.priceTHB,
      imageUrl,
      galleryUrls: galleryUrls.length > 0 ? galleryUrls : undefined,
      categoryName: entry.categoryName,
      productType: "DIGITAL" as const,
      digitalKind: "EBOOK" as const,
      active: true,
    };
    let productId: string;
    if (existing) {
      await prisma.product.update({ where: { id: existing.id }, data });
      productId = existing.id;
      updated++;
    } else {
      const p = await prisma.product.create({
        data: {
          storeId: store.id,
          supplier: "MOCK",
          externalProductId: entry.externalProductId,
          ...data,
        },
      });
      productId = p.id;
      created++;
    }

    // ── PDF assets (private — the paid download) ──
    for (const pdf of pdfs) {
      const already = await prisma.digitalAsset.findFirst({
        where: { productId, fileName: pdf },
        select: { id: true },
      });
      if (already) {
        assetsSkipped++;
        continue;
      }
      const buf = await readFile(path.join(dir, pdf));
      const { key } = await uploadBuffer({
        prefix: `digital-assets/${productId}`,
        filename: pdf,
        contentType: "application/pdf",
        body: buf,
        private: true,
        fixedKey: `digital-assets/${productId}/${entry.externalProductId}-${pdf}`,
      });
      await prisma.digitalAsset.create({
        data: {
          productId,
          fileName: pdf,
          fileFormat: "pdf",
          fileSizeMB: +(buf.length / 1024 / 1024).toFixed(2),
          storageKey: key,
          isPreview: false,
        },
      });
      assetsUploaded++;
    }
    console.log(`  ✓ product ${productId} — ${pdfs.length} PDF assets`);
  }

  console.log(
    `\nDone: ${created} created, ${updated} updated · assets ${assetsUploaded} uploaded, ${assetsSkipped} already existed`,
  );
  console.log(`Visit https://basketplace.co/stores/${STORE_SLUG}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
