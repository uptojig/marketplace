/**
 * Bundle — featured bundle deal: a row of items + total price + CTA.
 *
 * Rebuilt on daisyUI .card with header (title + badge), body (item
 * row), and footer (price summary + CTA button). All theme tokens
 * via daisyUI primary / base-100 / base-200 / success.
 */
export function BundleBlock({
  title,
  items,
  bundlePrice,
  originalTotal,
  savings,
  ctaText,
  ctaLink,
  badge,
}: {
  title?: string;
  items?: Array<{
    name?: string;
    imageUrl?: string;
    altText?: string;
    originalPrice?: number;
  }>;
  bundlePrice?: number;
  originalTotal?: number;
  savings?: number;
  ctaText?: string;
  ctaLink?: string;
  badge?: string;
}) {
  return (
    <section className="px-6 py-12 max-w-3xl mx-auto">
      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="card-title text-lg">{title || "ชุดสุดคุ้ม"}</h3>
            {badge && (
              <div className="badge badge-error badge-sm font-medium">
                {badge}
              </div>
            )}
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {items?.map((item, i) => (
              <div key={i} className="shrink-0 w-28">
                <div className="aspect-square bg-base-200 rounded-lg overflow-hidden mb-2">
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageUrl}
                      alt={item.altText || item.name || ""}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-base-content/50">
                      {item.name}
                    </div>
                  )}
                </div>
                <p className="text-xs truncate">{item.name}</p>
                {item.originalPrice !== undefined && (
                  <p className="text-xs text-base-content/60 line-through">
                    ฿{item.originalPrice.toLocaleString()}
                  </p>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-baseline justify-between mt-4 pt-4 border-t border-base-300">
            <div>
              <span className="text-2xl font-bold text-primary">
                ฿{bundlePrice?.toLocaleString()}
              </span>
              {originalTotal !== undefined && (
                <span className="text-sm text-base-content/60 line-through ml-2">
                  ฿{originalTotal.toLocaleString()}
                </span>
              )}
              {savings !== undefined && (
                <span className="text-sm text-success ml-2">
                  ประหยัด ฿{savings.toLocaleString()}
                </span>
              )}
            </div>
            {ctaText && (
              <a href={ctaLink || "#"} className="btn btn-primary btn-sm">
                {ctaText}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
