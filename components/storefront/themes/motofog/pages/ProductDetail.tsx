'use client';

/**
 * MotoFog — racing PDP.
 *
 * Image gallery (thumbs + main) + spec/description block + Racing-Tested
 * badge + ADD-TO-CART + BUY-NOW (which adds the line then routes to the
 * store's checkout flow).
 *
 * No mock spec data — only the real `description` from the product is
 * surfaced. Variants are listed when present.
 */

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Flag,
  Shield,
  Truck,
  CreditCard,
  Bike,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';
import type {
  ProductDetailProps,
  TemplateProductCard,
} from '@/lib/templates/types';

export function MotoFogProductDetail({
  store,
  product,
  related,
}: ProductDetailProps) {
  const router = useRouter();
  const add = useCart((s) => s.add);

  const gallery = useMemo(() => {
    const all: string[] = [];
    if (product.imageUrl) all.push(product.imageUrl);
    for (const img of product.images ?? []) {
      if (!all.includes(img)) all.push(img);
    }
    return all;
  }, [product.imageUrl, product.images]);

  const [activeIdx, setActiveIdx] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    product.variants?.[0]?.id ?? null,
  );

  const selectedVariant = product.variants?.find((v) => v.id === selectedVariantId);
  const displayPrice = selectedVariant?.priceTHB ?? product.priceTHB;
  const displayCompareAt = product.originalPriceTHB ?? null;

  const handleAdd = () => {
    add({
      productId: product.id,
      storeSlug: store.slug,
      storeName: store.name,
      title: product.title,
      priceTHB: displayPrice,
      imageUrl: product.imageUrl ?? undefined,
    });
  };

  const handleBuyNow = () => {
    handleAdd();
    router.push(`/stores/${store.slug}/checkout`);
  };

  const mainImage = gallery[activeIdx];

  return (
    <main
      className="min-h-screen"
      style={{
        backgroundColor: 'var(--shop-bg, #0F1417)',
        color: 'var(--shop-ink, #F5F7FA)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <nav
          aria-label="breadcrumb"
          className="font-[family:var(--font-prompt)] text-[11px] uppercase tracking-widest font-bold mb-6 flex items-center gap-2"
          style={{ color: 'var(--shop-ink-muted, #94A3B0)' }}
        >
          <Link
            href={`/stores/${store.slug}`}
            className="hover:underline"
            style={{ color: 'var(--shop-ink, #F5F7FA)' }}
          >
            หน้าแรก
          </Link>
          <span>/</span>
          <Link
            href={`/stores/${store.slug}/category`}
            className="hover:underline"
            style={{ color: 'var(--shop-ink, #F5F7FA)' }}
          >
            สินค้า
          </Link>
          {product.categoryName && (
            <>
              <span>/</span>
              <span style={{ color: 'var(--shop-accent, #FFC72C)' }}>
                {product.categoryName}
              </span>
            </>
          )}
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Gallery */}
          <div className="lg:col-span-7">
            <div
              className="relative aspect-square overflow-hidden"
              style={{
                backgroundColor: 'var(--shop-surface, #1A2128)',
                border: '1px solid var(--shop-border, #2B3540)',
                clipPath:
                  'polygon(0 4%, 100% 0, 100% 96%, 0 100%)',
              }}
            >
              {mainImage ? (
                <img
                  src={mainImage}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Bike
                    className="h-28 w-28"
                    style={{ color: 'var(--shop-border, #2B3540)' }}
                  />
                </div>
              )}

              {/* Racing tested badge */}
              <div
                className="absolute top-6 left-6 inline-flex items-center gap-1.5 px-3 py-1 rounded-sm font-[family:var(--font-prompt)] text-[10px] font-bold uppercase tracking-widest"
                style={{
                  background:
                    'var(--shop-primary-gradient, var(--shop-primary, #FF6B35))',
                  color: '#0A0A0A',
                }}
              >
                <Flag className="h-3 w-3" />
                Racing Tested
              </div>
            </div>

            {gallery.length > 1 && (
              <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                {gallery.map((img, i) => (
                  <button
                    key={img + i}
                    type="button"
                    onClick={() => setActiveIdx(i)}
                    className="relative shrink-0 w-20 h-20 overflow-hidden rounded-sm transition-transform hover:-translate-y-0.5"
                    style={{
                      border:
                        i === activeIdx
                          ? '2px solid var(--shop-accent, #FFC72C)'
                          : '1px solid var(--shop-border, #2B3540)',
                      backgroundColor: 'var(--shop-surface, #1A2128)',
                    }}
                    aria-label={`ภาพที่ ${i + 1}`}
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Buy box */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              {product.categoryName && (
                <p
                  className="font-[family:var(--font-prompt)] text-[10px] uppercase tracking-[0.3em] font-bold mb-2"
                  style={{ color: 'var(--shop-accent, #FFC72C)' }}
                >
                  {product.categoryName}
                </p>
              )}
              <h1
                className="font-[family:var(--font-kanit)] italic font-black text-3xl sm:text-4xl uppercase tracking-tight leading-tight"
                style={{ color: 'var(--shop-ink, #F5F7FA)' }}
              >
                {product.title}
              </h1>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span
                className="font-[family:var(--font-kanit)] italic font-black text-3xl tabular-nums"
                style={{ color: 'var(--shop-ink, #F5F7FA)' }}
              >
                {formatTHB(displayPrice)}
              </span>
              {displayCompareAt && displayCompareAt > displayPrice && (
                <span
                  className="font-[family:var(--font-prompt)] text-base line-through"
                  style={{ color: 'var(--shop-ink-muted, #94A3B0)' }}
                >
                  {formatTHB(displayCompareAt)}
                </span>
              )}
            </div>

            {/* Variant picker */}
            {product.variants && product.variants.length > 0 && (
              <div>
                <p
                  className="font-[family:var(--font-prompt)] text-[10px] uppercase tracking-widest font-bold mb-2"
                  style={{ color: 'var(--shop-ink-muted, #94A3B0)' }}
                >
                  ตัวเลือก
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => {
                    const label =
                      v.colorLabel ??
                      v.sizeLabel ??
                      v.materialLabel ??
                      Object.values(v.attributes ?? {}).join(' · ') ??
                      'ตัวเลือก';
                    const isActive = v.id === selectedVariantId;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariantId(v.id)}
                        className="px-3 h-9 rounded-sm font-[family:var(--font-prompt)] text-xs uppercase tracking-wider font-bold"
                        style={
                          isActive
                            ? {
                                background:
                                  'var(--shop-primary-gradient, var(--shop-primary, #FF6B35))',
                                color: '#0A0A0A',
                              }
                            : {
                                backgroundColor: 'var(--shop-surface, #1A2128)',
                                color: 'var(--shop-ink, #F5F7FA)',
                                border: '1px solid var(--shop-border, #2B3540)',
                              }
                        }
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* CTAs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleAdd}
                className="inline-flex items-center justify-center gap-2 h-12 rounded-md font-[family:var(--font-prompt)] text-xs font-bold uppercase tracking-widest transition-transform hover:-translate-y-0.5"
                style={{
                  backgroundColor: 'var(--shop-surface, #1A2128)',
                  color: 'var(--shop-ink, #F5F7FA)',
                  border: '2px solid var(--shop-primary, #FF6B35)',
                }}
              >
                <Plus className="h-4 w-4" />
                เพิ่มลงตะกร้า
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                className="inline-flex items-center justify-center gap-2 h-12 rounded-md font-[family:var(--font-kanit)] italic font-black text-sm uppercase tracking-widest transition-transform hover:-translate-y-0.5"
                style={{
                  background:
                    'var(--shop-primary-gradient, var(--shop-primary, #FF6B35))',
                  color: '#0A0A0A',
                }}
              >
                ซื้อเลย
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* Service callouts */}
            <ul
              className="rounded-md divide-y"
              style={{
                backgroundColor: 'var(--shop-surface, #1A2128)',
                borderColor: 'var(--shop-border, #2B3540)',
                border: '1px solid var(--shop-border, #2B3540)',
              }}
            >
              {[
                {
                  Icon: Shield,
                  label: 'รับประกัน 2 ปี',
                  desc: 'สินค้าแบรนด์แท้ ส่งคืนได้ภายใน 7 วัน',
                },
                {
                  Icon: Truck,
                  label: 'จัดส่งฟรี',
                  desc: 'เมื่อสั่งครบ ฿1,990 · ภายใน 1-3 วัน',
                },
                {
                  Icon: CreditCard,
                  label: 'จ่ายผ่าน AnyPay',
                  desc: 'ปลอดภัยทุกธุรกรรม · QR / โอน / บัตรเครดิต',
                },
              ].map(({ Icon, label, desc }) => (
                <li
                  key={label}
                  className="flex items-start gap-3 p-4"
                  style={{ borderColor: 'var(--shop-border, #2B3540)' }}
                >
                  <Icon
                    className="h-5 w-5 mt-0.5 shrink-0"
                    style={{ color: 'var(--shop-accent, #FFC72C)' }}
                  />
                  <div className="min-w-0">
                    <p
                      className="font-[family:var(--font-prompt)] text-xs uppercase tracking-widest font-bold"
                      style={{ color: 'var(--shop-ink, #F5F7FA)' }}
                    >
                      {label}
                    </p>
                    <p
                      className="font-[family:var(--font-prompt)] text-xs"
                      style={{ color: 'var(--shop-ink-muted, #94A3B0)' }}
                    >
                      {desc}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <section className="mt-14">
            <div className="flex items-center gap-2 mb-4">
              <span
                className="inline-block w-1.5 h-6 rounded-sm"
                style={{
                  background:
                    'var(--shop-primary-gradient, var(--shop-primary, #FF6B35))',
                }}
              />
              <h2
                className="font-[family:var(--font-kanit)] italic font-black text-xl uppercase tracking-widest"
                style={{ color: 'var(--shop-ink, #F5F7FA)' }}
              >
                รายละเอียดสินค้า
              </h2>
            </div>
            <div
              className="rounded-md p-6 font-[family:var(--font-prompt)] text-sm leading-relaxed whitespace-pre-line"
              style={{
                backgroundColor: 'var(--shop-surface, #1A2128)',
                border: '1px solid var(--shop-border, #2B3540)',
                color: 'var(--shop-ink, #F5F7FA)',
              }}
            >
              {product.description}
            </div>
          </section>
        )}

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-16">
            <div className="flex items-center gap-2 mb-6">
              <span
                className="inline-block w-1.5 h-6 rounded-sm"
                style={{
                  background:
                    'var(--shop-primary-gradient, var(--shop-primary, #FF6B35))',
                }}
              />
              <h2
                className="font-[family:var(--font-kanit)] italic font-black text-xl uppercase tracking-widest"
                style={{ color: 'var(--shop-ink, #F5F7FA)' }}
              >
                สินค้าที่เกี่ยวข้อง
              </h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {related.slice(0, 8).map((p: TemplateProductCard) => (
                <Link
                  key={p.id}
                  href={`/stores/${store.slug}/products/${p.id}`}
                  className="group flex flex-col overflow-hidden transition-transform hover:-translate-y-1"
                  style={{
                    backgroundColor: 'var(--shop-surface, #1A2128)',
                    border: '1px solid var(--shop-border, #2B3540)',
                    clipPath:
                      'polygon(0 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%)',
                  }}
                >
                  <div
                    className="relative aspect-square overflow-hidden"
                    style={{ backgroundColor: 'var(--shop-bg, #0F1417)' }}
                  >
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Bike
                          className="h-10 w-10"
                          style={{ color: 'var(--shop-border, #2B3540)' }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="p-3 flex flex-col gap-2">
                    <h3
                      className="font-[family:var(--font-prompt)] text-xs font-semibold leading-snug line-clamp-2"
                      style={{ color: 'var(--shop-ink, #F5F7FA)' }}
                    >
                      {p.title}
                    </h3>
                    <span
                      className="font-[family:var(--font-kanit)] italic font-black text-base tabular-nums"
                      style={{ color: 'var(--shop-ink, #F5F7FA)' }}
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

export default MotoFogProductDetail;
