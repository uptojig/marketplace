'use client';

/**
 * EduClassroom — bespoke Product Detail page.
 *
 * Adapts the layout vocabulary of two shadcn-studio blocks into the
 * classroom-themed PDP:
 *   - `product-overview-06` — header rating + gallery on the left,
 *     license-plan picker on the right (radio group).
 *   - `product-reviews-04` — bottom rating histogram + individual
 *     review cards with like/dislike counts.
 *
 * The original blocks are not imported; their copy and layout are
 * rebuilt by hand here so the visual language matches the rest of the
 * EduClassroom chrome (cream notebook page, classroom-blue accents,
 * chalk-amber stamps, Kanit headings, Prompt body).
 *
 * Wired to the marketplace zustand cart directly — no shared
 * pdp-adapter helper sits between this component and the page
 * dispatcher.
 */

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  BookOpen,
  Download,
  Star,
  CheckCircle2,
  Sparkles,
  ShoppingCart,
  Zap,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
  Presentation,
  FileText,
  ClipboardList,
  GraduationCap,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { useCartConfirmation } from '@/lib/store/cartConfirm';
import { formatTHB } from '@/lib/utils';
import type { ProductDetailProps } from '@/lib/templates/types';

import {
  EDU_PRIMARY,
  EDU_PRIMARY_DEEP,
  EDU_ACCENT,
  EDU_ACCENT_DEEP,
  EDU_SAVINGS,
  EDU_BG,
  EDU_BG_SOFT,
  EDU_BORDER,
  EDU_BORDER_SOFT,
  EDU_INK,
  EDU_INK_MUTED,
} from '../palette';

const FONT_HEADING = 'font-[family:var(--font-kanit)]';
const FONT_BODY = 'font-[family:var(--font-prompt)]';

interface LicensePlan {
  id: string;
  title: string;
  context: string;
  priceMultiplier: number;
}

function subjectIcon(label: string | null | undefined): LucideIcon {
  if (!label) return BookOpen;
  const k = label.toLowerCase();
  if (k.includes('ใบงาน') || k.includes('แบบฝึก')) return FileText;
  if (k.includes('สไลด์') || k.includes('การสอน')) return Presentation;
  if (k.includes('ข้อสอบ') || k.includes('แบบทดสอบ')) return ClipboardList;
  if (k.includes('เกม') || k.includes('กิจกรรม')) return Sparkles;
  return BookOpen;
}

// Mock review distribution — same shape as `product-reviews-04` so the
// histogram looks credible even before review data is wired. Real
// reviews will replace this once the marketplace review module is live.
const REVIEW_DISTRIBUTION = [
  { stars: 5, count: 184 },
  { stars: 4, count: 42 },
  { stars: 3, count: 11 },
  { stars: 2, count: 4 },
  { stars: 1, count: 2 },
];

const SAMPLE_REVIEWS = [
  {
    id: 1,
    name: 'ครูสุดารัตน์',
    role: 'ครูภาษาไทย ป.4',
    verified: true,
    rating: 5,
    date: '2 สัปดาห์ที่แล้ว',
    body: 'ใช้สอนจริงในห้องเรียน เด็กๆ เข้าใจง่ายมากค่ะ ออกแบบสไลด์สวย ใส่ภาพประกอบที่เด็กชอบ',
    liked: 24,
    unliked: 1,
  },
  {
    id: 2,
    name: 'ครูประยุทธ์',
    role: 'ครูคณิตศาสตร์ ม.2',
    verified: true,
    rating: 5,
    date: '1 เดือนที่แล้ว',
    body: 'ดาวน์โหลดได้ทันที ไฟล์เปิดด้วย Google Slides ได้เลย แก้ไขชื่อโรงเรียนของตัวเองได้ง่ายมากครับ',
    liked: 18,
    unliked: 0,
  },
  {
    id: 3,
    name: 'ครูพิมพ์ใจ',
    role: 'ครูวิทยาศาสตร์ ป.6',
    verified: false,
    rating: 4,
    date: '3 สัปดาห์ที่แล้ว',
    body: 'เนื้อหาสอดคล้องกับหลักสูตรแกนกลางดีค่ะ อยากให้เพิ่มแบบทดสอบท้ายบทมากกว่านี้',
    liked: 9,
    unliked: 1,
  },
];

export default function EduClassroomProductDetail({
  store,
  product,
  related,
}: ProductDetailProps) {
  const add = useCart((s) => s.add);
  const showConfirm = useCartConfirmation((s) => s.show);

  // Gallery: dedupe imageUrl into images array
  const gallery = useMemo(() => {
    const all = [product.imageUrl, ...(product.images ?? [])].filter(
      (s): s is string => typeof s === 'string' && s.length > 0,
    );
    return Array.from(new Set(all));
  }, [product.imageUrl, product.images]);

  const [activeImage, setActiveImage] = useState<string | null>(gallery[0] ?? null);

  // License-plan picker — adapted from `product-overview-06.paymentOption`
  // radio group. Single-room license is the base price; school-wide and
  // district licenses scale.
  const plans: LicensePlan[] = [
    {
      id: 'classroom',
      title: 'ใช้สอนห้องเดียว',
      context: 'สำหรับห้องเรียนของครูที่ซื้อ · ดาวน์โหลดได้ทันที',
      priceMultiplier: 1,
    },
    {
      id: 'school',
      title: 'ใช้ทั้งโรงเรียน',
      context: 'ครูทุกคนในโรงเรียนเดียวกันใช้ได้ · ลิขสิทธิ์ 1 ปี',
      priceMultiplier: 2.5,
    },
    {
      id: 'district',
      title: 'ใช้ทั้งสำนักงานเขต',
      context: 'ครูทุกคนในเขตเดียวกัน · เหมาะกับศูนย์การเรียนรู้',
      priceMultiplier: 6,
    },
  ];
  const [planId, setPlanId] = useState<string>('classroom');
  const selectedPlan = plans.find((p) => p.id === planId) ?? plans[0];

  const basePrice = product.priceTHB;
  const effectivePrice = Math.round(basePrice * selectedPlan.priceMultiplier);
  const originalPrice = product.originalPriceTHB ?? null;
  const hasDiscount = planId === 'classroom' && originalPrice !== null && originalPrice > effectivePrice;
  const discountPct = hasDiscount && originalPrice
    ? Math.round(((originalPrice - effectivePrice) / originalPrice) * 100)
    : 0;

  const totalReviews = REVIEW_DISTRIBUTION.reduce((s, r) => s + r.count, 0);
  const avgRating =
    REVIEW_DISTRIBUTION.reduce((s, r) => s + r.stars * r.count, 0) / Math.max(1, totalReviews);

  const addToCart = () => {
    add({
      productId: product.id,
      title: product.title,
      priceTHB: effectivePrice,
      imageUrl: gallery[0] ?? undefined,
      storeSlug: store.slug,
      storeName: store.name,
    });
    showConfirm(product.title, store.slug);
  };

  const SubjectIcon = subjectIcon(product.categoryName);

  return (
    <main className={`${FONT_BODY} min-h-screen`} style={{ background: EDU_BG, color: EDU_INK }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Breadcrumb */}
        <nav className={`flex items-center gap-2 text-xs ${FONT_HEADING} font-bold`}>
          <Link
            href={`/stores/${store.slug}`}
            className="hover:text-[#2563EB] transition-colors"
            style={{ color: EDU_INK_MUTED }}
          >
            <ArrowLeft size={12} className="inline mr-1 -mt-0.5" />
            หน้าร้าน
          </Link>
          {product.categoryName && (
            <>
              <ChevronRight size={12} style={{ color: EDU_BORDER }} />
              <Link
                href={`/stores/${store.slug}/category?cat=${encodeURIComponent(product.categoryName)}`}
                className="hover:text-[#2563EB] transition-colors"
                style={{ color: EDU_INK_MUTED }}
              >
                {product.categoryName}
              </Link>
            </>
          )}
          <ChevronRight size={12} style={{ color: EDU_BORDER }} />
          <span className="line-clamp-1" style={{ color: EDU_INK }}>
            {product.title}
          </span>
        </nav>

        {/* Main grid — gallery + plan picker */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ── Gallery ─────────────────────────────────────────────────── */}
          <div className="lg:col-span-7 space-y-3">
            <div
              className="relative bg-white border rounded-2xl overflow-hidden aspect-square"
              style={{ borderColor: EDU_BORDER }}
            >
              {activeImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={activeImage}
                  alt={product.title}
                  className="h-full w-full object-contain"
                />
              ) : (
                <ChalkboardPlaceholder />
              )}
              <span
                className={`absolute top-3 left-3 inline-flex items-center gap-1 text-[11px] ${FONT_HEADING} font-bold uppercase tracking-wider px-2.5 py-1 rounded-full text-white shadow-md`}
                style={{ background: EDU_PRIMARY }}
              >
                <SubjectIcon size={11} />
                {product.categoryName ?? 'สื่อการสอน'}
              </span>
            </div>
            {gallery.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {gallery.slice(0, 5).map((src) => {
                  const isActive = src === activeImage;
                  return (
                    <button
                      key={src}
                      type="button"
                      onClick={() => setActiveImage(src)}
                      className="aspect-square overflow-hidden border-2 rounded-xl transition-colors"
                      style={{
                        borderColor: isActive ? EDU_PRIMARY : EDU_BORDER,
                        background: '#EFF6FF',
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" className="h-full w-full object-cover" />
                    </button>
                  );
                })}
              </div>
            )}

            {/* Description card */}
            {product.description && (
              <section
                className="bg-white border rounded-2xl p-5 sm:p-6 space-y-3 mt-2"
                style={{ borderColor: EDU_BORDER }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg"
                    style={{ background: `${EDU_PRIMARY}14`, color: EDU_PRIMARY }}
                  >
                    <BookOpen size={16} />
                  </span>
                  <h2 className={`${FONT_HEADING} font-bold text-lg`} style={{ color: EDU_INK }}>
                    เกี่ยวกับสื่อชิ้นนี้
                  </h2>
                </div>
                <p
                  className="text-sm leading-relaxed whitespace-pre-line"
                  style={{ color: EDU_INK_MUTED }}
                >
                  {product.description}
                </p>
              </section>
            )}
          </div>

          {/* ── Buy panel ───────────────────────────────────────────────── */}
          <div className="lg:col-span-5 space-y-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 text-[10px] ${FONT_HEADING} font-bold uppercase tracking-wider px-2.5 py-1 rounded-full`}
                  style={{ background: EDU_BG_SOFT, color: EDU_ACCENT_DEEP }}
                >
                  <GraduationCap size={11} />
                  ครูแชร์ครู
                </span>
                {discountPct > 0 && (
                  <span
                    className={`inline-flex items-center text-[10px] ${FONT_HEADING} font-bold uppercase tracking-wider px-2.5 py-1 rounded-full text-white`}
                    style={{ background: EDU_SAVINGS }}
                  >
                    ลดทันที {discountPct}%
                  </span>
                )}
              </div>

              <h1
                className={`${FONT_HEADING} font-black text-2xl sm:text-3xl leading-snug`}
                style={{ color: EDU_INK }}
              >
                {product.title}
              </h1>

              {/* Rating row — adapted from product-overview-06 */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <span
                  className={`inline-flex items-center gap-1 text-xs ${FONT_HEADING} font-bold px-2 py-0.5 rounded-md`}
                  style={{ background: EDU_BG_SOFT, color: EDU_ACCENT_DEEP }}
                >
                  <Star size={11} fill={EDU_ACCENT} stroke="none" />
                  {avgRating.toFixed(1)}
                </span>
                <a
                  href="#reviews"
                  className="text-xs underline"
                  style={{ color: EDU_INK_MUTED }}
                >
                  รีวิว {totalReviews.toLocaleString()} ครู
                </a>
                <span className={`text-xs ${FONT_HEADING} font-bold inline-flex items-center gap-1`} style={{ color: EDU_SAVINGS }}>
                  <CheckCircle2 size={12} />
                  ดาวน์โหลดทันที
                </span>
              </div>
            </div>

            {/* Price block */}
            <div
              className="bg-white border rounded-2xl p-4 space-y-1"
              style={{ borderColor: EDU_BORDER }}
            >
              <div className="flex items-baseline gap-3 flex-wrap">
                <span
                  className={`${FONT_HEADING} font-black text-3xl`}
                  style={{ color: EDU_PRIMARY }}
                >
                  {formatTHB(effectivePrice)}
                </span>
                {hasDiscount && originalPrice !== null && (
                  <span className="text-sm line-through" style={{ color: EDU_INK_MUTED }}>
                    {formatTHB(originalPrice)}
                  </span>
                )}
              </div>
              <p className="text-xs" style={{ color: EDU_INK_MUTED }}>
                ราคารวมภาษีแล้ว · ดาวน์โหลดได้ทันทีหลังชำระเงิน
              </p>
            </div>

            {/* License-plan picker — adapted from product-overview-06 radio */}
            <fieldset className="space-y-2">
              <legend className={`${FONT_HEADING} font-bold text-sm uppercase tracking-wider`} style={{ color: EDU_INK }}>
                เลือกประเภทลิขสิทธิ์
              </legend>
              <div className="space-y-2">
                {plans.map((plan) => {
                  const active = plan.id === planId;
                  return (
                    <label
                      key={plan.id}
                      htmlFor={plan.id}
                      className="relative flex w-full cursor-pointer gap-3 rounded-2xl border-2 p-3 transition-all"
                      style={{
                        background: active ? EDU_BG_SOFT : '#FFFFFF',
                        borderColor: active ? EDU_PRIMARY : EDU_BORDER,
                      }}
                    >
                      <input
                        type="radio"
                        name="license-plan"
                        id={plan.id}
                        value={plan.id}
                        checked={active}
                        onChange={() => setPlanId(plan.id)}
                        className="sr-only"
                      />
                      <span
                        className="mt-0.5 inline-flex items-center justify-center w-4 h-4 rounded-full border-2 shrink-0"
                        style={{
                          borderColor: active ? EDU_PRIMARY : EDU_BORDER,
                          background: active ? EDU_PRIMARY : '#FFFFFF',
                        }}
                      >
                        {active && (
                          <span className="block w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`${FONT_HEADING} font-bold text-sm`} style={{ color: EDU_INK }}>
                            {plan.title}
                          </p>
                          <p className={`${FONT_HEADING} font-bold text-sm`} style={{ color: EDU_PRIMARY }}>
                            {formatTHB(Math.round(basePrice * plan.priceMultiplier))}
                          </p>
                        </div>
                        <p className="text-xs mt-0.5" style={{ color: EDU_INK_MUTED }}>
                          {plan.context}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            {/* CTA */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={addToCart}
                className={`inline-flex items-center justify-center gap-2 ${FONT_HEADING} font-bold py-3 rounded-full border-2 transition-all hover:shadow-md`}
                style={{ background: '#FFFFFF', color: EDU_PRIMARY, borderColor: EDU_PRIMARY }}
              >
                <ShoppingCart size={16} />
                ใส่ตะกร้า
              </button>
              <Link
                href={`/stores/${store.slug}/cart`}
                onClick={addToCart}
                className={`inline-flex items-center justify-center gap-2 text-white ${FONT_HEADING} font-bold py-3 rounded-full transition-all hover:shadow-md`}
                style={{ background: EDU_PRIMARY }}
              >
                <Zap size={16} />
                ซื้อเลย
              </Link>
            </div>

            {/* Trust badges */}
            <div
              className="bg-white border rounded-2xl p-4 grid grid-cols-2 gap-3"
              style={{ borderColor: EDU_BORDER }}
            >
              <Badge icon={<Download size={14} />} title="ดาวน์โหลดทันที" body="ภายใน 5 วินาทีหลังชำระเงิน" />
              <Badge icon={<BookOpen size={14} />} title="แก้ไขใน Slides" body="PPTX · DOCX · PDF" />
              <Badge icon={<ShieldCheck size={14} />} title="รับประกันคุณภาพ" body="คืนเงิน 100% ถ้าไฟล์มีปัญหา" />
              <Badge icon={<Sparkles size={14} />} title="อัปเดตฟรี" body="ตามหลักสูตรปัจจุบันตลอด" />
            </div>
          </div>
        </div>

        {/* ── Reviews — adapted from product-reviews-04 ───────────────────────── */}
        <section
          id="reviews"
          className="bg-white border rounded-2xl p-6 space-y-6"
          style={{ borderColor: EDU_BORDER }}
        >
          <div className="flex items-end justify-between border-b pb-4" style={{ borderColor: EDU_BORDER_SOFT }}>
            <div>
              <p
                className={`text-[11px] ${FONT_HEADING} font-bold uppercase tracking-wider`}
                style={{ color: EDU_ACCENT_DEEP }}
              >
                เสียงจากคุณครู
              </p>
              <h2 className={`${FONT_HEADING} font-bold text-2xl`} style={{ color: EDU_INK }}>
                รีวิวจากครูที่เคยใช้
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Rating histogram */}
            <aside className="lg:col-span-4 space-y-3">
              <div className="text-center space-y-1">
                <p
                  className={`${FONT_HEADING} font-black text-5xl`}
                  style={{ color: EDU_PRIMARY }}
                >
                  {avgRating.toFixed(1)}
                </p>
                <div className="flex items-center justify-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      size={16}
                      fill={n <= Math.round(avgRating) ? EDU_ACCENT : 'transparent'}
                      stroke={EDU_ACCENT}
                      strokeWidth={2}
                    />
                  ))}
                </div>
                <p className="text-xs" style={{ color: EDU_INK_MUTED }}>
                  จาก {totalReviews.toLocaleString()} รีวิว
                </p>
              </div>

              <div className="space-y-1.5">
                {REVIEW_DISTRIBUTION.map((row) => {
                  const pct = (row.count / Math.max(1, totalReviews)) * 100;
                  return (
                    <div key={row.stars} className="flex items-center gap-2 text-xs">
                      <span
                        className={`${FONT_HEADING} font-bold w-3 text-right`}
                        style={{ color: EDU_INK }}
                      >
                        {row.stars}
                      </span>
                      <Star size={11} fill={EDU_ACCENT} stroke="none" />
                      <div
                        className="flex-1 h-1.5 rounded-full overflow-hidden"
                        style={{ background: EDU_BORDER_SOFT }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${pct}%`, background: EDU_ACCENT }}
                        />
                      </div>
                      <span className="w-8 text-right tabular-nums" style={{ color: EDU_INK_MUTED }}>
                        {row.count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </aside>

            {/* Review cards */}
            <div className="lg:col-span-8 space-y-3">
              {SAMPLE_REVIEWS.map((r) => (
                <article
                  key={r.id}
                  className="border rounded-2xl p-4 space-y-3"
                  style={{ borderColor: EDU_BORDER, background: '#FFFFFF' }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex items-center justify-center w-9 h-9 rounded-full ${FONT_HEADING} font-bold text-sm`}
                        style={{ background: `${EDU_PRIMARY}14`, color: EDU_PRIMARY }}
                      >
                        {r.name.charAt(0)}
                      </span>
                      <div>
                        <p className={`${FONT_HEADING} font-bold text-sm`} style={{ color: EDU_INK }}>
                          {r.name}
                          {r.verified && (
                            <span
                              className="inline-flex items-center gap-1 text-[10px] ml-1.5 align-middle"
                              style={{ color: EDU_SAVINGS }}
                            >
                              <CheckCircle2 size={10} />
                              ยืนยันครู
                            </span>
                          )}
                        </p>
                        <p className="text-xs" style={{ color: EDU_INK_MUTED }}>
                          {r.role} · {r.date}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          size={13}
                          fill={n <= r.rating ? EDU_ACCENT : 'transparent'}
                          stroke={EDU_ACCENT}
                          strokeWidth={2}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: EDU_INK_MUTED }}>
                    {r.body}
                  </p>
                  <div className="flex items-center gap-3 text-xs pt-1 border-t" style={{ borderColor: EDU_BORDER_SOFT }}>
                    <span className="flex items-center gap-1 pt-2" style={{ color: EDU_INK_MUTED }}>
                      เป็นประโยชน์ไหม?
                    </span>
                    <span
                      className="inline-flex items-center gap-1 pt-2"
                      style={{ color: EDU_SAVINGS }}
                    >
                      <ThumbsUp size={11} /> {r.liked}
                    </span>
                    <span
                      className="inline-flex items-center gap-1 pt-2"
                      style={{ color: EDU_INK_MUTED }}
                    >
                      <ThumbsDown size={11} /> {r.unliked}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Related rail */}
        {related.length > 0 && (
          <section
            className="bg-white border rounded-2xl p-6 space-y-4"
            style={{ borderColor: EDU_BORDER }}
          >
            <div className="flex items-end justify-between border-b pb-3" style={{ borderColor: EDU_BORDER_SOFT }}>
              <div>
                <p
                  className={`text-[11px] ${FONT_HEADING} font-bold uppercase tracking-wider`}
                  style={{ color: EDU_ACCENT_DEEP }}
                >
                  สื่ออื่นที่ครูชอบ
                </p>
                <h2 className={`${FONT_HEADING} font-bold text-xl`} style={{ color: EDU_INK }}>
                  จากร้านเดียวกัน
                </h2>
              </div>
              <Link
                href={`/stores/${store.slug}`}
                className={`text-xs ${FONT_HEADING} font-bold transition-colors`}
                style={{ color: EDU_PRIMARY }}
              >
                ดูทั้งหมด →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {related.slice(0, 5).map((r) => {
                const compare = r.compareAtPriceTHB ?? null;
                const onSale = compare !== null && compare > r.priceTHB;
                return (
                  <Link
                    key={r.id}
                    href={`/stores/${store.slug}/products/${r.id}`}
                    className="group block border rounded-2xl overflow-hidden hover:shadow-md transition-all"
                    style={{ borderColor: EDU_BORDER, background: '#FFFFFF' }}
                  >
                    <div className="aspect-square overflow-hidden" style={{ background: '#EFF6FF' }}>
                      {r.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={r.imageUrl}
                          alt={r.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <ChalkboardPlaceholder small />
                      )}
                    </div>
                    <div className="p-2 space-y-1">
                      <p
                        className={`text-xs leading-tight line-clamp-2 ${FONT_HEADING} font-bold`}
                        style={{ color: EDU_INK }}
                      >
                        {r.title}
                      </p>
                      <div className="flex items-baseline gap-1">
                        <span
                          className={`${FONT_HEADING} font-bold text-sm`}
                          style={{ color: EDU_PRIMARY }}
                        >
                          {formatTHB(r.priceTHB)}
                        </span>
                        {onSale && compare !== null && (
                          <span className="text-[10px] line-through" style={{ color: EDU_INK_MUTED }}>
                            {formatTHB(compare)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function Badge({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex gap-2">
      <span
        className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-lg"
        style={{ background: `${EDU_PRIMARY}14`, color: EDU_PRIMARY }}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p
          className={`text-xs ${FONT_HEADING} font-bold`}
          style={{ color: EDU_INK }}
        >
          {title}
        </p>
        <p className="text-[10px] leading-snug" style={{ color: EDU_INK_MUTED }}>
          {body}
        </p>
      </div>
    </div>
  );
}

function ChalkboardPlaceholder({ small = false }: { small?: boolean }) {
  return (
    <div
      className="w-full h-full relative flex items-center justify-center"
      style={{ background: `linear-gradient(135deg, ${EDU_PRIMARY_DEEP}, ${EDU_PRIMARY})` }}
    >
      <svg
        viewBox="0 0 200 200"
        className="absolute inset-0 w-full h-full opacity-25"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="40" cy="40" r="18" stroke="white" strokeWidth="1.2" fill="none" />
        <rect x="120" y="30" width="40" height="28" stroke="white" strokeWidth="1.2" fill="none" rx="4" />
        <path d="M 30 130 L 60 100 L 90 130 L 60 160 Z" stroke="white" strokeWidth="1.2" fill="none" />
        <text x="100" y="100" fontSize="14" fill="white" textAnchor="middle" opacity="0.85" fontFamily="var(--font-kanit)">
          A B C
        </text>
      </svg>
      <div className="relative z-10 flex flex-col items-center gap-1 text-white">
        <BookOpen size={small ? 22 : 36} strokeWidth={1.5} />
        {!small && (
          <span className={`text-[10px] ${FONT_HEADING} font-bold uppercase tracking-wider opacity-90`}>
            ตัวอย่างสื่อ
          </span>
        )}
      </div>
    </div>
  );
}
