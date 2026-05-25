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

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ChevronRight,
  FileSpreadsheet,
  Download,
  Check,
} from 'lucide-react';
import type { ProductDetailProps } from '@/lib/templates/types';
import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';

const FEATURE_BULLETS = [
  'ไฟล์ .xlsx พร้อมใช้งานทันที',
  'รองรับ Excel 2019 / 365 / Google Sheets (import)',
  'อัปเดตฟรีตลอดอายุไฟล์',
  'ปลดล็อกเซลล์ไม่จำกัด แก้ไขได้',
];

export default function SheetlabFormulaProductDetail({
  store,
  product,
  related,
}: ProductDetailProps) {
  const add = useCart((s) => s.add);
  const [activeImg, setActiveImg] = useState(0);
  const [justAdded, setJustAdded] = useState(false);

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

  const handleAdd = () => {
    add({
      productId: product.id,
      storeSlug: store.slug,
      storeName: store.name,
      title: product.title,
      priceTHB: product.priceTHB,
      imageUrl: product.imageUrl ?? undefined,
      productType: 'DIGITAL',
      digitalKind: 'EXCEL',
    });
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 2000);
  };

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

            {/* Add to cart */}
            <div className="mt-7">
              <button
                type="button"
                onClick={handleAdd}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-md text-white text-sm font-semibold shadow-sm hover:opacity-95 transition-opacity"
                style={{ background: '#107C41' }}
              >
                <Download className="w-4 h-4" />
                เพิ่มในตะกร้า
              </button>
              {justAdded ? (
                <p
                  className="mt-2 text-xs font-medium text-[#107C41]"
                  role="status"
                  aria-live="polite"
                >
                  เพิ่มในตะกร้า ✓
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
      </div>
    </div>
  );
}
