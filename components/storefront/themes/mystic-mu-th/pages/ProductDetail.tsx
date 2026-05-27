'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ShoppingCart,
  Sparkles,
  Plus,
  Minus,
  Star,
  ShieldCheck,
  Download,
  Coins,
  Crown,
  Zap,
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

type TabId = 'desc' | 'specs' | 'reviews' | 'shipping';

/**
 * MysticMu Product Detail — Mario level-card layout. Gallery on left
 * with pixel-border, info panel on right with bold red price, variant
 * picker (1-up style), quantity steppers, and a coin-block "Add to
 * Cart" CTA. Tabs reveal description/specs/reviews/shipping.
 */
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
  const [tab, setTab] = useState<TabId>('desc');

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
    <div className="bg-[#5C94FC] text-[#1A1A2E] font-[family:var(--font-prompt)] min-h-screen pb-16">
      {/* Breadcrumb */}
      <section className="bg-[#FFD700] border-b-4 border-[#1A1A2E] px-4 py-3">
        <div className="max-w-7xl mx-auto text-xs font-[family:var(--font-kanit)] font-black uppercase tracking-widest flex items-center gap-2 flex-wrap">
          <Link href={`/stores/${store.slug}`} className="hover:underline decoration-4 underline-offset-4">
            ร้านค้า
          </Link>
          <span aria-hidden>›</span>
          <Link
            href={`/stores/${store.slug}/category`}
            className="hover:underline decoration-4 underline-offset-4"
          >
            สินค้าทั้งหมด
          </Link>
          {product.categoryName && (
            <>
              <span aria-hidden>›</span>
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
          <div className="relative aspect-square border-4 border-[#1A1A2E] shadow-[8px_8px_0_0_#1A1A2E] bg-white overflow-hidden">
            {hasDiscount && (
              <div className="absolute top-5 -left-2 z-10 bg-[#E52521] text-white font-[family:var(--font-kanit)] font-black text-base uppercase px-4 py-2 border-4 border-[#1A1A2E] shadow-[4px_4px_0_0_#1A1A2E] rotate-[-4deg]">
                ลด {discountPct}%
              </div>
            )}
            <div className="absolute top-4 right-4 z-10 bg-[#009A4E] text-white border-4 border-[#1A1A2E] px-2.5 py-1 font-[family:var(--font-kanit)] font-black text-[11px] uppercase tracking-widest shadow-[3px_3px_0_0_#1A1A2E]">
              ⭐ 1-UP
            </div>
            {gallery[activeImage] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={gallery[activeImage]}
                alt={product.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#FFD700] via-[#E52521] to-[#009A4E]">
                <Sparkles className="w-24 h-24 text-white drop-shadow-[3px_3px_0_#1A1A2E]" />
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
                  className={`aspect-square border-4 overflow-hidden bg-white ${
                    idx === activeImage
                      ? 'border-[#E52521] shadow-[3px_3px_0_0_#1A1A2E]'
                      : 'border-[#1A1A2E] hover:border-[#E52521]'
                  } active:translate-x-0.5 active:translate-y-0.5 transition-transform`}
                  aria-label={`รูปที่ ${idx + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info panel */}
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="text-[11px] font-[family:var(--font-kanit)] font-black uppercase tracking-widest text-white drop-shadow-[2px_2px_0_#1A1A2E]">
              {product.categoryName ?? 'วอลเปเปอร์'} · #{product.id.slice(-6)}
            </div>
            <h1 className="font-[family:var(--font-kanit)] text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight leading-tight text-white drop-shadow-[4px_4px_0_#1A1A2E]">
              {product.title}
            </h1>
          </div>

          {/* Price card */}
          <div className="bg-white border-4 border-[#1A1A2E] shadow-[6px_6px_0_0_#1A1A2E] p-5">
            <div className="flex items-baseline gap-3">
              <span className="font-[family:var(--font-kanit)] font-black text-4xl text-[#E52521]">
                {formatTHB(effectivePrice)}
              </span>
              {hasDiscount && (
                <span className="text-lg font-bold text-[#4A4A6E] line-through">
                  {formatTHB(product.originalPriceTHB!)}
                </span>
              )}
            </div>
            <p className="mt-2 text-xs font-[family:var(--font-kanit)] font-black uppercase tracking-widest text-[#009A4E] flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5" /> ดาวน์โหลดทันทีหลังชำระเงิน
            </p>
          </div>

          {/* Variants */}
          {product.variants.length > 0 && (
            <div className="bg-white border-4 border-[#1A1A2E] shadow-[4px_4px_0_0_#1A1A2E] p-4 space-y-3">
              <h3 className="font-[family:var(--font-kanit)] font-black uppercase tracking-tight text-base flex items-center gap-2">
                <Star className="w-4 h-4 text-[#E52521]" /> ตัวเลือก
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
                      className={`px-3 h-11 border-4 font-[family:var(--font-kanit)] font-black uppercase text-xs tracking-widest active:translate-x-1 active:translate-y-1 transition-transform ${
                        active
                          ? 'border-[#1A1A2E] bg-[#E52521] text-white shadow-[3px_3px_0_0_#1A1A2E]'
                          : 'border-[#1A1A2E] bg-white hover:bg-[#FFD700]'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Qty + CTA */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center border-4 border-[#1A1A2E] bg-white shadow-[3px_3px_0_0_#1A1A2E]">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="ลดจำนวน"
                className="w-12 h-14 flex items-center justify-center hover:bg-[#FFD700] active:translate-x-0.5 active:translate-y-0.5"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-14 h-14 flex items-center justify-center font-[family:var(--font-kanit)] font-black text-xl border-x-4 border-[#1A1A2E]">
                {qty}
              </span>
              <button
                type="button"
                onClick={() => setQty((q) => q + 1)}
                aria-label="เพิ่มจำนวน"
                className="w-12 h-14 flex items-center justify-center hover:bg-[#FFD700] active:translate-x-0.5 active:translate-y-0.5"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={handleAdd}
              className="flex-1 h-14 px-6 bg-[#E52521] text-white border-4 border-[#1A1A2E] font-[family:var(--font-kanit)] font-black uppercase tracking-widest shadow-[6px_6px_0_0_#1A1A2E] hover:bg-[#009A4E] active:translate-x-1.5 active:translate-y-1.5 active:shadow-none flex items-center justify-center gap-2 transition-all"
            >
              <ShoppingCart className="w-5 h-5" />
              เพิ่มในตะกร้า
            </button>
          </div>

          {/* Trust badges — Mario item blocks */}
          <div className="grid grid-cols-3 gap-3">
            <div className="border-4 border-[#1A1A2E] bg-[#FFD700] p-3 text-center shadow-[3px_3px_0_0_#1A1A2E]">
              <Zap className="w-6 h-6 mx-auto mb-1 text-[#E52521]" />
              <p className="text-[10px] font-[family:var(--font-kanit)] font-black uppercase tracking-widest">
                ดาวน์โหลดทันที
              </p>
            </div>
            <div className="border-4 border-[#1A1A2E] bg-[#009A4E] text-white p-3 text-center shadow-[3px_3px_0_0_#1A1A2E]">
              <ShieldCheck className="w-6 h-6 mx-auto mb-1" />
              <p className="text-[10px] font-[family:var(--font-kanit)] font-black uppercase tracking-widest">
                4K ลิขสิทธิ์แท้
              </p>
            </div>
            <div className="border-4 border-[#1A1A2E] bg-[#E52521] text-white p-3 text-center shadow-[3px_3px_0_0_#1A1A2E]">
              <Crown className="w-6 h-6 mx-auto mb-1" />
              <p className="text-[10px] font-[family:var(--font-kanit)] font-black uppercase tracking-widest">
                คืนเงิน 7 วัน
              </p>
            </div>
          </div>

          {/* Stock */}
          {typeof product.stockLeft === 'number' && product.stockLeft > 0 && product.stockLeft < 20 && (
            <div className="border-4 border-[#1A1A2E] bg-[#FFD700] px-4 py-3 font-[family:var(--font-kanit)] font-black uppercase text-sm shadow-[3px_3px_0_0_#1A1A2E] flex items-center gap-2">
              <Coins className="w-5 h-5 text-[#E52521]" />
              เหลือเพียง {product.stockLeft} ชิ้น · รีบมูก่อนหมด!
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <section className="max-w-7xl mx-auto px-4 mt-8">
        <div className="bg-white border-4 border-[#1A1A2E] shadow-[6px_6px_0_0_#1A1A2E]">
          <div className="flex flex-wrap border-b-4 border-[#1A1A2E]">
            {(
              [
                { id: 'desc', label: 'รายละเอียด' },
                { id: 'specs', label: 'สเปก' },
                { id: 'reviews', label: 'รีวิว' },
                { id: 'shipping', label: 'การจัดส่ง' },
              ] as Array<{ id: TabId; label: string }>
            ).map((t) => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`flex-1 sm:flex-none px-5 py-3 font-[family:var(--font-kanit)] font-black uppercase text-xs sm:text-sm tracking-widest border-r-4 border-[#1A1A2E] last:border-r-0 ${
                    active
                      ? 'bg-[#E52521] text-white'
                      : 'bg-white hover:bg-[#FFD700]'
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
          <div className="p-5 sm:p-7">
            {tab === 'desc' && (
              <div className="text-sm sm:text-base whitespace-pre-line leading-relaxed">
                {product.description?.trim() ||
                  'วอลเปเปอร์มงคลสายมูคุณภาพสูง ออกแบบเพื่อหนุนดวงและเสริมโชค — เหมาะกับทุกราศี ดาวน์โหลดได้ทันทีหลังชำระเงิน รองรับทุกอุปกรณ์'}
              </div>
            )}
            {tab === 'specs' && (
              <ul className="space-y-2 text-sm">
                <SpecRow label="ความละเอียด" value="4K (3840 × 2160) + Full HD (1920 × 1080)" />
                <SpecRow label="ไฟล์ที่ได้" value="JPG + PNG + PDF (พิมพ์เป็นโปสเตอร์ได้)" />
                <SpecRow label="ขนาดไฟล์" value="ประมาณ 5-15 MB" />
                <SpecRow label="ลิขสิทธิ์" value="ใช้ส่วนตัว · ห้ามจำหน่ายต่อ" />
                <SpecRow label="รองรับ" value="iOS · Android · Windows · macOS" />
                {product.categoryName && (
                  <SpecRow label="หมวดมู" value={product.categoryName} />
                )}
              </ul>
            )}
            {tab === 'reviews' && (
              <div className="text-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-[#FFD700] text-[#FFD700]" />
                    ))}
                  </div>
                  <span className="font-[family:var(--font-kanit)] font-black uppercase tracking-widest text-xs">
                    ลูกค้ามูพอใจ
                  </span>
                </div>
                <div className="space-y-3">
                  <ReviewCard
                    name="คุณสมศรี"
                    text="ดาวน์โหลดง่าย ภาพคมชัด ใส่แล้วรู้สึกชีวิตปังขึ้นจริงๆ ⭐"
                  />
                  <ReviewCard
                    name="คุณจิรชัย"
                    text="ตั้งเป็นวอลล์มือถือแล้วยอดขายขึ้น 2 เท่า มูจริง"
                  />
                  <ReviewCard
                    name="คุณนภา"
                    text="ราคาเป็นมิตร คุณภาพไม่ใช่เล่นๆ จะมาซื้ออีกแน่นอน"
                  />
                </div>
              </div>
            )}
            {tab === 'shipping' && (
              <div className="text-sm leading-relaxed space-y-3">
                <p>
                  <strong>ดาวน์โหลดทันที</strong> — เมื่อชำระเงินเรียบร้อย คุณจะได้รับลิงก์ดาวน์โหลดในอีเมลภายใน 5 นาที ไม่ต้องรอจัดส่ง
                </p>
                <p>
                  <strong>เก็บไฟล์ได้ตลอดชีพ</strong> — ลิงก์ดาวน์โหลดใช้ได้ไม่จำกัดครั้งภายใน 30 วัน หลังจากนั้นไฟล์จะอยู่ในบัญชีผู้ใช้ของคุณ
                </p>
                <p>
                  <strong>ใช้กับอุปกรณ์ไหนก็ได้</strong> — ไฟล์รองรับ iOS / Android / Windows / macOS · ตั้งเป็นวอลล์เพเปอร์มือถือ คอมพิวเตอร์ หรือพิมพ์เป็นโปสเตอร์
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="bg-[#1A1A2E] border-y-4 border-[#1A1A2E] px-4 py-12 mt-12">
          <div className="max-w-7xl mx-auto">
            <h2 className="font-[family:var(--font-kanit)] text-3xl sm:text-4xl font-black uppercase tracking-tight text-white mb-2 flex items-center gap-3">
              <Sparkles className="w-7 h-7 text-[#FFD700]" />
              วอลล์ที่เกี่ยวข้อง
            </h2>
            <p className="text-white/70 font-bold text-sm uppercase tracking-widest mb-8">
              เก็บครบเลเวลอัพแบบจัดเต็ม
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {related.slice(0, 4).map((p) => (
                <Link
                  key={p.id}
                  href={`/stores/${store.slug}/products/${p.id}`}
                  className="bg-white border-4 border-[#1A1A2E] shadow-[5px_5px_0_0_#FFD700] hover:shadow-[7px_7px_0_0_#FFD700] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
                >
                  <div className="relative aspect-square border-b-4 border-[#1A1A2E] bg-[#E8E8F0] overflow-hidden">
                    {p.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.imageUrl}
                        alt={p.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#FFD700] via-[#E52521] to-[#009A4E]">
                        <Sparkles className="w-8 h-8 text-white drop-shadow-[2px_2px_0_#1A1A2E]" />
                      </div>
                    )}
                  </div>
                  <div className="p-3 space-y-1">
                    <h3 className="font-[family:var(--font-kanit)] font-black text-sm uppercase tracking-tight line-clamp-2 leading-tight">
                      {p.title}
                    </h3>
                    <p className="font-[family:var(--font-kanit)] font-black text-base text-[#E52521]">
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

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 border-b-2 border-[#E8E8F0] pb-2 last:border-b-0">
      <span className="font-[family:var(--font-kanit)] font-black uppercase tracking-widest text-xs text-[#4A4A6E] sm:w-40 shrink-0">
        {label}
      </span>
      <span className="font-bold">{value}</span>
    </li>
  );
}

function ReviewCard({ name, text }: { name: string; text: string }) {
  return (
    <div className="border-4 border-[#1A1A2E] bg-[#FFF8DC] p-3 shadow-[3px_3px_0_0_#1A1A2E]">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-7 h-7 bg-[#E52521] text-white border-2 border-[#1A1A2E] flex items-center justify-center font-[family:var(--font-kanit)] font-black text-xs">
          {name.slice(-1)}
        </div>
        <span className="font-[family:var(--font-kanit)] font-black uppercase tracking-widest text-xs">
          {name}
        </span>
        <div className="ml-auto flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="w-3 h-3 fill-[#FFD700] text-[#FFD700]" />
          ))}
        </div>
      </div>
      <p className="text-sm leading-relaxed">{text}</p>
    </div>
  );
}
