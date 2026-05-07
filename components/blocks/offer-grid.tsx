"use client";

/**
 * OfferGrid — grid / carousel / bento of product cards.
 *
 * Rebuilt on daisyUI 5 `card` primitives:
 *   - .card .bg-base-100 .shadow-sm  → the card chrome
 *   - .card-body                      → padding for title + price
 *   - .badge.badge-primary            → "ขายดี" / "พรีเมียม" tag
 *   - .btn.btn-circle                 → the cart-icon bubble in the
 *                                       lower-right of the card body
 *
 * Theme tokens (bg-base-100, text-primary, badge-primary) flow
 * automatically across all 35 daisyUI themes — no per-block
 * recoloring needed. Family-specific overrides (.cyber-card hover,
 * .theme-A aspect-4/5) still apply through the className hooks
 * preserved on the wrapping <Link>.
 *
 * Multi-shape product input handled by pickId/pickName/pickPrice/
 * pickImage helpers (kept verbatim from the v3 incarnation) — the
 * agent v3 emits camelCase + product_id, older v12 schemas use
 * id/name/price; both render identically.
 */

import Link from "next/link";
import { ShoppingCart } from "lucide-react";

interface Product {
  id?: string;
  product_id?: string;
  productId?: string;
  name?: string;
  title?: string;
  titleTh?: string;
  price?: number;
  priceTHB?: number;
  price_thb?: number;
  imageUrl?: string;
  image_url?: string;
  badge?: string;
}

interface OfferGridProps {
  title?: string;
  products?: Product[];
  subtitle?: string;
  storeSlug?: string;
  themeColor?: string;
  layoutStyle?: "grid" | "carousel" | "bento";
}

function pickId(p: Product): string | undefined {
  return p.id ?? p.product_id ?? p.productId;
}
function pickName(p: Product): string {
  return p.name ?? p.title ?? p.titleTh ?? "";
}
function pickPrice(p: Product): number | undefined {
  return p.price ?? p.priceTHB ?? p.price_thb;
}
function pickImage(p: Product): string | undefined {
  return p.imageUrl ?? p.image_url;
}

export function OfferGridBlock({
  title,
  subtitle,
  products,
  storeSlug,
  layoutStyle = "grid",
}: OfferGridProps) {
  if (!products || products.length === 0) return null;

  let wrapperClass = "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4";
  if (layoutStyle === "carousel") {
    wrapperClass =
      "flex overflow-x-auto snap-x snap-mandatory gap-4 pb-6 w-full hide-scrollbar";
  } else if (layoutStyle === "bento") {
    wrapperClass = "grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-3 auto-rows-fr";
  }

  return (
    <section className="px-6 py-12 max-w-7xl mx-auto">
      {title && (
        <h3 className="text-3xl md:text-4xl font-black text-center mb-2 cyber-gradient-text-on-cyber">
          {title}
        </h3>
      )}
      {subtitle && (
        <p className="text-sm text-center mb-10 text-base-content/70">
          {subtitle}
        </p>
      )}
      <div className={wrapperClass}>
        {products.map((product, i) => {
          const productId = pickId(product);
          const isBentoHero = layoutStyle === "bento" && i === 0;

          let itemClass =
            "cyber-card card bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition-all";
          if (layoutStyle === "carousel") {
            itemClass += " w-[240px] md:w-[280px] shrink-0 snap-center";
          } else if (isBentoHero) {
            itemClass += " md:col-span-2 md:row-span-2";
          } else {
            itemClass += " w-full";
          }

          const inner = (
            <CardContent product={product} isBentoHero={isBentoHero} />
          );

          return productId && storeSlug ? (
            <Link
              key={productId || i}
              href={`/stores/${storeSlug}/products/${productId}`}
              className={`${itemClass} group`}
            >
              {inner}
            </Link>
          ) : (
            <div key={i} className={itemClass}>
              {inner}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function CardContent({
  product,
  isBentoHero,
}: {
  product: Product;
  isBentoHero?: boolean;
}) {
  const name = pickName(product);
  const price = pickPrice(product);
  const imageUrl = pickImage(product);

  return (
    <>
      <figure
        className={`relative overflow-hidden bg-base-200 ${
          isBentoHero
            ? "aspect-[4/3] md:aspect-auto md:flex-1"
            : "aspect-square"
        }`}
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-base-content/50">
            ไม่มีรูปภาพ
          </div>
        )}

        {/* Cyber-only bottom gradient — hidden on light themes via
            the global .cyber-only rule. */}
        <div
          className="cyber-only absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(to top, var(--shop-card) 0%, transparent 50%)",
            opacity: 0.6,
          }}
        />

        {product.badge && (
          <div className="absolute top-3 left-3 badge badge-primary badge-sm font-medium">
            {product.badge}
          </div>
        )}
      </figure>

      <div
        className={`card-body p-4 flex flex-col flex-grow gap-3 ${
          isBentoHero ? "md:p-6" : ""
        }`}
      >
        <h4
          className={`card-title font-medium line-clamp-2 transition-colors group-hover:text-primary ${
            isBentoHero ? "text-lg md:text-2xl" : "text-sm"
          }`}
        >
          {name}
        </h4>
        <div className="card-actions justify-between items-end mt-auto pt-2">
          {price !== undefined && (
            <span
              className={`font-black cyber-gradient-text text-primary ${
                isBentoHero ? "text-2xl" : "text-xl"
              }`}
            >
              ฿{price.toLocaleString("th-TH")}
            </span>
          )}
          <span
            aria-hidden="true"
            className="cyber-cart-bubble btn btn-circle btn-sm btn-ghost"
          >
            <ShoppingCart className="w-4 h-4" />
          </span>
        </div>
      </div>
    </>
  );
}
