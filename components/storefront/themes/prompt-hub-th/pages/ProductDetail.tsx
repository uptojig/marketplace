'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ShoppingCart,
  Bot,
  Plus,
  Minus,
  Download,
  ShieldCheck,
  Zap,
  Star,
  Code2,
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

type TabId = 'description' | 'specs' | 'reviews' | 'shipping';

const GRADIENT_BG = 'linear-gradient(135deg, #A855F7 0%, #06B6D4 100%)';
const GLASS_STYLE: React.CSSProperties = {
  backgroundColor: 'rgba(19, 19, 46, 0.6)',
  backdropFilter: 'blur(12px) saturate(140%)',
  WebkitBackdropFilter: 'blur(12px) saturate(140%)',
  border: '1px solid rgba(168, 85, 247, 0.16)',
};
const GLOW_SM =
  '0 0 0 1px rgba(168,85,247,0.4), 0 0 12px rgba(168,85,247,0.4), 0 0 32px rgba(168,85,247,0.2)';
const GLOW_LG =
  '0 0 0 1px rgba(168,85,247,0.5), 0 0 24px rgba(168,85,247,0.5), 0 0 64px rgba(168,85,247,0.28)';

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
  const [tab, setTab] = useState<TabId>('description');

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
    <div className="bg-[#0B0B1F] text-[#F8FAFC] font-[family:var(--font-prompt)] min-h-screen">
      <section className="border-b border-[#312E81]/40 px-4 py-3">
        <div className="max-w-7xl mx-auto text-xs text-[#94A3B8] flex items-center gap-1.5 flex-wrap">
          <Link href={`/stores/${store.slug}`} className="hover:text-[#A855F7] transition-colors">
            ร้านค้า
          </Link>
          <ChevronRight className="w-3 h-3" />
          <Link
            href={`/stores/${store.slug}/category`}
            className="hover:text-[#A855F7] transition-colors"
          >
            พรอมต์ทั้งหมด
          </Link>
          {product.categoryName && (
            <>
              <ChevronRight className="w-3 h-3" />
              <Link
                href={`/stores/${store.slug}/category?cat=${encodeURIComponent(product.categoryName)}`}
                className="hover:text-[#A855F7] transition-colors"
              >
                {product.categoryName}
              </Link>
            </>
          )}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8 grid lg:grid-cols-[1.1fr_1fr] gap-8 lg:gap-12">
        <div className="space-y-4 lg:sticky lg:top-24 self-start">
          <div
            className="relative aspect-square rounded-2xl overflow-hidden"
            style={{ ...GLASS_STYLE, boxShadow: GLOW_SM }}
          >
            {hasDiscount && (
              <div className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-full bg-[#FACC15] text-[#0B0B1F] text-xs font-bold uppercase tracking-wider font-[family:var(--font-kanit)]">
                ลด {discountPct}%
              </div>
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
                    'linear-gradient(135deg, rgba(168,85,247,0.25) 0%, rgba(6,182,212,0.25) 100%)',
                }}
              >
                <Bot className="w-24 h-24 text-[#F8FAFC]/30" />
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
                      ? 'ring-2 ring-[#A855F7]'
                      : 'opacity-60 hover:opacity-100 ring-1 ring-[#312E81]'
                  }`}
                  style={idx === activeImage ? { boxShadow: GLOW_SM } : undefined}
                  aria-label={`รูปที่ ${idx + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <div className="text-[11px] uppercase tracking-[0.16em] text-[#06B6D4] font-medium">
              {product.categoryName ?? 'AI Prompt'} ·{' '}
              <span className="text-[#94A3B8]">#{product.id.slice(-6)}</span>
            </div>
            <h1 className="font-[family:var(--font-kanit)] text-3xl sm:text-4xl font-bold tracking-tight text-[#F8FAFC] leading-tight">
              {product.title}
            </h1>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-[#FACC15] text-[#FACC15]" />
                ))}
              </div>
              <span className="text-[#94A3B8]">4.9 · 1,284 รีวิว</span>
            </div>
          </div>

          <div className="rounded-2xl p-5" style={GLASS_STYLE}>
            <div className="flex items-baseline gap-3">
              <span className="font-[family:var(--font-kanit)] font-bold text-4xl text-[#A855F7] tabular-nums">
                {formatTHB(effectivePrice)}
              </span>
              {hasDiscount && (
                <span className="text-lg text-[#94A3B8] line-through tabular-nums">
                  {formatTHB(product.originalPriceTHB!)}
                </span>
              )}
            </div>
            <p className="text-xs text-[#94A3B8] mt-2 flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5 text-[#10B981]" />
              ดาวน์โหลดได้ทันทีหลังชำระเงิน · ใช้งานได้ตลอดชีพ
            </p>
          </div>

          {product.variants.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-[family:var(--font-kanit)] font-semibold text-sm uppercase tracking-[0.16em] text-[#F8FAFC]">
                ตัวเลือก
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => {
                  const active = selectedVariant === v.id;
                  const label =
                    v.colorLabel ||
                    v.sizeLabel ||
                    v.materialLabel ||
                    Object.values(v.attributes).join(' · ') ||
                    'ตัวเลือก';
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariant(v.id)}
                      className={`px-4 h-10 rounded-full text-sm font-medium transition-all font-[family:var(--font-kanit)] ${
                        active
                          ? 'text-white'
                          : 'bg-[#13132E] text-[#94A3B8] border border-[#312E81] hover:border-[#A855F7]/50 hover:text-[#F8FAFC]'
                      }`}
                      style={active ? { backgroundImage: GRADIENT_BG, boxShadow: GLOW_SM } : undefined}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center rounded-full bg-[#13132E] border border-[#312E81]">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="ลดจำนวน"
                className="w-11 h-12 flex items-center justify-center text-[#94A3B8] hover:text-[#A855F7] transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 h-12 flex items-center justify-center font-[family:var(--font-kanit)] font-semibold text-[#F8FAFC] tabular-nums">
                {qty}
              </span>
              <button
                type="button"
                onClick={() => setQty((q) => q + 1)}
                aria-label="เพิ่มจำนวน"
                className="w-11 h-12 flex items-center justify-center text-[#94A3B8] hover:text-[#A855F7] transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={handleAdd}
              className="flex-1 h-12 rounded-full text-white font-[family:var(--font-kanit)] font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              style={{ backgroundImage: GRADIENT_BG, boxShadow: GLOW_LG }}
            >
              <ShoppingCart className="w-4 h-4" />
              เพิ่มในตะกร้า
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl p-3 text-center" style={GLASS_STYLE}>
              <Download className="w-5 h-5 mx-auto mb-1.5 text-[#10B981]" />
              <p className="text-[10px] uppercase tracking-[0.14em] text-[#F8FAFC] font-semibold">
                ดาวน์โหลดทันที
              </p>
            </div>
            <div className="rounded-xl p-3 text-center" style={GLASS_STYLE}>
              <ShieldCheck className="w-5 h-5 mx-auto mb-1.5 text-[#06B6D4]" />
              <p className="text-[10px] uppercase tracking-[0.14em] text-[#F8FAFC] font-semibold">
                คืนเงิน 7 วัน
              </p>
            </div>
            <div className="rounded-xl p-3 text-center" style={GLASS_STYLE}>
              <Zap className="w-5 h-5 mx-auto mb-1.5 text-[#A855F7]" />
              <p className="text-[10px] uppercase tracking-[0.14em] text-[#F8FAFC] font-semibold">
                ใช้งานตลอดชีพ
              </p>
            </div>
          </div>

          {typeof product.stockLeft === 'number' &&
            product.stockLeft > 0 &&
            product.stockLeft < 20 && (
              <div className="rounded-xl border border-[#FACC15]/40 bg-[#FACC15]/10 px-4 py-3 font-[family:var(--font-kanit)] text-sm text-[#FACC15] font-semibold flex items-center gap-2">
                <Zap className="w-4 h-4" />
                เหลือเพียง {product.stockLeft} สิทธิ์
              </div>
            )}
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-4 pb-12">
        <div className="border-b border-[#312E81]/60 flex items-center gap-1 overflow-x-auto">
          {[
            { id: 'description', label: 'รายละเอียด' },
            { id: 'specs', label: 'สเปก' },
            { id: 'reviews', label: 'รีวิว' },
            { id: 'shipping', label: 'การจัดส่ง' },
          ].map((t) => {
            const active = tab === (t.id as TabId);
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id as TabId)}
                className={`shrink-0 px-5 py-3 text-sm font-medium transition-all relative font-[family:var(--font-kanit)] ${
                  active ? 'text-[#A855F7]' : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                }`}
              >
                {t.label}
                {active && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{ backgroundImage: GRADIENT_BG, boxShadow: GLOW_SM }}
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-6 rounded-2xl p-6 sm:p-8" style={GLASS_STYLE}>
          {tab === 'description' && (
            <div className="prose prose-invert prose-sm max-w-none">
              {product.description ? (
                <p className="text-[#94A3B8] leading-relaxed whitespace-pre-line text-sm sm:text-base">
                  {product.description}
                </p>
              ) : (
                <p className="text-[#94A3B8] text-sm">
                  พรอมต์ AI คุณภาพสูง คัดสรรเพื่อใช้งานได้ทันที — เหมาะสำหรับครีเอเตอร์ คอนเทนต์ครีเอเตอร์ และนักพัฒนา
                </p>
              )}
            </div>
          )}
          {tab === 'specs' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: 'รูปแบบไฟล์', value: '.txt / .json' },
                { label: 'เข้ากันได้กับ', value: 'ChatGPT · Claude · Gemini' },
                { label: 'ภาษา', value: 'ไทย / อังกฤษ' },
                { label: 'การใช้งาน', value: 'ตลอดชีพ ไม่จำกัดจำนวนครั้ง' },
                { label: 'อัปเดต', value: 'ฟรีตลอดอายุการใช้งาน' },
                { label: 'ขนาดไฟล์', value: '< 1 MB' },
              ].map((s) => (
                <div
                  key={s.label}
                  className="flex items-center justify-between px-4 py-3 rounded-lg bg-[#0B0B1F]/60 border border-[#312E81]"
                >
                  <span className="text-xs uppercase tracking-[0.14em] text-[#94A3B8] flex items-center gap-2">
                    <Code2 className="w-3.5 h-3.5 text-[#A855F7]" />
                    {s.label}
                  </span>
                  <span className="text-sm text-[#F8FAFC] font-medium">{s.value}</span>
                </div>
              ))}
            </div>
          )}
          {tab === 'reviews' && (
            <div className="space-y-4">
              {[
                { name: 'นัทธมน W.', rating: 5, text: 'พรอมต์ใช้ง่าย ได้ผลลัพธ์ตรงตามที่ต้องการ คุ้มราคามากครับ' },
                { name: 'ภาคิน ส.', rating: 5, text: 'คุณภาพดีมาก แนะนำสำหรับคนที่อยากเริ่มใช้ AI สร้างคอนเทนต์' },
                { name: 'พิมพ์ลภัส K.', rating: 4, text: 'เนื้อหาแน่น มีตัวอย่างให้ลองใช้ ปรับแต่งง่าย' },
              ].map((r, i) => (
                <div key={i} className="rounded-xl bg-[#0B0B1F]/60 border border-[#312E81] p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-[#F8FAFC]">{r.name}</span>
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star
                          key={idx}
                          className={`w-3.5 h-3.5 ${
                            idx < r.rating ? 'fill-[#FACC15] text-[#FACC15]' : 'text-[#312E81]'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-[#94A3B8]">{r.text}</p>
                </div>
              ))}
            </div>
          )}
          {tab === 'shipping' && (
            <div className="space-y-4 text-sm text-[#94A3B8]">
              <div className="flex items-start gap-3">
                <Download className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#F8FAFC] mb-1">ดาวน์โหลดได้ทันที</p>
                  <p>หลังชำระเงิน ระบบจะส่งลิงก์ดาวน์โหลดให้ทางอีเมลทันที</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#06B6D4] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#F8FAFC] mb-1">รับประกันคืนเงิน 7 วัน</p>
                  <p>หากไม่พอใจ ติดต่อทีมงานเพื่อขอคืนเงินเต็มจำนวน</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {related.length > 0 && (
        <section className="px-4 py-12 border-t border-[#312E81]/40 bg-[#13132E]/40">
          <div className="max-w-7xl mx-auto">
            <h2 className="font-[family:var(--font-kanit)] text-2xl font-bold tracking-tight text-[#F8FAFC] mb-6">
              พรอมต์ที่เกี่ยวข้อง
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {related.slice(0, 4).map((p) => (
                <Link
                  key={p.id}
                  href={`/stores/${store.slug}/products/${p.id}`}
                  className="group rounded-xl overflow-hidden transition-all hover:-translate-y-0.5"
                  style={GLASS_STYLE}
                >
                  <div className="relative aspect-square bg-[#1E1E3F] overflow-hidden">
                    {p.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.imageUrl}
                        alt={p.title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#A855F7]/15 to-[#06B6D4]/15">
                        <Bot className="w-8 h-8 text-[#F8FAFC]/30" />
                      </div>
                    )}
                  </div>
                  <div className="p-3 space-y-1.5">
                    <h3 className="font-[family:var(--font-kanit)] font-semibold text-xs sm:text-sm text-[#F8FAFC] line-clamp-2 leading-snug min-h-[2.2em]">
                      {p.title}
                    </h3>
                    <p className="font-[family:var(--font-kanit)] font-bold text-sm text-[#A855F7] tabular-nums">
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
