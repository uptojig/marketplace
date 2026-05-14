/**
 * FashionBeautyContactPage — bespoke FB contact layout.
 *
 * Structural difference from the generic /stores/[slug]/contact page:
 *   - Editorial intro essay reads like a magazine letter ("Say hello to
 *     our team") instead of a plain h1.
 *   - Form sits BELOW the essay in a single-column max-w-2xl frame
 *     rather than next to a side-rail (form-left / info-right). The
 *     boutique-style page wants the visitor to read the welcome first.
 *   - Store info card is a soft-pink folded panel UNDER the form with
 *     italic-serif row labels — feels like a stationery card.
 *
 * Reuses the existing client-side ContactForm (kept as drop-in child)
 * so the API + email-required + guest-allowed behaviour stays
 * identical. Only the chrome around it is bespoke.
 */

import Link from 'next/link';
import { Map } from 'lucide-react';
import { formatStoreAddressLines } from '@/lib/format/storeAddress';
import {
  StoreSocialIcons,
  StoreContactRows,
} from '@/components/shop/StoreSocialIcons';
import { ContactForm } from '@/app/stores/[slug]/contact/contact-form';

const FB_DISPLAY_FONT =
  'var(--font-fashion-display, "Cormorant Garamond"), "Playfair Display", Georgia, "Noto Serif Thai", serif';

export interface FashionBeautyContactPageProps {
  slug: string;
  storeName: string;
  tagline: string | null;
  /** Store columns needed by StoreContactRows + StoreSocialIcons. */
  store: Parameters<typeof StoreContactRows>[0]['store'] &
    Parameters<typeof StoreSocialIcons>[0]['store'];
  /** Pre-formatted address lines from formatStoreAddressLines. */
  addressLines: string[];
}

export function FashionBeautyContactPage({
  slug,
  storeName,
  tagline,
  store,
  addressLines,
}: FashionBeautyContactPageProps) {
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
        {/* Editorial intro essay */}
        <header className="text-center">
          <p
            className="text-[11px] uppercase tracking-[0.28em]"
            style={{ color: 'var(--shop-ink-muted)' }}
          >
            Get in touch
          </p>
          <h1
            className="mt-3 text-5xl sm:text-6xl"
            style={{
              fontFamily: FB_DISPLAY_FONT,
              color: 'var(--shop-ink)',
              fontWeight: 500,
              letterSpacing: '-0.005em',
              lineHeight: 1.05,
            }}
          >
            Say hello to our team
          </h1>
          <div
            aria-hidden
            className="mx-auto mt-5 h-px w-12"
            style={{ background: 'var(--shop-accent)' }}
          />
          <p
            className="mx-auto mt-6 max-w-xl text-base italic leading-relaxed"
            style={{
              fontFamily: FB_DISPLAY_FONT,
              color: 'var(--shop-ink-muted)',
            }}
          >
            {tagline ||
              `Whether you have a styling question, want help finding the right size, or just want to chat about the next collection — we're here. ${storeName} reads every message.`}
          </p>
        </header>

        {/* Contact form — keeps the existing client component */}
        <div className="mt-12 sm:mt-16">
          <ContactForm storeSlug={slug} storeName={storeName} />
        </div>

        {/* Stationery-card store info — soft pink panel below */}
        <section
          className="mt-12 rounded-2xl border p-8 shadow-sm"
          style={{
            background: 'var(--shop-muted)',
            borderColor: 'var(--shop-accent)',
          }}
        >
          <div className="flex items-center gap-2.5">
            <Map className="h-4 w-4" style={{ color: 'var(--shop-primary)' }} />
            <h2
              className="text-xl"
              style={{
                fontFamily: FB_DISPLAY_FONT,
                color: 'var(--shop-ink)',
                fontWeight: 500,
              }}
            >
              Visit the boutique
            </h2>
          </div>

          <div className="mt-5 grid gap-6 sm:grid-cols-2">
            <div>
              <p
                className="text-[11px] uppercase tracking-[0.22em]"
                style={{ color: 'var(--shop-ink-muted)' }}
              >
                Address
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
                  className="mt-2 text-sm italic"
                  style={{
                    fontFamily: FB_DISPLAY_FONT,
                    color: 'var(--shop-ink-muted)',
                  }}
                >
                  Address will appear soon.
                </p>
              )}
            </div>

            <div>
              <p
                className="text-[11px] uppercase tracking-[0.22em]"
                style={{ color: 'var(--shop-ink-muted)' }}
              >
                Direct
              </p>
              <div className="mt-2">
                <StoreContactRows store={store} />
              </div>
            </div>
          </div>

          {hasAnySocials && (
            <div className="mt-6 border-t pt-5" style={{ borderColor: 'var(--shop-accent)' }}>
              <p
                className="mb-3 text-[11px] uppercase tracking-[0.22em]"
                style={{ color: 'var(--shop-ink-muted)' }}
              >
                Follow the boutique
              </p>
              <StoreSocialIcons store={store} />
            </div>
          )}
        </section>

        <div className="mt-10 text-center">
          <Link
            href={`/stores/${slug}`}
            className="text-sm italic hover:underline"
            style={{
              fontFamily: FB_DISPLAY_FONT,
              color: 'var(--shop-ink-muted)',
            }}
          >
            ← Back to the boutique
          </Link>
        </div>
      </main>
    </div>
  );
}
