/**
 * /themes — public salepage template catalog. ThemeForest-style grid:
 * thumbnail, name, category, accent stripe, "Live Preview" → fullscreen
 * iframe at /themes/[id]/preview, "Details" → marketing detail page.
 */
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { SALEPAGE_TEMPLATES } from '@/lib/salepages/registry';

export const metadata: Metadata = {
  title: 'Salepage Templates · Basketplace',
  description:
    'เทมเพลตหน้าขายสินค้าออกแบบมาสำหรับ digital product, course, และ ebook — preview สด ก่อนใช้',
};

const CATEGORY_LABEL: Record<string, string> = {
  'info-product': 'Info Product',
  course: 'Course',
  ebook: 'Ebook',
  service: 'Service',
  software: 'Software',
};

export default function ThemesCatalogPage() {
  return (
    <div className="bg-mp-cream min-h-screen">
      <section className="border-b border-zinc-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <p className="text-xs font-bold tracking-[0.18em] text-zinc-500 mb-3">
            BASKETPLACE · SALEPAGE LIBRARY
          </p>
          <h1 className="font-[family:var(--font-kanit)] text-4xl sm:text-5xl font-bold tracking-tight mb-3">
            Salepage Templates
          </h1>
          <p className="text-base sm:text-lg text-zinc-600 max-w-2xl">
            เทมเพลตหน้าขายสินค้าสำเร็จรูป — ออกแบบมาสำหรับ digital product,
            course, และ ebook ของไทย. กดดูสดได้ทุกตัวก่อนเลือก
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SALEPAGE_TEMPLATES.map((t) => {
            const isLive = t.status === 'live';
            return (
              <article
                key={t.id}
                className="group bg-white rounded-xl border border-zinc-200 overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                {/* Accent stripe */}
                <div
                  className="h-1.5 w-full"
                  style={{ background: t.accentColor }}
                  aria-hidden
                />
                {/* Thumbnail area */}
                <div className="relative aspect-[3/2] bg-zinc-100 overflow-hidden">
                  {/* Real thumbnail will go to /public/salepages/<id>/thumb.jpg;
                      for now fall back to a clean placeholder block with template name. */}
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${t.accentColor}15 0%, ${t.accentColor}05 100%)`,
                    }}
                  >
                    <div className="text-center px-6">
                      <p
                        className="font-[family:var(--font-kanit)] font-bold text-2xl"
                        style={{ color: t.accentColor }}
                      >
                        {t.name}
                      </p>
                      <p className="text-xs text-zinc-500 mt-2">
                        Preview ก่อนใช้ได้
                      </p>
                    </div>
                  </div>
                  {!isLive && (
                    <div className="absolute top-3 right-3 inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-zinc-900 text-white">
                      Coming Soon
                    </div>
                  )}
                  {isLive && (
                    <Link
                      href={`/themes/${t.id}/preview`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors"
                    >
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-sm font-semibold shadow-lg">
                        <ExternalLink className="w-4 h-4" />
                        Live Preview
                      </span>
                    </Link>
                  )}
                </div>
                {/* Meta */}
                <div className="p-5">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-zinc-100 text-zinc-700">
                      {CATEGORY_LABEL[t.category] ?? t.category}
                    </span>
                  </div>
                  <h2 className="font-bold text-lg mb-1.5">{t.name}</h2>
                  <p className="text-sm text-zinc-600 line-clamp-2 mb-4">
                    {t.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/themes/${t.id}`}
                      className={
                        isLive
                          ? 'flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-md text-sm font-semibold border border-zinc-300 hover:bg-zinc-50 transition-colors'
                          : 'flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-md text-sm font-semibold border border-zinc-300 opacity-50 cursor-not-allowed'
                      }
                      onClick={
                        isLive
                          ? undefined
                          : (e) => e.preventDefault()
                      }
                    >
                      Details <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    {isLive && (
                      <Link
                        href={`/themes/${t.id}/preview`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-md text-sm font-semibold text-white transition-opacity hover:opacity-90"
                        style={{ background: t.accentColor }}
                      >
                        Live Preview <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
