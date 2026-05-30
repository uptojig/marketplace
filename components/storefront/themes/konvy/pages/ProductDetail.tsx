'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Heart,
  Zap,
  ShieldCheck,
  Truck,
  Sparkles,
  Minus,
  Plus,
  Star,
} from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';
import type { ProductDetailProps } from '@/lib/templates/types';

/**
 * Konvy — K-beauty product detail.
 *
 * Layout:
 *   - LEFT: image gallery (main + thumbs).
 *   - RIGHT: title · price · variants · qty · CTA stack.
 *
 * CTAs:
 *   - หยิบใส่ตะกร้า (white + ring) silently adds via useCart.add.
 *   - ซื้อเลย (filled gradient) calls add() AND router.push to
 *     /stores/<slug>/checkout per project rule.
 *
 * No useCartConfirmation popup. Currency is formatTHB only.
 */
export default function ProductDetail({
  store,
  product,
  related,
}: ProductDetailProps) {
  const router = useRouter();
  const add = useCart((s) => s.add);

  const images = useMemo(
    () =>
      Array.from(
        new Set(
          [product.imageUrl, ...product.images].filter(
            (u): u is string => Boolean(u),
          ),
        ),
      ),
    [product.imageUrl, product.images],
  );

  const [activeImage, setActiveImage] = useState(images[0] ?? null);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(
    product.variants[0]?.id ?? null,
  );
  const [qty, setQty] = useState(1);

  const variant = product.variants.find((v) => v.id === selectedVariant) ?? null;
  const effectivePrice = variant?.priceTHB ?? product.priceTHB;
  const compareAt = product.originalPriceTHB ?? null;
  const discount =
    compareAt && compareAt > effectivePrice
      ? Math.round(((compareAt - effectivePrice) / compareAt) * 100)
      : 0;

  // Group variants by attribute key so picker UI can show each group.
  const variantGroups = useMemo(() => {
    const groups: Record<string, { value: string; ids: string[] }[]> = {};
    for (const v of product.variants) {
      for (const [key, value] of Object.entries(v.attributes)) {
        if (!groups[key]) groups[key] = [];
        const found = groups[key].find((g) => g.value === value);
        if (found) {
          found.ids.push(v.id);
        } else {
          groups[key].push({ value, ids: [v.id] });
        }
      }
    }
    return groups;
  }, [product.variants]);

  function commitAdd() {
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
  }

  function handleAdd() {
    commitAdd();
  }

  function handleBuyNow() {
    commitAdd();
    router.push(`/stores/${store.slug}/checkout`);
  }

  return (
    <div
      className="font-[family:var(--font-prompt)] text-[var(--shop-ink)]"
      style={{ background: 'var(--shop-bg, #FFFFFF)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 grid gap-8 lg:gap-12 lg:grid-cols-2">
        {/* LEFT — gallery */}
        <div>
          <div
            className="aspect-square rounded-3xl overflow-hidden mb-4 shadow-sm border border-[var(--shop-border)]"
            style={{ background: 'var(--shop-bg-soft, #FAF6F2)' }}
          >
            {activeImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={activeImage}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center opacity-30">
                <Heart
                  className="h-20 w-20"
                  style={{ color: 'var(--shop-primary)' }}
                />
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-5 gap-2.5">
              {images.slice(0, 10).map((src) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setActiveImage(src)}
                  className="aspect-square rounded-xl overflow-hidden border-2 transition-all"
                  style={{
                    borderColor:
                      activeImage === src
                        ? 'var(--shop-primary)'
                        : 'var(--shop-border)',
                  }}
                  aria-label="เลือกภาพสินค้า"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt=""
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT — info */}
        <div className="flex flex-col">
          {product.categoryName && (
            <span
              className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.2em] font-semibold mb-3"
              style={{ color: 'var(--shop-primary)' }}
            >
              <Sparkles className="h-3.5 w-3.5" />
              {product.categoryName}
            </span>
          )}
          <h1 className="font-[family:var(--font-kanit)] text-2xl sm:text-3xl lg:text-4xl font-semibold leading-tight tracking-tight mb-4">
            {product.title}
          </h1>

          {/* Rating placeholder (no fake numbers) */}
          <div className="flex items-center gap-1.5 mb-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className="h-4 w-4 fill-current opacity-30"
                style={{ color: 'var(--shop-primary)' }}
              />
            ))}
            <span
              className="text-xs ml-1"
              style={{ color: 'var(--shop-ink-muted)' }}
            >
              รีวิวจะปรากฏเมื่อมีผู้ซื้อให้คะแนน
            </span>
          </div>

          {/* Price block */}
          <div className="flex items-baseline gap-3 mb-6">
            <span
              className="font-[family:var(--font-kanit)] text-3xl sm:text-4xl font-semibold"
              style={{ color: 'var(--shop-primary)' }}
            >
              {formatTHB(effectivePrice)}
            </span>
            {compareAt && compareAt > effectivePrice && (
              <>
                <span
                  className="text-base line-through"
                  style={{ color: 'var(--shop-ink-muted)' }}
                >
                  {formatTHB(compareAt)}
                </span>
                {discount > 0 && (
                  <span
                    className="text-[11px] font-semibold uppercase tracking-wider text-white px-2.5 py-1 rounded-full"
                    style={{ background: 'var(--shop-primary)' }}
                  >
                    -{discount}%
                  </span>
                )}
              </>
            )}
          </div>

          {/* Variant pickers */}
          {Object.keys(variantGroups).length > 0 && (
            <div className="space-y-5 mb-6">
              {Object.entries(variantGroups).map(([key, options]) => (
                <div key={key}>
                  <p
                    className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-2"
                    style={{ color: 'var(--shop-ink-muted)' }}
                  >
                    {key}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {options.map((opt) => {
                      const variantId = opt.ids[0];
                      const active = variant?.attributes[key] === opt.value;
                      return (
                        <button
                          key={`${key}-${opt.value}`}
                          type="button"
                          onClick={() => setSelectedVariant(variantId)}
                          className="px-4 py-2 rounded-full text-sm transition-all border-2"
                          style={{
                            borderColor: active
                              ? 'var(--shop-primary)'
                              : 'var(--shop-border)',
                            background: active
                              ? 'var(--shop-bg-soft)'
                              : 'transparent',
                            color: active
                              ? 'var(--shop-primary)'
                              : 'var(--shop-ink)',
                            fontWeight: active ? 600 : 400,
                          }}
                          aria-pressed={active}
                        >
                          {opt.value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Qty stepper */}
          <div className="mb-7">
            <p
              className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-2"
              style={{ color: 'var(--shop-ink-muted)' }}
            >
              จำนวน
            </p>
            <div className="inline-flex items-center gap-1 rounded-full border border-[var(--shop-border)] p-1 bg-white">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="h-9 w-9 rounded-full grid place-items-center hover:bg-[var(--shop-bg-soft)] transition-colors"
                aria-label="ลดจำนวน"
                disabled={qty <= 1}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="min-w-[40px] text-center font-medium" aria-live="polite">
                {qty}
              </span>
              <button
                type="button"
                onClick={() => setQty((q) => q + 1)}
                className="h-9 w-9 rounded-full grid place-items-center hover:bg-[var(--shop-bg-soft)] transition-colors"
                aria-label="เพิ่มจำนวน"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* CTA stack */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <button
              type="button"
              onClick={handleAdd}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white border-2 text-sm font-semibold transition-all hover:shadow-md hover:-translate-y-0.5"
              style={{
                borderColor: 'var(--shop-primary)',
                color: 'var(--shop-primary)',
              }}
            >
              <ShoppingBag className="h-4 w-4" />
              หยิบใส่ตะกร้า
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-sm font-semibold text-white transition-all hover:shadow-lg hover:-translate-y-0.5"
              style={{
                background:
                  'var(--shop-primary-gradient, var(--shop-primary))',
              }}
            >
              <Zap className="h-4 w-4" />
              ซื้อเลย
            </button>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-2 py-5 border-t border-[var(--shop-border)] mb-6">
            {[
              { Icon: ShieldCheck, label: 'คัดสรรคุณภาพ' },
              { Icon: Truck, label: 'ส่งฟรี ฿590+' },
              { Icon: Sparkles, label: 'จ่ายออนไลน์' },
            ].map(({ Icon, label }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-1.5 text-center"
              >
                <Icon
                  className="h-5 w-5"
                  style={{ color: 'var(--shop-primary)' }}
                />
                <span
                  className="text-[11px] font-medium"
                  style={{ color: 'var(--shop-ink-muted)' }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* Description */}
          {product.description && (
            <div>
              <h2
                className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-3"
                style={{ color: 'var(--shop-primary)' }}
              >
                รายละเอียดสินค้า
              </h2>
              <p
                className="text-sm leading-relaxed whitespace-pre-line"
                style={{ color: 'var(--shop-ink-muted)' }}
              >
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section
          className="border-t border-[var(--shop-border)]"
          style={{ background: 'var(--shop-bg-soft, #FAF6F2)' }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
            <div className="text-center mb-10">
              <p
                className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-1"
                style={{ color: 'var(--shop-primary)' }}
              >
                You may also love
              </p>
              <h2 className="font-[family:var(--font-kanit)] text-2xl sm:text-3xl font-semibold">
                สินค้าที่เกี่ยวข้อง
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {related.slice(0, 8).map((p) => (
                <Link
                  key={p.id}
                  href={`/stores/${store.slug}/products/${p.id}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-[var(--shop-border)] flex flex-col"
                >
                  <div
                    className="aspect-square overflow-hidden"
                    style={{ background: 'var(--shop-bg-soft, #FAF6F2)' }}
                  >
                    {p.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.imageUrl}
                        alt={p.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : null}
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="text-sm font-medium leading-snug line-clamp-2 mb-3 flex-1">
                      {p.title}
                    </h3>
                    <span
                      className="font-[family:var(--font-kanit)] font-semibold mt-auto"
                      style={{ color: 'var(--shop-primary)' }}
                    >
                      {formatTHB(p.priceTHB)}
                    </span>
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
