"use client";

import Link from "next/link";
import { Star, Heart, ChevronRight, ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/store/cart";
import { useCartConfirmation } from "@/lib/store/cartConfirm";

export interface MiniMopsProduct {
  id: string;
  title: string;
  priceTHB: number;
  compareAtPriceTHB: number | null;
  imageUrl: string | null;
  category: string | null;
  rating: number;
  reviews: number;
}

export interface MiniMopsStore {
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  bannerUrl: string | null;
  primaryColor: string;
}

interface NavCategory {
  label: string;
  category: string;
}

interface Props {
  store: MiniMopsStore;
  products: MiniMopsProduct[];
  /** Hero featured product. If null, falls back to products[0] */
  featuredProduct?: MiniMopsProduct | null;
  /** Footer category links (derived from real product categoryNames) */
  navCategories?: NavCategory[];
  /** Heading text for the grid section */
  gridHeading?: string;
  /** Subheading for the grid section */
  gridSubheading?: string;
  /** Hex accent — defaults to emerald-600. */
  accent?: string;
}

/**
 * Landing-page body for mini-mops-v1. Header/footer live in
 * `components/storefront/templates/mini-mops/{Header,Footer}.tsx`
 * and are rendered by `app/stores/[slug]/layout.tsx` so every
 * sub-page (cart / product / category / …) shares the same chrome.
 */
export function MiniMopsTemplate({
  store,
  products,
  featuredProduct,
  gridHeading = "ไอเทมยอดฮิตในบ้าน & ครัว",
  gridSubheading = "คัดสรรสินค้าคุณภาพระดับพรีเมียม เพื่อบ้านที่น่าอยู่ของคุณ",
  accent = "#10b981",
}: Props) {
  const addToCart = useCart((s) => s.add);
  const showConfirm = useCartConfirmation((s) => s.show);

  const featured = featuredProduct ?? products[0] ?? null;

  const handleAddToCart = (p: MiniMopsProduct) => {
    addToCart({
      productId: p.id,
      title: p.title,
      imageUrl: p.imageUrl ?? undefined,
      priceTHB: p.priceTHB,
      storeSlug: store.slug,
      storeName: store.name,
    });
    showConfirm(p.title, store.slug);
  };

  const productHref = (p: MiniMopsProduct) =>
    `/stores/${store.slug}/products/${p.id}`;

  const accentDeep = `color-mix(in srgb, ${accent} 75%, black)`;
  const accentTint = `color-mix(in srgb, ${accent} 12%, transparent)`;
  const accentBorder = `color-mix(in srgb, ${accent} 24%, transparent)`;

  return (
    <div className="bg-gray-50 font-sans text-gray-800">
      {/* Hero — featured product */}
      {featured && (
        <div className="bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
            <div
              className="rounded-3xl overflow-hidden flex flex-col lg:flex-row items-center border shadow-sm relative"
              style={{
                backgroundColor: accentTint,
                borderColor: accentBorder,
              }}
            >
              <div
                className="absolute top-6 left-6 z-10 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-bold shadow-sm border flex items-center gap-1.5"
                style={{
                  color: accentDeep,
                  borderColor: accentBorder,
                }}
              >
                <Star
                  size={14}
                  className="fill-current"
                  style={{ color: accent }}
                />{" "}
                สินค้าขายดีประจำสัปดาห์
              </div>

              <div className="p-8 lg:p-16 lg:w-1/2 flex flex-col justify-center items-start z-10">
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4">
                  {store.tagline ?? "ยกระดับห้องครัวของคุณ"}
                  <br />
                  <span style={{ color: accent }}>
                    {store.description?.slice(0, 50) ?? "ให้สมบูรณ์แบบกว่าที่เคย"}
                  </span>
                </h1>
                <p className="text-lg text-gray-600 mb-8 max-w-md line-clamp-3">
                  {featured.title}
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={() => handleAddToCart(featured)}
                    className="text-white px-8 py-3.5 rounded-full font-semibold transition-all shadow-lg flex items-center gap-2 transform hover:-translate-y-0.5"
                    style={{
                      backgroundColor: accent,
                      boxShadow: `0 12px 24px -10px ${accent}`,
                    }}
                  >
                    ช้อปเลย ฿{featured.priceTHB.toLocaleString("th-TH")}
                  </button>
                  <Link
                    href={productHref(featured)}
                    className="bg-white text-gray-700 border border-gray-200 px-6 py-3.5 rounded-full font-medium transition-all"
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.borderColor = accentBorder;
                      el.style.backgroundColor = accentTint;
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.borderColor = "";
                      el.style.backgroundColor = "";
                    }}
                  >
                    ดูรายละเอียด
                  </Link>
                </div>
              </div>

              <div className="lg:w-1/2 w-full h-72 lg:h-auto relative">
                <div
                  className="absolute inset-0 z-10 hidden lg:block"
                  style={{
                    background: `linear-gradient(to right, ${accentTint}, transparent)`,
                  }}
                />
                {featured.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={featured.imageUrl}
                    alt={featured.title}
                    className="w-full h-full object-cover object-center"
                  />
                ) : store.bannerUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={store.bannerUrl}
                    alt={store.name}
                    className="w-full h-full object-cover object-center"
                  />
                ) : (
                  <div
                    className="w-full h-full"
                    style={{
                      background: `linear-gradient(to bottom right, ${accentTint}, color-mix(in srgb, ${accent} 25%, transparent))`,
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              {gridHeading}
            </h2>
            <p className="text-gray-500">{gridSubheading}</p>
          </div>
          <Link
            href={`/stores/${store.slug}/products`}
            className="hidden sm:flex items-center font-medium transition-colors"
            style={{ color: accent }}
          >
            ดูทั้งหมด <ChevronRight size={18} className="ml-1" />
          </Link>
        </div>

        {products.length === 0 ? (
          <p className="text-center py-16 text-gray-500">ยังไม่มีสินค้าในร้านนี้</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
            {products.map((p) => {
              const onSale = p.compareAtPriceTHB && p.compareAtPriceTHB > p.priceTHB;
              return (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col h-full"
                >
                  <Link
                    href={productHref(p)}
                    className="relative aspect-square rounded-xl overflow-hidden mb-4 bg-gray-50 block"
                  >
                    {p.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.imageUrl}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100" />
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full text-gray-400 hover:text-rose-500 hover:bg-white transition-colors z-10 opacity-0 group-hover:opacity-100 focus:opacity-100"
                      aria-label="Favorite"
                    >
                      <Heart size={18} />
                    </button>
                    {onSale && (
                      <span className="absolute left-3 top-3 rounded bg-rose-500 px-2 py-0.5 text-xs font-bold text-white">
                        SALE
                      </span>
                    )}
                  </Link>

                  <div className="flex flex-col flex-grow">
                    {p.category && (
                      <div
                        className="text-xs font-semibold mb-2 uppercase tracking-wider"
                        style={{ color: accent }}
                      >
                        {p.category}
                      </div>
                    )}
                    <Link
                      href={productHref(p)}
                      className="text-sm font-medium text-gray-800 line-clamp-2 mb-2 flex-grow transition-colors leading-relaxed"
                    >
                      {p.title}
                    </Link>

                    {p.reviews > 0 && (
                      <div className="flex items-center gap-1 mb-3">
                        <Star size={14} className="fill-amber-400 text-amber-400" />
                        <span className="text-xs font-medium text-gray-700">
                          {p.rating.toFixed(1)}
                        </span>
                        <span className="text-xs text-gray-400">({p.reviews})</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex flex-col">
                        <span className="text-lg font-bold text-gray-900">
                          ฿{p.priceTHB.toLocaleString("th-TH")}
                        </span>
                        {onSale && p.compareAtPriceTHB && (
                          <span className="text-xs text-gray-400 line-through">
                            ฿{p.compareAtPriceTHB.toLocaleString("th-TH")}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddToCart(p)}
                        className="p-2.5 bg-gray-900 text-white rounded-xl transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2"
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.backgroundColor = accent;
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.backgroundColor = "";
                        }}
                        aria-label="Add to cart"
                      >
                        <ShoppingCart size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Mobile View All Button */}
        <div className="mt-10 sm:hidden">
          <Link
            href={`/stores/${store.slug}/products`}
            className="w-full py-3.5 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors flex items-center justify-center"
          >
            ดูสินค้าทั้งหมด <ChevronRight size={18} className="ml-1 text-gray-400" />
          </Link>
        </div>
      </div>
    </div>
  );
}
