/**
 * PetHouseHero — landing-page hero for the pet-house custom homepage.
 *
 * Server component (no client state needed). Renders the welcome kicker,
 * Georgia serif title (with green italic for เจ้าตัวขนปุย), sub-text and
 * a two-CTA row. The right column hosts the inline house-with-cat SVG
 * ported verbatim from the design mockup.
 *
 * Sits between the real ShopHeader (from app/stores/[slug]/layout.tsx)
 * and the rest of the homepage — does NOT render its own header / nav.
 */

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface Props {
  storeSlug: string;
}

export function PetHouseHero({ storeSlug }: Props) {
  return (
    <section
      style={{ background: '#FAF7F4' }}
      className="px-6 sm:px-8 pt-8 pb-10 sm:pt-10 sm:pb-12"
    >
      <div className="mx-auto max-w-[1100px] grid gap-6 lg:gap-8 lg:grid-cols-[1.2fr_1fr] items-center">
        {/* Left — copy + CTAs */}
        <div className="hero-text">
          <p
            className="inline-flex items-center gap-2 font-semibold uppercase mb-3"
            style={{
              fontSize: '10px',
              letterSpacing: '3px',
              color: '#5BA033',
            }}
          >
            <span
              aria-hidden
              style={{
                display: 'inline-block',
                width: 18,
                height: 1,
                background: '#5BA033',
              }}
            />
            Welcome to Fluffy House
          </p>
          <h1
            className="mb-3"
            style={{
              fontFamily: 'Georgia, serif',
              fontSize: 'clamp(28px, 4vw, 36px)',
              lineHeight: 1.1,
              color: '#3B2F1F',
              fontWeight: 400,
              letterSpacing: '-0.5px',
            }}
          >
            บ้านอบอุ่น
            <br />
            สำหรับ
            <em style={{ color: '#5BA033', fontStyle: 'italic' }}>
              เจ้าตัวขนปุย
            </em>
          </h1>
          <p
            className="mb-5 max-w-[360px]"
            style={{
              fontSize: '13px',
              color: '#6E5E4A',
              lineHeight: 1.55,
            }}
          >
            ทุกอย่างที่น้องแมวกับน้องหมาต้องการ · คัดสรรของพรีเมียม ·
            จัดส่งภายใน 1-3 วันทำการ
          </p>
          <div className="flex flex-wrap gap-3 items-center">
            <Link
              href={`/stores/${storeSlug}/category`}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 font-semibold"
              style={{
                background: '#5BA033',
                color: 'white',
                borderRadius: '999px',
                fontSize: '12px',
              }}
            >
              ช้อปสินค้าทั้งหมด
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href={`/stores/${storeSlug}/category?sort=newest`}
              className="inline-block font-medium"
              style={{
                fontSize: '12px',
                color: '#5C3D1F',
                paddingBottom: '3px',
                borderBottom: '1px solid #5C3D1F',
              }}
            >
              ดูสินค้าใหม่
            </Link>
          </div>
        </div>

        {/* Right — house-with-cat illustration (ported verbatim from mockup) */}
        <div className="relative mx-auto w-full max-w-[260px] aspect-square">
          <svg
            viewBox="0 0 260 260"
            width="100%"
            height="100%"
            aria-hidden
          >
            {/* soft yellow circle bg */}
            <circle cx="130" cy="130" r="120" fill="#FAEBA0" opacity="0.7" />
            {/* paw prints decoration */}
            <g fill="#5BA033" opacity="0.18">
              <ellipse cx="40" cy="50" rx="6" ry="7" />
              <ellipse cx="34" cy="40" rx="3" ry="3.5" />
              <ellipse cx="42" cy="38" rx="3" ry="3.5" />
              <ellipse cx="50" cy="42" rx="3" ry="3.5" />
              <ellipse cx="220" cy="220" rx="6" ry="7" />
              <ellipse cx="214" cy="210" rx="3" ry="3.5" />
              <ellipse cx="222" cy="208" rx="3" ry="3.5" />
              <ellipse cx="230" cy="212" rx="3" ry="3.5" />
              <ellipse cx="50" cy="220" rx="6" ry="7" />
              <ellipse cx="44" cy="210" rx="3" ry="3.5" />
              <ellipse cx="52" cy="208" rx="3" ry="3.5" />
              <ellipse cx="60" cy="212" rx="3" ry="3.5" />
            </g>
            {/* house base */}
            <path
              d="M70 145 L130 85 L190 145 L190 215 L70 215 Z"
              fill="#D4A55C"
              stroke="#5C3D1F"
              strokeWidth="2.5"
            />
            {/* roof */}
            <path
              d="M60 150 L130 80 L200 150"
              stroke="#5C3D1F"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* chimney */}
            <rect x="165" y="100" width="14" height="20" fill="#5C3D1F" />
            {/* door (arch) */}
            <path
              d="M105 215 L105 175 Q130 145 155 175 L155 215 Z"
              fill="#5C3D1F"
            />
            {/* cat in doorway */}
            <ellipse cx="130" cy="200" rx="22" ry="18" fill="white" />
            {/* cat ears */}
            <polygon
              points="113 185, 109 168, 122 180"
              fill="white"
              stroke="#3B2F1F"
              strokeWidth="0.8"
            />
            <polygon
              points="147 185, 151 168, 138 180"
              fill="white"
              stroke="#3B2F1F"
              strokeWidth="0.8"
            />
            <polygon points="115 182, 113 174, 120 180" fill="#F4B8C8" />
            <polygon points="145 182, 147 174, 140 180" fill="#F4B8C8" />
            {/* cat eyes */}
            <ellipse cx="121" cy="197" rx="2.5" ry="3" fill="#3B2F1F" />
            <ellipse cx="139" cy="197" rx="2.5" ry="3" fill="#3B2F1F" />
            <circle cx="121.5" cy="196" r="0.7" fill="white" />
            <circle cx="139.5" cy="196" r="0.7" fill="white" />
            {/* cat nose */}
            <polygon points="130 203, 127 206, 133 206" fill="#D4537E" />
            {/* cat mouth */}
            <path
              d="M130 207 Q126 211 122 209"
              stroke="#3B2F1F"
              strokeWidth="1.2"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M130 207 Q134 211 138 209"
              stroke="#3B2F1F"
              strokeWidth="1.2"
              fill="none"
              strokeLinecap="round"
            />
            {/* whiskers */}
            <line
              x1="108"
              y1="201"
              x2="100"
              y2="199"
              stroke="#3B2F1F"
              strokeWidth="0.8"
              strokeLinecap="round"
            />
            <line
              x1="108"
              y1="204"
              x2="100"
              y2="206"
              stroke="#3B2F1F"
              strokeWidth="0.8"
              strokeLinecap="round"
            />
            <line
              x1="152"
              y1="201"
              x2="160"
              y2="199"
              stroke="#3B2F1F"
              strokeWidth="0.8"
              strokeLinecap="round"
            />
            <line
              x1="152"
              y1="204"
              x2="160"
              y2="206"
              stroke="#3B2F1F"
              strokeWidth="0.8"
              strokeLinecap="round"
            />
            {/* heart above house */}
            <path
              d="M127 65 Q124 60 121 62 Q118 65 124 72 Q130 65 127 62 Q134 60 130 65"
              fill="#5BA033"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}
