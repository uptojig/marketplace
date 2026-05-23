'use client';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Star,
  Flame,
  Timer,
  ShoppingCart,
  Truck,
  ShieldCheck,
  RotateCw,
  Plus,
  Minus,
  ChevronRight,
} from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';
import { soldChip, flashDeadlineSeconds } from '../palette';

interface ProductVariant {
  id: string;
  attributes: Record<string, string>;
  colorLabel?: string | null;
  sizeLabel?: string | null;
  materialLabel?: string | null;
  priceTHB: number;
  imageUrl?: string | null;
  inventory: number | null;
}

interface PdpProduct {
  id: string;
  title: string;
  description?: string | null;
  priceTHB: number;
  originalPriceTHB?: number | null;
  imageUrl?: string | null;
  images: string[];
  variants: ProductVariant[];
  stockLeft?: number | null;
  videoUrl?: string | null;
  categoryName?: string | null;
}

interface RelatedCard {
  id: string;
  title: string;
  imageUrl?: string | null;
  priceTHB: number;
  compareAtPriceTHB?: number | null;
  categoryName?: string | null;
}

export interface ProductDetailProps {
  store: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string | null;
  };
  product: PdpProduct;
  related: RelatedCard[];
}

/**
 * taobao-style — Product Detail page.
 *
 * Sections:
 *   - Two-column hero: gallery (left) + price/CTA stack (right)
 *   - Flash deal countdown bar
 *   - Variant pickers (color / size / material)
 *   - Trust strip (guarantee · ship · return)
 *   - Description + spec list
 *   - Related products rail
 */
export function ProductDetail({ store, product, related }: ProductDetailProps) {
  const add = useCart((s) => s.add);

  const gallery = useMemo(() => {
    const main = product.imageUrl ? [product.imageUrl] : [];
    const rest = product.images.filter((i) => i !== product.imageUrl);
    return [...main, ...rest];
  }, [product.imageUrl, product.images]);

  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants[0] ?? null,
  );

  const colorOptions = useMemo(() => {
    const seen = new Set<string>();
    return product.variants
      .filter((v) => v.colorLabel)
      .filter((v) => {
        if (seen.has(v.colorLabel!)) return false;
        seen.add(v.colorLabel!);
        return true;
      });
  }, [product.variants]);

  const sizeOptions = useMemo(() => {
    const seen = new Set<string>();
    return product.variants
      .filter((v) => v.sizeLabel)
      .filter((v) => {
        if (seen.has(v.sizeLabel!)) return false;
        seen.add(v.sizeLabel!);
        return true;
      });
  }, [product.variants]);

  const totalSeconds = useMemo(
    () => flashDeadlineSeconds(`${store.slug}-${product.id}`),
    [store.slug, product.id],
  );
  const [remaining, setRemaining] = useState(totalSeconds);
  useEffect(() => {
    setRemaining(totalSeconds);
    const id = setInterval(() => setRemaining((r) => (r > 0 ? r - 1 : totalSeconds)), 1000);
    return () => clearInterval(id);
  }, [totalSeconds]);

  const hh = String(Math.floor(remaining / 3600)).padStart(2, '0');
  const mm = String(Math.floor((remaining % 3600) / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');

  const effectivePrice = selectedVariant?.priceTHB ?? product.priceTHB;
  const hasDiscount =
    product.originalPriceTHB && product.originalPriceTHB > effectivePrice;
  const discountPct = hasDiscount
    ? Math.round(((product.originalPriceTHB! - effectivePrice) / product.originalPriceTHB!) * 100)
    : 0;
  const savedAmount = hasDiscount ? product.originalPriceTHB! - effectivePrice : 0;

  // Social proof — stable per product
  const sp = useMemo(() => {
    let h = 0;
    for (let i = 0; i < product.id.length; i++) h = (h * 31 + product.id.charCodeAt(i)) | 0;
    return {
      sold: 50 + (Math.abs(h) % 5500),
      rating: (4 + (Math.abs(h >> 3) % 10) / 10).toFixed(1),
      reviews: 25 + (Math.abs(h >> 5) % 2200),
    };
  }, [product.id]);

  const stockLeft = product.stockLeft ?? selectedVariant?.inventory ?? null;

  const handleAdd = () => {
    add(
      {
        productId: product.id,
        storeSlug: store.slug,
        storeName: store.name,
        title: product.title,
        priceTHB: effectivePrice,
        imageUrl: product.imageUrl || undefined,
      },
      qty,
    );
  };

  return (
    <main
      className="min-h-screen font-[family:var(--font-prompt)] pb-12"
      style={{ background: 'var(--shop-bg)', color: 'var(--shop-ink)' }}
    >
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <nav
          className="text-xs font-[family:var(--font-prompt)] flex items-center gap-1 flex-wrap"
          style={{ color: 'var(--shop-ink-muted)' }}
        >
          <a href={`/stores/${store.slug}`} className="hover:text-[color:var(--shop-primary)]">
            หน้าแรก
          </a>
          <ChevronRight size={12} />
          <a
            href={`/stores/${store.slug}/category`}
            className="hover:text-[color:var(--shop-primary)]"
          >
            สินค้าทั้งหมด
          </a>
          {product.categoryName && (
            <>
              <ChevronRight size={12} />
              <a
                href={`/stores/${store.slug}/category?cat=${encodeURIComponent(product.categoryName)}`}
                className="hover:text-[color:var(--shop-primary)]"
              >
                {product.categoryName}
              </a>
            </>
          )}
          <ChevronRight size={12} />
          <span className="truncate max-w-[200px]" style={{ color: 'var(--shop-ink)' }}>
            {product.title}
          </span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Gallery */}
        <section className="lg:col-span-5">
          <div
            className="bg-white rounded-lg overflow-hidden"
            style={{ border: `1px solid var(--shop-border)` }}
          >
            <div
              className="aspect-square relative overflow-hidden"
              style={{ background: 'var(--shop-muted)' }}
            >
              {gallery[activeImg] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={gallery[activeImg]}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-sm"
                  style={{ color: 'var(--shop-ink-muted)' }}
                >
                  {product.title}
                </div>
              )}
              {discountPct > 0 && (
                <span
                  className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-xs font-[family:var(--font-kanit)] font-black text-white shadow"
                  style={{ background: 'var(--shop-primary)' }}
                >
                  -{discountPct}%
                </span>
              )}
            </div>
            {gallery.length > 1 && (
              <div className="p-2 grid grid-cols-5 gap-1.5">
                {gallery.slice(0, 5).map((img, i) => (
                  <button
                    key={img + i}
                    onClick={() => setActiveImg(i)}
                    className="aspect-square overflow-hidden rounded-md transition-all"
                    style={{
                      border:
                        activeImg === i
                          ? `2px solid var(--shop-primary)`
                          : `1px solid var(--shop-border)`,
                      background: 'var(--shop-muted)',
                    }}
                    aria-label={`ภาพที่ ${i + 1}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Buybox */}
        <section className="lg:col-span-7 space-y-4">
          <div
            className="bg-white rounded-lg p-5"
            style={{ border: `1px solid var(--shop-border)` }}
          >
            {/* Title + badges */}
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              <span
                className="px-2 py-0.5 rounded text-[10px] font-[family:var(--font-kanit)] font-extrabold uppercase text-white"
                style={{ background: 'var(--shop-primary)' }}
              >
                Flash Sale
              </span>
              <span
                className="px-2 py-0.5 rounded text-[10px] font-[family:var(--font-kanit)] font-extrabold uppercase"
                style={{ background: 'var(--shop-accent)', color: 'var(--shop-ink)' }}
              >
                HOT
              </span>
              <span
                className="px-2 py-0.5 rounded text-[10px] font-[family:var(--font-prompt)] font-bold"
                style={{ background: 'var(--shop-muted)', color: 'var(--shop-ink)' }}
              >
                ของแท้ 100%
              </span>
            </div>

            <h1
              className="font-[family:var(--font-kanit)] font-extrabold text-xl sm:text-2xl leading-snug"
              style={{ color: 'var(--shop-ink)' }}
            >
              {product.title}
            </h1>

            {/* Rating + sold */}
            <div
              className="flex items-center gap-3 mt-2 text-xs font-[family:var(--font-prompt)] flex-wrap"
              style={{ color: 'var(--shop-ink-muted)' }}
            >
              <span
                className="flex items-center gap-0.5 font-bold"
                style={{ color: 'var(--shop-accent)' }}
              >
                <Star size={14} fill="currentColor" /> {sp.rating}
              </span>
              <span>|</span>
              <span>{sp.reviews.toLocaleString()} รีวิว</span>
              <span>|</span>
              <span style={{ color: 'var(--shop-primary)' }} className="font-bold">
                {soldChip(sp.sold)}
              </span>
            </div>

            {/* Price block on hot bg */}
            <div
              className="mt-4 rounded-lg p-4 text-white"
              style={{ background: 'var(--shop-primary-gradient)' }}
            >
              <div className="flex items-baseline gap-3 flex-wrap">
                <span
                  className="text-xs font-[family:var(--font-prompt)] font-extrabold uppercase text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]"
                >
                  ราคาแฟลชเซลล์
                </span>
                <span className="font-[family:var(--font-kanit)] font-black text-3xl sm:text-4xl tabular-nums">
                  {formatTHB(effectivePrice)}
                </span>
                {hasDiscount && (
                  <>
                    <span
                      className="text-sm line-through opacity-80"
                      style={{ color: 'white' }}
                    >
                      {formatTHB(product.originalPriceTHB!)}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded text-[11px] font-[family:var(--font-kanit)] font-black"
                      style={{
                        background: 'var(--shop-accent)',
                        color: 'var(--shop-ink)',
                      }}
                    >
                      ประหยัด {formatTHB(savedAmount)}
                    </span>
                  </>
                )}
              </div>

              <div className="mt-3 flex items-center justify-between gap-3 flex-wrap text-xs font-[family:var(--font-prompt)] font-bold">
                <div className="flex items-center gap-1.5">
                  <Timer size={14} style={{ color: 'var(--shop-accent)' }} />
                  ดีลปิดใน
                  <span
                    className="font-[family:var(--font-kanit)] font-black tabular-nums px-1.5 py-0.5 rounded"
                    style={{ background: 'var(--shop-ink)', color: 'var(--shop-accent)' }}
                  >
                    {hh}:{mm}:{ss}
                  </span>
                </div>
                {stockLeft !== null && stockLeft > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Flame size={14} style={{ color: 'var(--shop-accent)' }} />
                    เหลือ {stockLeft} ชิ้น
                  </div>
                )}
              </div>
            </div>

            {/* Variants */}
            {colorOptions.length > 0 && (
              <div className="mt-4">
                <p
                  className="text-[11px] font-[family:var(--font-prompt)] font-extrabold uppercase tracking-wider mb-2"
                  style={{ color: 'var(--shop-ink-muted)' }}
                >
                  สี
                </p>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((v) => {
                    const isActive = selectedVariant?.colorLabel === v.colorLabel;
                    return (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(v)}
                        className="px-3 py-1.5 rounded-md text-xs font-[family:var(--font-prompt)] font-bold transition-colors"
                        style={
                          isActive
                            ? {
                                background: 'var(--shop-bg-soft)',
                                color: 'var(--shop-primary)',
                                border: `2px solid var(--shop-primary)`,
                              }
                            : {
                                background: 'white',
                                color: 'var(--shop-ink)',
                                border: `1px solid var(--shop-border)`,
                              }
                        }
                      >
                        {v.colorLabel}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {sizeOptions.length > 0 && (
              <div className="mt-4">
                <p
                  className="text-[11px] font-[family:var(--font-prompt)] font-extrabold uppercase tracking-wider mb-2"
                  style={{ color: 'var(--shop-ink-muted)' }}
                >
                  ขนาด
                </p>
                <div className="flex flex-wrap gap-2">
                  {sizeOptions.map((v) => {
                    const isActive = selectedVariant?.sizeLabel === v.sizeLabel;
                    return (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(v)}
                        className="px-3 py-1.5 rounded-md text-xs font-[family:var(--font-prompt)] font-bold transition-colors min-w-[44px]"
                        style={
                          isActive
                            ? {
                                background: 'var(--shop-bg-soft)',
                                color: 'var(--shop-primary)',
                                border: `2px solid var(--shop-primary)`,
                              }
                            : {
                                background: 'white',
                                color: 'var(--shop-ink)',
                                border: `1px solid var(--shop-border)`,
                              }
                        }
                      >
                        {v.sizeLabel}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Qty + CTA */}
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <div
                className="inline-flex items-center rounded-md overflow-hidden"
                style={{ border: `1px solid var(--shop-border)` }}
              >
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-9 h-9 flex items-center justify-center"
                  style={{ color: 'var(--shop-ink)' }}
                  aria-label="ลดจำนวน"
                >
                  <Minus size={14} />
                </button>
                <input
                  type="number"
                  value={qty}
                  onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
                  className="w-12 h-9 text-center bg-transparent text-sm font-[family:var(--font-kanit)] font-black outline-none"
                  style={{ color: 'var(--shop-ink)' }}
                />
                <button
                  onClick={() => setQty(qty + 1)}
                  className="w-9 h-9 flex items-center justify-center"
                  style={{ color: 'var(--shop-ink)' }}
                  aria-label="เพิ่มจำนวน"
                >
                  <Plus size={14} />
                </button>
              </div>

              <button
                onClick={handleAdd}
                className="flex-1 min-w-[180px] py-3 rounded-md text-sm font-[family:var(--font-kanit)] font-black uppercase transition-colors flex items-center justify-center gap-2"
                style={{
                  background: 'var(--shop-bg-soft)',
                  color: 'var(--shop-primary)',
                  border: `2px solid var(--shop-primary)`,
                }}
              >
                <ShoppingCart size={16} /> หยิบใส่ตะกร้า
              </button>
              <button
                onClick={handleAdd}
                className="flex-1 min-w-[180px] py-3 rounded-md text-sm font-[family:var(--font-kanit)] font-black uppercase transition-opacity hover:opacity-90"
                style={{ background: 'var(--shop-primary-gradient)', color: '#ffffff' }}
              >
                ซื้อเลย
              </button>
            </div>
          </div>

          {/* Trust strip */}
          <div
            className="bg-white rounded-lg p-3 grid grid-cols-3 gap-2"
            style={{ border: `1px solid var(--shop-border)` }}
          >
            {[
              { Icon: ShieldCheck, t: 'รับประกันของแท้' },
              { Icon: Truck, t: 'ส่งฟรี ฿199+' },
              { Icon: RotateCw, t: 'คืนสินค้าได้ 7 วัน' },
            ].map(({ Icon, t }) => (
              <div
                key={t}
                className="flex items-center gap-1.5 text-[11px] font-[family:var(--font-prompt)] font-bold"
                style={{ color: 'var(--shop-ink)' }}
              >
                <Icon size={14} style={{ color: 'var(--shop-primary)' }} />
                <span className="truncate">{t}</span>
              </div>
            ))}
          </div>

          {/* Description */}
          {product.description && (
            <div
              className="bg-white rounded-lg p-5"
              style={{ border: `1px solid var(--shop-border)` }}
            >
              <h2
                className="font-[family:var(--font-kanit)] font-black text-base mb-3 pb-2 border-b uppercase"
                style={{ borderColor: 'var(--shop-border)', color: 'var(--shop-primary)' }}
              >
                รายละเอียดสินค้า
              </h2>
              <p
                className="text-sm font-[family:var(--font-prompt)] leading-relaxed whitespace-pre-wrap"
                style={{ color: 'var(--shop-ink)' }}
              >
                {product.description}
              </p>
            </div>
          )}
        </section>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h2
            className="font-[family:var(--font-kanit)] font-black text-lg uppercase mb-4 flex items-center gap-2"
            style={{ color: 'var(--shop-ink)' }}
          >
            <Flame size={18} style={{ color: 'var(--shop-primary)' }} /> สินค้าที่คุณอาจชอบ
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {related.slice(0, 12).map((r) => {
              const hasDiscount = r.compareAtPriceTHB && r.compareAtPriceTHB > r.priceTHB;
              const pct = hasDiscount
                ? Math.round(((r.compareAtPriceTHB! - r.priceTHB) / r.compareAtPriceTHB!) * 100)
                : 0;
              return (
                <a
                  key={r.id}
                  href={`/stores/${store.slug}/products/${r.id}`}
                  className="bg-white rounded-lg overflow-hidden group"
                  style={{ border: `1px solid var(--shop-border)` }}
                >
                  <div
                    className="aspect-square relative"
                    style={{ background: 'var(--shop-muted)' }}
                  >
                    {r.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={r.imageUrl}
                        alt={r.title}
                        className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center text-[10px] p-2 text-center"
                        style={{ color: 'var(--shop-ink-muted)' }}
                      >
                        {r.title.slice(0, 20)}
                      </div>
                    )}
                    {pct > 0 && (
                      <span
                        className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[10px] font-[family:var(--font-kanit)] font-black text-white"
                        style={{ background: 'var(--shop-primary)' }}
                      >
                        -{pct}%
                      </span>
                    )}
                  </div>
                  <div className="p-2 space-y-1">
                    <p
                      className="text-xs font-[family:var(--font-prompt)] font-semibold line-clamp-2 leading-snug"
                      style={{ color: 'var(--shop-ink)' }}
                    >
                      {r.title}
                    </p>
                    <div className="flex items-baseline gap-1">
                      <span
                        className="font-[family:var(--font-kanit)] font-black text-sm"
                        style={{ color: 'var(--shop-primary)' }}
                      >
                        {formatTHB(r.priceTHB)}
                      </span>
                      {r.compareAtPriceTHB && (
                        <span
                          className="text-[10px] line-through"
                          style={{ color: 'var(--shop-ink-muted)' }}
                        >
                          {formatTHB(r.compareAtPriceTHB)}
                        </span>
                      )}
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}

export default ProductDetail;
