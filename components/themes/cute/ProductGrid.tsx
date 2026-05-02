interface ProductCard {
  title?: string;
  imageUrl?: string;
  priceTHB?: number;
  compareAtPriceTHB?: number;
  href?: string;
  badge?: string;
}

interface ProductGridContent {
  heading?: string;
  subheading?: string;
  products?: ProductCard[];
}

function thb(n?: number) {
  if (typeof n !== "number") return "";
  return `฿${n.toLocaleString("th-TH")}`;
}

export function CuteProductGrid({ content }: { content: ProductGridContent }) {
  const products = content.products ?? [];
  return (
    <section className="space-y-6">
      {content.heading && (
        <div className="text-center">
          <h2 className="text-2xl font-bold text-pink-900 md:text-3xl">{content.heading}</h2>
          {content.subheading && (
            <p className="mt-1 text-sm text-pink-800/70">{content.subheading}</p>
          )}
        </div>
      )}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {products.map((p, i) => (
          <a
            key={i}
            href={p.href ?? "#"}
            className="group relative overflow-hidden rounded-2xl border-2 border-pink-100 bg-white transition hover:border-pink-300 hover:shadow-lg"
          >
            {p.badge && (
              <span className="absolute left-3 top-3 z-10 rounded-full bg-pink-500 px-2 py-0.5 text-xs font-semibold text-white shadow">
                {p.badge}
              </span>
            )}
            {p.imageUrl && (
              <div className="aspect-square overflow-hidden bg-pink-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.imageUrl}
                  alt={p.title ?? ""}
                  className="h-full w-full object-cover transition group-hover:scale-105"
                />
              </div>
            )}
            <div className="space-y-1 p-3">
              <p className="line-clamp-2 text-sm font-medium text-pink-900">{p.title}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-base font-bold text-pink-700">{thb(p.priceTHB)}</span>
                {p.compareAtPriceTHB && p.compareAtPriceTHB > (p.priceTHB ?? 0) && (
                  <span className="text-xs text-pink-400 line-through">
                    {thb(p.compareAtPriceTHB)}
                  </span>
                )}
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
