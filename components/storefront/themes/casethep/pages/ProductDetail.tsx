'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Smartphone,
  Minus,
  Plus,
  ShoppingBag,
  Zap,
  Truck,
  ShieldCheck,
  RefreshCw,
  ChevronRight,
} from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';

interface ProductCard {
  id: string;
  title: string;
  imageUrl?: string | null;
  priceTHB: number;
  compareAtPriceTHB?: number | null;
  categoryName?: string | null;
}

interface Variant {
  id: string;
  attributes: Record<string, string>;
  colorLabel?: string | null;
  sizeLabel?: string | null;
  materialLabel?: string | null;
  priceTHB: number;
  imageUrl?: string | null;
  inventory: number | null;
}

interface ProductDetailProps {
  store: { id: string; name: string; slug: string; logoUrl?: string | null };
  product: {
    id: string;
    title: string;
    description?: string | null;
    priceTHB: number;
    originalPriceTHB?: number | null;
    imageUrl?: string | null;
    images: string[];
    variants: Variant[];
    stockLeft?: number | null;
    videoUrl?: string | null;
    categoryName?: string | null;
  };
  related: ProductCard[];
}

const DEVICE_FALLBACK = [
  'iPhone 15 Pro Max',
  'iPhone 15 Pro',
  'iPhone 15',
  'iPhone 14 Pro',
  'iPhone 14',
  'Samsung S24',
];

const DECORATIVE_SWATCHES: Array<{ name: string; hex: string }> = [
  { name: 'Coral Pink', hex: '#FF8597' },
  { name: 'Cream', hex: '#F4ECDC' },
  { name: 'Sage Green', hex: '#A8C5A2' },
  { name: 'Sky Blue', hex: '#A7C8E5' },
  { name: 'Lavender', hex: '#C6B4D8' },
  { name: 'Midnight', hex: '#22232A' },
];

export default function ProductDetail({ store, product, related }: ProductDetailProps) {
  const router = useRouter();
  const add = useCart((s) => s.add);

  const gallery = useMemo(() => {
    const all = [product.imageUrl, ...product.images].filter((u): u is string => !!u);
    return Array.from(new Set(all));
  }, [product.imageUrl, product.images]);

  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(
    product.variants[0]?.id ?? null,
  );
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);

  const variant = product.variants.find((v) => v.id === selectedVariant) ?? null;
  const effectivePrice = variant?.priceTHB ?? product.priceTHB;
  const hasDiscount =
    product.originalPriceTHB && product.originalPriceTHB > effectivePrice;
  const discountPct = hasDiscount
    ? Math.round(
        ((product.originalPriceTHB! - effectivePrice) / product.originalPriceTHB!) * 100,
      )
    : 0;

  // Group variants by attribute type so we can render dedicated rows.
  const colorVariants = product.variants.filter(
    (v) => v.colorLabel || v.attributes?.color,
  );
  const otherVariants = product.variants.filter(
    (v) => !(v.colorLabel || v.attributes?.color),
  );

  const handleAdd = () => {
    add(
      {
        productId: product.id,
        storeSlug: store.slug,
        storeName: store.name,
        title: product.title,
        priceTHB: effectivePrice,
        imageUrl: variant?.imageUrl || product.imageUrl || undefined,
      },
      qty,
    );
  };

  const handleBuyNow = () => {
    handleAdd();
    router.push(`/stores/${store.slug}/checkout`);
  };

  return (
    <div
      className="font-[family:var(--font-prompt)] min-h-screen"
      style={{ background: 'var(--shop-bg, #FBF8F3)', color: 'var(--shop-ink, #1A1A1F)' }}
    >
      {/* Breadcrumb */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 text-xs text-[color:var(--shop-ink-muted,#6B7280)] flex items-center gap-1.5 flex-wrap">
        <Link href={`/stores/${store.slug}`} className="hover:text-[color:var(--shop-primary,#FF5A6A)]">
          {store.name}
        </Link>
        <ChevronRight className="w-3 h-3" />
        <Link href={`/stores/${store.slug}/category`} className="hover:text-[color:var(--shop-primary,#FF5A6A)]">
          สินค้าทั้งหมด
        </Link>
        {product.categoryName && (
          <>
            <ChevronRight className="w-3 h-3" />
            <Link
              href={`/stores/${store.slug}/category?cat=${encodeURIComponent(product.categoryName)}`}
              className="hover:text-[color:var(--shop-primary,#FF5A6A)]"
            >
              {product.categoryName}
            </Link>
          </>
        )}
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Gallery */}
        <div className="space-y-4">
          <div
            className="relative aspect-square rounded-3xl overflow-hidden bg-white"
            style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 20px 40px -10px rgba(0,0,0,0.08)' }}
          >
            {hasDiscount && (
              <span
                className="absolute top-4 left-4 z-10 rounded-full px-3 py-1 text-xs font-semibold text-white"
                style={{ background: 'var(--shop-primary, #FF5A6A)' }}
              >
                ลด {discountPct}%
              </span>
            )}
            {gallery[activeImage] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={gallery[activeImage]}
                alt={product.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  background:
                    'linear-gradient(135deg, #FFE5E9 0%, #FFF4E5 50%, #E9F4FF 100%)',
                }}
              >
                <Smartphone className="w-24 h-24 text-[color:var(--shop-primary,#FF5A6A)]/40" />
              </div>
            )}
          </div>
          {gallery.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {gallery.slice(0, 5).map((src, idx) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setActiveImage(idx)}
                  className={`aspect-square rounded-xl overflow-hidden transition-all ${
                    idx === activeImage
                      ? 'ring-2 ring-offset-2'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  style={
                    idx === activeImage
                      ? { boxShadow: `0 0 0 2px var(--shop-primary, #FF5A6A)` }
                      : undefined
                  }
                  aria-label={`รูปที่ ${idx + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div className="space-y-2">
            {product.categoryName && (
              <p className="text-xs uppercase tracking-wide text-[color:var(--shop-ink-muted,#6B7280)]">
                {product.categoryName}
              </p>
            )}
            <h1 className="font-[family:var(--font-kanit)] text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">
              {product.title}
            </h1>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="font-[family:var(--font-kanit)] font-semibold text-3xl text-[color:var(--shop-primary,#FF5A6A)]">
              {formatTHB(effectivePrice)}
            </span>
            {hasDiscount && (
              <span className="text-base text-[color:var(--shop-ink-muted,#6B7280)] line-through">
                {formatTHB(product.originalPriceTHB!)}
              </span>
            )}
          </div>

          {/* Color swatches — real variant colors when present, else decorative */}
          <div className="space-y-2">
            <p className="text-sm font-medium">
              สี {variant?.colorLabel ? <span className="text-[color:var(--shop-ink-muted,#6B7280)] font-normal">— {variant.colorLabel}</span> : null}
            </p>
            <div className="flex flex-wrap gap-2.5">
              {colorVariants.length > 0
                ? colorVariants.map((v) => {
                    const active = selectedVariant === v.id;
                    const hex = v.attributes?.color || '#E5E7EB';
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariant(v.id)}
                        aria-label={v.colorLabel ?? 'สี'}
                        title={v.colorLabel ?? ''}
                        className={`w-9 h-9 rounded-full border transition-all ${
                          active
                            ? 'ring-2 ring-offset-2'
                            : 'hover:scale-110'
                        }`}
                        style={{
                          background: hex,
                          borderColor: 'rgba(0,0,0,0.08)',
                          boxShadow: active
                            ? `0 0 0 2px var(--shop-primary, #FF5A6A)`
                            : undefined,
                        }}
                      />
                    );
                  })
                : DECORATIVE_SWATCHES.map((c) => (
                    <button
                      type="button"
                      key={c.name}
                      aria-label={c.name}
                      title={c.name}
                      className="w-9 h-9 rounded-full border hover:scale-110 transition-transform"
                      style={{ background: c.hex, borderColor: 'rgba(0,0,0,0.08)' }}
                    />
                  ))}
            </div>
          </div>

          {/* Device picker */}
          <div className="space-y-2">
            <p className="text-sm font-medium">เลือกรุ่นโทรศัพท์</p>
            <div className="flex flex-wrap gap-2">
              {DEVICE_FALLBACK.map((d) => {
                const active = selectedDevice === d;
                return (
                  <button
                    type="button"
                    key={d}
                    onClick={() => setSelectedDevice(d)}
                    className={`inline-flex items-center rounded-full px-3.5 h-9 text-xs font-medium transition-colors border ${
                      active
                        ? 'text-white border-transparent'
                        : 'border-[color:var(--shop-ink,#1A1A1F)]/10 hover:border-[color:var(--shop-primary,#FF5A6A)] hover:text-[color:var(--shop-primary,#FF5A6A)]'
                    }`}
                    style={
                      active
                        ? { background: 'var(--shop-primary-gradient, var(--shop-primary, #FF5A6A))' }
                        : undefined
                    }
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Other variants (size / material) */}
          {otherVariants.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">ตัวเลือก</p>
              <div className="flex flex-wrap gap-2">
                {otherVariants.map((v) => {
                  const active = selectedVariant === v.id;
                  const label =
                    v.sizeLabel ||
                    v.materialLabel ||
                    Object.values(v.attributes).join(' · ') ||
                    'ตัวเลือก';
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariant(v.id)}
                      className={`inline-flex items-center rounded-full px-4 h-10 text-sm font-medium transition-colors border ${
                        active
                          ? 'text-white border-transparent'
                          : 'border-[color:var(--shop-ink,#1A1A1F)]/10 hover:border-[color:var(--shop-primary,#FF5A6A)]'
                      }`}
                      style={
                        active
                          ? { background: 'var(--shop-primary-gradient, var(--shop-primary, #FF5A6A))' }
                          : undefined
                      }
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Qty + actions */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center rounded-full bg-white border border-[color:var(--shop-ink,#1A1A1F)]/10">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="ลดจำนวน"
                  className="w-10 h-10 flex items-center justify-center text-[color:var(--shop-ink-muted,#6B7280)] hover:text-[color:var(--shop-primary,#FF5A6A)]"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-medium tabular-nums">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty((q) => q + 1)}
                  aria-label="เพิ่มจำนวน"
                  className="w-10 h-10 flex items-center justify-center text-[color:var(--shop-ink-muted,#6B7280)] hover:text-[color:var(--shop-primary,#FF5A6A)]"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {typeof product.stockLeft === 'number' && product.stockLeft > 0 && product.stockLeft < 20 && (
                <span className="text-xs text-[color:var(--shop-primary,#FF5A6A)] font-medium">
                  เหลือเพียง {product.stockLeft} ชิ้น
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleAdd}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-full h-12 px-6 text-sm font-medium border border-[color:var(--shop-primary,#FF5A6A)] text-[color:var(--shop-primary,#FF5A6A)] hover:bg-[color:var(--shop-primary,#FF5A6A)]/5 transition-colors"
              >
                <ShoppingBag className="w-4 h-4" /> เพิ่มในตะกร้า
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-full h-12 px-6 text-sm font-medium text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: 'var(--shop-primary-gradient, var(--shop-primary, #FF5A6A))',
                }}
              >
                <Zap className="w-4 h-4" /> ซื้อเลย
              </button>
            </div>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            {[
              { icon: Truck, label: 'ส่งใน 1–3 วัน' },
              { icon: ShieldCheck, label: 'ของแท้ 100%' },
              { icon: RefreshCw, label: 'เปลี่ยน/คืน 7 วัน' },
            ].map((t) => (
              <div
                key={t.label}
                className="rounded-xl bg-white px-3 py-3 text-center"
                style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
              >
                <t.icon className="w-4 h-4 mx-auto mb-1 text-[color:var(--shop-primary,#FF5A6A)]" />
                <p className="text-[11px] text-[color:var(--shop-ink-muted,#6B7280)]">{t.label}</p>
              </div>
            ))}
          </div>

          {/* Description */}
          {product.description && (
            <div
              className="rounded-2xl bg-white p-5"
              style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
            >
              <h3 className="font-[family:var(--font-kanit)] font-semibold text-base mb-2">รายละเอียดสินค้า</h3>
              <p className="text-sm leading-relaxed whitespace-pre-line text-[color:var(--shop-ink,#1A1A1F)]/90">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="px-4 sm:px-6 lg:px-8 pb-16">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-6">
              <h2 className="font-[family:var(--font-kanit)] text-2xl sm:text-3xl font-semibold tracking-tight">
                สินค้าที่เกี่ยวข้อง
              </h2>
              <Link
                href={`/stores/${store.slug}/category`}
                className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-[color:var(--shop-primary,#FF5A6A)] hover:underline"
              >
                ดูทั้งหมด <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {related.slice(0, 4).map((p) => {
                const hasDisc = p.compareAtPriceTHB && p.compareAtPriceTHB > p.priceTHB;
                return (
                  <Link
                    key={p.id}
                    href={`/stores/${store.slug}/products/${p.id}`}
                    className="group rounded-2xl bg-white overflow-hidden hover:-translate-y-1 transition-transform"
                    style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)' }}
                  >
                    <div className="relative aspect-square bg-[#F5F1EB] overflow-hidden">
                      {p.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.imageUrl}
                          alt={p.title}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Smartphone className="w-10 h-10 text-[color:var(--shop-primary,#FF5A6A)]/30" />
                        </div>
                      )}
                    </div>
                    <div className="p-3 sm:p-4">
                      <h3 className="font-[family:var(--font-kanit)] font-medium text-sm leading-snug line-clamp-2">
                        {p.title}
                      </h3>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="font-[family:var(--font-kanit)] font-semibold text-sm">
                          {formatTHB(p.priceTHB)}
                        </span>
                        {hasDisc && (
                          <span className="text-xs text-[color:var(--shop-ink-muted,#6B7280)] line-through">
                            {formatTHB(p.compareAtPriceTHB!)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
