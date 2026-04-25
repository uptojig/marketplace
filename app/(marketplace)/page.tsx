import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/product/ProductCard";

export const dynamic = "force-dynamic";

export default async function Home() {
  const products = await prisma.product.findMany({
    where: { active: true },
    include: { store: true },
    orderBy: { createdAt: "desc" },
    take: 24,
  });

  const stores = await prisma.store.findMany({ take: 6 });

  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight">Featured stores</h1>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {stores.map((s) => (
            <Link
              key={s.id}
              href={`/stores/${s.slug}`}
              className="rounded-lg border p-4 transition hover:shadow"
            >
              <div className="font-semibold">{s.name}</div>
              <div className="text-sm text-muted-foreground line-clamp-2">{s.description}</div>
            </Link>
          ))}
          {stores.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No stores yet. Run <code>npm run db:seed</code> to populate demo data.
            </p>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold tracking-tight">Latest products</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={{
                id: p.id,
                title: p.title,
                priceTHB: Number(p.priceTHB),
                imageUrl: p.imageUrl ?? undefined,
                storeName: p.store.name,
                storeSlug: p.store.slug,
              }}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
