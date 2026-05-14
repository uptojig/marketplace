/**
 * TrustContactPage — bespoke heritage-maison contact layout.
 *
 * Structural difference from the generic /stores/[slug]/contact
 * page and from FashionBeautyContactPage:
 *   - Centered hero serif title cartouche framed by gold hairlines
 *     ("MAISON · CORRESPONDENCE") sitting above a bordered ivory
 *     frame containing the form. NO italic essay copy.
 *   - The ContactForm sits inside a bordered ivory frame (white
 *     surface, gold-rule border, sharp corners) with a heritage
 *     caps label cartouche above it.
 *   - Store details render BELOW as an INSCRIBED PLATE: a sharp
 *     bordered cartouche with caps section labels, serif body lines,
 *     and a hairline divider between address / direct contact /
 *     follow-the-house panels.
 *   - Reuses the existing client ContactForm component so the API +
 *     email-required + guest-allowed behaviour stays identical.
 */

import Link from 'next/link';
import { Map } from 'lucide-react';
import {
  StoreSocialIcons,
  StoreContactRows,
} from '@/components/shop/StoreSocialIcons';
import { ContactForm } from '@/app/stores/[slug]/contact/contact-form';

const TRUST_DISPLAY_FONT =
  'var(--font-trust-display, "Playfair Display"), Georgia, "Noto Serif Thai", serif';

export interface TrustContactPageProps {
  slug: string;
  storeName: string;
  tagline: string | null;
  /** Store columns needed by StoreContactRows + StoreSocialIcons. */
  store: Parameters<typeof StoreContactRows>[0]['store'] &
    Parameters<typeof StoreSocialIcons>[0]['store'];
  /** Pre-formatted address lines from formatStoreAddressLines. */
  addressLines: string[];
}

export function TrustContactPage({
  slug,
  storeName,
  tagline,
  store,
  addressLines,
}: TrustContactPageProps) {
  const hasAnySocials =
    !!store.facebookUrl ||
    !!store.messengerUrl ||
    !!store.twitterUrl ||
    !!store.instagramUrl ||
    !!store.websiteUrl ||
    !!store.lineId;

  return (
    <div style={{ background: 'var(--shop-bg)', minHeight: '100vh' }}>
      <main className="mx-auto max-w-3xl px-4 pb-24 pt-12 sm:px-6 sm:pt-20 lg:px-8">
        {/* Heritage hero — centered serif cartouche. */}
        <header className="text-center">
          <p
            className="text-[11px] uppercase"
            style={{
              color: 'var(--shop-accent)',
              letterSpacing: '0.32em',
              fontWeight: 600,
            }}
          >
            เมซอน · จดหมายติดต่อ
          </p>

          {/* Title cartouche — gold-rule top + bottom. */}
          <div
            className="mx-auto mt-4 inline-block border-y py-3"
            style={{ borderColor: 'var(--shop-accent)' }}
          >
            <h1
              className="text-4xl sm:text-5xl md:text-6xl"
              style={{
                fontFamily: TRUST_DISPLAY_FONT,
                color: 'var(--shop-ink)',
                fontWeight: 600,
                letterSpacing: '-0.01em',
                lineHeight: 1.05,
              }}
            >
              พร้อมให้บริการคุณ
            </h1>
          </div>

          <p
            className="mx-auto mt-6 max-w-xl text-sm leading-relaxed"
            style={{
              fontFamily: TRUST_DISPLAY_FONT,
              color: 'var(--shop-ink-muted)',
              fontWeight: 500,
            }}
          >
            {tagline ||
              `ติดต่อสอบถามทุกข้อสงสัยมาที่เมซอน ${storeName} ตอบทุกข้อความด้วยตนเอง — เรื่องไซส์ การสั่งทำพิเศษ และคอลเลกชันถัดไป`}
          </p>
        </header>

        {/* Contact form — wrapped in bordered ivory frame. */}
        <section className="mt-12 sm:mt-16">
          <p
            className="mb-3 text-center text-[10px] uppercase"
            style={{
              color: 'var(--shop-ink-muted)',
              letterSpacing: '0.28em',
              fontWeight: 600,
            }}
          >
            ส่งข้อความถึงเรา
          </p>
          <div
            className="rounded-sm border-2 bg-white p-1"
            style={{ borderColor: 'var(--shop-accent)' }}
          >
            {/* Inner padding via the ContactForm card itself; we
                keep the outer gold trim sharp. */}
            <ContactForm storeSlug={slug} storeName={storeName} />
          </div>
        </section>

        {/* Inscribed plate — store details. */}
        <section
          className="mt-12 rounded-sm border-2 bg-white p-8"
          style={{ borderColor: 'var(--shop-accent)' }}
        >
          <div className="flex items-center justify-center gap-2.5 text-center">
            <Map className="h-4 w-4" style={{ color: 'var(--shop-accent)' }} />
            <p
              className="text-[11px] uppercase"
              style={{
                color: 'var(--shop-accent)',
                letterSpacing: '0.32em',
                fontWeight: 600,
              }}
            >
              เยี่ยมชมเมซอน
            </p>
          </div>

          <h2
            className="mt-2 text-center text-2xl sm:text-3xl"
            style={{
              fontFamily: TRUST_DISPLAY_FONT,
              color: 'var(--shop-ink)',
              fontWeight: 600,
              letterSpacing: '-0.01em',
            }}
          >
            ข้อมูลเมซอน
          </h2>

          <div
            aria-hidden
            className="mx-auto mt-4 h-px w-16"
            style={{ background: 'var(--shop-accent)' }}
          />

          <div className="mt-7 grid gap-7 sm:grid-cols-2">
            <div>
              <p
                className="text-[10px] uppercase"
                style={{
                  color: 'var(--shop-ink-muted)',
                  letterSpacing: '0.28em',
                  fontWeight: 600,
                }}
              >
                ที่อยู่
              </p>
              {addressLines.length > 0 ? (
                <div
                  className="mt-3 space-y-1 text-sm leading-relaxed"
                  style={{
                    fontFamily: TRUST_DISPLAY_FONT,
                    color: 'var(--shop-ink)',
                    fontWeight: 500,
                  }}
                >
                  {addressLines.map((l, i) => (
                    <p key={i}>{l}</p>
                  ))}
                </div>
              ) : (
                <p
                  className="mt-3 text-sm"
                  style={{
                    fontFamily: TRUST_DISPLAY_FONT,
                    color: 'var(--shop-ink-muted)',
                    fontWeight: 500,
                  }}
                >
                  จะแจ้งที่อยู่ในเร็ว ๆ นี้
                </p>
              )}
            </div>

            <div className="sm:border-l sm:pl-7" style={{ borderColor: 'var(--shop-border)' }}>
              <p
                className="text-[10px] uppercase"
                style={{
                  color: 'var(--shop-ink-muted)',
                  letterSpacing: '0.28em',
                  fontWeight: 600,
                }}
              >
                ช่องทางติดต่อ
              </p>
              <div className="mt-3">
                <StoreContactRows store={store} />
              </div>
            </div>
          </div>

          {hasAnySocials && (
            <div
              className="mt-7 border-t pt-6 text-center"
              style={{ borderColor: 'var(--shop-accent)' }}
            >
              <p
                className="mb-4 text-[10px] uppercase"
                style={{
                  color: 'var(--shop-ink-muted)',
                  letterSpacing: '0.28em',
                  fontWeight: 600,
                }}
              >
                ติดตามเมซอน
              </p>
              <div className="flex justify-center">
                <StoreSocialIcons store={store} />
              </div>
            </div>
          )}
        </section>

        <div className="mt-12 text-center">
          <Link
            href={`/stores/${slug}`}
            className="text-xs uppercase hover:underline"
            style={{
              color: 'var(--shop-ink-muted)',
              letterSpacing: '0.22em',
              fontWeight: 600,
            }}
          >
            กลับสู่เมซอน
          </Link>
        </div>
      </main>
    </div>
  );
}
