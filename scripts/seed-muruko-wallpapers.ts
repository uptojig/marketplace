// Idempotent seed: upload `วอเปเปอร์` ZIP contents to DO Spaces +
// create the matching DIGITAL products on the muruko storefront.
//
//   pnpm tsx scripts/seed-muruko-wallpapers.ts <path-to-extracted-folder> [--dry-run]
//
// Layout the script expects (one subfolder per category):
//
//   <root>/
//     ยันต์/
//       ยันต์มหาเกาะเพชรหนุนดวง 32.png        ← full wallpaper (locked)
//       หน้าปก ยันต์มหาเกาะเพชรหนุนดวง 32.jpg  ← cover preview (public)
//       ...
//     ฮินดู/...
//     เทพจีน/...
//     ไพ่ทาโรต์/...
//     สามเณร/...
//
// Pairing rule: files are grouped by trailing number (e.g. " 32").
// A file whose name starts with "หน้าปก" is the cover; the other file
// in the group is the full asset. Unpaired full files still seed —
// they become products whose imageUrl falls back to the full file URL
// (the storefront then watermarks at render time).
//
// Idempotency: each pair gets a deterministic `externalProductId`
// (`MURUKO-WP-<category>-<number>`). Re-running the script skips any
// product that already exists.

import { PrismaClient } from "@prisma/client";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

import { uploadBuffer, isSpacesConfigured } from "../lib/storage/spaces";

const STORE_SLUG = "muruko";
const SUPPLIER = "MOCK";
const DEFAULT_PRICE_THB = 49;
const DEFAULT_DESCRIPTION =
  "วอลล์เปเปอร์มงคล สายมู หนุนดวง เสริมโชค · ดาวน์โหลดทันทีหลังชำระด้วยเครดิต — รับไฟล์เต็มความละเอียดสูง ไม่มีลายน้ำ";

const COVER_PREFIX = "หน้าปก";

interface Pair {
  cover?: string;
  full?: string;
}

const prisma = new PrismaClient();

function fail(msg: string): never {
  console.error(`✖ ${msg}`);
  process.exit(1);
}

function contentTypeFor(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    default:
      return "application/octet-stream";
  }
}

/** "ยันต์ห้าแถว 33.png" → "ยันต์ห้าแถว" (drop trailing space+number+ext). */
function humanTitle(filename: string): string {
  return filename
    .replace(/\.[^.]+$/, "")
    .replace(/\s*\d+\s*$/, "")
    .trim();
}

/** "หน้าปก ยันต์ห้าแถว 33.jpg" → 33  /  "ยันต์ห้าแถว 33.png" → 33 */
function trailingNumber(filename: string): string | null {
  const m = filename.match(/(\d+)\s*\.[^.]+$/);
  return m ? m[1] : null;
}

function buildPairs(dir: string): Map<string, Pair> {
  const groups = new Map<string, Pair>();
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isFile()) continue;
    if (entry.name.startsWith(".")) continue;
    const num = trailingNumber(entry.name);
    if (!num) {
      console.warn(`  ? skip (no trailing number): ${entry.name}`);
      continue;
    }
    const isCover = entry.name.startsWith(COVER_PREFIX);
    const slot = groups.get(num) ?? {};
    if (isCover) slot.cover = entry.name;
    else slot.full = entry.name;
    groups.set(num, slot);
  }
  return groups;
}

async function seedCategory(args: {
  storeId: string;
  categoryName: string;
  catDir: string;
  dryRun: boolean;
}): Promise<{ created: number; skipped: number }> {
  const { storeId, categoryName, catDir, dryRun } = args;
  const pairs = buildPairs(catDir);
  let created = 0;
  let skipped = 0;

  for (const [num, pair] of pairs.entries()) {
    if (!pair.full) {
      console.warn(`  ? skip group ${num} (cover but no full)`);
      continue;
    }

    const extId = `MURUKO-WP-${categoryName}-${num}`;
    const existing = await prisma.product.findFirst({
      where: { storeId, externalProductId: extId },
      select: { id: true },
    });
    if (existing) {
      console.log(`  ↻ skip ${extId} (already seeded as ${existing.id})`);
      skipped++;
      continue;
    }

    const fullPath = join(catDir, pair.full);
    const fullBuf = readFileSync(fullPath);
    const fullSizeMB = Math.round((fullBuf.length / 1024 / 1024) * 100) / 100;
    const title = humanTitle(pair.full);

    if (dryRun) {
      console.log(
        `  · DRY ${extId}  title="${title}" full=${pair.full} cover=${pair.cover ?? "<none>"}`,
      );
      created++;
      continue;
    }

    // 1. Cover → public Space
    let imageUrl: string | null = null;
    if (pair.cover) {
      const coverBuf = readFileSync(join(catDir, pair.cover));
      const up = await uploadBuffer({
        prefix: `stores/${STORE_SLUG}/covers/${categoryName}`,
        filename: pair.cover,
        contentType: contentTypeFor(pair.cover),
        body: coverBuf,
      });
      imageUrl = up.publicUrl;
    }

    // 2. Full file → private Space (locked behind DigitalUnlock)
    const fullUp = await uploadBuffer({
      prefix: `stores/${STORE_SLUG}/digital/${categoryName}`,
      filename: pair.full,
      contentType: contentTypeFor(pair.full),
      body: fullBuf,
      private: true,
    });

    // Fallback: if there's no separate cover, use the full file as the
    // product image too. The storefront's mu-wallpaper-th Homepage
    // applies a watermark/blur at render time on locked products.
    if (!imageUrl) {
      const sameAsFull = await uploadBuffer({
        prefix: `stores/${STORE_SLUG}/covers/${categoryName}`,
        filename: pair.full,
        contentType: contentTypeFor(pair.full),
        body: fullBuf,
      });
      imageUrl = sameAsFull.publicUrl;
    }

    // 3. Create Product + DigitalAsset in one tx
    const product = await prisma.product.create({
      data: {
        storeId,
        title,
        titleTh: title,
        description: DEFAULT_DESCRIPTION,
        descriptionTh: DEFAULT_DESCRIPTION,
        priceTHB: DEFAULT_PRICE_THB,
        imageUrl,
        supplier: SUPPLIER,
        externalProductId: extId,
        categoryName,
        active: true,
        productType: "DIGITAL",
        digitalKind: "OTHER",
        digitalAssets: {
          create: {
            fileName: pair.full,
            fileFormat: pair.full.split(".").pop()?.toLowerCase() ?? "bin",
            fileSizeMB: fullSizeMB,
            storageKey: fullUp.key,
            isPreview: false,
          },
        },
      },
      select: { id: true, title: true },
    });
    console.log(`  ✓ ${product.id}  "${product.title}"  (${fullSizeMB} MB)`);
    created++;
  }

  return { created, skipped };
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const dir = args.find((a) => !a.startsWith("--"));
  if (!dir) {
    fail(
      "usage: pnpm tsx scripts/seed-muruko-wallpapers.ts <path-to-extracted-folder> [--dry-run]",
    );
  }

  try {
    if (!statSync(dir).isDirectory()) fail(`not a directory: ${dir}`);
  } catch {
    fail(`cannot stat: ${dir}`);
  }

  if (!dryRun && !isSpacesConfigured()) {
    fail(
      "DO Spaces env not set — need SPACES_ENDPOINT / SPACES_BUCKET / SPACES_KEY / SPACES_SECRET",
    );
  }

  const store = await prisma.store.findUnique({
    where: { slug: STORE_SLUG },
    select: { id: true, name: true },
  });
  if (!store) fail(`store "${STORE_SLUG}" not found in DB`);

  console.log(
    `\n→ Seeding ${dryRun ? "(DRY RUN) " : ""}wallpapers into store "${store.name}" (${store.id})\n`,
  );

  let totalCreated = 0;
  let totalSkipped = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith(".")) continue;
    const categoryName = entry.name;
    console.log(`Category: ${categoryName}`);
    const { created, skipped } = await seedCategory({
      storeId: store.id,
      categoryName,
      catDir: join(dir, categoryName),
      dryRun,
    });
    totalCreated += created;
    totalSkipped += skipped;
    console.log("");
  }

  console.log(
    `Done — created ${totalCreated}, skipped ${totalSkipped} (already existed)\n`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
