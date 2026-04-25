import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductDetail } from "@/components/shop/ProductDetail";

export const dynamic = "force-dynamic";

export default async function ShopProductPage({
  params,
}: {
  params: { slug: string; id: string };
}) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { store: true, variants: { orderBy: { createdAt: "asc" } } },
  });
  if (!product || !product.active) notFound();
  if (product.store.slug !== params.slug) notFound();

  const gallery = (Array.isArray(product.galleryUrls) ? (product.galleryUrls as string[]) : []).filter(Boolean);
  const images = [product.imageUrl, ...gallery].filter((x): x is string => !!x);

  const related = await prisma.product.findMany({
    where: { storeId: product.storeId, active: true, NOT: { id: product.id } },
    take: 6,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <Link href={`/stores/${params.slug}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:underline">
        ← กลับ
      </Link>

      <ProductDetail
        product={{
          id: product.id,
          title: product.titleTh ?? product.title,
          description: product.descriptionTh ?? product.description ?? "",
          priceTHB: Number(product.priceTHB),
          imageUrl: product.imageUrl ?? undefined,
          images,
          storeName: product.store.name,
          storeSlug: product.store.slug,
          storePrimaryColor: product.store.primaryColor ?? "#2563eb",
          variants: product.variants.map((v) => ({
            id: v.id,
            externalVariantId: v.externalVariantId,
            attributes: v.attributes as Record<string, string>,
            priceTHB: Number(v.priceTHB),
            inventory: v.inventory,
            imageUrl: v.imageUrl ?? undefined,
          })),
        }}
      />

      {related.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">สินค้าที่เกี่ยวข้อง</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
            {related.map((r) => (
              <Link
                key={r.id}
                href={`/stores/${params.slug}/products/${r.id}`}
                className="group overflow-hidden rounded-lg border bg-white"
              >
                <div className="aspect-square overflow-hidden bg-muted">
                  {r.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={r.imageUrl}
                      alt={r.titleTh ?? r.title}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                    />
                  )}
                </div>
                <div className="p-2">
                  <div className="line-clamp-2 text-xs">{r.titleTh ?? r.title}</div>
                  <div className="text-xs font-semibold">฿ {Number(r.priceTHB).toLocaleString("th-TH")}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
