/**
 * PetHouseBrandStory — yellow rounded card with cat+dog illustration on
 * the left and the brand story copy + mini stats row + founder quote +
 * CTA on the right. SVG ported verbatim from the design mockup.
 *
 * Server component (static copy).
 */

import Link from 'next/link';

interface Props {
  storeSlug: string;
}

// TODO(stats): wire to real counters once Order + Review tables are
// queryable from this page. Numbers are placeholders for now — they are
// not (yet) derived from Prisma.
const MINI_STATS = [
  { value: '1,200+', label: 'ลูกค้า' },
  { value: '5,000+', label: 'ออเดอร์' },
  { value: '4.9★', label: 'Reviews' },
];

export function PetHouseBrandStory({ storeSlug }: Props) {
  return (
    <section
      className="mx-6 sm:mx-8 mb-9"
      style={{ background: '#FAEBA0', borderRadius: '12px', padding: '24px' }}
    >
      <div className="mx-auto max-w-[1100px] grid gap-6 md:grid-cols-[1fr_1.3fr] items-start">
        {/* Cat + Dog illustration */}
        <div className="relative mx-auto w-full max-w-[180px] aspect-square">
          <svg viewBox="0 0 180 180" width="100%" height="100%" aria-hidden>
            <circle cx="90" cy="90" r="80" fill="white" opacity="0.5" />
            {/* cat body */}
            <ellipse
              cx="60"
              cy="120"
              rx="22"
              ry="16"
              fill="#FFF8E1"
              stroke="#5C3D1F"
              strokeWidth="1.5"
            />
            <circle
              cx="60"
              cy="100"
              r="16"
              fill="#FFF8E1"
              stroke="#5C3D1F"
              strokeWidth="1.5"
            />
            <polygon
              points="48 92, 45 80, 55 88"
              fill="#FFF8E1"
              stroke="#5C3D1F"
              strokeWidth="1.2"
            />
            <polygon
              points="72 92, 75 80, 65 88"
              fill="#FFF8E1"
              stroke="#5C3D1F"
              strokeWidth="1.2"
            />
            <ellipse cx="55" cy="100" rx="2" ry="2.5" fill="#3B2F1F" />
            <ellipse cx="65" cy="100" rx="2" ry="2.5" fill="#3B2F1F" />
            <polygon points="60 105, 57 108, 63 108" fill="#D4537E" />
            {/* dog body */}
            <ellipse
              cx="115"
              cy="120"
              rx="24"
              ry="18"
              fill="#FFF8E1"
              stroke="#5C3D1F"
              strokeWidth="1.5"
            />
            <circle
              cx="115"
              cy="100"
              r="17"
              fill="#FFF8E1"
              stroke="#5C3D1F"
              strokeWidth="1.5"
            />
            <ellipse
              cx="100"
              cy="95"
              rx="5"
              ry="9"
              fill="#D4A55C"
              stroke="#5C3D1F"
              strokeWidth="1.2"
            />
            <ellipse
              cx="130"
              cy="95"
              rx="5"
              ry="9"
              fill="#D4A55C"
              stroke="#5C3D1F"
              strokeWidth="1.2"
            />
            <ellipse
              cx="115"
              cy="106"
              rx="8"
              ry="6"
              fill="#FFF8E1"
              stroke="#5C3D1F"
              strokeWidth="1.2"
            />
            <ellipse cx="110" cy="100" rx="2" ry="2.5" fill="#3B2F1F" />
            <ellipse cx="120" cy="100" rx="2" ry="2.5" fill="#3B2F1F" />
            <ellipse cx="115" cy="105" rx="2.5" ry="2" fill="#3B2F1F" />
            {/* heart */}
            <path
              d="M85 60 Q80 55 75 58 Q70 62 82 75 Q94 62 89 58 Q98 55 93 60"
              fill="#5BA033"
            />
          </svg>
        </div>

        {/* Text */}
        <div>
          <div
            className="font-semibold uppercase mb-2.5"
            style={{
              fontSize: '10px',
              letterSpacing: '3px',
              color: '#5BA033',
            }}
          >
            เกี่ยวกับ Fluffy House
          </div>
          <h3
            className="m-0 mb-3"
            style={{
              fontFamily: 'Georgia, serif',
              fontSize: '22px',
              color: '#3B2F1F',
              fontWeight: 500,
              letterSpacing: '-0.3px',
              lineHeight: 1.2,
            }}
          >
            เราเลือกเฉพาะของที่
            <br />
            เราอยากใช้กับน้องของเรา
          </h3>
          <p
            className="mb-4 max-w-[420px]"
            style={{
              fontSize: '12px',
              lineHeight: 1.7,
              color: '#5C3D1F',
            }}
          >
            ทุกชิ้นในร้านผ่านการคัดสรรจากคนที่เป็นทาสแมว-ทาสหมาตัวจริง ·
            ใช้เองมาก่อนถึงจะเอามาขาย ·
            ตอบทุกคำถามที่คุณมีเรื่องการดูแลสัตว์เลี้ยง
          </p>

          {/* Mini stats row — 3 stats separated by · */}
          {/* TODO(stats): wire to real counters once Order + Review tables
              are queryable from this page. */}
          <div
            className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mb-4"
            style={{
              borderTop: '0.5px solid rgba(91, 160, 51, 0.25)',
              borderBottom: '0.5px solid rgba(91, 160, 51, 0.25)',
              padding: '8px 0',
            }}
          >
            {MINI_STATS.map((s, i) => (
              <span key={s.label} className="inline-flex items-baseline gap-1.5">
                {i > 0 && (
                  <span
                    aria-hidden
                    style={{ color: '#5BA033', opacity: 0.4, marginRight: 6 }}
                  >
                    ·
                  </span>
                )}
                <span
                  className="font-semibold"
                  style={{
                    fontSize: '13px',
                    color: '#3B2F1F',
                    letterSpacing: '-0.2px',
                  }}
                >
                  {s.value}
                </span>
                <span
                  className="font-semibold uppercase"
                  style={{
                    fontSize: '9px',
                    letterSpacing: '2px',
                    color: '#5BA033',
                  }}
                >
                  {s.label}
                </span>
              </span>
            ))}
          </div>

          {/* Founder quote */}
          <blockquote
            className="mb-4 italic"
            style={{
              borderLeft: '3px solid #5BA033',
              paddingLeft: '12px',
              fontSize: '12px',
              lineHeight: 1.6,
              color: 'rgba(92, 61, 31, 0.85)',
              fontFamily: 'Georgia, serif',
              maxWidth: '420px',
            }}
          >
            &ldquo;เริ่มจากที่บ้านเลี้ยงน้อง 3 ตัว — เลือกของให้น้องของเราเอง
            ก่อนจะส่งต่อให้คนอื่น&rdquo;
            <footer
              className="not-italic mt-1.5"
              style={{
                fontSize: '10px',
                color: '#5C3D1F',
                opacity: 0.7,
                fontFamily: 'inherit',
              }}
            >
              — Fluffy House Team
            </footer>
          </blockquote>

          <Link
            href={`/stores/${storeSlug}/about`}
            className="inline-flex items-center gap-1.5 font-semibold"
            style={{
              fontSize: '12px',
              color: '#3B2F1F',
              paddingBottom: '3px',
              borderBottom: '1px solid #3B2F1F',
            }}
          >
            อ่านเรื่องราวของเรา →
          </Link>
        </div>
      </div>
    </section>
  );
}
