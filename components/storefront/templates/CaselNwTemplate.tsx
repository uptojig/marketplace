"use client";

import Link from "next/link";
import {
  ShoppingBag,
  Star,
  Heart,
  ChevronRight,
  Truck,
  ShieldCheck,
  RotateCcw,
  Headphones,
} from "lucide-react";
import { useCart } from "@/lib/store/cart";
import { useCartConfirmation } from "@/lib/store/cartConfirm";
import type {
  MiniMopsProduct as Product,
  MiniMopsStore as Store,
} from "./MiniMopsTemplate";

interface NavCategory {
  label: string;
  category: string;
}

interface Props {
  store: Store;
  products: Product[];
  featuredProduct?: Product | null;
  navCategories?: NavCategory[];
  gridHeading?: string;
  gridSubheading?: string;
  /** Hex accent — drives discount/CTA highlights. Defaults to caselnw orange. */
  accent?: string;
}

const TRUST_STRIP = [
  { Icon: Truck, title: "ส่งฟรี", subtitle: "ครบ ฿499" },
  { Icon: RotateCcw, title: "เปลี่ยนคืน", subtitle: "ภายใน 7 วัน" },
  { Icon: ShieldCheck, title: "จ่ายปลอดภัย", subtitle: "SSL + 3D Secure" },
  { Icon: Headphones, title: "แชทตอบไว", subtitle: "9.00 – 21.00" },
];

/**
 * Landing-page body for caselnw-v1. The header/footer live in
 * `components/storefront/templates/caselnw/{Header,Footer}.tsx` and
 * are rendered by `app/stores/[slug]/layout.tsx` so they wrap every
 * sub-page (cart, product, category, …) consistently.
 */
export function CaselNwTemplate({
  store,
  products,
  featuredProduct,
  navCategories = [],
  gridHeading = "เคสยอดนิยม",
  gridSubheading = "คัดสรรดีไซน์ใหม่ทุกสัปดาห์ — รองรับรุ่นยอดฮิต iPhone & Samsung",
  accent = "#f97316",
}: Props) {
  const addToCart = useCart((s) => s.add);
  const showConfirm = useCartConfirmation((s) => s.show);

  const featured = featuredProduct ?? products[0] ?? null;
  const bestSellers = products.slice(1, 5);
  const productHref = (p: Product) => `/stores/${store.slug}/products/${p.id}`;
  const categoryHref = (cat: string) =>
    `/stores/${store.slug}/category/${encodeURIComponent(cat)}`;

  const handleAdd = (p: Product) => {
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

  return (
    <div className="bg-white text-slate-900">
      {/* Hero — featured product */}
      {featured && (
        <section
          className="border-b border-slate-100"
          style={{
            background: `linear-gradient(to bottom right, #f8fafc, #ffffff, color-mix(in srgb, ${accent} 8%, transparent))`,
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="order-2 lg:order-1">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold mb-5"
                style={{
                  backgroundColor: `color-mix(in srgb, ${accent} 18%, transparent)`,
                  color: `color-mix(in srgb, ${accent} 75%, black)`,
                }}
              >
                <Star
                  size={12}
                  className="fill-current"
                  style={{ color: accent }}
                />
                ขายดีประจำสัปดาห์
              </span>
              <h1 className="text-3xl md:text-5xl font-extrabold leading-tight tracking-tight mb-4">
                {store.tagline ?? "เคสคุณภาพ ดีไซน์เป็นของตัวคุณ"}
              </h1>
              <p className="text-base md:text-lg text-slate-600 mb-7 line-clamp-3">
                {featured.title}
              </p>
              <div className="flex items-baseline gap-3 mb-7">
                <span className="text-3xl font-extrabold text-slate-900">
                  ฿{featured.priceTHB.toLocaleString("th-TH")}
                </span>
                {featured.compareAtPriceTHB &&
                  featured.compareAtPriceTHB > featured.priceTHB && (
                    <>
                      <span className="text-base text-slate-400 line-through">
                        ฿{featured.compareAtPriceTHB.toLocaleString("th-TH")}
                      </span>
                      <span className="rounded-md bg-rose-100 text-rose-700 px-2 py-0.5 text-xs font-bold">
                        -
                        {Math.round(
                          ((featured.compareAtPriceTHB - featured.priceTHB) /
                            featured.compareAtPriceTHB) *
                            100,
                        )}
                        %
                      </span>
                    </>
                  )}
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => handleAdd(featured)}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 text-white px-6 py-3.5 text-sm font-semibold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10"
                >
                  <ShoppingBag size={18} />
                  เพิ่มลงตะกร้า
                </button>
                <Link
                  href={productHref(featured)}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-800 hover:border-slate-900 transition-colors"
                >
                  ดูรายละเอียด
                  <ChevronRight size={16} />
                </Link>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="relative aspect-square overflow-hidden rounded-3xl bg-white border border-slate-100 shadow-xl shadow-slate-900/5">
                {featured.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={featured.imageUrl}
                    alt={featured.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : store.bannerUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={store.bannerUrl}
                    alt={store.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200" />
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Trust strip */}
      <section className="border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {TRUST_STRIP.map(({ Icon, title, subtitle }) => (
            <div key={title} className="flex items-center gap-3">
              <span
                className="inline-flex items-center justify-center size-10 rounded-full bg-slate-900 shrink-0"
                style={{ color: accent }}
              >
                <Icon size={18} />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">{title}</p>
                <p className="text-xs text-slate-500">{subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Category picker */}
      {navCategories.length > 0 && (
        <section className="border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex items-end justify-between mb-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                  เลือกตามรุ่น
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  รองรับมือถือยอดนิยมหลากหลายรุ่น
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
              {navCategories.slice(0, 8).map((c) => (
                <Link
                  key={c.category}
                  href={categoryHref(c.category)}
                  className="group relative aspect-[4/3] rounded-2xl border border-slate-200 bg-slate-50 hover:border-slate-900 transition-colors flex items-center justify-center text-center px-4"
                >
                  <span className="text-sm font-semibold text-slate-800 group-hover:text-slate-900">
                    {c.label}
                  </span>
                  <ChevronRight
                    size={16}
                    className="absolute right-3 bottom-3 text-slate-400 group-hover:text-slate-900"
                  />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Product grid */}
      <section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                {gridHeading}
              </h2>
              <p className="text-sm text-slate-500 mt-1">{gridSubheading}</p>
            </div>
            <Link
              href={`/stores/${store.slug}/products`}
              className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-slate-700 hover:text-slate-900"
            >
              ดูทั้งหมด <ChevronRight size={16} />
            </Link>
          </div>

          {products.length === 0 ? (
            <p className="text-center py-16 text-slate-500">ยังไม่มีสินค้าในร้านนี้</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
              {products.slice(0, 12).map((p) => {
                const onSale = p.compareAtPriceTHB && p.compareAtPriceTHB > p.priceTHB;
                const discount =
                  onSale && p.compareAtPriceTHB
                    ? Math.round(
                        ((p.compareAtPriceTHB - p.priceTHB) / p.compareAtPriceTHB) *
                          100,
                      )
                    : 0;
                return (
                  <div
                    key={p.id}
                    className="group flex flex-col rounded-2xl border border-slate-200 bg-white hover:border-slate-900 transition-colors overflow-hidden"
                  >
                    <Link
                      href={productHref(p)}
                      className="relative block aspect-square overflow-hidden bg-slate-50"
                    >
                      {p.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.imageUrl}
                          alt={p.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-100" />
                      )}
                      {onSale && (
                        <span className="absolute left-3 top-3 inline-flex items-center rounded-md bg-rose-500 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
                          -{discount}%
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        aria-label="Wishlist"
                        className="absolute top-3 right-3 size-8 rounded-full bg-white/90 backdrop-blur grid place-items-center text-slate-500 hover:text-rose-500 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                      >
                        <Heart size={15} />
                      </button>
                    </Link>

                    <div className="flex flex-col flex-grow p-4">
                      {p.category && (
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                          {p.category}
                        </p>
                      )}
                      <Link
                        href={productHref(p)}
                        className="text-sm font-medium text-slate-900 line-clamp-2 mb-3 flex-grow group-hover:underline"
                      >
                        {p.title}
                      </Link>

                      {p.reviews > 0 && (
                        <div className="flex items-center gap-1 mb-3 text-xs text-slate-500">
                          <Star size={12} className="fill-amber-400 text-amber-400" />
                          <span className="font-semibold text-slate-700">
                            {p.rating.toFixed(1)}
                          </span>
                          <span>·</span>
                          <span>{p.reviews} ขายแล้ว</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex flex-col">
                          <span className="text-base font-extrabold text-slate-900">
                            ฿{p.priceTHB.toLocaleString("th-TH")}
                          </span>
                          {onSale && p.compareAtPriceTHB && (
                            <span className="text-[11px] text-slate-400 line-through">
                              ฿{p.compareAtPriceTHB.toLocaleString("th-TH")}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAdd(p)}
                          className="size-9 rounded-lg bg-slate-900 text-white grid place-items-center transition-colors"
                          style={
                            {
                              ["--hover-bg" as string]: accent,
                            } as React.CSSProperties
                          }
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                              accent;
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                              "";
                          }}
                          aria-label="Add to cart"
                        >
                          <ShoppingBag size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-10 sm:hidden">
            <Link
              href={`/stores/${store.slug}/products`}
              className="block w-full text-center rounded-xl border border-slate-200 py-3.5 text-sm font-semibold text-slate-800 hover:border-slate-900 transition-colors"
            >
              ดูสินค้าทั้งหมด
            </Link>
          </div>
        </div>
      </section>

      {/* Best sellers */}
      {bestSellers.length > 0 && (
        <section className="bg-slate-50 border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-end justify-between mb-6">
              <div>
                <h2 className="text-xl md:text-2xl font-bold tracking-tight">
                  แนะนำเฉพาะสำหรับคุณ
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  ดีไซน์ที่มาแรงในกลุ่มลูกค้าเดือนนี้
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
              {bestSellers.map((p) => (
                <Link
                  key={p.id}
                  href={productHref(p)}
                  className="group flex flex-col rounded-2xl bg-white border border-slate-200 hover:border-slate-900 transition-colors overflow-hidden"
                >
                  <div className="relative aspect-square bg-slate-100">
                    {p.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.imageUrl}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : null}
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-slate-500 line-clamp-1 mb-0.5">
                      {p.category ?? store.name}
                    </p>
                    <p className="text-sm font-medium line-clamp-2 mb-2">{p.title}</p>
                    <p className="text-sm font-bold">
                      ฿{p.priceTHB.toLocaleString("th-TH")}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
