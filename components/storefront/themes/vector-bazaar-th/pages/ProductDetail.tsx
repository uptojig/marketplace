'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Download,
  Plus,
  Minus,
  Palette,
  FileImage,
  ShieldCheck,
  Zap,
  Layers,
  Star,
  Heart,
  Sparkles,
} from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';
import { VECTOR_BAZAAR_RAINBOW } from '../palette';

interface ProductCardLite {
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
  related: ProductCardLite[];
}

type TabKey = 'description' | 'specs' | 'license' | 'reviews';

const TABS: { id: TabKey; label: string }[] = [
  { id: 'description', label: 'รายละเอียด' },
  { id: 'specs', label: 'สเปคไฟล์' },
  { id: 'license', label: 'ใบอนุญาต' },
  { id: 'reviews', label: 'รีวิว' },
];

const STATIC_REVIEWS = [
  { name: 'นภัสกร · Brand designer', stars: 5, body: 'ไฟล์ SVG จัดเลเยอร์มาดีมาก แก้ใน Figma ง่ายมาก ใช้ทำ landing page ของลูกค้าสองรายแล้ว คุ้มสุดๆ' },
  { name: 'อัสนี · Freelancer', stars: 5, body: 'ราคาดี คุณภาพระดับสตูดิโอ เลือกใช้เพราะมีทั้ง .ai .eps ครบ ปรับสีตามแบรนด์ลูกค้าได้ทันที' },
  { name: 'สุภาพร · Art director', stars: 4, body: 'สีสันสดใสตรงปก แพ็คใหญ่ใช้ได้หลายโปรเจค ขอเพิ่มสไตล์ที่เป็นลายเส้นบางๆ เพิ่มอีกได้ไหมคะ' },
];

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
  const [tab, setTab] = useState<TabKey>('description');

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
    <div className="bg-[#FEFCE8] text-[#1E1B4B] font-[family:var(--font-prompt)] min-h-screen">
      {/* Breadcrumb */}
      <section className="bg-white border-b border-[#FBCFE8] px-4 py-3">
        <div className="max-w-7xl mx-auto text-xs font-bold text-[#6366F1] flex items-center gap-2 overflow-x-auto vb-no-scrollbar">
          <Link href={`/stores/${store.slug}`} className="hover:text-[#DB2777] whitespace-nowrap">
            หน้าร้าน
          </Link>
          <span>›</span>
          <Link href={`/stores/${store.slug}/category`} className="hover:text-[#DB2777] whitespace-nowrap">
            คลังทั้งหมด
          </Link>
          {product.categoryName && (
            <>
              <span>›</span>
              <Link
                href={`/stores/${store.slug}/category?cat=${encodeURIComponent(product.categoryName)}`}
                className="hover:text-[#DB2777] whitespace-nowrap"
              >
                {product.categoryName}
              </Link>
            </>
          )}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Gallery */}
        <div className="space-y-4 lg:sticky lg:top-24 self-start">
          <div className="relative aspect-square rounded-3xl vb-checker border border-[#FBCFE8] overflow-hidden shadow-[0_16px_40px_-16px_rgba(244,114,182,0.35)] group">
            {hasDiscount && (
              <div className="absolute top-4 left-4 z-10 inline-flex items-center gap-1.5 rounded-full bg-[#F472B6] text-white px-4 py-1.5 text-xs font-black tracking-widest uppercase shadow-md font-[family:var(--font-kanit)]">
                <Sparkles className="w-3.5 h-3.5" />
                ลด {discountPct}%
              </div>
            )}
            {gallery[activeImage] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={gallery[activeImage]}
                alt={product.title}
                className="absolute inset-0 w-full h-full object-contain p-10 group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-[#F472B6] via-[#FBBF24] to-[#60A5FA] flex items-center justify-center shadow-2xl">
                  <Palette className="w-16 h-16 text-white" />
                </div>
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
                  className={`aspect-square rounded-2xl vb-checker overflow-hidden border-2 transition-all ${
                    idx === activeImage
                      ? 'border-[#F472B6] vb-glow-primary'
                      : 'border-[#FBCFE8] hover:border-[#F472B6]'
                  }`}
                  aria-label={`รูปที่ ${idx + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="w-full h-full object-contain p-2" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info column */}
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#FCE7F3] text-[#DB2777] px-3 py-1 text-[11px] font-black tracking-widest uppercase font-[family:var(--font-kanit)]">
              <FileImage className="w-3 h-3" />
              {product.categoryName ?? 'ผลงานเวกเตอร์'} · #{product.id.slice(-6)}
            </div>
            <h1 className="font-[family:var(--font-kanit)] text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              {product.title}
            </h1>
            {/* Fake review summary — purely visual */}
            <div className="flex items-center gap-2 pt-1">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-[#FBBF24] text-[#FBBF24]" />
                ))}
              </div>
              <span className="text-xs font-bold text-[#6366F1]">4.8 · {STATIC_REVIEWS.length} รีวิว</span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 py-4 border-y border-[#FBCFE8]">
            <span className="font-[family:var(--font-kanit)] font-black text-4xl vb-rainbow-text">
              {formatTHB(effectivePrice)}
            </span>
            {hasDiscount && (
              <span className="text-base font-bold text-[#6366F1]/60 line-through">
                {formatTHB(product.originalPriceTHB!)}
              </span>
            )}
          </div>

          {/* Variants */}
          {product.variants.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-[family:var(--font-kanit)] font-black text-sm tracking-widest uppercase text-[#1E1B4B]">
                ตัวเลือก
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v, idx) => {
                  const active = selectedVariant === v.id;
                  const label = v.colorLabel || v.sizeLabel || v.materialLabel ||
                    Object.values(v.attributes).join(' · ') || 'ตัวเลือก';
                  const color = VECTOR_BAZAAR_RAINBOW[idx % VECTOR_BAZAAR_RAINBOW.length];
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariant(v.id)}
                      className={`px-4 h-11 rounded-full font-[family:var(--font-kanit)] font-bold text-sm transition-all ${
                        active
                          ? 'text-white shadow-md'
                          : 'bg-white border border-[#FBCFE8] text-[#1E1B4B] hover:scale-105'
                      }`}
                      style={active ? { backgroundColor: color } : undefined}
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
            <div className="flex items-center rounded-full border border-[#FBCFE8] bg-white shrink-0">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="ลดจำนวน"
                className="w-12 h-12 rounded-full flex items-center justify-center text-[#1E1B4B] hover:bg-[#FCE7F3] active:scale-90 transition-all"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center font-[family:var(--font-kanit)] font-black text-lg">
                {qty}
              </span>
              <button
                type="button"
                onClick={() => setQty((q) => q + 1)}
                aria-label="เพิ่มจำนวน"
                className="w-12 h-12 rounded-full flex items-center justify-center text-[#1E1B4B] hover:bg-[#FCE7F3] active:scale-90 transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={handleAdd}
              className="flex-1 h-14 rounded-full bg-[#F472B6] text-white font-[family:var(--font-kanit)] font-black text-base vb-glow-primary hover:bg-[#EC4899] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              เพิ่มในตะกร้า · ดาวน์โหลดทันที
            </button>
          </div>

          {/* Trust strip */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { Icon: Download, label: 'ดาวน์โหลด', sub: 'ทันทีหลังจ่าย', bg: '#FCE7F3', fg: '#DB2777' },
              { Icon: Layers, label: 'ทุกเลเยอร์', sub: 'แก้ไขได้', bg: '#DBEAFE', fg: '#2563EB' },
              { Icon: ShieldCheck, label: 'License', sub: 'เชิงพาณิชย์', bg: '#D1FAE5', fg: '#047857' },
            ].map((t, i) => (
              <div
                key={i}
                className="rounded-2xl p-3 text-center"
                style={{ backgroundColor: t.bg }}
              >
                <t.Icon className="w-5 h-5 mx-auto mb-1.5" style={{ color: t.fg }} />
                <p className="font-[family:var(--font-kanit)] font-black text-xs" style={{ color: t.fg }}>
                  {t.label}
                </p>
                <p className="text-[10px] text-[#1E1B4B]/70 font-bold">{t.sub}</p>
              </div>
            ))}
          </div>

          {/* Stock indicator */}
          {typeof product.stockLeft === 'number' && product.stockLeft > 0 && product.stockLeft < 20 && (
            <div className="rounded-2xl bg-[#FEF3C7] border border-[#FBBF24] px-4 py-3 inline-flex items-center gap-2 font-[family:var(--font-kanit)] font-bold text-sm text-[#B45309]">
              <Zap className="w-4 h-4 fill-[#FBBF24]" />
              เหลือเพียง {product.stockLeft} ใบอนุญาต
            </div>
          )}

          {/* Tabs */}
          <div className="rounded-3xl bg-white border border-[#FBCFE8] overflow-hidden">
            <div className="flex overflow-x-auto vb-no-scrollbar border-b border-[#FBCFE8] bg-[#FEFCE8]/60">
              {TABS.map((t) => {
                const active = tab === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTab(t.id)}
                    className={`flex-1 min-w-fit px-5 py-3 text-sm font-[family:var(--font-kanit)] font-bold border-b-2 transition-colors ${
                      active
                        ? 'border-[#F472B6] text-[#DB2777]'
                        : 'border-transparent text-[#6366F1] hover:text-[#1E1B4B]'
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
            <div className="p-5 sm:p-6 text-sm leading-relaxed">
              {tab === 'description' && (
                <div className="space-y-3">
                  {product.description ? (
                    <p className="whitespace-pre-line">{product.description}</p>
                  ) : (
                    <p className="text-[#6366F1]">
                      ชุดผลงานเวกเตอร์คุณภาพระดับสตูดิโอ — ทุกไฟล์จัดเลเยอร์มาแล้ว เปลี่ยนสีและรูปทรงได้ง่ายๆ ใน Figma, Adobe Illustrator, หรือ Sketch ใช้ได้กับเว็บไซต์, สื่อสิ่งพิมพ์, แพ็คเกจจิ้ง และโซเชียลมีเดีย
                    </p>
                  )}
                </div>
              )}
              {tab === 'specs' && (
                <ul className="space-y-2">
                  <SpecRow label="รูปแบบไฟล์" value=".svg · .ai · .eps · .png" />
                  <SpecRow label="ความละเอียด" value="Vector · ไม่จำกัดขนาด" />
                  <SpecRow label="โหมดสี" value="RGB / CMYK" />
                  <SpecRow label="จำนวนชิ้นในแพ็ค" value="ตามรายการสินค้า" />
                  <SpecRow label="ขนาดไฟล์รวม" value="< 50 MB" />
                  <SpecRow label="ภาษาเลเยอร์" value="ไทย · อังกฤษ" />
                </ul>
              )}
              {tab === 'license' && (
                <div className="space-y-3">
                  <p>
                    <strong className="text-[#DB2777]">ใช้งานเชิงพาณิชย์ได้:</strong> เว็บไซต์, แอป, สื่อสิ่งพิมพ์, โซเชียลมีเดีย, แพ็คเกจจิ้ง, สื่อโฆษณา
                  </p>
                  <p>
                    <strong className="text-[#2563EB]">ไม่อนุญาต:</strong> ขายต่อในรูปแบบ template หรือ stock asset · นำไปอ้างเป็นผลงานต้นฉบับ
                  </p>
                  <p className="text-[#6366F1]">
                    ใบอนุญาตต่อหนึ่งใบ = ใช้ในโปรเจคไม่จำกัดของผู้ซื้อ
                  </p>
                </div>
              )}
              {tab === 'reviews' && (
                <ul className="space-y-4">
                  {STATIC_REVIEWS.map((r, i) => (
                    <li key={i} className="rounded-2xl bg-[#FEFCE8]/60 p-4">
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <span className="font-[family:var(--font-kanit)] font-bold text-sm">{r.name}</span>
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <Star
                              key={idx}
                              className={`w-3.5 h-3.5 ${idx < r.stars ? 'fill-[#FBBF24] text-[#FBBF24]' : 'text-[#FBCFE8]'}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-[#1E1B4B]/80 leading-relaxed">{r.body}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="relative bg-white border-y border-[#FBCFE8] px-4 sm:px-6 lg:px-8 py-14 mt-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between gap-3 mb-8">
              <h2 className="font-[family:var(--font-kanit)] text-2xl sm:text-3xl font-black tracking-tight inline-flex items-center gap-2">
                <Heart className="w-6 h-6 fill-[#F472B6] text-[#F472B6]" />
                ผลงานที่คุณอาจชอบ
              </h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {related.slice(0, 4).map((p, idx) => {
                const accent = VECTOR_BAZAAR_RAINBOW[idx % VECTOR_BAZAAR_RAINBOW.length];
                return (
                  <Link
                    key={p.id}
                    href={`/stores/${store.slug}/products/${p.id}`}
                    className="group vb-card-hover rounded-3xl bg-[#FEFCE8] border border-[#FBCFE8] overflow-hidden flex flex-col"
                  >
                    <div className="relative aspect-square vb-checker overflow-hidden">
                      {p.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.imageUrl}
                          alt={p.title}
                          className="absolute inset-0 w-full h-full object-contain p-5 group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div
                            className="w-14 h-14 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: accent }}
                          >
                            <FileImage className="w-7 h-7 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-3 space-y-1">
                      <h3 className="font-[family:var(--font-kanit)] font-black text-sm line-clamp-2">
                        {p.title}
                      </h3>
                      <p className="font-[family:var(--font-kanit)] font-black text-base text-[#DB2777]">
                        {formatTHB(p.priceTHB)}
                      </p>
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

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex items-baseline justify-between gap-3 border-b border-[#FBCFE8]/60 pb-2 last:border-b-0 last:pb-0">
      <span className="font-bold text-[#6366F1] text-xs tracking-widest uppercase font-[family:var(--font-kanit)]">
        {label}
      </span>
      <span className="font-bold text-[#1E1B4B] text-sm text-right">{value}</span>
    </li>
  );
}
