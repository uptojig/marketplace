/**
 * CaseStudioInstagramGrid — 6-square IG callout grid.
 *
 * Server component. Renders ONLY when `Store.instagramUrl` is set on
 * the store row — per spec we never show a placeholder IG section
 * for a store that hasn't filled in its handle. (Same rule the spec
 * applies to reviews: hide if no real data.)
 *
 * Each cell uses a pastel gradient + a large emoji placeholder; on
 * hover a dark overlay fades in. Each cell clicks through to the
 * store's instagram URL. We don't deep-link to individual posts
 * because there's no IG-post model — clicking any tile goes to the
 * profile, which is the spec-suggested behavior.
 *
 * If we ever wire a real IG embed (Graph API media list), swap the
 * emoji backgrounds for `<img>` thumbs and update the alt text.
 */

import { ArrowUpRight } from 'lucide-react';

interface Props {
  instagramUrl: string | null;
}

const CELLS: { bg: string; emoji: string }[] = [
  { bg: 'linear-gradient(135deg, #FFE5EC, #F9A8D4)', emoji: '📱' },
  { bg: 'linear-gradient(135deg, #E0F2FE, #7DD3FC)', emoji: '💎' },
  { bg: 'linear-gradient(135deg, #FEF3C7, #FCD34D)', emoji: '⚡' },
  { bg: 'linear-gradient(135deg, #DCFCE7, #86EFAC)', emoji: '🌿' },
  { bg: 'linear-gradient(135deg, #F3E8FF, #C4B5FD)', emoji: '✨' },
  { bg: 'linear-gradient(135deg, #FFEDD5, #FED7AA)', emoji: '🍑' },
];

export function CaseStudioInstagramGrid({ instagramUrl }: Props) {
  // Hide entirely if the store hasn't set an IG handle
  if (!instagramUrl) return null;

  // Extract the handle for the kicker (best-effort). Falls back to
  // a generic IG label if the URL doesn't parse cleanly.
  let handle = '@instagram';
  try {
    const u = new URL(instagramUrl);
    const seg = u.pathname.split('/').filter(Boolean)[0];
    if (seg) handle = `@${seg}`;
  } catch {
    // ignore — keep default
  }

  return (
    <section className="px-4 sm:px-6 py-20" style={{ background: '#F5F5F7' }}>
      <div className="mx-auto" style={{ maxWidth: '1280px' }}>
        {/* Header */}
        <div className="text-center mb-9">
          <p
            className="font-bold uppercase mb-2"
            style={{
              fontSize: '11px',
              letterSpacing: '2.5px',
              color: '#FF3366',
            }}
          >
            {handle}
          </p>
          <h2
            className="mb-1"
            style={{
              fontSize: 'clamp(26px, 4vw, 32px)',
              fontWeight: 800,
              letterSpacing: '-1px',
              color: '#0A0A0F',
            }}
          >
            #yourcasestudio
          </h2>
          <p style={{ fontSize: '13px', color: '#6B7280' }}>
            แชร์ภาพเคสของคุณ · มีโอกาสถูกเลือกขึ้นหน้าเว็บ
          </p>
        </div>

        {/* 6-col grid */}
        <div className="grid gap-2 grid-cols-3 sm:grid-cols-6">
          {CELLS.map((c, i) => (
            <a
              key={i}
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative overflow-hidden group flex items-center justify-center"
              style={{
                aspectRatio: '1 / 1',
                borderRadius: '8px',
                background: c.bg,
                fontSize: '48px',
              }}
            >
              {c.emoji}
              <span
                aria-hidden
                className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100"
                style={{
                  background: 'rgba(0,0,0,0.6)',
                  color: '#FFFFFF',
                }}
              >
                <ArrowUpRight className="h-7 w-7" />
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
