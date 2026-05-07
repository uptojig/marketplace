import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ShopAddButton } from "@/components/shop/ShopAddButton";
import { SortSelect } from "@/components/shop/SortSelect";

export const dynamic = "force-dynamic";

export default async function StoreCategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string; name: string };
  searchParams: { sort?: string };
}) {
  const store = await prisma.store.findUnique({ where: { slug: params.slug } });
  if (!store) notFound();

  const categoryName = decodeURIComponent(params.name);
  const sort = searchParams.sort ?? "";

  const where = {
    storeId: store.id,
    active: true,
    categoryName,
  };

  const [products, totalInCategory, allCategoriesRows] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy:
        sort === "low-to-high"
          ? { priceTHB: "asc" }
          : sort === "high-to-low"
            ? { priceTHB: "desc" }
            : { createdAt: "desc" },
      take: 200,
    }),
    prisma.product.count({ where }),
    prisma.product.findMany({
      where: { storeId: store.id, active: true, categoryName: { not: null } },
      select: { categoryName: true },
      distinct: ["categoryName"],
      orderBy: { categoryName: "asc" },
    }),
  ]);

  const allCategories = allCategoriesRows
    .map((r) => r.categoryName)
    .filter((c): c is string => !!c);

  const categoryCounts = await prisma.product.groupBy({
    by: ["categoryName"],
    where: { storeId: store.id, active: true, categoryName: { not: null } },
    _count: { _all: true },
  });
  const countMap = new Map(
    categoryCounts.map((g) => [g.categoryName ?? "", g._count._all]),
  );
  const totalAllProducts = await prisma.product.count({
    where: { storeId: store.id, active: true },
  });

  return (
    <div className="container mx-auto max-w-[1200px] px-4 py-6">
      <Link
        href={`/stores/${store.slug}`}
        className="inline-flex items-center gap-1 text-sm opacity-80 hover:opacity-100"
        style={{ color: 'var(--shop-ink)' }}
      >
        <ChevronLeft className="h-4 w-4" />
        กลับหน้าร้าน
      </Link>

      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide opacity-60" style={{ color: 'var(--shop-ink)' }}>หมวดหมู่</p>
          <h1 className="mt-0.5 text-2xl font-bold" style={{ color: 'var(--shop-ink)' }}>{categoryName}</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--shop-ink-muted)' }}>
            {totalInCategory.toLocaleString()} สินค้า
          </p>
        </div>
        <SortSelect defaultValue={sort} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[220px,1fr]">
        {/* Sidebar with all categories */}
        <aside className="lg:block">
          <div className="lg:sticky lg:top-4 rounded-lg border p-4" style={{ background: 'var(--shop-card)', borderColor: 'var(--shop-border)' }}>
            <h2 className="mb-3 text-sm font-semibold" style={{ color: 'var(--shop-ink)' }}>หมวดหมู่ทั้งหมด</h2>
            <ul className="space-y-1 text-sm">
              <li>
                <Link
                  href={`/stores/${store.slug}`}
                  className="flex items-center justify-between rounded px-2 py-1.5 opacity-80 hover:opacity-100 hover:bg-black/5"
                  style={{ color: 'var(--shop-ink)' }}
                >
                  <span>ทั้งหมด</span>
                  <span className="text-xs opacity-60">
                    {totalAllProducts}
                  </span>
                </Link>
              </li>
              {allCategories.map((c) => {
                const isActive = c === categoryName;
                return (
                  <li key={c}>
                    <Link
                      href={`/stores/${store.slug}/category/${encodeURIComponent(c)}`}
                      className={`flex items-center justify-between rounded px-2 py-1.5 ${
                        isActive
                          ? "font-medium"
                          : "opacity-80 hover:opacity-100 hover:bg-black/5"
                      }`}
                      style={{ 
                        color: isActive ? '#fff' : 'var(--shop-ink)',
                        backgroundColor: isActive ? 'var(--shop-primary)' : 'transparent' 
                      }}
                    >
                      <span>{c}</span>
                      <span
                        className={`text-xs ${isActive ? "text-white/80" : "opacity-60"}`}
                      >
                        {countMap.get(c) ?? 0}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>

        {/* Product grid */}
        <div>
          {products.length === 0 ? (
            <div className="rounded-lg border p-10 text-center" style={{ background: 'var(--shop-card)', borderColor: 'var(--shop-border)' }}>
              <p style={{ color: 'var(--shop-ink-muted)' }}>ยังไม่มีสินค้าในหมวดนี้</p>
              <Link
                href={`/stores/${store.slug}`}
                className="mt-3 inline-block text-sm hover:underline"
                style={{ color: 'var(--shop-primary)' }}
              >
                ดูสินค้าทั้งหมด
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="group flex flex-col overflow-hidden rounded-lg border"
                  style={{ background: 'var(--shop-card)', borderColor: 'var(--shop-border)' }}
                >
                  <Link
                    href={`/stores/${store.slug}/products/${p.id}`}
                    className="block"
                  >
                    <div className="aspect-square overflow-hidden" style={{ backgroundColor: 'var(--shop-bg)' }}>
                      {p.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.imageUrl}
                          alt={p.titleTh ?? p.title}
                          className="h-full w-full object-cover transition group-hover:scale-105"
                        />
                      )}
                    </div>
                  </Link>
                  <div className="flex flex-1 flex-col p-3">
                    <Link
                      href={`/stores/${store.slug}/products/${p.id}`}
                      className="line-clamp-2 text-sm hover:underline"
                      style={{ color: 'var(--shop-ink)' }}
                    >
                      {p.titleTh ?? p.title}
                    </Link>
                    <div className="mt-2 flex items-end justify-between gap-2">
                      <p className="text-base font-bold" style={{ color: 'var(--shop-primary)' }}>
                        ฿ {Number(p.priceTHB).toLocaleString("th-TH")}
                      </p>
                      <ShopAddButton
                        product={{
                          id: p.id,
                          title: p.titleTh ?? p.title,
                          priceTHB: Number(p.priceTHB),
                          imageUrl: p.imageUrl ?? undefined,
                          storeName: store.name,
                          storeSlug: store.slug,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
