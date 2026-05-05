"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface Product {
  id: string; // รับ ID สินค้าจริงมา
  name: string;
  price: number;
  imageUrl: string;
  badge?: string;
}

interface OfferGridProps {
  title?: string;
  products?: Product[];
  storeSlug?: string;
  themeColor?: string;
  layoutStyle?: "grid" | "carousel" | "bento";
}

export function OfferGridBlock({ title, products, storeSlug, themeColor, layoutStyle = "grid" }: OfferGridProps) {
  if (!products || products.length === 0) return null;

  let wrapperClass = "grid grid-cols-2 md:grid-cols-3 gap-4";
  if (layoutStyle === "carousel") {
    wrapperClass = "flex overflow-x-auto snap-x snap-mandatory gap-4 pb-6 w-full hide-scrollbar";
  } else if (layoutStyle === "bento") {
    wrapperClass = "grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-3 auto-rows-fr";
  }

  return (
    <section className="px-6 py-12 max-w-5xl mx-auto">
      {title && <h3 className="text-xl font-bold text-center mb-8">{title}</h3>}
      <div className={wrapperClass}>
        
        {products.map((product, i) => {
          let itemClass = "group rounded-xl overflow-hidden border transition flex flex-col";
          
          if (layoutStyle === "carousel") {
            itemClass += " w-[240px] md:w-[280px] shrink-0 snap-center";
          } else if (layoutStyle === "bento" && i === 0) {
            itemClass += " md:col-span-2 md:row-span-2";
          } else {
            itemClass += " w-full";
          }

          return product.id && storeSlug ? (
            <Link 
              key={product.id || i} 
              href={`/stores/${storeSlug}/products/${product.id}`}
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
  return (
    <>
      <div className={`bg-zinc-800 relative overflow-hidden ${isBentoHero ? 'aspect-[4/3] md:aspect-auto md:flex-1' : 'aspect-square'}`}>
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-stone-100 text-stone-400 text-xs">
            ไม่มีรูปภาพ
          </div>
        )}
        
        {product.badge && (
          <Badge className="absolute top-2 left-2 text-[10px]" variant="destructive">
            {product.badge}
          </Badge>
        )}
      </div>
      
      <div className={`p-3 space-y-1.5 ${isBentoHero ? 'md:p-6' : ''}`}>
        <h4 className={`font-medium line-clamp-2 ${isBentoHero ? 'text-lg md:text-2xl' : 'text-sm'}`}>{product.name}</h4>
        <div className="flex items-baseline gap-2">
          <span className={`font-bold ${isBentoHero ? 'text-lg' : 'text-sm'}`} style={{ color: themeColor || "var(--primary, #a855f7)" }}>
            ฿{product.price?.toLocaleString("th-TH")}
          </span>
        </div>
      </div>
    </>
  );
}
