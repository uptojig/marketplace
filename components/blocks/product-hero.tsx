"use client";

import { Badge } from "@/components/ui/badge";

export function ProductHeroBlock({ imageUrl, headline, subheadline, price, originalPrice, currency = "฿", ctaText, ctaLink, trustChips, layoutStyle = "split" }: {
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
  const hasDiscount = originalPrice && price && originalPrice > price;
  const discountPct = hasDiscount ? Math.round((1 - price / originalPrice) * 100) : 0;

  return (
    <div className={`px-6 py-12 max-w-6xl mx-auto ${layoutStyle === "centered" ? "flex flex-col items-center text-center gap-8" : "grid md:grid-cols-2 gap-12"}`}>
      <div className={`aspect-square bg-zinc-800 rounded-2xl overflow-hidden flex items-center justify-center ${layoutStyle === "centered" ? "w-full max-w-md" : layoutStyle === "reverse" ? "md:order-last" : ""}`}>
        {imageUrl ? (
          <img src={imageUrl} alt={headline || "สินค้า"} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        ) : (
          <div className="text-zinc-500 text-sm">รูปสินค้า</div>
        )}
      </div>
      <div className={`flex flex-col justify-center gap-4 ${layoutStyle === "centered" ? "items-center max-w-2xl" : ""}`}>
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">{headline || "ชื่อสินค้า"}</h2>
        {subheadline && <p className="text-lg" style={{ color: 'var(--shop-ink-muted)' }}>{subheadline}</p>}
        {price && (
          <div className={`flex items-baseline gap-3 mt-2 ${layoutStyle === "centered" ? "justify-center" : ""}`}>
            <span className="text-4xl font-bold" style={{ color: "var(--shop-primary)" }}>
              {currency}{price.toLocaleString()}
            </span>
            {hasDiscount && (
              <>
                <span className="text-xl line-through" style={{ color: 'var(--shop-ink-muted)' }}>{currency}{originalPrice.toLocaleString()}</span>
                <Badge variant="destructive" className="text-sm px-2 py-0.5">-{discountPct}%</Badge>
              </>
            )}
          </div>
        )}
        {trustChips && trustChips.length > 0 && (
          <div className={`flex flex-wrap gap-2 mt-4 ${layoutStyle === "centered" ? "justify-center" : ""}`}>
            {trustChips.map((chip, i) => <Badge key={i} variant="outline" className="text-xs" style={{ background: 'var(--shop-card)' }}>{chip}</Badge>)}
          </div>
        )}
        {ctaText && (
          <a href={ctaLink || "#"} className="inline-flex items-center justify-center px-10 py-4 rounded-xl font-bold text-white shadow-lg transition-transform hover:scale-105 hover:-translate-y-1 text-base mt-4 w-fit"
            style={{ backgroundColor: "var(--shop-primary)" }}>
            {ctaText}
          </a>
        )}
      </div>
    </div>
  );
}
