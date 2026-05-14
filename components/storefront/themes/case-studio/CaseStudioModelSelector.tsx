'use client';

/**
 * CaseStudioModelSelector — brand-tab + model-chip picker.
 *
 * Client component (we need state to switch which set of model chips
 * renders when the user picks a brand tab). No DB-side phone-model
 * table exists yet — we hard-code 12 common chips per brand from the
 * design source. Tabs other than iPhone show a small placeholder set
 * (Samsung S24 / S23 / Z Flip etc.) so the UI feels alive even before
 * a real PhoneModel schema lands.
 *
 * Each chip links to:
 *   /stores/<slug>/category?cat=<model-name>
 *
 * The category page's existing PET_PSEUDO regex fallback (PR #67)
 * doesn't yet cover phone-model substrings — operators with mixed-
 * compat products can extend that map later. For now the chip routes
 * exactly the same as a sidebar category click; if no exact match the
 * filter just empties (which still leaves the page navigable).
 *
 * Visual: white tabs strip on top, 6-col model grid below. Active
 * tab = filled black pill, inactive = muted text. Chips are rounded-
 * lg white cards with a 26px emoji and tight model name; the three
 * newest iPhone 16 models get a coral "NEW" pin in the top-right.
 */

import Link from 'next/link';
import { useState } from 'react';

type Brand = 'iPhone' | 'Samsung' | 'Xiaomi' | 'OPPO' | 'Realme' | 'Vivo' | 'Huawei';

interface ModelChip {
  name: string;
  isNew?: boolean;
}

const MODELS: Record<Brand, ModelChip[]> = {
  iPhone: [
    { name: 'iPhone 16 Pro Max', isNew: true },
    { name: 'iPhone 16 Pro', isNew: true },
    { name: 'iPhone 16', isNew: true },
    { name: 'iPhone 15 Pro Max' },
    { name: 'iPhone 15 Pro' },
    { name: 'iPhone 15' },
    { name: 'iPhone 14 Pro Max' },
    { name: 'iPhone 14 Pro' },
    { name: 'iPhone 14' },
    { name: 'iPhone 13 Pro' },
    { name: 'iPhone 13' },
    { name: 'iPhone 12' },
  ],
  Samsung: [
    { name: 'Galaxy S24 Ultra', isNew: true },
    { name: 'Galaxy S24+', isNew: true },
    { name: 'Galaxy S24', isNew: true },
    { name: 'Galaxy S23 Ultra' },
    { name: 'Galaxy S23' },
    { name: 'Galaxy Z Fold 5' },
    { name: 'Galaxy Z Flip 5' },
    { name: 'Galaxy A55' },
    { name: 'Galaxy A35' },
    { name: 'Galaxy S22' },
    { name: 'Galaxy Note 20' },
    { name: 'Galaxy A54' },
  ],
  Xiaomi: [
    { name: 'Xiaomi 14 Pro', isNew: true },
    { name: 'Xiaomi 14' },
    { name: 'Xiaomi 13T Pro' },
    { name: 'Xiaomi 13T' },
    { name: 'Redmi Note 13 Pro+' },
    { name: 'Redmi Note 13 Pro' },
    { name: 'Redmi Note 13' },
    { name: 'POCO X6 Pro' },
    { name: 'POCO X6' },
    { name: 'POCO F6 Pro' },
    { name: 'Redmi 13C' },
    { name: 'Mi 11' },
  ],
  OPPO: [
    { name: 'Find X7 Ultra', isNew: true },
    { name: 'Reno 11 Pro' },
    { name: 'Reno 11' },
    { name: 'Reno 10 Pro+' },
    { name: 'Reno 10 Pro' },
    { name: 'Reno 10' },
    { name: 'A98' },
    { name: 'A78' },
    { name: 'A58' },
    { name: 'A38' },
    { name: 'F23' },
    { name: 'A17' },
  ],
  Realme: [
    { name: 'GT 5 Pro', isNew: true },
    { name: 'GT 5' },
    { name: 'GT Neo 6' },
    { name: '12 Pro+' },
    { name: '12 Pro' },
    { name: '12' },
    { name: '11 Pro+' },
    { name: '11 Pro' },
    { name: 'C67' },
    { name: 'C55' },
    { name: 'Narzo 60' },
    { name: 'Note 50' },
  ],
  Vivo: [
    { name: 'X100 Pro', isNew: true },
    { name: 'X100' },
    { name: 'V30 Pro' },
    { name: 'V30' },
    { name: 'V29 Pro' },
    { name: 'V29' },
    { name: 'Y200' },
    { name: 'Y100' },
    { name: 'Y36' },
    { name: 'Y27' },
    { name: 'Y17s' },
    { name: 'iQOO 12' },
  ],
  Huawei: [
    { name: 'Pura 70 Ultra', isNew: true },
    { name: 'Pura 70' },
    { name: 'Mate 60 Pro' },
    { name: 'Mate 60' },
    { name: 'P60 Pro' },
    { name: 'P60' },
    { name: 'Nova 12 Pro' },
    { name: 'Nova 11 Pro' },
    { name: 'Nova 11' },
    { name: 'Y91' },
    { name: 'Y61' },
    { name: 'Mate X5' },
  ],
};

const BRANDS: Brand[] = ['iPhone', 'Samsung', 'Xiaomi', 'OPPO', 'Realme', 'Vivo', 'Huawei'];

interface Props {
  storeSlug: string;
}

export function CaseStudioModelSelector({ storeSlug }: Props) {
  const [active, setActive] = useState<Brand>('iPhone');
  const chips = MODELS[active];

  return (
    <section
      className="px-4 sm:px-6 py-16"
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

        {/* Brand tabs */}
        <div className="flex justify-center mb-8">
          <div
            className="inline-flex flex-wrap justify-center"
            style={{
              gap: '4px',
              padding: '6px',
              background: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              maxWidth: 'fit-content',
            }}
          >
            {BRANDS.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setActive(b)}
                className="transition"
                style={{
                  padding: '10px 20px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: active === b ? '#FFFFFF' : '#6B7280',
                  background: active === b ? '#0A0A0F' : 'transparent',
                  borderRadius: '8px',
                  border: 0,
                  cursor: 'pointer',
                }}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        {/* Model chips — 2-col on phones, 3 sm, 4 md, 6 desktop. */}
        <div
          className="mx-auto grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
          style={{ maxWidth: '1100px' }}
        >
          {chips.map((m) => (
            <Link
              key={m.name}
              href={`/stores/${storeSlug}/category?cat=${encodeURIComponent(m.name)}`}
              className="relative block text-center transition hover:-translate-y-0.5"
              style={{
                padding: '16px 12px',
                background: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '10px',
              }}
            >
              {m.isNew && (
                <span
                  className="absolute font-bold uppercase"
                  style={{
                    top: 6,
                    right: 6,
                    background: '#FF3366',
                    color: '#FFFFFF',
                    fontSize: '8px',
                    padding: '2px 5px',
                    borderRadius: '999px',
                    letterSpacing: '0.5px',
                  }}
                >
                  NEW
                </span>
              )}
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
                {m.name}
              </div>
            </Link>
          ))}
        </div>
      </div>

    </section>
  );
}
