'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Package,
  Minus,
  Plus,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RefreshCw,
  TrendingDown,
  Phone,
  Check,
  Sparkles,
} from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { useCartConfirmation } from '@/lib/store/cartConfirm';
import { formatTHB } from '@/lib/utils';

interface VariantOption {
  id: string;
  attributes: Record<string, string>;
  colorLabel?: string | null;
  sizeLabel?: string | null;
  materialLabel?: string | null;
  priceTHB: number;
  imageUrl?: string | null;
  inventory: number | null;
}

interface DetailProduct {
  id: string;
  title: string;
  description?: string | null;
  priceTHB: number;
  originalPriceTHB?: number | null;
  imageUrl?: string | null;
  images: string[];
  variants: VariantOption[];
  stockLeft?: number | null;
  videoUrl?: string | null;
  categoryName?: string | null;
}

interface RelatedCard {
  id: string;
  title: string;
  priceTHB: number;
  compareAtPriceTHB: number | null;
  imageUrl: string | null;
  categoryName: string | null;
}

export interface PackagingSupplyProductDetailProps {
  store: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string | null;
  };
  product: DetailProduct;
  related: RelatedCard[];
}

function moqTiers(base: number) {
  return [
    { qty: 50, unit: base, save: 0 },
    { qty: 300, unit: Math.round(base * 0.9), save: 10 },
    { qty: 1000, unit: Math.round(base * 0.82), save: 18 },
  ];
}

export function ProductDetail({ store, product, related }: PackagingSupplyProductDetailProps) {
  const add = useCart((s) => s.add);
  const showConfirm = useCartConfirmation((s) => s.show);

  const gallery = useMemo(() => {
    const list: string[] = [];
    if (product.imageUrl) list.push(product.imageUrl);
    product.images.forEach((i) => {
      if (i && !list.includes(i)) list.push(i);
    });
    return list;
  }, [product.imageUrl, product.images]);

  const [activeImage, setActiveImage] = useState<string | null>(gallery[0] ?? null);
  const [qty, setQty] = useState<number>(50);
  const [variantId, setVariantId] = useState<string | undefined>(product.variants[0]?.id);

  const currentVariant = useMemo(
    () => product.variants.find((v) => v.id === variantId),
    [product.variants, variantId],
  );

  const basePrice = currentVariant?.priceTHB ?? product.priceTHB;
  const tiers = moqTiers(basePrice);
  const activeTier = [...tiers].reverse().find((t) => qty >= t.qty) ?? tiers[0];
  const unitPrice = activeTier.unit;
  const lineTotal = unitPrice * qty;
  const baseline = basePrice * qty;
  const savings = Math.max(0, baseline - lineTotal);

  const handleAdd = () => {
    add(
      {
        productId: product.id,
        storeSlug: store.slug,
        storeName: store.name,
        title: product.title,
        priceTHB: unitPrice,
        imageUrl: activeImage ?? product.imageUrl ?? undefined,
      },
      qty,
    );
    showConfirm(product.title, store.slug);
  };

  // Group variants by attribute type for picker rows
  const sizeOptions = product.variants.filter((v) => v.sizeLabel);
  const colorOptions = product.variants.filter((v) => v.colorLabel);
  const materialOptions = product.variants.filter((v) => v.materialLabel);

  const safeQty = (v: number) => Math.max(50, Math.min(99999, Math.floor(v)));

  return (
    <main className="min-h-screen bg-[var(--shop-bg)] font-[family:var(--font-prompt)] text-[var(--shop-ink)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <nav className="text-xs text-[var(--shop-ink-muted)] mb-4" aria-label="breadcrumb">
          <Link href={`/stores/${store.slug}`} className="hover:text-[var(--shop-primary)]">
            {store.name}
          </Link>
          <span className="mx-1.5">›</span>
          {product.categoryName && (
            <>
              <Link
                href={`/stores/${store.slug}/category?cat=${encodeURIComponent(product.categoryName)}`}
                className="hover:text-[var(--shop-primary)]"
              >
                {product.categoryName}
              </Link>
              <span className="mx-1.5">›</span>
            </>
          )}
          <span className="text-[var(--shop-ink)] font-semibold line-clamp-1">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Gallery */}
          <section className="lg:col-span-6 space-y-3">
            <div className="relative aspect-square rounded-3xl overflow-hidden border-4 border-[var(--shop-accent)] bg-[var(--shop-muted)]">
              {activeImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={activeImage} alt={product.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[var(--pks-ink-dim)]">
                  <Package size={96} />
                </div>
              )}
              <span className="absolute top-4 left-4 bg-[var(--shop-primary)] text-white text-xs font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-full">
                ขายส่ง
              </span>
              {product.originalPriceTHB && product.originalPriceTHB > product.priceTHB && (
                <span className="absolute top-4 right-4 bg-[var(--shop-ink)] text-[var(--shop-accent)] text-xs font-extrabold px-3 py-1.5 rounded-full">
                  -
                  {Math.round(
                    ((product.originalPriceTHB - product.priceTHB) / product.originalPriceTHB) * 100,
                  )}
                  %
                </span>
              )}
            </div>
            {gallery.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {gallery.map((src) => {
                  const active = src === activeImage;
                  return (
                    <button
                      key={src}
                      type="button"
                      onClick={() => setActiveImage(src)}
                      className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors ${
                        active ? 'border-[var(--shop-primary)]' : 'border-[var(--shop-border)] hover:border-[var(--pks-ink-dim)]'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" className="w-full h-full object-cover" />
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* Buy box */}
          <section className="lg:col-span-6 space-y-5">
            <div>
              {product.categoryName && (
                <div className="text-xs font-bold uppercase tracking-widest text-[var(--shop-primary)] mb-2">
                  {product.categoryName}
                </div>
              )}
              <h1 className="font-[family:var(--font-kanit)] font-extrabold text-3xl tracking-tight leading-tight">
                {product.title}
              </h1>
              <div className="flex items-center gap-2 mt-3 text-xs text-[var(--shop-ink-muted)]">
                <Check size={14} className="text-[var(--shop-savings)]" />
                <span>SKU: PKS-{product.id.substring(0, 6).toUpperCase()}</span>
                {product.stockLeft != null && (
                  <>
                    <span aria-hidden>·</span>
                    <span className="text-[var(--shop-savings)] font-semibold">
                      พร้อมส่ง {product.stockLeft.toLocaleString('th-TH')} ชิ้น
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Price band */}
            <div className="rounded-2xl bg-[var(--shop-bg-soft)] p-5 border border-[var(--shop-border)]">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="font-[family:var(--font-kanit)] font-extrabold text-4xl text-[var(--shop-primary)]">
                  {formatTHB(unitPrice)}
                </span>
                <span className="text-sm text-[var(--shop-ink-muted)]">/ ชิ้น @ {qty} ชิ้น</span>
                {basePrice !== unitPrice && (
                  <span className="text-sm text-[var(--pks-ink-dim)] line-through">
                    {formatTHB(basePrice)}
                  </span>
                )}
                {activeTier.save > 0 && (
                  <span className="bg-[var(--shop-savings)] text-white text-xs font-extrabold px-2.5 py-0.5 rounded-full">
                    ประหยัด {activeTier.save}%
                  </span>
                )}
              </div>
              <div className="mt-2 text-sm">
                ราคารวม:{' '}
                <span className="font-[family:var(--font-kanit)] font-extrabold text-[var(--shop-ink)]">
                  {formatTHB(lineTotal)}
                </span>
                {savings > 0 && (
                  <span className="text-[var(--shop-savings)] ml-2 font-semibold">
                    (คุณประหยัด {formatTHB(savings)})
                  </span>
                )}
              </div>
            </div>

            {/* MOQ tier picker */}
            <div>
              <div className="flex items-center gap-2 mb-2 text-sm font-bold">
                <TrendingDown size={16} className="text-[var(--shop-primary)]" />
                <span>เลือกขั้นจำนวน (MOQ)</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {tiers.map((t) => {
                  const active = activeTier.qty === t.qty;
                  return (
                    <button
                      key={t.qty}
                      type="button"
                      onClick={() => setQty(t.qty)}
                      className={`rounded-xl border-2 p-3 text-left transition-all ${
                        active
                          ? 'border-[var(--shop-primary)] bg-[var(--shop-bg-soft)] shadow-md'
                          : 'border-[var(--shop-border)] bg-[var(--shop-card)] hover:border-[var(--pks-ink-dim)]'
                      }`}
                    >
                      <div className="text-xs font-bold text-[var(--shop-ink-muted)]">
                        {t.qty.toLocaleString('th-TH')}+ ชิ้น
                      </div>
                      <div className="font-[family:var(--font-kanit)] font-extrabold text-lg text-[var(--shop-primary)]">
                        {formatTHB(t.unit)}
                      </div>
                      {t.save > 0 ? (
                        <div className="text-[10px] font-bold text-[var(--shop-savings)]">
                          ลด {t.save}%
                        </div>
                      ) : (
                        <div className="text-[10px] text-[var(--pks-ink-dim)]">ขั้นเริ่มต้น</div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Variant pickers */}
            {sizeOptions.length > 0 && (
              <VariantRow
                label="ขนาด"
                options={sizeOptions}
                getLabel={(v) => v.sizeLabel ?? ''}
                activeId={variantId}
                onPick={setVariantId}
              />
            )}
            {colorOptions.length > 0 && (
              <VariantRow
                label="สี"
                options={colorOptions}
                getLabel={(v) => v.colorLabel ?? ''}
                activeId={variantId}
                onPick={setVariantId}
              />
            )}
            {materialOptions.length > 0 && (
              <VariantRow
                label="วัสดุ"
                options={materialOptions}
                getLabel={(v) => v.materialLabel ?? ''}
                activeId={variantId}
                onPick={setVariantId}
              />
            )}

            {/* Qty stepper */}
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-[var(--shop-muted)] rounded-full border border-[var(--shop-border)]">
                <button
                  type="button"
                  onClick={() => setQty((q) => safeQty(q - 50))}
                  className="p-2.5 text-[var(--shop-ink-muted)] hover:text-[var(--shop-primary)] disabled:opacity-40"
                  aria-label="ลดจำนวน"
                  disabled={qty <= 50}
                >
                  <Minus size={16} />
                </button>
                <input
                  type="number"
                  inputMode="numeric"
                  min={50}
                  step={50}
                  value={qty}
                  onChange={(e) => setQty(safeQty(Number(e.target.value) || 50))}
                  className="w-20 bg-transparent text-center font-bold text-[var(--shop-ink)] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setQty((q) => safeQty(q + 50))}
                  className="p-2.5 text-[var(--shop-ink-muted)] hover:text-[var(--shop-primary)]"
                  aria-label="เพิ่มจำนวน"
                >
                  <Plus size={16} />
                </button>
              </div>
              <span className="text-xs text-[var(--shop-ink-muted)]">
                ขั้นต่ำ 50 ชิ้น · เพิ่มทีละ 50
              </span>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleAdd}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-[var(--shop-primary)] hover:bg-[var(--pks-pink-deep)] text-white font-bold px-6 py-4 rounded-full shadow-lg shadow-[var(--shop-primary)]/30 transition-all hover:-translate-y-0.5"
              >
                <ShoppingBag size={18} /> หยิบใส่ตะกร้า
              </button>
              <button
                type="button"
                className="flex-1 inline-flex items-center justify-center gap-2 bg-[var(--shop-accent)] hover:brightness-95 text-[var(--shop-ink)] font-bold px-6 py-4 rounded-full transition-colors"
              >
                <Phone size={18} /> ขอราคาพิเศษ
              </button>
            </div>

            {/* Trust row */}
            <ul className="grid grid-cols-3 gap-2 text-[11px] text-center pt-2">
              {[
                { icon: Truck, label: 'ส่งฟรี ฿990+' },
                { icon: ShieldCheck, label: 'รับประกันงาน' },
                { icon: RefreshCw, label: 'คืนได้ 7 วัน' },
              ].map(({ icon: I, label }) => (
                <li
                  key={label}
                  className="rounded-xl bg-[var(--shop-muted)] py-3 px-2 flex flex-col items-center gap-1 text-[var(--shop-ink-muted)] font-semibold"
                >
                  <I size={18} className="text-[var(--shop-primary)]" />
                  {label}
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Description band */}
        {product.description && (
          <section className="mt-12 rounded-3xl bg-[var(--shop-bg-soft)] p-6 lg:p-10 border border-[var(--shop-border)]">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={18} className="text-[var(--shop-primary)]" />
              <h2 className="font-[family:var(--font-kanit)] font-bold text-xl">รายละเอียดสินค้า</h2>
            </div>
            <p className="text-sm leading-relaxed text-[var(--shop-ink-muted)] whitespace-pre-wrap">
              {product.description}
            </p>
          </section>
        )}

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-14">
            <h2 className="font-[family:var(--font-kanit)] font-extrabold text-2xl mb-5">
              สินค้าที่เกี่ยวข้อง
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.slice(0, 8).map((r) => (
                <Link
                  key={r.id}
                  href={`/stores/${store.slug}/products/${r.id}`}
                  className="group bg-[var(--shop-card)] rounded-2xl border border-[var(--shop-border)] overflow-hidden hover:border-[var(--shop-primary)] hover:shadow-md transition-all"
                >
                  <div className="aspect-square bg-[var(--shop-muted)] overflow-hidden">
                    {r.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={r.imageUrl}
                        alt={r.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[var(--pks-ink-dim)]">
                        <Package size={36} />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-bold line-clamp-2 leading-snug group-hover:text-[var(--shop-primary)] transition-colors">
                      {r.title}
                    </h3>
                    <div className="mt-2 font-[family:var(--font-kanit)] font-extrabold text-[var(--shop-primary)]">
                      {formatTHB(r.priceTHB)}
                    </div>
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

interface VariantRowProps {
  label: string;
  options: VariantOption[];
  getLabel: (v: VariantOption) => string;
  activeId: string | undefined;
  onPick: (id: string) => void;
}

function VariantRow({ label, options, getLabel, activeId, onPick }: VariantRowProps) {
  return (
    <div>
      <div className="text-sm font-bold mb-2">{label}</div>
      <div className="flex flex-wrap gap-2">
        {options.map((v) => {
          const active = v.id === activeId;
          const out = v.inventory === 0;
          return (
            <button
              key={v.id}
              type="button"
              disabled={out}
              onClick={() => onPick(v.id)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border-2 transition-all ${
                active
                  ? 'border-[var(--shop-primary)] bg-[var(--shop-primary)] text-white'
                  : 'border-[var(--shop-border)] bg-[var(--shop-card)] text-[var(--shop-ink-muted)] hover:border-[var(--shop-primary)] hover:text-[var(--shop-ink)]'
              } ${out ? 'opacity-50 line-through cursor-not-allowed' : ''}`}
            >
              {getLabel(v)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default ProductDetail;
