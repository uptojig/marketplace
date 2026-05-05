import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function CategoryIndexPage({
  params,
}: {
  params: { slug: string };
}) {
  const store = await prisma.store.findUnique({
    where: { slug: params.slug },
    include: {
      products: {
        where: { active: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!store) notFound();

  // Group products by category
  const productsByCategory: Record<string, typeof store.products> = {};
  const uncategorized: typeof store.products = [];

  for (const product of store.products) {
    if (product.categoryName) {
      if (!productsByCategory[product.categoryName]) {
        productsByCategory[product.categoryName] = [];
      }
      productsByCategory[product.categoryName].push(product);
    } else {
      uncategorized.push(product);
    }
  }

  const categoryNames = Object.keys(productsByCategory).sort();

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <div className="w-full md:w-64 shrink-0">
          <div className="sticky top-24 rounded-xl border p-6" style={{ background: 'var(--shop-card)', borderColor: 'var(--shop-border)' }}>
            <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--shop-ink)' }}>หมวดหมู่</h2>
            <ul className="space-y-3">
              <li>
                <Link href={`/stores/${store.slug}/category`} className="font-medium hover:underline block" style={{ color: 'var(--shop-primary)' }}>
                  สินค้าทั้งหมด
                </Link>
              </li>
              {categoryNames.map(category => (
                <li key={category}>
                  <Link href={`/stores/${store.slug}/category/${encodeURIComponent(category)}`} className="hover:underline block opacity-80 transition-opacity hover:opacity-100" style={{ color: 'var(--shop-ink)' }}>
                    {category}
                  </Link>
                </li>
              ))}
              {uncategorized.length > 0 && (
                <li>
                  <Link href={`/stores/${store.slug}/category/uncategorized`} className="hover:underline block opacity-80 transition-opacity hover:opacity-100" style={{ color: 'var(--shop-ink)' }}>
                    อื่นๆ
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-8" style={{ color: 'var(--shop-ink)' }}>สินค้าทั้งหมด</h1>

          {categoryNames.length === 0 && uncategorized.length === 0 ? (
            <div className="text-center py-20 rounded-xl border" style={{ background: 'var(--shop-card)', borderColor: 'var(--shop-border)' }}>
              <p className="text-lg" style={{ color: 'var(--shop-ink)', opacity: 0.6 }}>ยังไม่มีสินค้าในร้านนี้</p>
            </div>
          ) : (
            <div className="space-y-16">
              {categoryNames.map((category) => (
                <div key={category}>
                  <div className="flex items-center justify-between mb-6 border-b pb-2" style={{ borderColor: 'var(--shop-border)' }}>
                    <h2 className="text-2xl font-semibold" style={{ color: 'var(--shop-ink)' }}>{category}</h2>
                    <Link
                      href={`/stores/${store.slug}/category/${encodeURIComponent(category)}`}
                      className="text-sm font-medium hover:underline"
                      style={{ color: "var(--shop-primary)" }}
                    >
                      ดูทั้งหมด &rarr;
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                    {productsByCategory[category].slice(0, 6).map((product) => (
                      <ProductCard key={product.id} product={product} storeSlug={store.slug} />
                    ))}
                  </div>
                </div>
              ))}

              {uncategorized.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-6 border-b pb-2" style={{ borderColor: 'var(--shop-border)' }}>
                    <h2 className="text-2xl font-semibold" style={{ color: 'var(--shop-ink)' }}>อื่นๆ</h2>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                    {uncategorized.map((product) => (
                      <ProductCard key={product.id} product={product} storeSlug={store.slug} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProductCard({ product, storeSlug }: { product: any; storeSlug: string }) {
  return (
    <Link
      href={`/stores/${storeSlug}/products/${product.id}`}
      className="group block"
    >
      <div className="aspect-square relative mb-3 rounded-lg overflow-hidden" style={{ background: 'var(--shop-bg)' }}>
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-stone-400">
            ไม่มีรูปภาพ
          </div>
        )}
      </div>
      <h3 className="font-medium group-hover:underline line-clamp-2" style={{ color: 'var(--shop-ink)' }}>
        {product.titleTh || product.title}
      </h3>
      <p className="mt-1 font-semibold" style={{ color: "var(--shop-primary)" }}>
        ฿{Number(product.priceTHB).toLocaleString()}
      </p>
    </Link>
  );
}
