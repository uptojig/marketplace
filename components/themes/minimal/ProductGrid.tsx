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

export function MinimalProductGrid({ content }: { content: ProductGridContent }) {
  const products = content.products ?? [];
  return (
    <section className="space-y-6 py-10">
      {content.heading && (
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{content.heading}</h2>
          {content.subheading && (
            <p className="mt-1 text-sm text-gray-600">{content.subheading}</p>
          )}
        </div>
      )}
      <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {products.map((p, i) => (
          <a key={i} href={p.href ?? "#"} className="group block">
            {p.imageUrl && (
              <div className="relative aspect-square overflow-hidden rounded-md bg-gray-100">
                {p.badge && (
                  <span className="absolute left-2 top-2 rounded-sm bg-black/80 px-2 py-0.5 text-xs font-medium text-white">
                    {p.badge}
                  </span>
                )}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.imageUrl}
                  alt={p.title ?? ""}
                  className="h-full w-full object-cover transition group-hover:scale-105"
                />
              </div>
            )}
            <div className="mt-2 space-y-0.5">
              <p className="line-clamp-2 text-sm">{p.title}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-medium">{thb(p.priceTHB)}</span>
                {p.compareAtPriceTHB && p.compareAtPriceTHB > (p.priceTHB ?? 0) && (
                  <span className="text-xs text-gray-400 line-through">
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
