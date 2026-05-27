/**
 * info-product-classic — long-form sales letter for digital info
 * products (online courses, ebooks, template packs). Sections in
 * conversion-tested order: hero → pain points → benefits → curriculum
 * → social proof → author → pricing → FAQ → final CTA.
 *
 * Renders against the generic SalepageData contract so the same
 * component drives the /themes preview (with demo data) and any
 * future merchant-installed instance.
 */
import Link from 'next/link';
import { Check, Star, Clock, Shield, X } from 'lucide-react';
import type { SalepageData } from '@/lib/salepages/types';

const ACCENT = '#FF6B35';
const INK = '#1A1A1A';
const SOFT = '#FAF7F3';

function formatTHB(n: number): string {
  return `฿${n.toLocaleString('th-TH')}`;
}

export default function InfoProductClassicSalepage({
  data,
}: {
  data: SalepageData;
}) {
  const discountPct =
    data.compareAtPriceTHB && data.compareAtPriceTHB > data.priceTHB
      ? Math.round(
          ((data.compareAtPriceTHB - data.priceTHB) / data.compareAtPriceTHB) *
            100,
        )
      : 0;

  return (
    <div
      className="min-h-screen font-[family:var(--font-prompt),sans-serif]"
      style={{ background: SOFT, color: INK }}
    >
      {/* ─── Scarcity bar ─── */}
      {data.scarcityText && (
        <div
          className="text-center text-sm py-2 font-semibold tracking-wide text-white"
          style={{ background: INK }}
        >
          {data.scarcityText}
        </div>
      )}

      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div>
            {data.eyebrow && (
              <p
                className="text-xs sm:text-sm font-bold tracking-[0.18em] mb-4"
                style={{ color: ACCENT }}
              >
                {data.eyebrow}
              </p>
            )}
            <h1 className="font-[family:var(--font-kanit)] text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05] mb-5">
              {data.headline}
            </h1>
            <p className="text-lg sm:text-xl leading-relaxed text-zinc-700 mb-8">
              {data.subheadline}
            </p>
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <a
                href="#pricing"
                className="inline-flex items-center justify-center px-7 py-4 rounded-md text-white text-base font-bold shadow-lg hover:opacity-95 transition-opacity"
                style={{ background: ACCENT }}
              >
                {data.ctaPrimary}
              </a>
              {data.ctaSecondary && (
                <a
                  href="#preview"
                  className="inline-flex items-center justify-center px-6 py-4 rounded-md text-base font-semibold border-2 hover:bg-white transition-colors"
                  style={{ borderColor: INK, color: INK }}
                >
                  {data.ctaSecondary}
                </a>
              )}
            </div>
            {data.heroBadge && (
              <div className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600">
                {data.heroBadge}
              </div>
            )}
          </div>

          <div className="relative">
            <div
              className="absolute -inset-4 rounded-2xl blur-2xl opacity-20"
              style={{ background: ACCENT }}
              aria-hidden
            />
            <img
              src={data.heroImageUrl}
              alt={data.headline}
              className="relative w-full h-auto rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* ─── Pain Points ─── */}
      <section className="py-16 sm:py-24" style={{ background: '#fff' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-[family:var(--font-kanit)] text-3xl sm:text-4xl font-bold text-center mb-12">
            คุณเจอเรื่องพวกนี้ใช่ไหม?
          </h2>
          <ul className="space-y-4">
            {data.painPoints.map((pp) => (
              <li
                key={pp}
                className="flex items-start gap-3 p-4 rounded-lg border border-zinc-200 bg-zinc-50"
              >
                <X
                  className="w-5 h-5 mt-0.5 flex-shrink-0 text-red-500"
                  aria-hidden
                />
                <span className="text-base sm:text-lg leading-relaxed">{pp}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ─── Benefits ─── */}
      <section className="py-16 sm:py-24" style={{ background: SOFT }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <p
              className="text-xs font-bold tracking-[0.18em] mb-3"
              style={{ color: ACCENT }}
            >
              สิ่งที่คุณจะได้
            </p>
            <h2 className="font-[family:var(--font-kanit)] text-3xl sm:text-4xl font-bold">
              จบคอร์สนี้ — ชีวิตทำงานเปลี่ยน
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {data.benefits.map((b) => (
              <div
                key={b.title}
                className="bg-white rounded-xl p-6 border border-zinc-200 hover:shadow-lg transition-shadow"
              >
                {b.icon && <div className="text-3xl mb-3">{b.icon}</div>}
                <h3 className="font-bold text-lg mb-2">{b.title}</h3>
                <p className="text-sm leading-relaxed text-zinc-600">
                  {b.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Modules ─── */}
      {data.modules && data.modules.length > 0 && (
        <section className="py-16 sm:py-24" style={{ background: '#fff' }}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p
                className="text-xs font-bold tracking-[0.18em] mb-3"
                style={{ color: ACCENT }}
              >
                หลักสูตร
              </p>
              <h2 className="font-[family:var(--font-kanit)] text-3xl sm:text-4xl font-bold">
                4 Modules — เรียนตามลำดับ
              </h2>
            </div>
            <div className="space-y-4">
              {data.modules.map((m, i) => (
                <div
                  key={m.title}
                  className="rounded-xl border border-zinc-200 p-6 hover:border-zinc-400 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                      style={{ background: INK }}
                    >
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-xl mb-3">{m.title}</h3>
                      <ul className="space-y-1.5">
                        {m.bullets.map((bu) => (
                          <li
                            key={bu}
                            className="flex items-start gap-2 text-sm text-zinc-700"
                          >
                            <Check
                              className="w-4 h-4 mt-0.5 flex-shrink-0"
                              style={{ color: ACCENT }}
                            />
                            <span>{bu}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Testimonials ─── */}
      <section className="py-16 sm:py-24" style={{ background: SOFT }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p
              className="text-xs font-bold tracking-[0.18em] mb-3"
              style={{ color: ACCENT }}
            >
              เสียงจากผู้เรียน
            </p>
            <h2 className="font-[family:var(--font-kanit)] text-3xl sm:text-4xl font-bold">
              คนทำงานจริงเลือกแล้ว 2,847 คน
            </h2>
          </div>
          <div className="grid lg:grid-cols-3 gap-5">
            {data.testimonials.map((t) => (
              <div
                key={t.author}
                className="bg-white rounded-xl p-6 border border-zinc-200"
              >
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating ?? 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-amber-400 text-amber-400"
                      aria-hidden
                    />
                  ))}
                </div>
                <p className="text-base leading-relaxed mb-5 text-zinc-800">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  {t.avatarUrl && (
                    <img
                      src={t.avatarUrl}
                      alt={t.author}
                      className="w-11 h-11 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <p className="font-bold text-sm">{t.author}</p>
                    {t.role && (
                      <p className="text-xs text-zinc-500">{t.role}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Author ─── */}
      <section className="py-16 sm:py-24" style={{ background: '#fff' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start">
            {data.author.avatarUrl && (
              <img
                src={data.author.avatarUrl}
                alt={data.author.name}
                className="w-40 h-40 rounded-full object-cover flex-shrink-0 shadow-lg"
              />
            )}
            <div className="flex-1 text-center sm:text-left">
              <p
                className="text-xs font-bold tracking-[0.18em] mb-2"
                style={{ color: ACCENT }}
              >
                ผู้สอน
              </p>
              <h3 className="font-[family:var(--font-kanit)] text-2xl sm:text-3xl font-bold mb-1">
                {data.author.name}
              </h3>
              <p className="text-sm font-medium text-zinc-600 mb-4">
                {data.author.title}
              </p>
              <p className="text-base leading-relaxed text-zinc-700">
                {data.author.bio}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section
        id="pricing"
        className="py-16 sm:py-24 scroll-mt-16"
        style={{ background: INK, color: '#fff' }}
      >
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p
            className="text-xs font-bold tracking-[0.18em] mb-4"
            style={{ color: ACCENT }}
          >
            ลงทุนครั้งเดียว · ใช้ตลอดชีพ
          </p>
          <h2 className="font-[family:var(--font-kanit)] text-3xl sm:text-4xl font-bold mb-8">
            พร้อมเปลี่ยนชีวิตทำงานหรือยัง?
          </h2>

          <div className="bg-white text-black rounded-2xl p-8 sm:p-10 shadow-2xl">
            <div className="flex items-baseline justify-center gap-3 mb-2">
              {data.compareAtPriceTHB && (
                <span className="text-2xl text-zinc-400 line-through">
                  {formatTHB(data.compareAtPriceTHB)}
                </span>
              )}
              <span
                className="text-5xl sm:text-6xl font-bold font-[family:var(--font-kanit)]"
                style={{ color: ACCENT }}
              >
                {formatTHB(data.priceTHB)}
              </span>
            </div>
            {discountPct > 0 && (
              <p className="text-sm font-bold mb-6" style={{ color: ACCENT }}>
                ประหยัด {discountPct}% — โปรเปิดตัวเท่านั้น
              </p>
            )}
            <ul className="space-y-2.5 mb-8 text-left">
              {[
                'เข้าถึงเนื้อหาทั้งหมดตลอดชีวิต',
                '50+ เทมเพลต .xlsx พร้อมใช้',
                'อัปเดตฟรีทุกครั้งที่เพิ่มคอนเทนต์',
                'กลุ่ม LINE OpenChat ถาม-ตอบ',
                'ใบรับรองดิจิทัล + LinkedIn badge',
                'รับประกันคืนเงิน 14 วัน',
              ].map((f) => (
                <li key={f} className="flex items-start gap-2.5">
                  <Check
                    className="w-5 h-5 mt-0.5 flex-shrink-0"
                    style={{ color: ACCENT }}
                  />
                  <span className="text-sm sm:text-base">{f}</span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="w-full inline-flex items-center justify-center px-8 py-5 rounded-md text-white text-lg font-bold shadow-lg hover:opacity-95 transition-opacity"
              style={{ background: ACCENT }}
            >
              {data.ctaPrimary}
            </button>
            <div className="flex items-center justify-center gap-4 mt-5 text-xs text-zinc-500">
              <span className="inline-flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" />
                ปลอดภัย 100%
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                คืนเงินใน 14 วัน
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="py-16 sm:py-24" style={{ background: SOFT }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-[family:var(--font-kanit)] text-3xl sm:text-4xl font-bold text-center mb-12">
            คำถามที่พบบ่อย
          </h2>
          <div className="space-y-3">
            {data.faqs.map((f) => (
              <details
                key={f.q}
                className="rounded-lg border border-zinc-200 bg-white p-5 group"
              >
                <summary className="cursor-pointer font-semibold text-base flex items-center justify-between">
                  <span>{f.q}</span>
                  <span
                    className="ml-3 transition-transform group-open:rotate-45 text-2xl font-light"
                    style={{ color: ACCENT }}
                    aria-hidden
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-zinc-700">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="py-10 border-t border-zinc-200" style={{ background: '#fff' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p
            className="font-[family:var(--font-kanit)] font-bold text-xl mb-1"
            style={{ color: INK }}
          >
            {data.brandName}
          </p>
          {data.brandTagline && (
            <p className="text-sm text-zinc-500 mb-4">{data.brandTagline}</p>
          )}
          <p className="text-xs text-zinc-400">
            © {new Date().getFullYear()} {data.brandName} · ปลอดภัย · เชื่อถือได้
          </p>
        </div>
      </footer>
    </div>
  );
}
