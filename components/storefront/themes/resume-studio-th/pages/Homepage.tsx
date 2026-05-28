'use client';

/**
 * resume-studio-th — Homepage
 *
 * Translation of the ResumeKit `index.html` landing page for a Thai
 * digital resume-template store (instant download, pay with store
 * credit, no shipping). Section order mirrors the export:
 *
 *   1. Hero — eyebrow + headline (highlight word) + lead + dual CTA
 *      + trust ticks, with floating "mini-resume" art cards on the
 *      right and a "เริ่มที่ 39 เครดิต" tag.
 *   2. How-it-works — 3 numbered steps (เติมเครดิต → เลือก → ดาวน์โหลด).
 *   3. Featured templates — up to 8 product cards ("เทมเพลตยอดนิยม").
 *   4. Why grid — 4 value props (ATS / แก้เอง / เครดิต / โหลดซ้ำ).
 *   5. CTA band — indigo gradient "พร้อมเริ่มสมัครงานแล้วหรือยัง?".
 *
 * No motion/react — the floating hero cards use a CSS keyframe via
 * `<style jsx>`.
 *
 * Hero image fallback chain: landingContent.heroImageUrl →
 * store.bannerUrl → first product image. When none resolve, the
 * line-art mini-resume cards render as the visual.
 */

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Check,
  BadgeCheck,
  PencilLine,
  Coins,
  Download,
  FileText,
} from 'lucide-react';
import { formatTHB } from '@/lib/utils';
import {
  RS_ACCENT,
  RS_ACCENT_INK,
  RS_ACCENT_SOFT,
  RS_CREDIT,
  RS_CREDIT_INK,
  RS_CREDIT_SOFT,
  RS_BG,
  RS_SURFACE,
  RS_SURFACE_2,
  RS_FG,
  RS_FG_SOFT,
  RS_MUTED,
  RS_BORDER,
  RS_BORDER_2,
  RS_SHADOW_1,
  RS_SHADOW_2,
  RS_SHADOW_3,
} from '../palette';

interface ProductCard {
  id: string;
  title: string;
  priceTHB: number;
  compareAtPriceTHB: number | null;
  imageUrl: string | null;
  categoryName: string | null;
}

interface ResumeStudioHomepageProps {
  store: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    bannerUrl: string | null;
  };
  products: ProductCard[];
  categories: { id: string; name: string }[];
  landingContent?: {
    heroHeadline?: string | null;
    heroSubheadline?: string | null;
    heroCtaLabel?: string | null;
    heroCtaUrl?: string | null;
    heroImageUrl?: string | null;
  } | null;
}

// 3-step "ใช้งานง่ายใน 3 ขั้นตอน" — copy from index.html.
const STEPS = [
  {
    n: '1',
    title: 'เติมเครดิต',
    body: 'เลือกแพ็กเครดิตที่คุ้ม จ่ายผ่านพร้อมเพย์หรือบัตรครั้งเดียว ยิ่งเติมเยอะยิ่งได้โบนัส',
  },
  {
    n: '2',
    title: 'เลือกเทมเพลตที่ใช่',
    body: 'ค้นหา กรองตามหมวด เลือกซื้อเป็นชิ้น ดูพรีวิวก่อนตัดสินใจได้',
  },
  {
    n: '3',
    title: 'ตัดเครดิต ดาวน์โหลด',
    body: 'ระบบตัดเครดิตอัตโนมัติ ไฟล์เข้าคลัง “บัญชีของฉัน” ทันที ดาวน์โหลดซ้ำได้ไม่จำกัด',
  },
];

// 4 value props — "WHY" grid in index.html.
const WHY = [
  {
    Icon: BadgeCheck,
    title: 'ผ่านระบบ ATS',
    body: 'โครงสร้างไฟล์ที่ระบบคัดกรองอ่านได้ครบ ไม่ตกตั้งแต่ด่านแรก',
  },
  {
    Icon: PencilLine,
    title: 'แก้ไขเองได้ทันที',
    body: 'ไฟล์ .docx และลิงก์ Canva พร้อมแก้ ไม่ต้องลงโปรแกรมเพิ่ม',
  },
  {
    Icon: Coins,
    title: 'จ่ายด้วยเครดิต',
    body: 'เติมครั้งเดียวเลือกได้ทั้งร้าน เครดิตไม่หมดอายุ คุมงบง่าย',
  },
  {
    Icon: Download,
    title: 'โหลดซ้ำได้ตลอด',
    body: 'ไฟล์อยู่ในคลังถาวร อัปเดตเรซูเม่รอบใหม่ก็โหลดเวอร์ชันเดิมได้',
  },
];

const TRUST = [
  'แก้ได้ใน Word / Canva',
  'ผ่านระบบคัดกรอง ATS',
  'ดาวน์โหลดซ้ำได้ตลอด',
];

// Decorative line-art "mini-resume" used as the hero visual fallback.
function MiniResume({
  accent,
  rotate,
  className,
  style,
}: {
  accent: string;
  rotate: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const line = (w: string, c?: string) => (
    <div
      className="rounded-sm"
      style={{ height: 3, width: w, background: c ?? '#E6E9EE' }}
    />
  );
  return (
    <div
      className={className}
      style={{
        transform: `rotate(${rotate}deg)`,
        background: '#fff',
        border: `1px solid ${RS_BORDER}`,
        borderRadius: 12,
        boxShadow: RS_SHADOW_3,
        padding: 14,
        ...style,
      }}
    >
      <div
        className="flex flex-col gap-2"
        style={{ borderBottom: `2px solid ${accent}`, paddingBottom: 9 }}
      >
        <div className="rounded" style={{ height: 6, width: '58%', background: RS_SURFACE_2 }} />
        {line('40%')}
      </div>
      <div className="flex flex-col gap-1.5 mt-2.5">
        {line('100%')}
        {line('92%')}
        {line('80%')}
      </div>
      <div className="flex flex-col gap-1.5 mt-3">
        <div className="rounded-sm" style={{ height: 4, width: '34%', background: accent, opacity: 0.85 }} />
        {line('88%')}
        {line('70%')}
      </div>
    </div>
  );
}

export function ResumeStudioHomepage({
  store,
  products,
  landingContent,
}: ResumeStudioHomepageProps) {
  const catalogUrl = `/stores/${store.slug}/category`;
  const creditUrl = `/stores/${store.slug}/account/credit`;

  const headline =
    landingContent?.heroHeadline?.trim() ||
    'เรซูเม่ที่ทำให้เด็กจบใหม่ได้สัมภาษณ์งานจริง';
  const subheadline =
    landingContent?.heroSubheadline?.trim() ||
    'เลือกจากเทมเพลตมืออาชีพที่ผ่านระบบ ATS แก้ไขได้ใน Word และ Canva เติมเครดิตครั้งเดียว ใช้ตัดซื้อได้ทุกแบบ ไม่ต้องผูกบัตรซ้ำ';
  const ctaLabel = landingContent?.heroCtaLabel?.trim() || 'ดูเทมเพลตทั้งหมด';

  // Hero image fallback chain: landing → banner → first product image.
  const heroImage =
    landingContent?.heroImageUrl?.trim() ||
    store.bannerUrl?.trim() ||
    products.find((p) => p.imageUrl)?.imageUrl ||
    null;

  const featured = products.slice(0, 8);
  const lowestPrice =
    products.length > 0
      ? Math.min(...products.map((p) => p.priceTHB))
      : null;

  const sectionWrap = 'max-w-[1340px] mx-auto px-4 sm:px-6';

  return (
    <div
      className="min-h-screen font-[family:var(--font-prompt)]"
      style={
        {
          background: RS_BG,
          color: RS_FG,
          ['--shop-primary' as string]: RS_ACCENT,
        } as React.CSSProperties
      }
    >
      <style jsx>{`
        @keyframes rs-float-a {
          0%,
          100% {
            transform: translateX(-58%) rotate(-4deg) translateY(0);
          }
          50% {
            transform: translateX(-58%) rotate(-4deg) translateY(-10px);
          }
        }
        @keyframes rs-float-b {
          0%,
          100% {
            transform: rotate(5deg) translateY(0);
          }
          50% {
            transform: rotate(5deg) translateY(-13px);
          }
        }
        @keyframes rs-float-c {
          0%,
          100% {
            transform: rotate(-7deg) translateY(0);
          }
          50% {
            transform: rotate(-7deg) translateY(-8px);
          }
        }
        .rs-f1 {
          animation: rs-float-a 6s var(--rs-ease, cubic-bezier(0.23, 1, 0.32, 1))
            infinite;
        }
        .rs-f2 {
          animation: rs-float-b 7s cubic-bezier(0.23, 1, 0.32, 1) infinite;
        }
        .rs-f3 {
          animation: rs-float-c 6.5s cubic-bezier(0.23, 1, 0.32, 1) infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .rs-f1,
          .rs-f2,
          .rs-f3 {
            animation: none;
          }
        }
      `}</style>

      {/* ───── Hero ───── */}
      <section
        className="relative overflow-hidden"
        style={{
          backgroundImage: `radial-gradient(700px 420px at 88% -8%, ${RS_ACCENT_SOFT}, transparent 70%), radial-gradient(540px 360px at 4% 108%, ${RS_CREDIT_SOFT}, transparent 70%)`,
        }}
      >
        <div className={`${sectionWrap} pt-16 pb-[76px]`}>
          <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-8 lg:gap-12 items-center">
            {/* Left — copy */}
            <div>
              <span
                className="font-[family:var(--font-mono)] text-[12px] font-medium uppercase"
                style={{ letterSpacing: '0.16em', color: RS_ACCENT }}
              >
                เทมเพลตเรซูเม่ · ระบบเครดิต
              </span>
              <h1
                className="mt-3 font-[family:var(--font-kanit)] font-semibold leading-[1.08]"
                style={{
                  fontSize: 'clamp(34px, 5.4vw, 58px)',
                  letterSpacing: '-0.02em',
                  color: RS_FG,
                }}
              >
                {landingContent?.heroHeadline?.trim() ? (
                  headline
                ) : (
                  <>
                    เรซูเม่ที่ทำให้{' '}
                    <span style={{ color: RS_ACCENT }}>เด็กจบใหม่</span>
                    <br />
                    ได้สัมภาษณ์งานจริง
                  </>
                )}
              </h1>
              <p
                className="mt-5 text-[16px] sm:text-[19px] leading-relaxed max-w-[46ch]"
                style={{ color: RS_MUTED }}
              >
                {subheadline}
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  href={catalogUrl}
                  className="inline-flex items-center gap-2 px-[26px] py-3.5 rounded-[13px] text-white text-[16px] font-semibold transition-transform hover:-translate-y-0.5"
                  style={{
                    background: RS_ACCENT,
                    boxShadow: `0 8px 20px ${RS_ACCENT_SOFT}`,
                  }}
                >
                  {ctaLabel}
                  <ArrowRight className="w-[17px] h-[17px]" />
                </Link>
                <Link
                  href={creditUrl}
                  className="inline-flex items-center gap-2 px-[26px] py-3.5 rounded-[13px] text-[16px] font-semibold border bg-white transition-colors hover:bg-[#F2F5F9]"
                  style={{ color: RS_FG, borderColor: RS_BORDER_2 }}
                >
                  เติมเครดิต
                </Link>
              </div>
              <div className="mt-7 flex flex-wrap gap-5">
                {TRUST.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-2 text-[14px] font-medium"
                    style={{ color: RS_FG_SOFT }}
                  >
                    <Check
                      className="w-[18px] h-[18px]"
                      style={{ color: RS_CREDIT }}
                      strokeWidth={2.4}
                    />
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Right — hero art */}
            <div className="relative h-[380px] lg:h-[460px]">
              <span
                className="absolute z-[4] top-0 right-2 inline-flex items-center gap-2 rounded-full px-[15px] py-[9px] text-[14px] font-bold"
                style={{
                  background: RS_CREDIT,
                  color: '#06251C',
                  boxShadow: RS_SHADOW_2,
                }}
              >
                <Coins className="w-[17px] h-[17px]" />
                เริ่มที่ {lowestPrice ?? 39} เครดิต
              </span>

              {heroImage ? (
                <div
                  className="absolute inset-0 rounded-[20px] overflow-hidden"
                  style={{
                    border: `1px solid ${RS_BORDER}`,
                    boxShadow: RS_SHADOW_3,
                  }}
                >
                  <img
                    src={heroImage}
                    alt={store.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <>
                  <MiniResume
                    accent={RS_ACCENT}
                    rotate={-4}
                    className="rs-f1 absolute z-[2]"
                    style={{
                      width: 230,
                      left: '50%',
                      top: 18,
                      transform: 'translateX(-58%) rotate(-4deg)',
                    }}
                  />
                  <MiniResume
                    accent={RS_CREDIT}
                    rotate={5}
                    className="rs-f2 absolute z-[3]"
                    style={{ width: 190, right: 0, bottom: 24 }}
                  />
                  <MiniResume
                    accent={RS_ACCENT_INK}
                    rotate={-7}
                    className="rs-f3 absolute z-[1]"
                    style={{ width: 180, left: 0, bottom: 0, opacity: 0.96 }}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ───── How it works ───── */}
      <section className="py-12">
        <div className={sectionWrap}>
          <div className="mb-7">
            <span
              className="font-[family:var(--font-mono)] text-[12px] font-medium uppercase"
              style={{ letterSpacing: '0.16em', color: RS_ACCENT }}
            >
              ใช้งานง่ายใน 3 ขั้นตอน
            </span>
            <h2
              className="mt-1.5 font-[family:var(--font-kanit)] font-semibold"
              style={{ fontSize: 'clamp(26px, 3.4vw, 36px)', color: RS_FG }}
            >
              เติมเครดิต แล้วเลือกได้ทั้งร้าน
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-[18px]">
            {STEPS.map((s) => (
              <div
                key={s.n}
                className="rounded-[20px] p-[22px] sm:p-[26px]"
                style={{
                  background: RS_SURFACE,
                  border: `1px solid ${RS_BORDER}`,
                  boxShadow: RS_SHADOW_1,
                }}
              >
                <div
                  className="grid place-items-center w-[38px] h-[38px] rounded-[11px] mb-3.5 font-[family:var(--font-mono)] font-semibold"
                  style={{ background: RS_ACCENT_SOFT, color: RS_ACCENT_INK }}
                >
                  {s.n}
                </div>
                <h3
                  className="font-[family:var(--font-kanit)] text-[18px] font-semibold mb-1.5"
                  style={{ color: RS_FG }}
                >
                  {s.title}
                </h3>
                <p className="text-[14.5px]" style={{ color: RS_MUTED }}>
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Featured templates ───── */}
      {featured.length > 0 ? (
        <section className="py-12">
          <div className={sectionWrap}>
            <div className="flex items-end justify-between gap-5 flex-wrap mb-[30px]">
              <div>
                <span
                  className="font-[family:var(--font-mono)] text-[12px] font-medium uppercase"
                  style={{ letterSpacing: '0.16em', color: RS_ACCENT }}
                >
                  มาแรงตอนนี้
                </span>
                <h2
                  className="mt-1.5 font-[family:var(--font-kanit)] font-semibold"
                  style={{ fontSize: 'clamp(26px, 3.4vw, 36px)', color: RS_FG }}
                >
                  เทมเพลตยอดนิยม
                </h2>
                <p className="mt-1.5 text-[14.5px] max-w-[52ch]" style={{ color: RS_MUTED }}>
                  คัดแบบที่เด็กจบใหม่เลือกใช้บ่อยที่สุด พร้อมเวอร์ชันภาษาไทยและอังกฤษ
                </p>
              </div>
              <Link
                href={catalogUrl}
                className="inline-flex items-center gap-1 px-[14px] py-2 rounded-lg text-[13.5px] font-semibold"
                style={{ background: RS_ACCENT_SOFT, color: RS_ACCENT_INK }}
              >
                ดูทั้งหมด →
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-[22px]">
              {featured.map((p) => {
                const hasDiscount =
                  p.compareAtPriceTHB != null &&
                  p.compareAtPriceTHB > p.priceTHB;
                return (
                  <Link
                    key={p.id}
                    href={`/stores/${store.slug}/products/${p.id}`}
                    className="group flex flex-col overflow-hidden rounded-[20px] transition-transform hover:-translate-y-1"
                    style={{
                      background: RS_SURFACE,
                      border: `1px solid ${RS_BORDER}`,
                      boxShadow: RS_SHADOW_1,
                    }}
                  >
                    <div
                      className="relative grid place-items-center p-[18px]"
                      style={{
                        aspectRatio: '3 / 3.7',
                        background: RS_SURFACE_2,
                        borderBottom: `1px solid ${RS_BORDER}`,
                      }}
                    >
                      {p.imageUrl ? (
                        <img
                          src={p.imageUrl}
                          alt={p.title}
                          className="w-full h-full object-cover rounded transition-transform duration-500 group-hover:scale-[1.015]"
                        />
                      ) : (
                        <MiniResume
                          accent={RS_ACCENT}
                          rotate={0}
                          style={{ width: '100%', maxWidth: 170 }}
                        />
                      )}
                    </div>
                    <div className="flex flex-col gap-2 p-4 flex-1">
                      {p.categoryName ? (
                        <span
                          className="text-[12px] font-semibold"
                          style={{ color: RS_ACCENT }}
                        >
                          {p.categoryName}
                        </span>
                      ) : null}
                      <h3
                        className="font-[family:var(--font-kanit)] text-[16.5px] font-semibold line-clamp-2"
                        style={{ color: RS_FG }}
                      >
                        {p.title}
                      </h3>
                      <div
                        className="mt-auto pt-3 flex items-center justify-between gap-2.5"
                        style={{ borderTop: `1px solid ${RS_BORDER}` }}
                      >
                        <span className="inline-flex items-baseline gap-1.5 font-[family:var(--font-mono)] font-semibold">
                          <span
                            className="text-[1.05em]"
                            style={{ color: RS_CREDIT_INK }}
                          >
                            {formatTHB(p.priceTHB)}
                          </span>
                          {hasDiscount ? (
                            <span
                              className="text-[0.85em] line-through"
                              style={{ color: RS_MUTED }}
                            >
                              {formatTHB(p.compareAtPriceTHB as number)}
                            </span>
                          ) : null}
                        </span>
                        <span
                          className="px-3.5 py-2 rounded-lg text-[13.5px] font-semibold"
                          style={{
                            background: RS_ACCENT_SOFT,
                            color: RS_ACCENT_INK,
                          }}
                        >
                          ดูรายละเอียด
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {/* ───── Why grid ───── */}
      <section className="py-12">
        <div className={sectionWrap}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[18px]">
            {WHY.map(({ Icon, title, body }) => (
              <div
                key={title}
                className="rounded-[20px] p-[22px]"
                style={{ background: RS_SURFACE, border: `1px solid ${RS_BORDER}` }}
              >
                <div
                  className="grid place-items-center w-[42px] h-[42px] rounded-xl mb-3.5"
                  style={{ background: RS_CREDIT_SOFT, color: RS_CREDIT_INK }}
                >
                  <Icon className="w-[22px] h-[22px]" />
                </div>
                <h3
                  className="font-[family:var(--font-kanit)] text-[16.5px] font-semibold mb-1.5"
                  style={{ color: RS_FG }}
                >
                  {title}
                </h3>
                <p className="text-[14px]" style={{ color: RS_MUTED }}>
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── CTA band ───── */}
      <section className="py-12">
        <div className={sectionWrap}>
          <div
            className="relative overflow-hidden rounded-[26px] px-6 py-10 sm:px-12 sm:py-14 text-center text-white"
            style={{
              background: `linear-gradient(135deg, ${RS_ACCENT_INK}, ${RS_ACCENT})`,
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(500px 300px at 80% 120%, ${RS_CREDIT}, transparent 60%)`,
                opacity: 0.4,
              }}
              aria-hidden="true"
            />
            <div className="relative">
              <h2
                className="font-[family:var(--font-kanit)] font-semibold text-white"
                style={{ fontSize: 'clamp(26px, 4vw, 38px)' }}
              >
                พร้อมเริ่มสมัครงานแล้วหรือยัง?
              </h2>
              <p className="mt-3 mb-7 mx-auto max-w-[50ch] text-white/85 text-[15px] sm:text-[16px]">
                เติมเครดิตวันนี้ เลือกเทมเพลตที่ใช่สำหรับคุณ จ่ายครั้งเดียว ใช้ตัดซื้อได้ทุกแบบ
              </p>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <Link
                  href={creditUrl}
                  className="inline-flex items-center gap-2 px-[26px] py-3.5 rounded-[13px] text-[16px] font-semibold"
                  style={{ background: RS_CREDIT, color: '#06251C' }}
                >
                  เติมเครดิตเลย
                </Link>
                <Link
                  href={catalogUrl}
                  className="inline-flex items-center gap-2 px-[26px] py-3.5 rounded-[13px] text-[16px] font-semibold bg-white"
                  style={{ color: RS_ACCENT_INK }}
                >
                  เลือกเทมเพลตก่อน
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ResumeStudioHomepage;
