import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { translateAndRewriteCategories } from "@/lib/translate-categories";

/**
 * POST /api/store/categories/import
 *
 * Bulk-creates Category rows from one of three sources:
 *
 *   - "legacy"     : adopt distinct Product.categoryName values that
 *                    haven't been bucketed yet. Side-effect: every
 *                    matching product gets `categoryId` set to the
 *                    new Category in one updateMany per name.
 *
 *   - "cj"         : adopt CJ supplier first-level category names.
 *                    Pure label import — products aren't auto-linked
 *                    because CJ-side category != product membership
 *                    in the operator's store.
 *
 *   - "aliexpress" : same as `cj` but for AliExpress.
 *
 * Each name passes through translateAndRewriteCategories() which
 * (when ANTHROPIC_API_KEY is set) emits a shop-friendly Thai display
 * name + an ASCII URL slug. Without the key it falls back to using
 * the input verbatim and a slugified variant.
 *
 * Slug collisions inside the same store fall through the unique
 * constraint as a 409-ish per-row "skipped" so the operator can
 * rename and retry without touching successful rows.
 */

const schema = z.object({
  source: z.enum(["legacy", "cj", "aliexpress"]),
  names: z.array(z.string().min(1).max(120)).min(1).max(50),
  // When false the caller wants verbatim names + auto-slug only
  // (skip the AI rewrite). Defaults true so the dashboard's
  // "นำเข้าแบบ AI ช่วยเรียบเรียง" toggle is the happy path.
  rewrite: z.boolean().optional().default(true),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Admins can target any store via storeSlug in query OR body;
  // vendors fall back to their owned store. Same pattern as
  // /api/store/categories.
  const urlSlug = new URL(req.url).searchParams.get("storeSlug");
  const bodyClone = await req.clone().json().catch(() => null);
  const bodySlug = bodyClone && typeof bodyClone.storeSlug === "string"
    ? bodyClone.storeSlug
    : null;
  const slug = urlSlug ?? bodySlug;
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      role: true,
      store: { select: { id: true, ownerId: true } },
    },
  });
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let storeId: string | null = null;
  if (slug) {
    const target = await prisma.store.findUnique({
      where: { slug },
      select: { id: true, ownerId: true },
    });
    if (target && (user.role === "ADMIN" || target.ownerId === user.id)) {
      storeId = target.id;
    }
  } else if (user.store) {
    storeId = user.store.id;
  }
  if (!storeId) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }
  const { source, names, rewrite } = parsed.data;

  // Translate + rewrite. When `rewrite=false` we still go through
  // the helper because it also handles slug normalization + dedup
  // within the batch — a fall-back path that uses the original
  // string verbatim as the displayName.
  const dedupedNames = Array.from(new Set(names.map((n) => n.trim()))).filter(
    Boolean,
  );
  const rewritten = rewrite
    ? await translateAndRewriteCategories(dedupedNames)
    : dedupedNames.map((name) => ({
        original: name,
        displayName: name,
        slug:
          name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-|-$/g, "") || "category",
      }));

  // Existing categories so we can dedupe before writing. We don't
  // hard-fail on slug clash — the operator likely just wants to
  // skip the dupes, not abort the whole import.
  const existing = await prisma.category.findMany({
    where: { storeId },
    select: { slug: true, name: true },
  });
  const existingSlugs = new Set(existing.map((c) => c.slug));
  const existingNames = new Set(existing.map((c) => c.name));

  // Find next sortOrder so newly imported categories slot in at the
  // bottom of the list rather than re-shuffling the operator's
  // existing manual order.
  const last = await prisma.category.findFirst({
    where: { storeId },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });
  let nextSortOrder = (last?.sortOrder ?? 0) + 1;

  const created: Array<{
    id: string;
    name: string;
    slug: string;
    originalName: string;
    productCount?: number;
  }> = [];
  const skipped: Array<{ name: string; reason: string }> = [];

  for (const item of rewritten) {
    if (existingSlugs.has(item.slug) || existingNames.has(item.displayName)) {
      skipped.push({ name: item.original, reason: "duplicate" });
      continue;
    }
    try {
      const cat = await prisma.category.create({
        data: {
          storeId,
          name: item.displayName,
          slug: item.slug,
          sortOrder: nextSortOrder++,
        },
      });
      existingSlugs.add(cat.slug);
      existingNames.add(cat.name);

      let productCount = 0;
      if (source === "legacy") {
        // Reattach products whose categoryName matches the original
        // (un-rewritten) label. Also keep categoryName synced to
        // the new Category.name so storefront tiles read in the
        // shop-friendly version.
        const updated = await prisma.product.updateMany({
          where: { storeId, categoryName: item.original, categoryId: null },
          data: { categoryId: cat.id, categoryName: cat.name },
        });
        productCount = updated.count;
      }

      created.push({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        originalName: item.original,
        productCount,
      });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        skipped.push({ name: item.original, reason: "slug_taken" });
        continue;
      }
      throw err;
    }
  }

  return NextResponse.json({ ok: true, created, skipped });
}
