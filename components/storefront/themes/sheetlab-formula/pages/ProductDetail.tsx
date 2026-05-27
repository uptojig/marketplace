'use client';

/**
 * sheetlab-formula — Product Detail
 *
 * Two-column desktop layout (gallery + buy column), stacked on
 * mobile. Add-to-cart flags the line as DIGITAL/EXCEL so checkout
 * can skip the shipping step. Below the buy box, a long description
 * block and a "related" rail.
 *
 * Consumes the canonical `ProductDetailProps` contract directly.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  ChevronRight,
  FileSpreadsheet,
  Download,
  Check,
  Plus,
  X,
  Gift,
  Star,
  Pencil,
  Loader2,
} from 'lucide-react';
import type { ProductDetailProps } from '@/lib/templates/types';
import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';
import { WishlistHeart } from '@/components/storefront/WishlistHeart';

const FEATURE_BULLETS = [
  'ไฟล์ .xlsx พร้อมใช้งานทันที',
  'รองรับ Excel 2019 / 365 / Google Sheets (import)',
  'อัปเดตฟรีตลอดอายุไฟล์',
  'ปลดล็อกเซลล์ไม่จำกัด แก้ไขได้',
];

const MAX_RECIPIENTS = 20;
const MESSAGE_MAX = 200;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Recipient = { email: string; name: string; message?: string };
type BuyMode = 'self' | 'gift';

export default function SheetlabFormulaProductDetail({
  store,
  product,
  related,
}: ProductDetailProps) {
  const add = useCart((s) => s.add);
  const [activeImg, setActiveImg] = useState(0);
  const [justAdded, setJustAdded] = useState(false);
  const [lastAddedMode, setLastAddedMode] = useState<BuyMode>('self');
  const [mode, setMode] = useState<BuyMode>('self');
  const [recipients, setRecipients] = useState<Recipient[]>([
    { email: '', name: '', message: '' },
  ]);

  const homeUrl = `/stores/${store.slug}`;
  const catalogUrl = `/stores/${store.slug}/category`;

  // Build a deduped gallery (hero first, then extra images).
  const gallery = useMemo(() => {
    const list = [product.imageUrl, ...product.images].filter(
      (x): x is string => Boolean(x),
    );
    const seen = new Set<string>();
    const out: string[] = [];
    for (const src of list) {
      if (!seen.has(src)) {
        seen.add(src);
        out.push(src);
      }
    }
    return out;
  }, [product.imageUrl, product.images]);

  const hasDiscount =
    product.originalPriceTHB != null &&
    product.originalPriceTHB > product.priceTHB;

  const giftInvalid = useMemo(() => {
    if (mode !== 'gift') return false;
    if (recipients.length === 0) return true;
    return recipients.some(
      (r) => !r.name.trim() || !r.email.trim() || !EMAIL_RE.test(r.email.trim()),
    );
  }, [mode, recipients]);

  const updateRecipient = (idx: number, patch: Partial<Recipient>) => {
    setRecipients((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)),
    );
  };

  const addRecipient = () => {
    setRecipients((prev) =>
      prev.length >= MAX_RECIPIENTS
        ? prev
        : [...prev, { email: '', name: '', message: '' }],
    );
  };

  const removeRecipient = (idx: number) => {
    setRecipients((prev) =>
      prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx),
    );
  };

  const handleAdd = () => {
    if (mode === 'gift' && giftInvalid) return;

    const base = {
      productId: product.id,
      storeSlug: store.slug,
      storeName: store.name,
      title: product.title,
      priceTHB: product.priceTHB,
      imageUrl: product.imageUrl ?? undefined,
      productType: 'DIGITAL' as const,
      digitalKind: 'EXCEL' as const,
    };

    if (mode === 'gift') {
      const cleaned = recipients.map((r) => {
        const msg = r.message?.trim();
        return {
          email: r.email.trim(),
          name: r.name.trim(),
          ...(msg ? { message: msg } : {}),
        };
      });
      add({ ...base, giftRecipients: cleaned }, cleaned.length);
    } else {
      add(base);
    }

    setLastAddedMode(mode);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 2000);
    // Reset gift form back to defaults after a successful add.
    setRecipients([{ email: '', name: '', message: '' }]);
    setMode('self');
  };

  const giftTotal = product.priceTHB * recipients.length;
  const buyLabel =
    mode === 'gift' && recipients.length >= 1
      ? `ส่งของขวัญให้ ${recipients.length} คน`
      : 'เพิ่มในตะกร้า';
  const confirmLabel =
    lastAddedMode === 'gift' ? 'ส่งของขวัญแล้ว ✓' : 'เพิ่มในตะกร้า ✓';

  return (
    <div className="min-h-screen bg-[#F8FAFB] text-[#1F2937] font-[family:var(--font-prompt)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Breadcrumbs */}
        <nav
          aria-label="Breadcrumb"
          className="text-xs text-[#6B7280] mb-6 flex items-center flex-wrap gap-1"
        >
          <Link href={homeUrl} className="hover:text-[#107C41]">
            หน้าแรก
          </Link>
          <ChevronRight className="w-3 h-3" aria-hidden="true" />
          <Link href={catalogUrl} className="hover:text-[#107C41]">
            สูตรทั้งหมด
          </Link>
          {product.categoryName ? (
            <>
              <ChevronRight className="w-3 h-3" aria-hidden="true" />
              <Link
                href={`${catalogUrl}?cat=${encodeURIComponent(product.categoryName)}`}
                className="hover:text-[#107C41]"
              >
                {product.categoryName}
              </Link>
            </>
          ) : null}
          <ChevronRight className="w-3 h-3" aria-hidden="true" />
          <span
            className="truncate max-w-[180px] sm:max-w-xs text-[#1F2937]"
            aria-current="page"
          >
            {product.title}
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* ─── Left: Gallery ─── */}
          <div>
            <div
              className="relative aspect-[4/3] rounded-lg overflow-hidden bg-white border border-[#E5E7EB]"
            >
              <div
                className="h-1 w-full"
                style={{ background: '#107C41' }}
                aria-hidden="true"
              />
              {gallery[activeImg] ? (
                <img
                  src={gallery[activeImg]}
                  alt={product.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-[#9CA3AF]">
                  <FileSpreadsheet className="w-14 h-14 text-[#107C41] opacity-60" />
                  <span className="text-xs uppercase tracking-widest">
                    Excel Template
                  </span>
                </div>
              )}
              <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-semibold bg-white/95 border border-[#E5E7EB] text-[#107C41]">
                💾 Digital
              </span>
            </div>
            {gallery.length > 1 ? (
              <div className="mt-3 flex gap-2 overflow-x-auto">
                {gallery.map((src, idx) => (
                  <button
                    key={`${src}-${idx}`}
                    type="button"
                    onClick={() => setActiveImg(idx)}
                    aria-label={`เลือกภาพที่ ${idx + 1}`}
                    aria-current={idx === activeImg}
                    className={`relative h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 rounded-md overflow-hidden border transition-all ${
                      idx === activeImg
                        ? 'border-[#107C41]'
                        : 'border-[#E5E7EB] opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={src}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          {/* ─── Right: Buy column ─── */}
          <div>
            {product.categoryName ? (
              <span className="inline-block px-2 py-1 rounded text-[11px] font-semibold uppercase tracking-wider bg-[#F0FDF4] text-[#107C41] border border-[#D1FAE5] mb-3">
                {product.categoryName}
              </span>
            ) : null}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-[family:var(--font-kanit)] font-semibold tracking-tight leading-tight text-[#1F2937]">
              {product.title}
            </h1>

            {/* Price block */}
            <div className="mt-5 flex items-baseline flex-wrap gap-3">
              <span
                className="text-3xl sm:text-4xl font-bold"
                style={{ color: '#107C41' }}
              >
                {formatTHB(product.priceTHB)}
              </span>
              {hasDiscount ? (
                <span className="text-base text-[#9CA3AF] line-through">
                  {formatTHB(product.originalPriceTHB as number)}
                </span>
              ) : null}
              <span className="inline-flex items-center px-2 py-1 rounded text-[11px] font-medium bg-[#F0FDF4] text-[#107C41] border border-[#D1FAE5]">
                💾 Digital — ไม่มีค่าจัดส่ง
              </span>
            </div>

            {/* Features */}
            <div className="mt-7">
              <h2 className="text-sm font-semibold text-[#1F2937] mb-3">
                ประกอบด้วย
              </h2>
              <ul className="space-y-2">
                {FEATURE_BULLETS.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2 text-sm text-[#374151]"
                  >
                    <Check
                      className="w-4 h-4 mt-0.5 flex-shrink-0"
                      style={{ color: '#107C41' }}
                      aria-hidden="true"
                    />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Mode picker + Add to cart */}
            <div className="mt-7">
              <div
                role="tablist"
                aria-label="เลือกวิธีซื้อ"
                className="flex flex-col sm:flex-row gap-2 mb-4"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'self'}
                  onClick={() => setMode('self')}
                  className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-semibold border transition-colors ${
                    mode === 'self'
                      ? 'text-white border-transparent'
                      : 'bg-white text-[#1F2937] border-[#E5E7EB] hover:border-[#107C41]'
                  }`}
                  style={
                    mode === 'self' ? { background: '#107C41' } : undefined
                  }
                >
                  ซื้อให้ตัวเอง
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'gift'}
                  onClick={() => setMode('gift')}
                  className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-semibold border transition-colors ${
                    mode === 'gift'
                      ? 'text-white border-transparent'
                      : 'bg-white text-[#1F2937] border-[#E5E7EB] hover:border-[#F5A623]'
                  }`}
                  style={
                    mode === 'gift' ? { background: '#F5A623' } : undefined
                  }
                >
                  <Gift className="w-4 h-4" />
                  ซื้อเป็นของขวัญ
                </button>
              </div>

              {mode === 'gift' ? (
                <div className="mb-4 rounded-md border border-[#E5E7EB] bg-white p-4">
                  <div className="space-y-4">
                    {recipients.map((r, idx) => (
                      <div
                        key={idx}
                        className="rounded-md border border-[#E5E7EB] bg-[#FAFBFC] p-3"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-[#107C41] font-[family:var(--font-kanit)]">
                            ผู้รับคนที่ {idx + 1}
                          </span>
                          {recipients.length > 1 ? (
                            <button
                              type="button"
                              onClick={() => removeRecipient(idx)}
                              aria-label={`ลบผู้รับคนที่ ${idx + 1}`}
                              className="inline-flex items-center justify-center w-6 h-6 rounded text-[#6B7280] hover:text-[#DC2626] hover:bg-[#FEF2F2] transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          ) : null}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="email"
                            required
                            value={r.email}
                            onChange={(e) =>
                              updateRecipient(idx, { email: e.target.value })
                            }
                            placeholder="อีเมล"
                            aria-label={`อีเมลผู้รับคนที่ ${idx + 1}`}
                            className="w-full rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#107C41] focus:ring-1 focus:ring-[#107C41]"
                          />
                          <input
                            type="text"
                            required
                            value={r.name}
                            onChange={(e) =>
                              updateRecipient(idx, { name: e.target.value })
                            }
                            placeholder="ชื่อ"
                            aria-label={`ชื่อผู้รับคนที่ ${idx + 1}`}
                            className="w-full rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#107C41] focus:ring-1 focus:ring-[#107C41]"
                          />
                        </div>
                        <div className="mt-2">
                          <input
                            type="text"
                            value={r.message ?? ''}
                            maxLength={MESSAGE_MAX}
                            onChange={(e) =>
                              updateRecipient(idx, {
                                message: e.target.value,
                              })
                            }
                            placeholder="ข้อความ (ไม่บังคับ)"
                            aria-label={`ข้อความถึงผู้รับคนที่ ${idx + 1}`}
                            className="w-full rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#107C41] focus:ring-1 focus:ring-[#107C41]"
                          />
                          <div className="mt-1 text-right text-[10px] text-[#9CA3AF]">
                            {(r.message?.length ?? 0)}/{MESSAGE_MAX}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {recipients.length < MAX_RECIPIENTS ? (
                    <button
                      type="button"
                      onClick={addRecipient}
                      className="mt-3 inline-flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium text-[#107C41] border border-dashed border-[#107C41] hover:bg-[#F0FDF4] transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      เพิ่มผู้รับ
                    </button>
                  ) : null}

                  {giftInvalid ? (
                    <p
                      className="mt-3 text-xs font-medium text-[#DC2626]"
                      role="alert"
                    >
                      กรุณากรอกอีเมลและชื่อของผู้รับทุกคนให้ครบ และตรวจสอบรูปแบบอีเมลให้ถูกต้อง
                    </p>
                  ) : null}

                  <div className="mt-4 pt-3 border-t border-[#E5E7EB] flex items-baseline justify-between flex-wrap gap-2">
                    <span className="text-xs text-[#6B7280]">
                      {recipients.length} × {formatTHB(product.priceTHB)}
                    </span>
                    <span
                      className="text-base font-bold font-[family:var(--font-kanit)]"
                      style={{ color: '#107C41' }}
                    >
                      รวม {formatTHB(giftTotal)}
                    </span>
                  </div>
                </div>
              ) : null}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={mode === 'gift' && giftInvalid}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-md text-white text-sm font-semibold shadow-sm hover:opacity-95 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: '#107C41' }}
                >
                  {mode === 'gift' ? (
                    <Gift className="w-4 h-4" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  {buyLabel}
                </button>
                <WishlistHeart
                  productId={product.id}
                  className="inline-flex items-center justify-center px-4 py-3.5 rounded-md border text-sm hover:bg-zinc-50"
                />
              </div>
              {justAdded ? (
                <p
                  className="mt-2 text-xs font-medium text-[#107C41]"
                  role="status"
                  aria-live="polite"
                >
                  {confirmLabel}
                </p>
              ) : null}
              <p className="mt-3 text-xs text-[#6B7280]">
                ชำระผ่าน AnyPay · ดาวน์โหลดทันทีหลังชำระเงิน
              </p>
            </div>

            {/* Description */}
            {product.description?.trim() ? (
              <div className="mt-9 pt-7 border-t border-[#E5E7EB]">
                <h2 className="text-base font-semibold text-[#1F2937] font-[family:var(--font-kanit)] mb-3">
                  รายละเอียดสูตร
                </h2>
                <p className="text-sm text-[#4B5563] leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            ) : null}
          </div>
        </div>

        {/* ─── Related rail ─── */}
        {related.length > 0 ? (
          <section className="mt-16 pt-10 border-t border-[#E5E7EB]">
            <div className="flex items-end justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-[family:var(--font-kanit)] font-semibold text-[#1F2937] tracking-tight">
                สูตรอื่นที่อาจสนใจ
              </h2>
              <Link
                href={catalogUrl}
                className="hidden sm:inline text-sm text-[#107C41] hover:underline underline-offset-4"
              >
                ดูทั้งหมด →
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {related.slice(0, 4).map((r) => {
                const rDiscount =
                  r.compareAtPriceTHB != null &&
                  r.compareAtPriceTHB > r.priceTHB;
                return (
                  <Link
                    key={r.id}
                    href={`/stores/${store.slug}/products/${r.id}`}
                    className="group bg-white rounded-lg border border-[#E5E7EB] overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all"
                  >
                    <div
                      className="h-1 w-full"
                      style={{ background: '#107C41' }}
                      aria-hidden="true"
                    />
                    <div className="relative aspect-[4/3] bg-[#F3F4F6]">
                      {r.imageUrl ? (
                        <img
                          src={r.imageUrl}
                          alt={r.title}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <FileSpreadsheet className="w-10 h-10 text-[#107C41] opacity-50" />
                        </div>
                      )}
                      <span className="absolute top-2 right-2 inline-flex items-center px-2 py-1 rounded text-[10px] font-semibold bg-white/95 border border-[#E5E7EB] text-[#107C41]">
                        💾 Digital
                      </span>
                    </div>
                    <div className="p-3 sm:p-4">
                      {r.categoryName ? (
                        <span className="inline-block text-[10px] uppercase tracking-wider text-[#6B7280] mb-1">
                          {r.categoryName}
                        </span>
                      ) : null}
                      <h3 className="text-sm font-medium text-[#1F2937] line-clamp-2 group-hover:text-[#107C41] transition-colors">
                        {r.title}
                      </h3>
                      <div className="mt-2 flex items-baseline gap-2">
                        <span
                          className="text-base font-semibold"
                          style={{ color: '#107C41' }}
                        >
                          {formatTHB(r.priceTHB)}
                        </span>
                        {rDiscount ? (
                          <span className="text-xs text-[#9CA3AF] line-through">
                            {formatTHB(r.compareAtPriceTHB as number)}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ) : null}

        {/* ─── Reviews ─── */}
        <ReviewsSection productId={product.id} />
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
 *  Reviews — fetched client-side from /api/products/[id]/reviews.
 *  Renders header (avg + count), distribution bars, write form
 *  (auth-gated), and the most recent 20 reviews. Excel-green primary.
 * ──────────────────────────────────────────────────────────────── */

type ReviewItem = {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  createdAt: string;
  updatedAt: string;
  verifiedPurchase: boolean;
  author: { name: string };
};

type ReviewStats = {
  averageRating: number;
  count: number;
  buckets: Record<'1' | '2' | '3' | '4' | '5', number>;
};

type ReviewsResponse = { reviews: ReviewItem[]; stats: ReviewStats };

const BODY_MAX = 2000;
const TITLE_MAX = 120;
const EXCEL_GREEN = '#107C41';

function ReviewsSection({ productId }: { productId: string }) {
  const { data: session, status: sessionStatus } = useSession();
  const isSignedIn = Boolean(session?.user?.email);

  const [data, setData] = useState<ReviewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const callbackUrl = useMemo(() => {
    if (typeof window === 'undefined') return '/';
    return window.location.pathname + window.location.search;
  }, []);

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        cache: 'no-store',
      });
      if (!res.ok) {
        setLoadError('โหลดรีวิวไม่สำเร็จ');
        return;
      }
      const json = (await res.json()) as ReviewsResponse;
      setData(json);
      setLoadError(null);
    } catch {
      setLoadError('โหลดรีวิวไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    void fetchReviews();
  }, [fetchReviews]);

  // Deep-link: /products/<id>?review=1 (linked from /account/orders/[id])
  // auto-opens the review form for signed-in buyers and scrolls to the
  // section. Guests still see the sign-in CTA in the same slot.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('review') === '1' && isSignedIn) {
      setFormOpen(true);
      requestAnimationFrame(() => {
        document
          .getElementById('reviews')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }, [isSignedIn]);

  const resetForm = () => {
    setRating(5);
    setHoverRating(0);
    setTitle('');
    setBody('');
    setSubmitError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!body.trim()) {
      setSubmitError('กรุณากรอกเนื้อหารีวิว');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          rating,
          title: title.trim() || undefined,
          body: body.trim(),
        }),
      });
      if (res.status === 401) {
        setSubmitError('กรุณาเข้าสู่ระบบ');
        return;
      }
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        setSubmitError(err?.error ?? 'ส่งรีวิวไม่สำเร็จ');
        return;
      }
      resetForm();
      setFormOpen(false);
      await fetchReviews();
    } catch {
      setSubmitError('ส่งรีวิวไม่สำเร็จ — กรุณาลองใหม่');
    } finally {
      setSubmitting(false);
    }
  };

  const stats = data?.stats;
  const reviews = data?.reviews ?? [];
  const avgDisplay =
    stats && stats.count > 0
      ? (Math.round(stats.averageRating * 10) / 10).toFixed(1)
      : '0.0';
  const totalCount = stats?.count ?? 0;
  const maxBucket = stats
    ? Math.max(
        stats.buckets['1'],
        stats.buckets['2'],
        stats.buckets['3'],
        stats.buckets['4'],
        stats.buckets['5'],
        1,
      )
    : 1;

  return (
    <section
      id="reviews"
      className="mt-16 pt-10 border-t border-[#E5E7EB] scroll-mt-24"
      aria-labelledby="reviews-heading"
    >
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h2
            id="reviews-heading"
            className="text-xl sm:text-2xl font-[family:var(--font-kanit)] font-semibold text-[#1F2937] tracking-tight"
          >
            รีวิวจากผู้ใช้งาน
          </h2>
          {totalCount > 0 ? (
            <div className="mt-1 flex items-center gap-2 text-sm text-[#4B5563]">
              <span
                className="inline-flex items-center gap-1 font-semibold"
                style={{ color: EXCEL_GREEN }}
              >
                <Star
                  className="w-4 h-4 fill-current"
                  style={{ color: EXCEL_GREEN }}
                  aria-hidden="true"
                />
                {avgDisplay} / 5
              </span>
              <span className="text-[#6B7280]">
                (จาก {totalCount.toLocaleString('th-TH')} รีวิว)
              </span>
            </div>
          ) : null}
        </div>

        {!formOpen && isSignedIn ? (
          <button
            type="button"
            onClick={() => setFormOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-semibold text-white shadow-sm hover:opacity-95 transition-opacity"
            style={{ background: EXCEL_GREEN }}
          >
            <Pencil className="w-4 h-4" aria-hidden="true" />
            เขียนรีวิว
          </button>
        ) : null}
      </div>

      {/* Distribution bars */}
      {totalCount > 0 ? (
        <div className="mb-8 rounded-lg border border-[#E5E7EB] bg-white p-4 sm:p-5">
          <div className="space-y-1.5">
            {([5, 4, 3, 2, 1] as const).map((star) => {
              const c = stats!.buckets[String(star) as '1' | '2' | '3' | '4' | '5'];
              const pct = Math.round((c / maxBucket) * 100);
              return (
                <div key={star} className="flex items-center gap-3 text-xs">
                  <span className="w-8 inline-flex items-center gap-0.5 text-[#374151] font-medium">
                    {star}
                    <Star
                      className="w-3 h-3 fill-current"
                      style={{ color: EXCEL_GREEN }}
                      aria-hidden="true"
                    />
                  </span>
                  <div className="flex-1 h-2.5 rounded-full bg-[#F3F4F6] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, background: EXCEL_GREEN }}
                      aria-hidden="true"
                    />
                  </div>
                  <span className="w-10 text-right text-[#6B7280] tabular-nums">
                    {c.toLocaleString('th-TH')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Write form OR sign-in nudge */}
      {sessionStatus !== 'loading' ? (
        isSignedIn ? (
          formOpen ? (
            <form
              onSubmit={handleSubmit}
              className="mb-8 rounded-lg border border-[#E5E7EB] bg-white p-4 sm:p-5"
            >
              <h3 className="text-sm font-semibold font-[family:var(--font-kanit)] text-[#1F2937] mb-3">
                เขียนรีวิวของคุณ
              </h3>

              {/* Star picker */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-[#374151] mb-1.5">
                  ให้คะแนน
                </label>
                <div
                  className="flex items-center gap-1"
                  role="radiogroup"
                  aria-label="ให้คะแนน 1 ถึง 5 ดาว"
                >
                  {[1, 2, 3, 4, 5].map((n) => {
                    const active = (hoverRating || rating) >= n;
                    return (
                      <button
                        key={n}
                        type="button"
                        role="radio"
                        aria-checked={rating === n}
                        aria-label={`${n} ดาว`}
                        onClick={() => setRating(n)}
                        onMouseEnter={() => setHoverRating(n)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-0.5 rounded transition-transform hover:scale-110"
                      >
                        <Star
                          className="w-7 h-7"
                          style={{
                            color: EXCEL_GREEN,
                            fill: active ? EXCEL_GREEN : 'transparent',
                          }}
                          aria-hidden="true"
                        />
                      </button>
                    );
                  })}
                  <span className="ml-2 text-sm font-semibold text-[#374151]">
                    {rating}/5
                  </span>
                </div>
              </div>

              {/* Title */}
              <div className="mb-3">
                <label
                  htmlFor="review-title"
                  className="block text-xs font-semibold text-[#374151] mb-1.5"
                >
                  หัวข้อ (ไม่บังคับ)
                </label>
                <input
                  id="review-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value.slice(0, TITLE_MAX))}
                  maxLength={TITLE_MAX}
                  placeholder="เช่น สูตรใช้งานง่ายมาก"
                  className="w-full rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#107C41] focus:ring-1 focus:ring-[#107C41]"
                />
                <div className="mt-1 text-right text-[10px] text-[#9CA3AF]">
                  {title.length}/{TITLE_MAX}
                </div>
              </div>

              {/* Body */}
              <div className="mb-3">
                <label
                  htmlFor="review-body"
                  className="block text-xs font-semibold text-[#374151] mb-1.5"
                >
                  รายละเอียด <span className="text-[#DC2626]">*</span>
                </label>
                <textarea
                  id="review-body"
                  required
                  value={body}
                  onChange={(e) => setBody(e.target.value.slice(0, BODY_MAX))}
                  maxLength={BODY_MAX}
                  rows={5}
                  placeholder="เล่าประสบการณ์การใช้งานสูตรนี้..."
                  className="w-full rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#107C41] focus:ring-1 focus:ring-[#107C41] resize-y"
                />
                <div className="mt-1 text-right text-[10px] text-[#9CA3AF]">
                  {body.length}/{BODY_MAX}
                </div>
              </div>

              {submitError ? (
                <p
                  className="mb-3 text-xs font-medium text-[#DC2626]"
                  role="alert"
                >
                  {submitError}
                </p>
              ) : null}

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="submit"
                  disabled={submitting || !body.trim()}
                  className="inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-md text-sm font-semibold text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-95 transition-opacity"
                  style={{ background: EXCEL_GREEN }}
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  ) : null}
                  ส่งรีวิว
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormOpen(false);
                    resetForm();
                  }}
                  className="px-4 py-2 rounded-md text-sm font-medium text-[#374151] border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] transition-colors"
                >
                  ยกเลิก
                </button>
              </div>
            </form>
          ) : null
        ) : (
          <div className="mb-8 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-4 text-sm text-[#374151]">
            <Link
              href={`/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`}
              className="font-semibold hover:underline"
              style={{ color: EXCEL_GREEN }}
            >
              กรุณาเข้าสู่ระบบเพื่อเขียนรีวิว
            </Link>
          </div>
        )
      ) : null}

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-10 text-sm text-[#6B7280]">
          <Loader2 className="w-4 h-4 animate-spin mr-2" aria-hidden="true" />
          กำลังโหลดรีวิว...
        </div>
      ) : loadError ? (
        <p className="py-6 text-center text-sm text-[#DC2626]">{loadError}</p>
      ) : reviews.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[#E5E7EB] bg-white p-8 text-center">
          <p className="text-sm text-[#4B5563]">
            ยังไม่มีรีวิว — เป็นคนแรกที่รีวิวสินค้านี้!
          </p>
          {isSignedIn && !formOpen ? (
            <button
              type="button"
              onClick={() => setFormOpen(true)}
              className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-semibold text-white shadow-sm hover:opacity-95 transition-opacity"
              style={{ background: EXCEL_GREEN }}
            >
              <Pencil className="w-4 h-4" aria-hidden="true" />
              เขียนรีวิว
            </button>
          ) : null}
        </div>
      ) : (
        <ul className="space-y-4">
          {reviews.map((r) => (
            <li
              key={r.id}
              className="rounded-lg border border-[#E5E7EB] bg-white p-4 sm:p-5"
            >
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <div
                  className="inline-flex items-center gap-0.5"
                  aria-label={`${r.rating} ดาวจาก 5`}
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      className="w-4 h-4"
                      style={{
                        color: EXCEL_GREEN,
                        fill: n <= r.rating ? EXCEL_GREEN : 'transparent',
                      }}
                      aria-hidden="true"
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-[#1F2937]">
                  {r.author.name}
                </span>
                {r.verifiedPurchase ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#F0FDF4] text-[#107C41] border border-[#D1FAE5]">
                    <Check className="w-3 h-3" aria-hidden="true" />
                    ซื้อจริง
                  </span>
                ) : null}
                <span className="text-xs text-[#9CA3AF] ml-auto">
                  {formatThaiDate(r.createdAt)}
                </span>
              </div>
              {r.title ? (
                <p className="text-sm font-semibold text-[#1F2937] mb-1">
                  {r.title}
                </p>
              ) : null}
              <p className="text-sm text-[#4B5563] whitespace-pre-line leading-relaxed">
                {r.body}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** Format ISO date string → Thai short form, e.g. "27 พ.ค. 2569". */
function formatThaiDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}
