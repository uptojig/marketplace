'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Download,
  Plus,
  Minus,
  FileText,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Layers,
  Star,
  Briefcase,
  Award,
} from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';
import { RESUME_FORGE_TONES } from '../palette';

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
  { id: 'specs', label: 'รูปแบบไฟล์' },
  { id: 'license', label: 'ใบอนุญาต' },
  { id: 'reviews', label: 'รีวิว' },
];

const STATIC_REVIEWS = [
  { name: 'ณัฐ · Senior Engineer', stars: 5, body: 'ใช้สมัครงานที่บริษัทเทคฯ ใหญ่ ผ่าน ATS ทุกตัว สัมภาษณ์ผ่านได้ offer 2 จาก 3 ที่ คุ้มเกินราคา' },
  { name: 'พิม · Marketing Manager', stars: 5, body: 'เลย์เอาต์ดูเป็นมืออาชีพมาก แก้ใน Word ง่ายมาก ปรับสีตามแบรนด์ลูกค้าได้ทันที แนะนำสำหรับสาย marketing' },
  { name: 'เอก · Fresh Graduate', stars: 4, body: 'ราคาเข้าถึงได้สำหรับเด็กจบใหม่ มีเทมเพลตทั้ง entry level และ executive ขอเพิ่มแบบ creative bold-color ครับ' },
];

const ATS_SYSTEMS = [
  { name: 'Workday', pass: true },
  { name: 'Greenhouse', pass: true },
  { name: 'Lever', pass: true },
  { name: 'iCIMS', pass: true },
  { name: 'BambooHR', pass: true },
  { name: 'JobThai', pass: true },
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
    <div className="bg-[#F8FAFC] text-[#0F172A] font-[family:var(--font-prompt)] min-h-screen">
      {/* Breadcrumb */}
      <section className="bg-white border-b border-[#CBD5E1] px-4 py-3">
        <div className="max-w-7xl mx-auto text-xs font-semibold text-[#475569] flex items-center gap-2 overflow-x-auto rf-no-scrollbar">
          <Link href={`/stores/${store.slug}`} className="hover:text-[#1E3A8A] whitespace-nowrap">
            หน้าร้าน
          </Link>
          <span className="text-[#94A3B8]">›</span>
          <Link href={`/stores/${store.slug}/category`} className="hover:text-[#1E3A8A] whitespace-nowrap">
            คลังเทมเพลต
          </Link>
          {product.categoryName && (
            <>
              <span className="text-[#94A3B8]">›</span>
              <Link
                href={`/stores/${store.slug}/category?cat=${encodeURIComponent(product.categoryName)}`}
                className="hover:text-[#1E3A8A] whitespace-nowrap"
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
          <div className="relative aspect-[3/4] rounded-xl bg-white border border-[#CBD5E1] overflow-hidden shadow-[0_16px_40px_-16px_rgba(30,58,138,0.3)] group">
            {hasDiscount && (
              <div className="absolute top-4 left-4 z-10 inline-flex items-center gap-1.5 rounded-md bg-[#B45309] text-white px-3.5 py-1.5 text-xs font-bold tracking-[0.18em] uppercase shadow-md font-[family:var(--font-kanit)]">
                <Award className="w-3.5 h-3.5" />
                ลด {discountPct}%
              </div>
            )}
            <div className="absolute top-4 right-4 z-10 inline-flex items-center gap-1.5 rounded-md rf-ats-chip px-2.5 py-1 text-[10px] font-bold tracking-wider font-[family:var(--font-kanit)] shadow-sm">
              <CheckCircle2 className="w-3 h-3" />
              ATS PASS
            </div>
            {gallery[activeImage] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={gallery[activeImage]}
                alt={product.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
              />
            ) : (
              <PDPResumeMockup />
            )}
          </div>
          {gallery.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {gallery.slice(0, 5).map((src, idx) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setActiveImage(idx)}
                  className={`aspect-[3/4] rounded-md bg-[#F8FAFC] overflow-hidden border-2 transition-all ${
                    idx === activeImage
                      ? 'border-[#1E3A8A] rf-glow-primary'
                      : 'border-[#CBD5E1] hover:border-[#1E3A8A]'
                  }`}
                  aria-label={`รูปที่ ${idx + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info column */}
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-md bg-[#DBEAFE] text-[#1E40AF] px-3 py-1 text-[11px] font-bold tracking-[0.18em] uppercase font-[family:var(--font-kanit)]">
              <Briefcase className="w-3 h-3" />
              {product.categoryName ?? 'เทมเพลตเรซูเม่'} · #{product.id.slice(-6)}
            </div>
            <h1 className="font-[family:var(--font-kanit)] text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
              {product.title}
            </h1>
            <span className="rf-rule" aria-hidden />
            <div className="flex items-center gap-2 pt-1">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-[#B45309] text-[#B45309]" />
                ))}
              </div>
              <span className="text-xs font-semibold text-[#475569]">4.9 · {STATIC_REVIEWS.length} รีวิว</span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 py-4 border-y border-[#E2E8F0]">
            <span className="font-[family:var(--font-kanit)] font-bold text-4xl rf-gradient-text">
              {formatTHB(effectivePrice)}
            </span>
            {hasDiscount && (
              <span className="text-base font-semibold text-[#94A3B8] line-through">
                {formatTHB(product.originalPriceTHB!)}
              </span>
            )}
          </div>

          {/* Variants */}
          {product.variants.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-[family:var(--font-kanit)] font-bold text-xs tracking-[0.2em] uppercase text-[#475569]">
                ตัวเลือกเทมเพลต
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v, idx) => {
                  const active = selectedVariant === v.id;
                  const label = v.colorLabel || v.sizeLabel || v.materialLabel ||
                    Object.values(v.attributes).join(' · ') || 'ตัวเลือก';
                  const tone = RESUME_FORGE_TONES[idx % RESUME_FORGE_TONES.length];
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariant(v.id)}
                      className={`px-4 h-10 rounded-md font-[family:var(--font-kanit)] font-semibold text-sm transition-all border ${
                        active
                          ? 'text-white shadow-md'
                          : 'bg-white text-[#0F172A] hover:bg-[#F8FAFC]'
                      }`}
                      style={
                        active
                          ? { backgroundColor: tone.fg, borderColor: tone.fg }
                          : { borderColor: '#CBD5E1' }
                      }
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
            <div className="flex items-center rounded-md border border-[#CBD5E1] bg-white shrink-0">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="ลดจำนวน"
                className="w-11 h-12 rounded-l-md flex items-center justify-center text-[#0F172A] hover:bg-[#E2E8F0] active:scale-90 transition-all"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center font-[family:var(--font-kanit)] font-bold text-lg">
                {qty}
              </span>
              <button
                type="button"
                onClick={() => setQty((q) => q + 1)}
                aria-label="เพิ่มจำนวน"
                className="w-11 h-12 rounded-r-md flex items-center justify-center text-[#0F172A] hover:bg-[#E2E8F0] active:scale-90 transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={handleAdd}
              className="flex-1 h-12 rounded-md bg-[#1E3A8A] text-white font-[family:var(--font-kanit)] font-semibold text-base rf-glow-primary hover:bg-[#1E40AF] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              ซื้อเลย · ดาวน์โหลดทันที
            </button>
          </div>

          {/* Trust strip */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { Icon: Download, label: 'ดาวน์โหลด', sub: 'ทันทีหลังจ่าย', bg: '#DBEAFE', fg: '#1E40AF' },
              { Icon: Layers, label: 'แก้ไขทันที', sub: 'Word / Pages / Docs', bg: '#FEF3C7', fg: '#B45309' },
              { Icon: ShieldCheck, label: 'License', sub: 'สมัครได้ไม่จำกัด', bg: '#DCFCE7', fg: '#15803D' },
            ].map((t, i) => (
              <div
                key={i}
                className="rounded-md p-3 text-center border"
                style={{ backgroundColor: t.bg, borderColor: t.fg + '33' }}
              >
                <t.Icon className="w-5 h-5 mx-auto mb-1.5" style={{ color: t.fg }} />
                <p className="font-[family:var(--font-kanit)] font-bold text-xs" style={{ color: t.fg }}>
                  {t.label}
                </p>
                <p className="text-[10px] text-[#475569] font-semibold">{t.sub}</p>
              </div>
            ))}
          </div>

          {/* ATS pass strip */}
          <div className="rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] p-4">
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#475569] mb-2 font-[family:var(--font-kanit)]">
              ผ่านการทดสอบกับระบบ ATS
            </p>
            <div className="flex flex-wrap gap-2">
              {ATS_SYSTEMS.map((s) => (
                <span
                  key={s.name}
                  className="inline-flex items-center gap-1 rf-ats-chip rounded-md px-2.5 py-1 text-[11px] font-semibold font-[family:var(--font-kanit)]"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  {s.name}
                </span>
              ))}
            </div>
          </div>

          {/* Stock indicator */}
          {typeof product.stockLeft === 'number' && product.stockLeft > 0 && product.stockLeft < 20 && (
            <div className="rounded-md bg-[#FEF3C7] border border-[#FDE68A] px-4 py-3 inline-flex items-center gap-2 font-[family:var(--font-kanit)] font-bold text-sm text-[#B45309]">
              <Zap className="w-4 h-4 fill-[#FBBF24]" />
              เหลือเพียง {product.stockLeft} ใบอนุญาต
            </div>
          )}

          {/* Tabs */}
          <div className="rounded-xl bg-white border border-[#CBD5E1] overflow-hidden">
            <div className="flex overflow-x-auto rf-no-scrollbar border-b border-[#E2E8F0] bg-[#F8FAFC]">
              {TABS.map((t) => {
                const active = tab === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTab(t.id)}
                    className={`flex-1 min-w-fit px-5 py-3 text-sm font-[family:var(--font-kanit)] font-bold border-b-2 transition-colors ${
                      active
                        ? 'border-[#1E3A8A] text-[#1E3A8A] bg-white'
                        : 'border-transparent text-[#475569] hover:text-[#0F172A]'
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
                    <p className="text-[#475569]">
                      เทมเพลตเรซูเม่ระดับมืออาชีพ ออกแบบตามมาตรฐาน ATS อ่านได้ครบทุกระบบ — มีไฟล์ .docx, .pdf, Google Docs และ Pages พร้อมคู่มือเขียนแต่ละหัวข้อ (Summary, Experience, Skills, Education) เหมาะสมัครงานทั้งในประเทศและต่างประเทศ
                    </p>
                  )}
                </div>
              )}
              {tab === 'specs' && (
                <ul className="space-y-2">
                  <SpecRow label="รูปแบบไฟล์" value=".docx · .pdf · Google Docs · Pages" />
                  <SpecRow label="ขนาดกระดาษ" value="A4 · US Letter" />
                  <SpecRow label="ฟอนต์" value="Embedded · Google Fonts ฟรี" />
                  <SpecRow label="ภาษา" value="ไทย · อังกฤษ (สลับใน 1 คลิก)" />
                  <SpecRow label="คู่มือเขียน" value="PDF · ฉบับไทย" />
                  <SpecRow label="ขนาดไฟล์รวม" value="< 5 MB" />
                </ul>
              )}
              {tab === 'license' && (
                <div className="space-y-3">
                  <p>
                    <strong className="text-[#1E3A8A]">ใช้งานส่วนตัว:</strong> สมัครงานในนามผู้ซื้อ ใช้ได้ไม่จำกัดจำนวนตำแหน่ง ตลอดอายุการใช้งานบัญชี
                  </p>
                  <p>
                    <strong className="text-[#B45309]">ไม่อนุญาต:</strong> ขายต่อในรูปแบบเทมเพลต หรือนำไปอ้างเป็นผลงานต้นฉบับ
                  </p>
                  <p className="text-[#475569]">
                    หากต้องการใบอนุญาตเชิงพาณิชย์ (สำหรับ HR consultant หรือ career coach) ติดต่อทีมงาน
                  </p>
                </div>
              )}
              {tab === 'reviews' && (
                <ul className="space-y-4">
                  {STATIC_REVIEWS.map((r, i) => (
                    <li key={i} className="rounded-md bg-[#F8FAFC] border border-[#E2E8F0] p-4">
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <span className="font-[family:var(--font-kanit)] font-bold text-sm">{r.name}</span>
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <Star
                              key={idx}
                              className={`w-3.5 h-3.5 ${idx < r.stars ? 'fill-[#B45309] text-[#B45309]' : 'text-[#CBD5E1]'}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-[#334155] leading-relaxed">{r.body}</p>
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
        <section className="relative bg-white border-y border-[#CBD5E1] px-4 sm:px-6 lg:px-8 py-14 mt-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between gap-3 mb-8">
              <div>
                <h2 className="font-[family:var(--font-kanit)] text-2xl sm:text-3xl font-bold tracking-tight inline-flex items-center gap-2">
                  <FileText className="w-6 h-6 text-[#1E3A8A]" />
                  เทมเพลตที่เกี่ยวข้อง
                </h2>
                <span className="rf-rule mt-3 block" aria-hidden />
              </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {related.slice(0, 4).map((p, idx) => {
                const tone = RESUME_FORGE_TONES[idx % RESUME_FORGE_TONES.length];
                return (
                  <Link
                    key={p.id}
                    href={`/stores/${store.slug}/products/${p.id}`}
                    className="group rf-card rounded-xl overflow-hidden flex flex-col"
                  >
                    <div className="relative aspect-[3/4] bg-[#F8FAFC] overflow-hidden border-b border-[#E2E8F0]">
                      {p.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.imageUrl}
                          alt={p.title}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <RelatedMockup tone={tone} />
                      )}
                    </div>
                    <div className="p-3 space-y-1 bg-white">
                      <h3 className="font-[family:var(--font-kanit)] font-bold text-sm line-clamp-2">
                        {p.title}
                      </h3>
                      <p className="font-[family:var(--font-kanit)] font-bold text-base text-[#1E3A8A]">
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
    <li className="flex items-baseline justify-between gap-3 border-b border-[#E2E8F0] pb-2 last:border-b-0 last:pb-0">
      <span className="font-bold text-[#475569] text-xs tracking-[0.18em] uppercase font-[family:var(--font-kanit)]">
        {label}
      </span>
      <span className="font-semibold text-[#0F172A] text-sm text-right">{value}</span>
    </li>
  );
}

function PDPResumeMockup() {
  return (
    <div className="absolute inset-0 p-8 sm:p-12 flex flex-col gap-4 bg-white">
      <div className="flex items-end justify-between border-b-2 border-[#1E3A8A] pb-4">
        <div>
          <div className="h-4 w-40 rounded mb-2 bg-[#0F172A]" />
          <div className="h-2.5 w-28 rounded bg-[#B45309]" />
        </div>
        <div className="w-16 h-16 rounded-md bg-gradient-to-br from-[#1E3A8A] to-[#172554] flex items-center justify-center">
          <FileText className="w-7 h-7 text-[#FBBF24]" />
        </div>
      </div>
      <div className="flex gap-2">
        <div className="h-1.5 w-20 rounded bg-[#CBD5E1]" />
        <div className="h-1.5 w-14 rounded bg-[#CBD5E1]" />
        <div className="h-1.5 w-16 rounded bg-[#CBD5E1]" />
      </div>
      <div className="mt-3 space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-sm bg-[#1E3A8A]" />
          <div className="h-2.5 w-32 rounded bg-[#1E3A8A]" />
        </div>
        <div className="h-1.5 w-full rounded bg-[#E2E8F0]" />
        <div className="h-1.5 w-11/12 rounded bg-[#E2E8F0]" />
        <div className="h-1.5 w-10/12 rounded bg-[#E2E8F0]" />
      </div>
      <div className="mt-3 space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-sm bg-[#1E3A8A]" />
          <div className="h-2.5 w-36 rounded bg-[#1E3A8A]" />
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between items-baseline">
            <div className="h-2 w-32 rounded bg-[#0F172A]" />
            <div className="h-2 w-16 rounded bg-[#94A3B8]" />
          </div>
          <div className="h-1.5 w-40 rounded bg-[#B45309]" />
          <div className="h-1 w-full rounded bg-[#E2E8F0]" />
          <div className="h-1 w-11/12 rounded bg-[#E2E8F0]" />
          <div className="h-1 w-10/12 rounded bg-[#E2E8F0]" />
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between items-baseline">
            <div className="h-2 w-36 rounded bg-[#0F172A]" />
            <div className="h-2 w-16 rounded bg-[#94A3B8]" />
          </div>
          <div className="h-1.5 w-40 rounded bg-[#B45309]" />
          <div className="h-1 w-full rounded bg-[#E2E8F0]" />
          <div className="h-1 w-11/12 rounded bg-[#E2E8F0]" />
        </div>
      </div>
      <div className="mt-3 space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-sm bg-[#1E3A8A]" />
          <div className="h-2.5 w-28 rounded bg-[#1E3A8A]" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-4 w-12 rounded bg-[#DBEAFE] border border-[#BFDBFE]" />
          ))}
        </div>
      </div>
    </div>
  );
}

function RelatedMockup({ tone }: { tone: { bg: string; fg: string; border: string } }) {
  return (
    <div className="absolute inset-0 p-3 flex flex-col gap-1.5">
      <div className="flex items-end justify-between border-b border-[#E2E8F0] pb-1.5">
        <div className="h-2 w-20 rounded" style={{ backgroundColor: tone.fg }} />
        <div
          className="w-5 h-5 rounded-sm flex items-center justify-center"
          style={{ backgroundColor: tone.bg, color: tone.fg, border: `1px solid ${tone.border}` }}
        >
          <FileText className="w-2.5 h-2.5" />
        </div>
      </div>
      <div className="space-y-1">
        <div className="h-1.5 w-12 rounded" style={{ backgroundColor: tone.fg }} />
        <div className="h-1 w-full rounded bg-[#E2E8F0]" />
        <div className="h-1 w-10/12 rounded bg-[#E2E8F0]" />
      </div>
      <div className="space-y-1">
        <div className="h-1.5 w-14 rounded" style={{ backgroundColor: tone.fg }} />
        <div className="h-1 w-full rounded bg-[#E2E8F0]" />
        <div className="h-1 w-11/12 rounded bg-[#E2E8F0]" />
        <div className="h-1 w-9/12 rounded bg-[#E2E8F0]" />
      </div>
    </div>
  );
}
