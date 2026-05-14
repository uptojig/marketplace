/**
 * SpecialtyContactPage — bespoke artisan / vintage contact layout.
 *
 * Structural difference from the generic /stores/[slug]/contact page
 * AND from the fashion-beauty bespoke variant:
 *   - Hand-script "Send a letter" eyebrow paired with a Fraunces
 *     slab-serif h1 "Say hello to the maker" — workshop-letter voice,
 *     not magazine letter.
 *   - Form sits inside a kraft-textured card (data-specialty-kraft=
 *     "true") with rounded-md corners and a hairline taupe border —
 *     reads as a stationery sheet on a workbench.
 *   - Store info renders as a "Visit the studio" kraft card UNDER the
 *     form with hand-script Caveat row labels (Address / Direct /
 *     Follow), softer than the FB italic-serif rows.
 *
 * Reuses the existing client-side ContactForm so the API + email-
 * required + guest-allowed behaviour stays identical. Only the chrome
 * around it is bespoke.
 */

import Link from 'next/link';
import { Map } from 'lucide-react';
import {
  StoreSocialIcons,
  StoreContactRows,
} from '@/components/shop/StoreSocialIcons';
import { ContactForm } from '@/app/stores/[slug]/contact/contact-form';

const SPECIALTY_DISPLAY_FONT =
  'var(--font-specialty-display, "Fraunces"), Georgia, "Noto Serif Thai", serif';

const SPECIALTY_HAND_FONT =
  'var(--font-specialty-hand, "Caveat"), "Permanent Marker", cursive';

export interface SpecialtyContactPageProps {
  slug: string;
  storeName: string;
  tagline: string | null;
  /** Store columns needed by StoreContactRows + StoreSocialIcons. */
  store: Parameters<typeof StoreContactRows>[0]['store'] &
    Parameters<typeof StoreSocialIcons>[0]['store'];
  /** Pre-formatted address lines from formatStoreAddressLines. */
  addressLines: string[];
}

export function SpecialtyContactPage({
  slug,
  storeName,
  tagline,
  store,
  addressLines,
}: SpecialtyContactPageProps) {
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
        {/* Workshop-letter intro */}
        <header className="text-center">
          <p
            className="text-2xl"
            style={{
              fontFamily: SPECIALTY_HAND_FONT,
              color: 'var(--shop-accent)',
            }}
          >
            ส่งจดหมาย
          </p>
          <h1
            className="mt-1 text-4xl sm:text-5xl"
            style={{
              fontFamily: SPECIALTY_DISPLAY_FONT,
              color: 'var(--shop-ink)',
              fontWeight: 500,
              letterSpacing: '-0.005em',
              lineHeight: 1.05,
            }}
          >
            ทักทายช่างฝีมือ
          </h1>
          <div
            aria-hidden
            className="mx-auto mt-5 h-px w-12"
            style={{ background: 'var(--shop-accent)' }}
          />
          <p
            className="mx-auto mt-6 max-w-xl text-base leading-relaxed"
            style={{ color: 'var(--shop-ink-muted)' }}
          >
            {tagline ||
              `ไม่ว่าจะมีคำถามเกี่ยวกับงาน อยากสั่งทำพิเศษ หรือแค่อยากทักทาย — เราอ่านทุกจดหมาย ${storeName} จะเขียนตอบกลับด้วยมือ`}
          </p>
        </header>

        {/* Contact form — kraft stationery card */}
        <section
          data-specialty-kraft="true"
          className="mt-12 rounded-md border p-6 shadow-sm sm:mt-16 sm:p-8"
          style={{ borderColor: 'var(--shop-border)' }}
        >
          <ContactForm storeSlug={slug} storeName={storeName} />
        </section>

        {/* Visit the studio — kraft card under the form */}
        <section
          data-specialty-kraft="true"
          className="mt-12 rounded-md border p-8 shadow-sm"
          style={{ borderColor: 'var(--shop-border)' }}
        >
          <div className="flex items-center gap-2.5">
            <Map className="h-4 w-4" style={{ color: 'var(--shop-primary)' }} />
            <p
              className="text-2xl"
              style={{
                fontFamily: SPECIALTY_HAND_FONT,
                color: 'var(--shop-accent)',
              }}
            >
              เยี่ยมชมสตูดิโอ
            </p>
          </div>
          <h2
            className="mt-1 text-2xl"
            style={{
              fontFamily: SPECIALTY_DISPLAY_FONT,
              color: 'var(--shop-ink)',
              fontWeight: 500,
            }}
          >
            ที่ {storeName} ทำงาน
          </h2>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div>
              <p
                className="text-xl"
                style={{
                  fontFamily: SPECIALTY_HAND_FONT,
                  color: 'var(--shop-accent)',
                }}
              >
                ที่อยู่
              </p>
              {addressLines.length > 0 ? (
                <div
                  className="mt-2 space-y-0.5 text-sm"
                  style={{ color: 'var(--shop-ink)' }}
                >
                  {addressLines.map((l, i) => (
                    <p key={i}>{l}</p>
                  ))}
                </div>
              ) : (
                <p
                  className="mt-2 text-sm"
                  style={{ color: 'var(--shop-ink-muted)' }}
                >
                  ที่อยู่จะปรากฏเร็วๆ นี้
                </p>
              )}
            </div>

            <div>
              <p
                className="text-xl"
                style={{
                  fontFamily: SPECIALTY_HAND_FONT,
                  color: 'var(--shop-accent)',
                }}
              >
                เขียนถึงเรา
              </p>
              <div className="mt-2">
                <StoreContactRows store={store} />
              </div>
            </div>
          </div>

          {hasAnySocials && (
            <div
              className="mt-6 border-t border-dashed pt-5"
              style={{ borderColor: 'var(--shop-accent)' }}
            >
              <p
                className="mb-3 text-xl"
                style={{
                  fontFamily: SPECIALTY_HAND_FONT,
                  color: 'var(--shop-accent)',
                }}
              >
                ติดตามสตูดิโอ
              </p>
              <StoreSocialIcons store={store} />
            </div>
          )}
        </section>

        <div className="mt-10 text-center">
          <Link
            href={`/stores/${slug}`}
            className="text-lg hover:underline"
            style={{
              fontFamily: SPECIALTY_HAND_FONT,
              color: 'var(--shop-ink-muted)',
            }}
          >
            ← กลับสตูดิโอ
          </Link>
        </div>
      </main>
    </div>
  );
}
