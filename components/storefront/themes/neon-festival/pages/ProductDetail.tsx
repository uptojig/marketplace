'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Sparkles, Plus, Minus, Zap, ShieldCheck, Truck } from 'lucide-react';
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
  store: { id: string; slug: string; name: string; logoUrl?: string | null };
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

export default function ProductDetail({ store, product, related }: ProductDetailProps) {
  const gallery = useMemo(() => {
    const all = [product.imageUrl, ...product.images].filter((u): u is string => !!u);
    return Array.from(new Set(all));
  }, [product.imageUrl, product.images]);

  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(
    product.variants[0]?.id ?? null,
  );

  const variant = product.variants.find((v) => v.id === selectedVariant) ?? null;
  const effectivePrice = variant?.priceTHB ?? product.priceTHB;
  const hasDiscount = product.originalPriceTHB && product.originalPriceTHB > effectivePrice;
  const discountPct = hasDiscount
    ? Math.round(((product.originalPriceTHB! - effectivePrice) / product.originalPriceTHB!) * 100)
    : 0;

  const add = useCart((s) => s.add);

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

  return (
    <div className="bg-[#fafafa] text-black font-[family:var(--font-prompt)] min-h-screen">
      {/* Breadcrumb strip */}
      <section className="bg-yellow-400 border-b-4 border-black px-4 py-3">
        <div className="max-w-7xl mx-auto text-xs font-black uppercase tracking-widest flex items-center gap-2">
          <Link href={`/stores/${store.slug}`} className="hover:underline decoration-4 underline-offset-4">
            ร้านค้า
          </Link>
          <span>/</span>
          <Link href={`/stores/${store.slug}/category`} className="hover:underline decoration-4 underline-offset-4">
            สินค้าทั้งหมด
          </Link>
          {product.categoryName && (
            <>
              <span>/</span>
              <Link
                href={`/stores/${store.slug}/category?cat=${encodeURIComponent(product.categoryName)}`}
                className="hover:underline decoration-4 underline-offset-4"
              >
                {product.categoryName}
              </Link>
            </>
          )}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8 grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-slate-100 overflow-hidden group">
            {hasDiscount && (
              <div className="absolute top-6 -left-2 z-10 bg-pink-500 text-white font-[family:var(--font-kanit)] font-black text-base uppercase px-5 py-2 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-[-4deg]">
                ลด {discountPct}%
              </div>
            )}
            {gallery[activeImage] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={gallery[activeImage]}
                alt={product.title}
                className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-pink-300 to-yellow-300">
                <Sparkles className="w-24 h-24 text-black/40" />
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
                  className={`aspect-square border-4 overflow-hidden ${
                    idx === activeImage
                      ? 'border-pink-500 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                      : 'border-black hover:border-pink-500'
                  } active:translate-x-1 active:translate-y-1`}
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
            <div className="text-[11px] font-black uppercase text-slate-500 tracking-widest">
              {product.categoryName ?? 'สินค้า'} · #{product.id.slice(-6)}
            </div>
            <h1 className="font-[family:var(--font-kanit)] text-3xl sm:text-4xl lg:text-5xl font-black uppercase italic leading-tight">
              {product.title}
            </h1>
          </div>

          <div className="flex items-baseline gap-4 border-y-4 border-black py-4">
            <span className="font-[family:var(--font-kanit)] font-black text-4xl text-pink-600">
              {formatTHB(effectivePrice)}
            </span>
            {hasDiscount && (
              <span className="text-lg font-bold text-slate-400 line-through">
                {formatTHB(product.originalPriceTHB!)}
              </span>
            )}
          </div>

          {/* Variants */}
          {product.variants.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-[family:var(--font-kanit)] font-black uppercase italic tracking-tight">
                ตัวเลือก
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => {
                  const active = selectedVariant === v.id;
                  const label = v.colorLabel || v.sizeLabel || v.materialLabel ||
                    Object.values(v.attributes).join(' · ') || 'ตัวเลือก';
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariant(v.id)}
                      className={`px-4 h-12 border-4 font-[family:var(--font-kanit)] font-black uppercase text-xs tracking-widest active:translate-x-1 active:translate-y-1 ${
                        active
                          ? 'border-black bg-pink-500 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                          : 'border-black bg-white hover:bg-yellow-400'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Qty + Add */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center border-4 border-black bg-white">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="ลดจำนวน"
                className="w-12 h-14 flex items-center justify-center hover:bg-yellow-400 active:translate-x-0.5 active:translate-y-0.5"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-14 h-14 flex items-center justify-center font-[family:var(--font-kanit)] font-black text-xl border-x-4 border-black">
                {qty}
              </span>
              <button
                type="button"
                onClick={() => setQty((q) => q + 1)}
                aria-label="เพิ่มจำนวน"
                className="w-12 h-14 flex items-center justify-center hover:bg-yellow-400 active:translate-x-0.5 active:translate-y-0.5"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={handleAdd}
              className="flex-1 h-14 px-6 bg-pink-500 text-white border-4 border-black font-[family:var(--font-kanit)] font-black uppercase tracking-widest shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-400 hover:text-black active:translate-x-2 active:translate-y-2 active:shadow-none flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              เพิ่มในตะกร้า
            </button>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3">
            <div className="border-4 border-black bg-yellow-400 p-3 text-center">
              <Truck className="w-6 h-6 mx-auto mb-1" />
              <p className="text-[10px] font-black uppercase tracking-widest">ส่งใน 1-3 วัน</p>
            </div>
            <div className="border-4 border-black bg-pink-500 text-white p-3 text-center">
              <ShieldCheck className="w-6 h-6 mx-auto mb-1" />
              <p className="text-[10px] font-black uppercase tracking-widest">คัดสรรคุณภาพ</p>
            </div>
            <div className="border-4 border-black bg-blue-600 text-white p-3 text-center">
              <Zap className="w-6 h-6 mx-auto mb-1" />
              <p className="text-[10px] font-black uppercase tracking-widest">คืนเงิน 7 วัน</p>
            </div>
          </div>

          {/* Stock */}
          {typeof product.stockLeft === 'number' && product.stockLeft > 0 && product.stockLeft < 20 && (
            <div className="border-4 border-black bg-yellow-400 px-4 py-3 font-[family:var(--font-kanit)] font-black uppercase text-sm">
              ⚡ เหลือเพียง {product.stockLeft} ชิ้น
            </div>
          )}

          {/* Description */}
          {product.description && (
            <div className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-5">
              <h3 className="font-[family:var(--font-kanit)] font-black text-xl uppercase italic mb-3 border-b-4 border-black pb-2">
                รายละเอียด
              </h3>
              <p className="text-sm whitespace-pre-line leading-relaxed">{product.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="bg-blue-600 border-y-4 border-black px-4 py-12 mt-12">
          <div className="max-w-7xl mx-auto">
            <h2 className="font-[family:var(--font-kanit)] text-3xl sm:text-4xl font-black uppercase italic text-white drop-shadow-[4px_4px_0_rgba(0,0,0,1)] mb-8">
              สินค้าที่เกี่ยวข้อง
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {related.slice(0, 4).map((p) => (
                <Link
                  key={p.id}
                  href={`/stores/${store.slug}/products/${p.id}`}
                  className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-400 active:translate-x-2 active:translate-y-2 active:shadow-none transition-all"
                >
                  <div className="relative aspect-square border-b-4 border-black bg-slate-100 overflow-hidden">
                    {p.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.imageUrl}
                        alt={p.title}
                        className="absolute inset-0 w-full h-full object-cover grayscale hover:grayscale-0 transition-all"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-pink-300 to-yellow-300">
                        <Sparkles className="w-8 h-8 text-black/40" />
                      </div>
                    )}
                  </div>
                  <div className="p-3 space-y-1">
                    <h3 className="font-[family:var(--font-kanit)] font-black text-sm uppercase line-clamp-2 leading-tight">
                      {p.title}
                    </h3>
                    <p className="font-[family:var(--font-kanit)] font-black text-base text-pink-600">
                      {formatTHB(p.priceTHB)}
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
