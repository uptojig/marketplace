'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  Minus,
  Plus,
  ShoppingBag,
  Zap,
  Shield,
  Truck,
  Package,
} from 'lucide-react';
import { formatTHB } from '@/lib/utils';
import { useCart } from '@/lib/store/cart';
import type { ProductDetailProps } from '@/lib/templates/types';

/**
 * BlackWrapp — premium dark Product Detail.
 *
 * Image gallery on a near-black canvas with a subtle accent rim glow.
 * Right rail: title, accent-color price, qty stepper, two CTAs
 * (เพิ่มลงตะกร้า / ซื้อเลย → /checkout).
 *
 * ADD only adjusts the cart; no popup, no toast. BUY NOW pushes the
 * user straight into checkout per task spec.
 */
export default function BlackwrappProductDetail(props: ProductDetailProps) {
  const { store, product, related } = props;
  const router = useRouter();
  const add = useCart((s) => s.add);

  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  // Build gallery: prefer the explicit images[] (which the adapter has
  // already deduped against imageUrl), fall back to the single hero.
  const gallery =
    product.images.length > 0
      ? product.images
      : product.imageUrl
        ? [product.imageUrl]
        : [];

  const hasDiscount =
    product.originalPriceTHB && product.originalPriceTHB > product.priceTHB;
  const savings = hasDiscount
    ? (product.originalPriceTHB as number) - product.priceTHB
    : 0;

  const doAdd = (n: number) => {
    add(
      {
        productId: product.id,
        storeSlug: store.slug,
        storeName: store.name,
        title: product.title,
        priceTHB: product.priceTHB,
        imageUrl: product.imageUrl ?? undefined,
      },
      n,
    );
  };

  const handleAdd = () => doAdd(qty);

  const handleBuyNow = () => {
    doAdd(qty);
    router.push(`/stores/${store.slug}/checkout`);
  };

  return (
    <main
      className="font-[family:var(--font-prompt)] min-h-screen"
      style={{ background: '#0A0A0A', color: '#FAFAFA' }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Breadcrumb */}
        <Link
          href={`/stores/${store.slug}/category`}
          className="inline-flex items-center gap-1 text-[11px] tracking-[0.2em] uppercase text-white/55 hover:text-white transition-colors mb-8"
        >
          <ChevronLeft size={14} strokeWidth={1.75} />
          กลับไปหน้าสินค้า
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
          {/* Gallery */}
          <div className="space-y-4">
            <div
              className="relative aspect-square rounded-2xl overflow-hidden border border-white/10"
              style={{
                background:
                  'linear-gradient(135deg, #141414 0%, #0A0A0A 100%)',
                boxShadow:
                  '0 0 60px var(--shop-primary, #00FF88)10, inset 0 0 0 1px rgba(255,255,255,0.04)',
              }}
            >
              {gallery[activeImage] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={gallery[activeImage]}
                  alt={product.title}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="eager"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Package
                    size={48}
                    strokeWidth={1}
                    className="text-white/15"
                  />
                </div>
              )}
            </div>

            {gallery.length > 1 && (
              <div
                role="tablist"
                aria-label="รูปภาพสินค้า"
                className="grid grid-cols-5 sm:grid-cols-6 gap-2"
              >
                {gallery.map((url, i) => (
                  <button
                    key={`${url}-${i}`}
                    type="button"
                    role="tab"
                    aria-selected={i === activeImage}
                    aria-label={`ดูรูปที่ ${i + 1}`}
                    onClick={() => setActiveImage(i)}
                    className="relative aspect-square overflow-hidden rounded-lg border bg-[#141414] transition-all"
                    style={{
                      borderColor:
                        i === activeImage
                          ? 'var(--shop-primary, #00FF88)'
                          : 'rgba(255,255,255,0.08)',
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 h-full w-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info rail */}
          <div className="space-y-7">
            {product.categoryName && (
              <span
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1 text-[10px] tracking-[0.3em] uppercase text-white/65"
              >
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full"
                  style={{ background: 'var(--shop-primary, #00FF88)' }}
                />
                {product.categoryName}
              </span>
            )}

            <h1 className="font-[family:var(--font-kanit)] font-medium text-3xl sm:text-4xl leading-tight tracking-[0.01em] text-white">
              {product.title}
            </h1>

            {/* Price */}
            <div
              className="rounded-xl border border-white/10 p-5"
              style={{ background: '#141414' }}
            >
              <div className="flex items-baseline gap-3 flex-wrap">
                <span
                  className="font-[family:var(--font-kanit)] font-medium text-3xl sm:text-4xl tabular-nums"
                  style={{ color: 'var(--shop-primary, #00FF88)' }}
                >
                  {formatTHB(product.priceTHB)}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-base text-white/35 line-through tabular-nums">
                      {formatTHB(product.originalPriceTHB as number)}
                    </span>
                    <span
                      className="rounded-full px-2.5 py-1 text-[10px] tracking-[0.15em] uppercase"
                      style={{
                        background: 'var(--shop-primary, #00FF88)18',
                        color: 'var(--shop-primary, #00FF88)',
                      }}
                    >
                      ประหยัด {formatTHB(savings)}
                    </span>
                  </>
                )}
              </div>
              {typeof product.stockLeft === 'number' && product.stockLeft > 0 && (
                <p className="mt-2 text-xs text-white/55">
                  เหลือ {product.stockLeft.toLocaleString()} ชิ้น
                </p>
              )}
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-4">
              <span className="text-[10px] tracking-[0.3em] uppercase text-white/55">
                จำนวน
              </span>
              <div
                role="group"
                aria-label="ปรับจำนวน"
                className="inline-flex items-center rounded-full border border-white/10"
                style={{ background: '#141414' }}
              >
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="inline-flex h-10 w-10 items-center justify-center text-white/80 hover:text-white transition-colors"
                  aria-label="ลดจำนวน"
                >
                  <Minus size={14} strokeWidth={2} />
                </button>
                <input
                  type="number"
                  min={1}
                  value={qty}
                  onChange={(e) => {
                    const n = parseInt(e.target.value, 10);
                    setQty(Number.isFinite(n) && n > 0 ? n : 1);
                  }}
                  className="w-12 bg-transparent text-center text-sm font-medium text-white outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  aria-label="จำนวน"
                />
                <button
                  type="button"
                  onClick={() => setQty((q) => q + 1)}
                  className="inline-flex h-10 w-10 items-center justify-center text-white/80 hover:text-white transition-colors"
                  aria-label="เพิ่มจำนวน"
                >
                  <Plus size={14} strokeWidth={2} />
                </button>
              </div>
            </div>

            {/* CTAs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleAdd}
                className="inline-flex items-center justify-center gap-2 rounded-full border px-6 py-3.5 font-[family:var(--font-kanit)] text-sm tracking-[0.15em] uppercase transition-all duration-300"
                style={{
                  borderColor: 'var(--shop-primary, #00FF88)',
                  color: 'var(--shop-primary, #00FF88)',
                }}
              >
                <ShoppingBag size={15} strokeWidth={2} />
                เพิ่มลงตะกร้า
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 font-[family:var(--font-kanit)] text-sm tracking-[0.15em] uppercase transition-all duration-300"
                style={{
                  background:
                    'var(--shop-primary-gradient, var(--shop-primary, #00FF88))',
                  color: '#0A0A0A',
                  boxShadow: '0 0 28px var(--shop-primary, #00FF88)45',
                }}
              >
                <Zap size={15} strokeWidth={2.25} />
                ซื้อเลย
              </button>
            </div>

            {/* Description */}
            {product.description && (
              <div className="border-t border-white/5 pt-6 space-y-3">
                <h2 className="text-[10px] tracking-[0.3em] uppercase text-white/50">
                  รายละเอียด
                </h2>
                <p className="text-sm leading-relaxed text-white/75 whitespace-pre-wrap">
                  {product.description}
                </p>
              </div>
            )}

            {/* Trust strip */}
            <div className="grid grid-cols-2 gap-3 border-t border-white/5 pt-6">
              <div
                className="flex items-start gap-3 rounded-lg border border-white/10 p-3"
                style={{ background: '#141414' }}
              >
                <Truck
                  size={16}
                  strokeWidth={1.75}
                  style={{ color: 'var(--shop-primary, #00FF88)' }}
                />
                <div>
                  <p className="text-[11px] font-medium text-white">
                    DELIVERED
                  </p>
                  <p className="text-[10px] text-white/55">ส่งฟรีทั่วประเทศ</p>
                </div>
              </div>
              <div
                className="flex items-start gap-3 rounded-lg border border-white/10 p-3"
                style={{ background: '#141414' }}
              >
                <Shield
                  size={16}
                  strokeWidth={1.75}
                  style={{ color: 'var(--shop-primary, #00FF88)' }}
                />
                <div>
                  <p className="text-[11px] font-medium text-white">
                    GUARANTEED
                  </p>
                  <p className="text-[10px] text-white/55">รับประกัน 14 วัน</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-20 border-t border-white/5 pt-12">
            <div className="flex items-end justify-between mb-8">
              <div className="space-y-2">
                <span className="text-[10px] tracking-[0.3em] uppercase text-white/50">
                  YOU MAY ALSO LIKE
                </span>
                <h2 className="font-[family:var(--font-kanit)] font-medium text-2xl text-white">
                  สินค้าที่คุณอาจสนใจ
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {related.slice(0, 4).map((p) => (
                <Link
                  key={p.id}
                  href={`/stores/${store.slug}/products/${p.id}`}
                  className="group rounded-xl overflow-hidden border border-white/10 transition-all duration-300 hover:border-[var(--shop-primary,#00FF88)]"
                  style={{ background: '#141414' }}
                >
                  <div className="relative aspect-square overflow-hidden bg-[#0A0A0A]">
                    {p.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.imageUrl}
                        alt={p.title}
                        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package
                          size={24}
                          strokeWidth={1.25}
                          className="text-white/15"
                        />
                      </div>
                    )}
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="text-sm font-medium text-white line-clamp-2 leading-snug min-h-[2.5rem]">
                      {p.title}
                    </h3>
                    <span
                      className="font-[family:var(--font-kanit)] font-medium text-sm tabular-nums"
                      style={{ color: 'var(--shop-primary, #00FF88)' }}
                    >
                      {formatTHB(p.priceTHB)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
