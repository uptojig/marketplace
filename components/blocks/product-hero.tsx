/**
 * ProductHero — single-product hero (image + name + price + CTA).
 *
 * Three layout modes:
 *   - "split"    image left, copy right (default)
 *   - "reverse"  image right, copy left
 *   - "centered" image on top, copy below, all centered
 *
 * daisyUI primitives in play:
 *   - .badge.badge-error   for the discount tag
 *   - .badge.badge-outline for trust chips ("ส่งฟรี 990+", "คืนได้ 7 วัน", …)
 *   - .btn.btn-primary.btn-lg for the buy CTA — picks up theme color
 */
export function ProductHeroBlock({
  imageUrl,
  headline,
  subheadline,
  price,
  originalPrice,
  currency = "฿",
  ctaText,
  ctaLink,
  trustChips,
  layoutStyle = "split",
}: {
  imageUrl?: string;
  headline?: string;
  subheadline?: string;
  price?: number;
  originalPrice?: number;
  currency?: string;
  ctaText?: string;
  ctaLink?: string;
  trustChips?: string[];
  layoutStyle?: "split" | "centered" | "reverse";
}) {
  const hasDiscount =
    originalPrice !== undefined &&
    price !== undefined &&
    originalPrice > price;
  const discountPct = hasDiscount
    ? Math.round((1 - price! / originalPrice!) * 100)
    : 0;

  const isCentered = layoutStyle === "centered";
  const isReverse = layoutStyle === "reverse";

  return (
    <section
      className={`px-6 py-12 max-w-6xl mx-auto ${
        isCentered
          ? "flex flex-col items-center text-center gap-8"
          : "grid md:grid-cols-2 gap-12"
      }`}
    >
      <figure
        className={`aspect-square bg-base-200 rounded-2xl overflow-hidden flex items-center justify-center ${
          isCentered ? "w-full max-w-md" : ""
        } ${isReverse ? "md:order-last" : ""}`}
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={headline || "สินค้า"}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="text-base-content/50 text-sm">รูปสินค้า</div>
        )}
      </figure>

      <div
        className={`flex flex-col justify-center gap-4 ${
          isCentered ? "items-center max-w-2xl" : ""
        }`}
      >
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
          {headline || "ชื่อสินค้า"}
        </h2>
        {subheadline && (
          <p className="text-lg text-base-content/70">{subheadline}</p>
        )}

        {price !== undefined && (
          <div
            className={`flex items-baseline gap-3 mt-2 ${
              isCentered ? "justify-center" : ""
            }`}
          >
            <span className="text-4xl font-bold text-primary">
              {currency}
              {price.toLocaleString()}
            </span>
            {hasDiscount && (
              <>
                <span className="text-xl line-through text-base-content/60">
                  {currency}
                  {originalPrice!.toLocaleString()}
                </span>
                <div className="badge badge-error badge-md font-semibold">
                  -{discountPct}%
                </div>
              </>
            )}
          </div>
        )}

        {trustChips && trustChips.length > 0 && (
          <div
            className={`flex flex-wrap gap-2 mt-4 ${
              isCentered ? "justify-center" : ""
            }`}
          >
            {trustChips.map((chip, i) => (
              <div key={i} className="badge badge-outline">
                {chip}
              </div>
            ))}
          </div>
        )}

        {ctaText && (
          <a
            href={ctaLink || "#"}
            className="btn btn-primary btn-lg mt-4 w-fit shadow-lg hover:scale-105 hover:-translate-y-0.5 transition-transform"
          >
            {ctaText}
          </a>
        )}
      </div>
    </section>
  );
}
