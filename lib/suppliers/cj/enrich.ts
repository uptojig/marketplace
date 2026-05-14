import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { cjAdapter } from "./adapter";
import { extractAllImages } from "./extract-images";

export interface EnrichResult {
  ok: boolean;
  variantCount?: number;
  error?: string;
}

/**
 * Fetch full product detail + variants from CJ and persist to DB.
 * CJ throttles at ~1 req/sec; caller should sleep between calls.
 *
 * Image handling — `extractAllImages` merges `productImage` +
 * `productImageSet` / `productImageList` so the PDP gallery shows
 * every shot CJ ships (cover stays in `Product.imageUrl`, the
 * remainder lands on `galleryUrls` with the cover stripped).
 *
 * Rich metadata — weight, origin, key attributes, materials,
 * video URL, and HS code come from the adapter's NormalizedProduct
 * fields, which were extracted defensively from raw CJ payloads.
 */
export async function enrichCJProduct(
  productId: string,
  externalProductId: string,
  options: { includeVariants?: boolean } = {},
): Promise<EnrichResult> {
  try {
    const detail = await cjAdapter.fetchProductById(externalProductId);
    // Belt-and-braces gallery extraction — the adapter already runs
    // extractAllImages, but we re-run it against detail.raw so that
    // re-enriching an existing product after a CJ payload format
    // tweak still picks up new URLs without bumping the adapter.
    const allImages = extractAllImages(detail.raw);
    const cover = detail.imageUrl ?? null;
    const gallery = cover ? allImages.filter((u) => u !== cover) : allImages;

    let variantCount = 0;
    if (options.includeVariants !== false && cjAdapter.fetchVariants) {
      await new Promise((r) => setTimeout(r, 1100));
      try {
        const variants = await cjAdapter.fetchVariants(externalProductId);
        if (variants.length > 0) {
          await prisma.$transaction([
            prisma.productVariant.deleteMany({ where: { productId } }),
            ...variants.map((v) =>
              prisma.productVariant.create({
                data: {
                  productId,
                  externalVariantId: v.externalVariantId,
                  sku: v.sku,
                  attributes: v.attributes as never,
                  colorLabel: v.colorLabel ?? null,
                  sizeLabel: v.sizeLabel ?? null,
                  materialLabel: v.materialLabel ?? null,
                  priceTHB: v.priceTHB,
                  imageUrl: v.imageUrl,
                  inventory: v.inventory,
                },
              }),
            ),
          ]);
          variantCount = variants.length;
        }
      } catch {
        // Soft-fail variants: keep the detail we already have
      }
    }

    const data: Prisma.ProductUpdateInput = {
      description: detail.description ?? null,
      imageUrl: detail.imageUrl ?? null,
      // Only persist gallery when we actually have something — leaving
      // the column untouched (vs writing `[]`) lets back-compat callers
      // distinguish "empty" from "never enriched".
      galleryUrls: gallery.length > 0 ? (gallery as never) : undefined,
      externalPayload: detail.raw as never,
      // Rich CJ metadata. `?? null` so a missing value clears any stale
      // text from a previous enrich (rather than leaving it dangling).
      weightGrams: detail.weightGrams ?? null,
      originCountry: detail.originCountry ?? null,
      keyAttributes: (detail.keyAttributes ?? null) as never,
      materials: (detail.materials ?? null) as never,
      videoUrl: detail.videoUrl ?? null,
      hsCode: detail.hsCode ?? null,
      ...(variantCount > 1 ? { hasVariants: true } : {}),
    };

    await prisma.product.update({
      where: { id: productId },
      data,
    });

    return { ok: true, variantCount };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "unknown" };
  }
}
