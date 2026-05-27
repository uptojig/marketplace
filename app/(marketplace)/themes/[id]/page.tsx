/**
 * /themes/[id] — detail page for a single salepage template. Big
 * description, sample screenshot, and the two CTAs (Live Preview +
 * Use This Template). Use button is wired but the install flow lands
 * in Phase 2 — currently routes to /signup with the template id as
 * a query param so we can pick it up after they create an account.
 */
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink, Sparkles } from 'lucide-react';
import { getSalepageTemplate } from '@/lib/salepages/registry';

interface Params {
  params: Promise<{ id: string }>;
}

const CATEGORY_LABEL: Record<string, string> = {
  'info-product': 'Info Product',
  course: 'Course',
  ebook: 'Ebook',
  service: 'Service',
  software: 'Software',
};

export default async function ThemeDetailPage({ params }: Params) {
  const { id } = await params;
  const t = getSalepageTemplate(id);
  if (!t) notFound();

  const isLive = t.status === 'live';

  return (
    <div className="bg-mp-cream min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link
          href="/themes"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-600 hover:text-zinc-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          กลับไปคลังเทมเพลต
        </Link>

        <div className="grid lg:grid-cols-[1fr_360px] gap-10">
          {/* Hero / preview area */}
          <div>
            <div
              className="h-1.5 w-full rounded-full mb-4"
              style={{ background: t.accentColor }}
              aria-hidden
            />
            <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden mb-6">
              <div
                className="aspect-[16/10] flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${t.accentColor}15 0%, ${t.accentColor}05 100%)`,
                }}
              >
                <div className="text-center px-8">
                  <p
                    className="font-[family:var(--font-kanit)] font-bold text-4xl mb-2"
                    style={{ color: t.accentColor }}
                  >
                    {t.name}
                  </p>
                  <p className="text-sm text-zinc-500">
                    {isLive
                      ? 'กด Live Preview เพื่อดูเทมเพลตเต็มจอ'
                      : 'เทมเพลตนี้ยังไม่เปิดให้ใช้'}
                  </p>
                </div>
              </div>
            </div>

            <span className="inline-flex items-center px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wide bg-zinc-100 text-zinc-700 mb-3">
              {CATEGORY_LABEL[t.category] ?? t.category}
            </span>
            <h1 className="font-[family:var(--font-kanit)] text-3xl sm:text-4xl font-bold mb-3">
              {t.name}
            </h1>
            <p className="text-base sm:text-lg text-zinc-700 leading-relaxed">
              {t.description}
            </p>
          </div>

          {/* Sticky CTA card */}
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
              <p
                className="text-xs font-bold tracking-[0.18em] mb-3"
                style={{ color: t.accentColor }}
              >
                เทมเพลตนี้
              </p>
              <div className="flex items-center gap-2 mb-5">
                <span className="text-3xl font-bold">฿0</span>
                <span className="text-sm text-zinc-500">Phase 1 · ฟรี</span>
              </div>
              <div className="space-y-2.5">
                {isLive ? (
                  <Link
                    href={`/themes/${t.id}/preview`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md text-white text-sm font-bold shadow-sm hover:opacity-95 transition-opacity"
                    style={{ background: t.accentColor }}
                  >
                    <ExternalLink className="w-4 h-4" />
                    Live Preview
                  </Link>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md text-white text-sm font-bold shadow-sm opacity-50 cursor-not-allowed"
                    style={{ background: t.accentColor }}
                  >
                    Coming Soon
                  </button>
                )}
                <Link
                  href={
                    isLive
                      ? `/signup?template=${encodeURIComponent(t.id)}`
                      : '#'
                  }
                  className={
                    isLive
                      ? 'w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md text-sm font-semibold border-2 border-zinc-900 hover:bg-zinc-50 transition-colors'
                      : 'w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md text-sm font-semibold border-2 border-zinc-300 text-zinc-400 cursor-not-allowed'
                  }
                  onClick={isLive ? undefined : (e) => e.preventDefault()}
                >
                  <Sparkles className="w-4 h-4" />
                  ใช้เทมเพลตนี้
                </Link>
              </div>
              <p className="text-[11px] text-zinc-500 mt-4 leading-relaxed">
                Phase 1: preview ดูได้, install flow มาใน Phase 2 (ตอนนี้กด
                "ใช้เทมเพลตนี้" ไป /signup ก่อน)
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
