"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  Menu,
  Search,
  Star,
  Heart,
  ChevronRight,
} from "lucide-react";
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
}

export function MiniMopsTemplate({
  store,
  products,
  featuredProduct,
  navCategories = [],
  gridHeading = "ไอเทมยอดฮิตในบ้าน & ครัว",
  gridSubheading = "คัดสรรสินค้าคุณภาพระดับพรีเมียม เพื่อบ้านที่น่าอยู่ของคุณ",
}: Props) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const cartCount = useCart((s) => s.count());
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

  const categoryHref = (cat: string) =>
    `/stores/${store.slug}/category/${encodeURIComponent(cat)}`;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      {/* Navigation */}
      <nav className="bg-white sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-500 hover:text-emerald-600"
                aria-label="Open menu"
              >
                <Menu size={24} />
              </button>
              <Link
                href={`/stores/${store.slug}`}
                className="text-2xl font-black tracking-tight text-emerald-700 flex items-center gap-2"
              >
                <span className="bg-emerald-100 p-1.5 rounded-lg">✨</span>
                {store.name}
              </Link>
            </div>

            <div className="hidden md:flex space-x-8">
              <Link
                href={`/stores/${store.slug}`}
                className="text-emerald-600 font-semibold border-b-2 border-emerald-600 px-1 py-2"
              >
                หน้าแรก
              </Link>
              {navCategories.slice(0, 4).map((c) => (
                <Link
                  key={c.category}
                  href={categoryHref(c.category)}
                  className="text-gray-500 hover:text-emerald-600 font-medium px-1 py-2 transition-colors"
                >
                  {c.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center space-x-4 border-l pl-4 border-gray-200">
              <Link
                href={`/stores/${store.slug}/search`}
                className="text-gray-500 hover:text-emerald-600 hidden sm:block transition-colors"
                aria-label="Search"
              >
                <Search size={22} />
              </Link>
              <Link
                href={`/stores/${store.slug}/cart`}
                className="text-gray-500 hover:text-emerald-600 relative transition-colors"
                aria-label="Cart"
              >
                <ShoppingCart size={22} />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 py-4 px-4 space-y-3 shadow-inner">
            <Link
              href={`/stores/${store.slug}`}
              className="block font-medium text-emerald-600 bg-emerald-50 rounded-lg px-4 py-2"
            >
              หน้าแรก
            </Link>
            {navCategories.slice(0, 4).map((c) => (
              <Link
                key={c.category}
                href={categoryHref(c.category)}
                className="block font-medium text-gray-600 hover:bg-gray-50 rounded-lg px-4 py-2"
              >
                {c.label}
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* Hero — featured product */}
      {featured && (
        <div className="bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
            <div className="bg-emerald-50 rounded-3xl overflow-hidden flex flex-col lg:flex-row items-center border border-emerald-100 shadow-sm relative">
              <div className="absolute top-6 left-6 z-10 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-emerald-700 text-sm font-bold shadow-sm border border-emerald-100 flex items-center gap-1.5">
                <Star size={14} className="fill-emerald-500 text-emerald-500" /> สินค้าขายดีประจำสัปดาห์
              </div>

              <div className="p-8 lg:p-16 lg:w-1/2 flex flex-col justify-center items-start z-10">
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4">
                  {store.tagline ?? "ยกระดับห้องครัวของคุณ"}
                  <br />
                  <span className="text-emerald-600">
                    {store.description?.slice(0, 50) ??
                      "ให้สมบูรณ์แบบกว่าที่เคย"}
                  </span>
                </h1>
                <p className="text-lg text-gray-600 mb-8 max-w-md line-clamp-3">
                  {featured.title}
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={() => handleAddToCart(featured)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3.5 rounded-full font-semibold transition-all shadow-lg shadow-emerald-200 flex items-center gap-2 transform hover:-translate-y-0.5"
                  >
                    ช้อปเลย ฿{featured.priceTHB.toLocaleString("th-TH")}
                  </button>
                  <Link
                    href={productHref(featured)}
                    className="bg-white text-gray-700 border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 px-6 py-3.5 rounded-full font-medium transition-all"
                  >
                    ดูรายละเอียด
                  </Link>
                </div>
              </div>

              <div className="lg:w-1/2 w-full h-72 lg:h-auto relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 to-transparent z-10 hidden lg:block" />
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
                  <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-emerald-200" />
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
            className="hidden sm:flex items-center text-emerald-600 font-medium hover:text-emerald-700 transition-colors"
          >
            ดูทั้งหมด <ChevronRight size={18} className="ml-1" />
          </Link>
        </div>

        {products.length === 0 ? (
          <p className="text-center py-16 text-gray-500">
            ยังไม่มีสินค้าในร้านนี้
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
            {products.map((p) => {
              const onSale =
                p.compareAtPriceTHB && p.compareAtPriceTHB > p.priceTHB;
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
                      <div className="text-xs font-semibold text-emerald-600 mb-2 uppercase tracking-wider">
                        {p.category}
                      </div>
                    )}
                    <Link
                      href={productHref(p)}
                      className="text-sm font-medium text-gray-800 line-clamp-2 mb-2 flex-grow group-hover:text-emerald-600 transition-colors leading-relaxed"
                    >
                      {p.title}
                    </Link>

                    {p.reviews > 0 && (
                      <div className="flex items-center gap-1 mb-3">
                        <Star
                          size={14}
                          className="fill-amber-400 text-amber-400"
                        />
                        <span className="text-xs font-medium text-gray-700">
                          {p.rating.toFixed(1)}
                        </span>
                        <span className="text-xs text-gray-400">
                          ({p.reviews})
                        </span>
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
                        className="p-2.5 bg-gray-900 hover:bg-emerald-600 text-white rounded-xl transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
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

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16 pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <div className="text-2xl font-black tracking-tight text-emerald-700 flex items-center gap-2 mb-4">
                <span className="bg-emerald-100 p-1 rounded-lg">✨</span>
                {store.name}
              </div>
              <p className="text-gray-500 max-w-sm mb-6">
                {store.description ??
                  "แหล่งรวมของใช้ในบ้าน ของใช้ในครัว และเฟอร์นิเจอร์สุดชิค ที่จะช่วยให้บ้านของคุณน่าอยู่และมีสไตล์ในทุกๆ มุม"}
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-4">หมวดหมู่สินค้า</h4>
              <ul className="space-y-2 text-gray-500">
                {navCategories.length > 0
                  ? navCategories.slice(0, 4).map((c) => (
                      <li key={c.category}>
                        <Link
                          href={categoryHref(c.category)}
                          className="hover:text-emerald-600 transition-colors"
                        >
                          {c.label}
                        </Link>
                      </li>
                    ))
                  : null}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-4">บริการลูกค้า</h4>
              <ul className="space-y-2 text-gray-500">
                <li>
                  <Link
                    href={`/stores/${store.slug}/about`}
                    className="hover:text-emerald-600 transition-colors"
                  >
                    เกี่ยวกับเรา
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/stores/${store.slug}/shipping`}
                    className="hover:text-emerald-600 transition-colors"
                  >
                    นโยบายการจัดส่ง
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/stores/${store.slug}/returns`}
                    className="hover:text-emerald-600 transition-colors"
                  >
                    การรับประกันและคืนสินค้า
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/stores/${store.slug}/contact`}
                    className="hover:text-emerald-600 transition-colors"
                  >
                    ติดต่อเรา
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} {store.name}. สงวนลิขสิทธิ์</p>
            <div className="flex gap-4">
              <Link
                href={`/stores/${store.slug}/terms`}
                className="hover:text-gray-600"
              >
                ข้อกำหนดและเงื่อนไข
              </Link>
              <Link
                href={`/stores/${store.slug}/privacy`}
                className="hover:text-gray-600"
              >
                นโยบายความเป็นส่วนตัว
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
