import { prisma } from "@/lib/prisma";
import { cjAdapter } from "./adapter";

function extractGallery(raw: unknown): string[] {
  if (!raw || typeof raw !== "object") return [];
  const r = raw as Record<string, unknown>;
  const set = r.productImageSet ?? r.productImageList;
  if (Array.isArray(set)) return set.filter((x): x is string => typeof x === "string");
  if (typeof set === "string") {
    return set
      .split(/[;,]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

export interface EnrichResult {
  ok: boolean;
  variantCount?: number;
  error?: string;
}

/**
 * Fetch full product detail + variants from CJ and persist to DB.
 * CJ throttles at ~1 req/sec; caller should sleep between calls.
 */
export async function enrichCJProduct(
  productId: string,
  externalProductId: string,
  options: { includeVariants?: boolean } = {},
): Promise<EnrichResult> {
  try {
    const detail = await cjAdapter.fetchProductById(externalProductId);
    const gallery = extractGallery(detail.raw);

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

    await prisma.product.update({
      where: { id: productId },
      data: {
        description: detail.description ?? null,
        imageUrl: detail.imageUrl ?? null,
        galleryUrls: gallery.length > 0 ? gallery : undefined,
        externalPayload: detail.raw as never,
        ...(variantCount > 1 ? { hasVariants: true } : {}),
      },
    });

    return { ok: true, variantCount };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "unknown" };
  }
}
