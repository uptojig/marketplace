/**
 * CaseStudioHero — landing-page hero for the case-studio custom homepage.
 *
 * Server component (no client state). Two-column grid:
 *   - Left: coral kicker → big Inter 800/900 H1 (with the phrase
 *     "เครื่องที่คุณรัก" styled with a coral-to-orange gradient) →
 *     sub copy → two-button CTA row → three-feature row.
 *   - Right: two rotated phone-case SVG mockups overlapping, ported
 *     verbatim from the design source (only attribute names
 *     normalized to JSX form: stroke-width → strokeWidth etc.).
 *
 * Background: a 135° pink → near-white gradient bleed
 *   linear-gradient(135deg, #FFE5EC 0%, #FFF5F7 60%, #FFFFFF 100%)
 * matches the mockup. A faint radial-coral blob is layered into the
 * top-right corner via a positioned absolute div (mirrors the
 * .hero-bg-shape rule from the HTML).
 *
 * Sits between the real ShopHeader (from app/stores/[slug]/layout.tsx)
 * and the rest of the homepage — does NOT render its own header / nav.
 */

import Link from 'next/link';
import { ArrowRight, ShieldCheck, Bolt, Paintbrush } from 'lucide-react';

interface Props {
  storeSlug: string;
}

export function CaseStudioHero({ storeSlug }: Props) {
  return (
    <section
      className="relative overflow-hidden px-6 sm:px-9 pt-12 sm:pt-16 pb-16 sm:pb-20"
      style={{
        background:
          'linear-gradient(135deg, #FFE5EC 0%, #FFF5F7 60%, #FFFFFF 100%)',
      }}
    >
      {/* Faint radial coral blob (top-right) — mirrors .hero-bg-shape */}
      <div
        aria-hidden
        className="pointer-events-none absolute"
        style={{
          right: -100,
          top: -100,
          width: 500,
          height: 500,
          background:
            'radial-gradient(circle, rgba(255,51,102,0.10) 0%, transparent 60%)',
          borderRadius: '50%',
        }}
      />

      <div className="relative mx-auto grid items-center gap-10 lg:gap-12 lg:grid-cols-[1.1fr_1fr]" style={{ maxWidth: '1280px' }}>
        {/* Left — copy + CTAs */}
        <div>
          <p
            className="font-bold uppercase mb-5"
            style={{
              fontSize: '11px',
              letterSpacing: '2.5px',
              color: '#FF3366',
            }}
          >
            ★ New Drop · Spring 2026
          </p>
          <h1
            className="mb-5"
            style={{
              fontFamily:
                'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              fontWeight: 900,
              fontSize: 'clamp(40px, 6vw, 64px)',
              lineHeight: 1,
              letterSpacing: '-2px',
              color: '#0A0A0F',
            }}
          >
            เคสที่ใช่
            <br />
            สำหรับ
            <span
              style={{
                background:
                  'linear-gradient(120deg, #FF3366 0%, #FF8A5C 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              เครื่องที่คุณรัก
            </span>
          </h1>
          <p
            className="mb-8 max-w-[460px]"
            style={{
              fontSize: '16px',
              lineHeight: 1.6,
              color: '#6B7280',
            }}
          >
            มากกว่า 500+ ลายดีไซน์ · รองรับ iPhone, Samsung, Xiaomi, OPPO · กันกระแทกผ่านมาตรฐาน MIL-STD-810G · ส่งฟรีทั่วประเทศ
          </p>
          <div className="flex flex-wrap gap-3 items-center mb-9">
            <Link
              href={`/stores/${storeSlug}/category`}
              className="inline-flex items-center gap-2 transition hover:opacity-90"
              style={{
                background: '#0A0A0F',
                color: '#FFFFFF',
                fontWeight: 600,
                fontSize: '14px',
                padding: '16px 28px',
                borderRadius: '8px',
              }}
            >
              เลือกซื้อเลย
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={`/stores/${storeSlug}/category?sort=newest`}
              className="inline-flex items-center gap-2 transition hover:bg-gray-50"
              style={{
                background: '#FFFFFF',
                color: '#0A0A0F',
                fontWeight: 600,
                fontSize: '14px',
                padding: '15px 28px',
                borderRadius: '8px',
                border: '1.5px solid #0A0A0F',
              }}
            >
              เลือกตามรุ่น
            </Link>
          </div>
          <div className="flex flex-wrap gap-7 items-center">
            <div
              className="inline-flex items-center gap-2"
              style={{ fontSize: '12px', fontWeight: 500, color: '#0A0A0F' }}
            >
              <ShieldCheck className="h-[18px] w-[18px]" style={{ color: '#FF3366' }} />
              กันกระแทก 3 เมตร
            </div>
            <div
              className="inline-flex items-center gap-2"
              style={{ fontSize: '12px', fontWeight: 500, color: '#0A0A0F' }}
            >
              <Bolt className="h-[18px] w-[18px]" style={{ color: '#FF3366' }} />
              MagSafe
            </div>
            <div
              className="inline-flex items-center gap-2"
              style={{ fontSize: '12px', fontWeight: 500, color: '#0A0A0F' }}
            >
              <Paintbrush className="h-[18px] w-[18px]" style={{ color: '#FF3366' }} />
              Custom Design
            </div>
          </div>
        </div>

        {/* Right — 2 overlapping rotated phone-case SVG mockups (ported verbatim) */}
        <div className="relative flex justify-center items-center mx-auto w-full" style={{ maxWidth: '480px' }}>
          <div className="relative w-full" style={{ height: 480, maxWidth: 480 }}>
            {/* phone-card-1 (coral case, left, rotated -10deg) */}
            <div
              className="absolute"
              style={{
                top: 20,
                left: 0,
                width: 240,
                height: 460,
                transform: 'rotate(-10deg)',
                zIndex: 1,
              }}
            >
              <svg viewBox="0 0 200 380" width="100%" height="100%" aria-hidden>
                <rect x="10" y="10" width="180" height="360" rx="32" fill="#FF3366" stroke="#0A0A0F" strokeWidth="2" />
                <rect x="22" y="22" width="156" height="336" rx="22" fill="#0A0A0F" />
                <rect x="26" y="26" width="148" height="328" rx="18" fill="#1F1F2A" />
                <rect x="78" y="32" width="44" height="10" rx="5" fill="#0A0A0F" />
                <rect x="22" y="22" width="60" height="60" rx="14" fill="rgba(0,0,0,0.4)" />
                <circle cx="42" cy="42" r="9" fill="#0A0A0F" />
                <circle cx="62" cy="42" r="9" fill="#0A0A0F" />
                <circle cx="42" cy="62" r="6" fill="#1F1F2A" />
                <text
                  x="100"
                  y="200"
                  textAnchor="middle"
                  fill="white"
                  fontSize="14"
                  fontWeight="700"
                  opacity="0.3"
                  fontFamily="-apple-system"
                >
                  9:41
                </text>
                <text
                  x="100"
                  y="340"
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.15)"
                  fontSize="48"
                  fontWeight="900"
                >
                  ★
                </text>
              </svg>
            </div>
            {/* phone-card-2 (black case w/ coral outline, right, rotated +8deg) */}
            <div
              className="absolute"
              style={{
                top: 0,
                right: 0,
                width: 240,
                height: 460,
                transform: 'rotate(8deg)',
                zIndex: 2,
              }}
            >
              <svg viewBox="0 0 200 380" width="100%" height="100%" aria-hidden>
                <rect x="10" y="10" width="180" height="360" rx="32" fill="#0A0A0F" stroke="#FF3366" strokeWidth="3" />
                <rect x="22" y="22" width="156" height="336" rx="22" fill="#0A0A0F" />
                <rect x="26" y="26" width="148" height="328" rx="18" fill="#1F1F2A" />
                <rect x="78" y="32" width="44" height="10" rx="5" fill="#0A0A0F" />
                <rect x="22" y="22" width="60" height="60" rx="14" fill="rgba(255,51,102,0.4)" />
                <circle cx="42" cy="42" r="9" fill="#0A0A0F" />
                <circle cx="62" cy="42" r="9" fill="#0A0A0F" />
                <text
                  x="100"
                  y="200"
                  textAnchor="middle"
                  fill="rgba(255,51,102,0.8)"
                  fontSize="32"
                  fontWeight="900"
                  fontFamily="-apple-system"
                >
                  CASE
                </text>
                <text
                  x="100"
                  y="232"
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.4)"
                  fontSize="20"
                  fontWeight="900"
                  fontFamily="-apple-system"
                >
                  STUDIO
                </text>
                <circle
                  cx="100"
                  cy="280"
                  r="20"
                  fill="none"
                  stroke="rgba(255,51,102,0.5)"
                  strokeWidth="2"
                />
                <circle cx="100" cy="280" r="10" fill="#FF3366" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
