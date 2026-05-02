import { prisma } from "@/lib/prisma";
import { aliexpressAdapter } from "./adapter";

export interface EnrichResult {
  ok: boolean;
  variantCount?: number;
  error?: string;
}

/**
 * Fetch full product detail + variants from AliExpress and persist to DB.
 * AliExpress rate-limits aggressively; caller should sleep ~1s between calls.
 */
export async function enrichAliExpressProduct(
  productId: string,
  externalProductId: string,
  options: { includeVariants?: boolean } = {},
): Promise<EnrichResult> {
  try {
    const detail = await aliexpressAdapter.fetchProductById(externalProductId);

    // Extract gallery from raw response
    const gallery = extractGallery(detail.raw);

    let variantCount = 0;
    if (options.includeVariants !== false && aliexpressAdapter.fetchVariants) {
      await new Promise((r) => setTimeout(r, 1100));
      try {
        const variants = await aliexpressAdapter.fetchVariants(externalProductId);
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

function extractGallery(raw: unknown): string[] {
  if (!raw || typeof raw !== "object") return [];
  const r = raw as Record<string, unknown>;

  // AliExpress returns images as semicolon-separated string in ae_multimedia_info_dto
  const multimedia = r.ae_multimedia_info_dto as Record<string, unknown> | undefined;
  const imageUrls = multimedia?.image_urls;
  if (typeof imageUrls === "string") {
    return imageUrls
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  // Fallback: check product_image_urls or similar fields
  if (Array.isArray(r.image_urls)) {
    return r.image_urls.filter((x): x is string => typeof x === "string");
  }

  return [];
}
