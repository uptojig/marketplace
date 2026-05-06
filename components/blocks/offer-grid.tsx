"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Agent v3 emits camelCase (product_id, titleTh, imageUrl, priceTHB),
// older v12 schemas use (id, name, price, imageUrl). Accept both shapes
// so the renderer doesn't blank the title/price when the agent's
// schema flows through.
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
  // Agent v3 sends `subtitle` for the section description.
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

export function OfferGridBlock({ title, subtitle, products, storeSlug, themeColor, layoutStyle = "grid" }: OfferGridProps) {
  if (!products || products.length === 0) return null;

  let wrapperClass = "grid grid-cols-2 md:grid-cols-3 gap-4";
  if (layoutStyle === "carousel") {
    wrapperClass = "flex overflow-x-auto snap-x snap-mandatory gap-4 pb-6 w-full hide-scrollbar";
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
        <p className="text-sm text-center mb-10 opacity-70">{subtitle}</p>
      )}
      <div className={wrapperClass}>

        {products.map((product, i) => {
          const productId = pickId(product);
          // Card chrome — `cyber-card` is no-op outside .theme-cyber
          // (CSS in globals.css scopes its hover/border to that ancestor)
          // so light-theme stores still get the prior look.
          let itemClass =
            "group cyber-card rounded-xl overflow-hidden border transition-all flex flex-col";

          if (layoutStyle === "carousel") {
            itemClass += " w-[240px] md:w-[280px] shrink-0 snap-center";
          } else if (layoutStyle === "bento" && i === 0) {
            itemClass += " md:col-span-2 md:row-span-2";
          } else {
            itemClass += " w-full";
          }

          return productId && storeSlug ? (
            <Link
              key={productId || i}
              href={`/stores/${storeSlug}/products/${productId}`}
              className={itemClass}
              style={{ background: 'var(--shop-card)', borderColor: 'var(--shop-border)' }}
            >
              <ProductCardContent product={product} themeColor={themeColor} isBentoHero={layoutStyle === "bento" && i === 0} />
            </Link>
          ) : (
            <div
              key={i}
              className={itemClass}
              style={{ background: 'var(--shop-card)', borderColor: 'var(--shop-border)' }}
            >
              <ProductCardContent product={product} themeColor={themeColor} isBentoHero={layoutStyle === "bento" && i === 0} />
            </div>
          )
        })}

      </div>
    </section>
  );
}

function ProductCardContent({ product, themeColor, isBentoHero }: { product: Product, themeColor?: string, isBentoHero?: boolean }) {
  const name = pickName(product);
  const price = pickPrice(product);
  const imageUrl = pickImage(product);
  return (
    <>
      <div
        className={`relative overflow-hidden ${isBentoHero ? 'aspect-[4/3] md:aspect-auto md:flex-1' : 'aspect-square'}`}
        style={{ backgroundColor: 'color-mix(in srgb, var(--shop-card) 70%, black)' }}
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs opacity-60">
            ไม่มีรูปภาพ
          </div>
        )}

        {/* Bottom gradient overlay — visible only on cyber theme.
            Helps badge/text pop off photo-heavy cards. */}
        <div
          className="cyber-only absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to top, var(--shop-card) 0%, transparent 50%)',
            opacity: 0.6,
          }}
        />

        {product.badge && (
          <span className="cyber-product-badge absolute top-3 left-3 z-10 text-[10px] font-bold px-3 py-1 rounded-full">
            {/* Default Badge for non-cyber themes */}
            <Badge className="text-[10px]" variant="destructive">
              {product.badge}
            </Badge>
          </span>
        )}
      </div>

      <div className={`p-4 flex flex-col flex-grow space-y-3 ${isBentoHero ? 'md:p-6' : ''}`}>
        <h4
          className={`font-medium line-clamp-2 transition-colors group-hover:text-[var(--shop-accent)] ${
            isBentoHero ? 'text-lg md:text-2xl' : 'text-sm'
          }`}
        >
          {name}
        </h4>
        <div className="mt-auto pt-2 flex items-end justify-between">
          {price !== undefined && (
            <span
              className={`font-black cyber-gradient-text ${isBentoHero ? 'text-2xl' : 'text-xl'}`}
              style={{
                // Non-cyber fallback: solid theme color (cyber theme's
                // gradient class wins via CSS).
                color: themeColor || 'var(--shop-primary, #a855f7)',
              }}
            >
              ฿{price.toLocaleString("th-TH")}
            </span>
          )}
          {/* Visual cart icon — pure decoration since card is wrapped
              in a Link that already navigates to PDP. Lights up on
              hover with neon glow inside cyber theme. */}
          <span
            aria-hidden="true"
            className="cyber-cart-bubble w-10 h-10 rounded-full flex items-center justify-center transition-all"
          >
            <ShoppingCart className="w-4 h-4" />
          </span>
        </div>
      </div>
    </>
  );
}
