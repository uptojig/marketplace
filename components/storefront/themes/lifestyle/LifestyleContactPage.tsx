/**
 * LifestyleContactPage — bespoke lifestyle contact layout.
 *
 * Structural difference from the generic /stores/[slug]/contact page
 * AND the FashionBeautyContactPage:
 *   - Warm conversational hero ("Drop us a line") in Outfit / Plus
 *     Jakarta Sans display weight 600 — geometric humanist sans, NOT
 *     italic serif. Sage eyebrow above + warm sub-copy.
 *   - Sage hand-drawn squiggle SVG divider below the hero, NOT a hairline.
 *   - Form sits inside a soft amber-100 (peach) muted rounded-3xl card
 *     with a heavy soft drop shadow via data-lifestyle-frame, NOT
 *     bare on the page background.
 *   - Store info renders as a "Find us" friendly panel — sage Map pin in
 *     a circular tile + warm Outfit display heading, address + direct
 *     contacts laid out in a 2-up grid.
 *   - Optional "We respond within a day" warm reassurance line below
 *     the form — friendly, not stationery-ish.
 *
 * Reuses the existing client-side ContactForm (kept as drop-in child)
 * so the API + email-required + guest-allowed behaviour stays
 * identical. Only the chrome around it is bespoke.
 */

import Link from 'next/link';
import { ArrowLeft, Map, MapPin, MessageCircle, Sparkles } from 'lucide-react';
import {
  StoreSocialIcons,
  StoreContactRows,
} from '@/components/shop/StoreSocialIcons';
import { ContactForm } from '@/app/stores/[slug]/contact/contact-form';

const LIFESTYLE_DISPLAY_FONT =
  'var(--font-lifestyle-display, "Outfit"), "Plus Jakarta Sans", "DM Sans", "Prompt", system-ui, sans-serif';

export interface LifestyleContactPageProps {
  slug: string;
  storeName: string;
  tagline: string | null;
  /** Store columns needed by StoreContactRows + StoreSocialIcons. */
  store: Parameters<typeof StoreContactRows>[0]['store'] &
    Parameters<typeof StoreSocialIcons>[0]['store'];
  /** Pre-formatted address lines from formatStoreAddressLines. */
  addressLines: string[];
}

export function LifestyleContactPage({
  slug,
  storeName,
  tagline,
  store,
  addressLines,
}: LifestyleContactPageProps) {
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
        {/* Warm conversational hero */}
        <header className="text-center">
          <p
            className="text-xs font-semibold uppercase tracking-[0.18em]"
            style={{ color: 'var(--shop-accent)' }}
          >
            Say hi
          </p>
          <h1
            className="mt-3 text-4xl sm:text-5xl md:text-6xl"
            style={{
              fontFamily: LIFESTYLE_DISPLAY_FONT,
              color: 'var(--shop-ink)',
              fontWeight: 600,
              letterSpacing: '-0.01em',
              lineHeight: 1.05,
            }}
          >
            Drop us a line
          </h1>
          {/* Sage hand-drawn squiggle divider */}
          <div
            data-lifestyle-squiggle="true"
            className="mx-auto mt-5 w-32"
            aria-hidden
          />
          <p
            className="mx-auto mt-5 max-w-xl text-base leading-relaxed"
            style={{ color: 'var(--shop-ink-muted)' }}
          >
            {tagline ||
              `Got a question about a piece, a recommendation, or just want to say hello? ${storeName} reads every message and writes back.`}
          </p>
        </header>

        {/* Form lives inside a soft peach muted card with shadow */}
        <section
          data-lifestyle-frame="true"
          className="mt-12 rounded-3xl p-6 sm:p-8"
          style={{ background: 'var(--shop-muted)' }}
        >
          <div className="mb-5 flex items-center gap-2.5">
            <span
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-white"
              style={{ background: 'var(--shop-accent)' }}
              aria-hidden
            >
              <MessageCircle className="h-4 w-4" />
            </span>
            <h2
              className="text-xl sm:text-2xl"
              style={{
                fontFamily: LIFESTYLE_DISPLAY_FONT,
                color: 'var(--shop-ink)',
                fontWeight: 600,
                letterSpacing: '-0.01em',
              }}
            >
              Send a message
            </h2>
          </div>
          <ContactForm storeSlug={slug} storeName={storeName} />

          <p
            className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold"
            style={{ color: 'var(--shop-accent)' }}
          >
            <Sparkles className="h-3.5 w-3.5" />
            We usually reply within a day
          </p>
        </section>

        {/* "Find us" friendly panel — store info card */}
        <section
          data-lifestyle-frame="true"
          className="mt-10 rounded-3xl bg-white p-6 sm:p-8"
        >
          <div className="flex items-center gap-2.5">
            <span
              className="inline-flex h-9 w-9 items-center justify-center rounded-full"
              style={{
                background: 'var(--shop-muted)',
                color: 'var(--shop-accent)',
              }}
              aria-hidden
            >
              <Map className="h-4 w-4" />
            </span>
            <h2
              className="text-xl sm:text-2xl"
              style={{
                fontFamily: LIFESTYLE_DISPLAY_FONT,
                color: 'var(--shop-ink)',
                fontWeight: 600,
                letterSpacing: '-0.01em',
              }}
            >
              Find us
            </h2>
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div>
              <p
                className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em]"
                style={{ color: 'var(--shop-ink-muted)' }}
              >
                <MapPin className="h-3.5 w-3.5" />
                Address
              </p>
              {addressLines.length > 0 ? (
                <div
                  className="mt-2 space-y-0.5 text-sm leading-relaxed"
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
                  Address coming soon.
                </p>
              )}
            </div>

            <div>
              <p
                className="text-xs font-semibold uppercase tracking-[0.18em]"
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
            <div
              className="mt-6 border-t pt-5"
              style={{ borderColor: 'var(--shop-border)' }}
            >
              <p
                className="mb-3 text-xs font-semibold uppercase tracking-[0.18em]"
                style={{ color: 'var(--shop-ink-muted)' }}
              >
                Follow along
              </p>
              <StoreSocialIcons store={store} />
            </div>
          )}
        </section>

        <div className="mt-10 text-center">
          <Link
            href={`/stores/${slug}`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold hover:underline"
            style={{ color: 'var(--shop-ink-muted)' }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to {storeName}
          </Link>
        </div>
      </main>
    </div>
  );
}
