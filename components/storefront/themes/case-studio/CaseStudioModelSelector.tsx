'use client';

/**
 * CaseStudioModelSelector — brand picker.
 *
 * Client component (we need state to switch which set of model chips
 * renders when the user picks a brand tab). No DB-side phone-model
 * table exists yet — we hard-code 12 common chips per brand from the
 * design source. Tabs other than iPhone show a small placeholder set
 * (Samsung S24 / S23 / Z Flip etc.) so the UI feels alive even before
 * a real PhoneModel schema lands.
 *
 * Each chip links to:
 *   /stores/<slug>/search?q=<brand-name>
 *
 * The category page's existing PET_PSEUDO regex fallback (PR #67)
 * doesn't yet cover phone-model substrings — operators with mixed-
 * compat products can extend that map later. For now the chip routes
 * to the search page which will search for the brand.
 */

import Link from 'next/link';

type Brand = 'iPhone' | 'Samsung' | 'OPPO' | 'Vivo';

const BRANDS: Brand[] = ['iPhone', 'Samsung', 'OPPO', 'Vivo'];

interface Props {
  storeSlug: string;
}

export function CaseStudioModelSelector({ storeSlug }: Props) {
  return (
    <section
      id="brand-selector"
      className="px-4 sm:px-6 py-16 scroll-mt-20"
      style={{ background: '#F5F5F7' }}
    >
      <div className="mx-auto" style={{ maxWidth: '1280px' }}>
        {/* Header */}
        <div className="text-center mb-9">
          <p
            className="font-bold uppercase mb-2.5"
            style={{
              fontSize: '11px',
              letterSpacing: '2.5px',
              color: '#FF3366',
            }}
          >
            Find Your Phone
          </p>
          <h2
            className="mb-2.5"
            style={{
              fontSize: 'clamp(28px, 4vw, 36px)',
              fontWeight: 800,
              letterSpacing: '-1px',
              color: '#0A0A0F',
            }}
          >
            เลือกรุ่นมือถือของคุณ
          </h2>
          <p style={{ fontSize: '14px', color: '#6B7280' }}>
            รองรับ 100+ รุ่น · จัดส่งภายใน 24 ชม.
          </p>
        </div>

        {/* Brand chips — flex centered */}
        <div
          className="mx-auto flex flex-wrap justify-center gap-3"
          style={{ maxWidth: '1100px' }}
        >
          {BRANDS.map((b) => (
            <Link
              key={b}
              href={`/stores/${storeSlug}/search?q=${encodeURIComponent(b)}`}
              className="relative block text-center transition hover:-translate-y-0.5 w-[calc(50%-6px)] sm:w-[calc(33.333%-8px)] md:w-[calc(25%-9px)] max-w-[160px]"
              style={{
                padding: '16px 12px',
                background: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '10px',
              }}
            >
              <div
                style={{
                  fontSize: '26px',
                  marginBottom: '6px',
                  lineHeight: 1,
                }}
              >
                📱
              </div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#0A0A0F' }}>
                {b}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
