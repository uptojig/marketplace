/**
 * CategoryBanner — image-tile grid linking to category pages.
 *
 * daisyUI primitives:
 *   - .card.image-full → image fills the card, content overlays
 *   - .card-body for the title + product-count footer
 *   - .badge.badge-primary for the optional category badge
 *
 * Image-full cards already have a built-in dark overlay so the
 * white text reads against any photo. Keeps `aspectRatio` prop
 * since daisyUI doesn't expose card aspect through a token.
 */
export function CategoryBannerBlock({
  title,
  subtitle,
  layout = "grid-3",
  categories,
  aspectRatio = "4/3",
}: {
  title?: string;
  subtitle?: string;
  layout?: string;
  categories?: Array<{
    name?: string;
    imageUrl?: string;
    altText?: string;
    linkTo?: string;
    badge?: string;
    productCount?: number;
  }>;
  aspectRatio?: string;
}) {
  if (!categories || categories.length === 0) return null;
  const cols = layout === "grid-2" ? 2 : layout === "grid-4" ? 4 : 3;

  return (
    <section className="px-6 py-12 max-w-5xl mx-auto">
      {title && (
        <h3 className="text-2xl md:text-3xl font-bold text-center mb-2 cyber-gradient-text-on-cyber">
          {title}
        </h3>
      )}
      {subtitle && (
        <p className="text-sm text-base-content/70 text-center mb-8">
          {subtitle}
        </p>
      )}
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {categories.map((cat, i) => (
          <a
            key={i}
            href={cat.linkTo || "#"}
            className="card image-full bg-base-300 hover:scale-[1.02] transition-transform overflow-hidden"
            style={{ aspectRatio }}
          >
            {cat.imageUrl ? (
              <figure>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cat.imageUrl}
                  alt={cat.altText || cat.name || ""}
                  className="w-full h-full object-cover"
                />
              </figure>
            ) : null}
            <div className="card-body justify-end p-4 text-white">
              {cat.badge && (
                <div className="badge badge-primary badge-sm mb-1 self-start">
                  {cat.badge}
                </div>
              )}
              <h4 className="card-title text-sm">{cat.name}</h4>
              {cat.productCount !== undefined && cat.productCount > 0 && (
                <p className="text-xs opacity-70">
                  พบ {cat.productCount} รายการ
                </p>
              )}
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
