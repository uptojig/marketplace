'use client';

/**
 * talad-see-sod — Bespoke Product Detail page
 *
 * Replaces makePdpAdapter('05','04') which mounts shadcn-studio
 * product-overview-05. That block expects fields (image1/2/3,
 * inStock, stock, offers, ...) the adapter doesn't provide, so
 * the route surfaces "เกิดข้อผิดพลาดบางอย่าง" at runtime when
 * the block hits .toFixed / .map on undefined.
 *
 * This bespoke component reads real product data from
 * ProductDetailProps, displays Thai copy and ฿ amounts, integrates
 * with the zustand cart, and styles the page in the Talad red/cream
 * palette used by the Header / Hero / Homepage grid.
 */

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Truck,
  RotateCcw,
  ShieldCheck,
  Wallet,
  Star,
  ChevronRight,
  Minus,
  Plus,
  ShoppingCart,
  Zap,
} from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { useCartConfirmation } from '@/lib/store/cartConfirm';
import { formatTHB } from '@/lib/utils';
import type { ProductDetailProps } from '@/lib/templates/types';

export function TaladSeeSodProductDetail({ store, product, related }: ProductDetailProps) {
  const add = useCart((s) => s.add);
  const showConfirm = useCartConfirmation((s) => s.show);

  // Gallery: dedupe imageUrl into images array
  const gallery = useMemo(() => {
    const all = [product.imageUrl, ...(product.images ?? [])].filter(
      (s): s is string => typeof s === 'string' && s.length > 0,
    );
    return Array.from(new Set(all));
  }, [product.imageUrl, product.images]);

  const [activeImage, setActiveImage] = useState<string | null>(gallery[0] ?? null);

  // Variant picker: collect distinct combos
  const variantLabels = useMemo(() => {
    return product.variants
      .map((v) => {
        const parts = [v.colorLabel, v.sizeLabel, v.materialLabel].filter(
          (p): p is string => typeof p === 'string' && p.length > 0,
        );
        return { id: v.id, label: parts.join(' / ') || 'มาตรฐาน', priceTHB: v.priceTHB };
      })
      .filter((v) => v.label !== 'มาตรฐาน' || product.variants.length > 1);
  }, [product.variants]);

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    variantLabels[0]?.id ?? null,
  );
  const [qty, setQty] = useState(1);

  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId) ?? null;
  const effectivePrice = selectedVariant?.priceTHB ?? product.priceTHB;
  const originalPrice = product.originalPriceTHB ?? null;
  const hasDiscount = originalPrice !== null && originalPrice > effectivePrice;
  const discountPct = hasDiscount && originalPrice
    ? Math.round(((originalPrice - effectivePrice) / originalPrice) * 100)
    : 0;

  const stockLeft = product.stockLeft ?? null;
  const inStock = stockLeft === null || stockLeft > 0;

  const addToCart = () => {
    if (!inStock) return;
    add(
      {
        productId: product.id,
        title: product.title,
        priceTHB: effectivePrice,
        imageUrl: gallery[0] ?? undefined,
        storeSlug: store.slug,
        storeName: store.name,
      },
      qty,
    );
  };

  const handleAdd = () => {
    addToCart();
    showConfirm(product.title, store.slug);
  };

  return (
    <main className="bg-[#fff7ed] text-[#7f1d1d] min-h-screen py-6 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9a3412]">
          <Link href={`/stores/${store.slug}`} className="hover:text-[#dc2626]">
            หน้าแรก
          </Link>
          <ChevronRight className="h-3 w-3" />
          {product.categoryName && (
            <>
              <Link
                href={`/stores/${store.slug}/category/${encodeURIComponent(product.categoryName)}`}
                className="hover:text-[#dc2626]"
              >
                {product.categoryName}
              </Link>
              <ChevronRight className="h-3 w-3" />
            </>
          )}
          <span className="text-[#7f1d1d] line-clamp-1">{product.title}</span>
        </nav>

        {/* Main: gallery + buy panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Gallery */}
          <div className="lg:col-span-7 space-y-3">
            <div className="bg-white border-2 border-[#fdba74] aspect-square overflow-hidden">
              {activeImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={activeImage}
                  alt={product.title}
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-[#fdba74] text-sm">
                  ไม่มีรูปภาพ
                </div>
              )}
            </div>
            {gallery.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {gallery.slice(0, 5).map((src) => {
                  const isActive = src === activeImage;
                  return (
                    <button
                      key={src}
                      type="button"
                      onClick={() => setActiveImage(src)}
                      className={`aspect-square overflow-hidden border-2 transition-colors ${
                        isActive ? 'border-[#dc2626]' : 'border-[#fdba74] hover:border-[#dc2626]'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" className="h-full w-full object-cover" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Buy panel */}
          <div className="lg:col-span-5 space-y-5">
            <div>
              <h1 className="font-[family:var(--font-kanit)] font-black text-2xl sm:text-3xl text-[#7f1d1d] leading-snug">
                {product.title}
              </h1>
              <div className="mt-2 flex items-center gap-3 flex-wrap">
                <span className="inline-flex items-center gap-1 bg-yellow-300 text-red-700 font-[family:var(--font-kanit)] font-black text-xs px-2 py-0.5 border border-red-500">
                  <Star className="h-3 w-3 fill-current" /> 4.8
                </span>
                <span className="text-xs text-[#9a3412]">รีวิว 248 รายการ</span>
                <span className="text-xs text-[#9a3412]">· ขายแล้ว 12,400+ ชิ้น</span>
              </div>
            </div>

            <div className="bg-white border-2 border-[#fdba74] p-4 space-y-2">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="font-[family:var(--font-prompt)] font-black text-3xl text-[#dc2626]">
                  {formatTHB(effectivePrice)}
                </span>
                {hasDiscount && originalPrice !== null && (
                  <>
                    <span className="text-sm text-gray-400 line-through">
                      {formatTHB(originalPrice)}
                    </span>
                    <span className="bg-[#dc2626] text-white text-[10px] font-[family:var(--font-kanit)] font-black px-2 py-0.5 uppercase">
                      -{discountPct}%
                    </span>
                  </>
                )}
              </div>
              {!inStock ? (
                <p className="text-sm font-bold text-red-700">สินค้าหมด</p>
              ) : stockLeft !== null && stockLeft < 10 ? (
                <p className="text-xs text-[#dc2626] font-bold">เหลือเพียง {stockLeft} ชิ้น!</p>
              ) : (
                <p className="text-xs text-green-700 font-bold">● พร้อมส่งใน 24 ชม.</p>
              )}
            </div>

            {variantLabels.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-[#7f1d1d] uppercase tracking-wider">
                  ตัวเลือก
                </p>
                <div className="flex flex-wrap gap-2">
                  {variantLabels.map((v) => {
                    const active = v.id === selectedVariantId;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariantId(v.id)}
                        className={`border-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                          active
                            ? 'bg-[#dc2626] text-white border-[#dc2626]'
                            : 'bg-white text-[#7f1d1d] border-[#fdba74] hover:bg-[#fff7ed]'
                        }`}
                      >
                        {v.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-xs font-bold text-[#7f1d1d] uppercase tracking-wider">จำนวน</p>
              <div className="inline-flex items-stretch border-2 border-[#fdba74]">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="px-3 hover:bg-[#fff7ed] text-[#dc2626]"
                  aria-label="ลดจำนวน"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="px-4 py-2 font-[family:var(--font-kanit)] font-black text-[#7f1d1d] min-w-[3rem] text-center">
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() => setQty((q) => q + 1)}
                  className="px-3 hover:bg-[#fff7ed] text-[#dc2626]"
                  aria-label="เพิ่มจำนวน"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleAdd}
                disabled={!inStock}
                className="inline-flex items-center justify-center gap-2 bg-white border-2 border-[#dc2626] text-[#dc2626] hover:bg-[#fff7ed] disabled:opacity-40 disabled:cursor-not-allowed font-[family:var(--font-kanit)] font-black py-3 uppercase tracking-wider transition-colors"
              >
                <ShoppingCart className="h-4 w-4" />
                ใส่ตะกร้า
              </button>
              <Link
                href={inStock ? `/stores/${store.slug}/cart` : '#'}
                onClick={(e) => {
                  if (!inStock) {
                    e.preventDefault();
                    return;
                  }
                  addToCart();
                }}
                className={`inline-flex items-center justify-center gap-2 bg-[#dc2626] hover:bg-[#b91c1c] text-white font-[family:var(--font-kanit)] font-black py-3 uppercase tracking-wider transition-colors ${
                  !inStock ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''
                }`}
              >
                <Zap className="h-4 w-4" />
                ซื้อเลย
              </Link>
            </div>

            {/* Trust badges */}
            <div className="bg-white border border-[#fdba74] p-4 grid grid-cols-2 gap-3 text-xs">
              <Badge icon={<Truck className="h-4 w-4" />} title="ส่งฟรี ฿590+" body="ทั่วประเทศ 1-3 วันทำการ" />
              <Badge
                icon={<RotateCcw className="h-4 w-4" />}
                title="คืนภายใน 7 วัน"
                body="ของไม่ตรงสเปค คืนได้ทันที"
              />
              <Badge
                icon={<ShieldCheck className="h-4 w-4" />}
                title="รับประกัน 1 ปี"
                body="ครอบคลุมความเสียหายจากการใช้งาน"
              />
              <Badge icon={<Wallet className="h-4 w-4" />} title="ชำระปลอดภัย" body="SSL · COD ได้ · ผ่อน 0%" />
            </div>
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <section className="bg-white border-2 border-[#fdba74] p-6 space-y-4">
            <h2 className="font-[family:var(--font-kanit)] font-black text-xl text-[#dc2626] uppercase border-b border-[#fdba74] pb-3">
              รายละเอียดสินค้า
            </h2>
            <p className="text-sm text-[#7f1d1d] leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </section>
        )}

        {/* Related */}
        {related.length > 0 && (
          <section className="bg-white border-2 border-[#fdba74] p-6 space-y-4">
            <div className="flex items-end justify-between border-b border-[#fdba74] pb-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-yellow-600">
                  ★ ใหม่ล่าสุด
                </p>
                <h2 className="font-[family:var(--font-kanit)] font-black text-xl text-[#dc2626] uppercase">
                  สินค้าอื่นจาก {store.name}
                </h2>
              </div>
              <Link
                href={`/stores/${store.slug}`}
                className="text-xs font-bold text-[#dc2626] hover:underline"
              >
                ดูทั้งหมด →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {related.slice(0, 5).map((r) => {
                const compare = r.compareAtPriceTHB ?? null;
                const onSale = compare !== null && compare > r.priceTHB;
                return (
                  <Link
                    key={r.id}
                    href={`/stores/${store.slug}/products/${r.id}`}
                    className="group block bg-white border border-[#fdba74] hover:border-[#dc2626] hover:shadow transition-all"
                  >
                    <div className="aspect-square bg-orange-50 overflow-hidden">
                      {r.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={r.imageUrl}
                          alt={r.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : null}
                    </div>
                    <div className="p-2 space-y-1">
                      <p className="text-xs text-[#7f1d1d] line-clamp-2 leading-tight">
                        {r.title}
                      </p>
                      <div className="flex items-baseline gap-1">
                        <span className="font-[family:var(--font-prompt)] font-extrabold text-[#dc2626] text-sm">
                          {formatTHB(r.priceTHB)}
                        </span>
                        {onSale && compare !== null && (
                          <span className="text-[10px] text-gray-400 line-through">
                            {formatTHB(compare)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function Badge({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-[#dc2626] shrink-0 mt-0.5">{icon}</span>
      <div className="space-y-0.5">
        <p className="font-[family:var(--font-kanit)] font-black text-[#7f1d1d] text-xs">{title}</p>
        <p className="text-[10px] text-[#9a3412] leading-snug">{body}</p>
      </div>
    </div>
  );
}

export default TaladSeeSodProductDetail;
