'use client';

/**
 * Handmade — scaffold→designer Prop adapters.
 *
 * Translates the scaffold `HeaderProps` / `FooterProps` /
 * `AnnouncementStripProps` from `lib/templates/types.ts` into the
 * Prop shapes the bespoke chrome components below want. Pattern
 * mirrors `components/storefront/themes/talad-see-sod/adapters.tsx`
 * and `sai-sing/adapters.tsx`.
 *
 * REGISTRY WIRING IS DELIBERATELY ABSENT — `lib/templates/registry.ts`
 * is NOT modified here. Wire these adapters into the `handmade` entry
 * AFTER the B1+B2 multi-page work merges (see B1/B2 agents), so we
 * avoid a merge conflict on the shared registry file. Example wiring
 * is documented in the agent report.
 */

import React from 'react';
import type {
  HeaderProps as ScaffoldHeaderProps,
  FooterProps as ScaffoldFooterProps,
  AnnouncementStripProps as ScaffoldStripProps,
} from '@/lib/templates/types';

import { Header as HandmadeHeader } from './chrome/Header';
import { Footer as HandmadeFooter } from './chrome/Footer';
import { AnnouncementStrip as HandmadeStrip } from './chrome/AnnouncementStrip';

export function HandmadeHeaderAdapter(props: ScaffoldHeaderProps) {
  return (
    <HandmadeHeader
      storeSlug={props.storeSlug}
      storeName={props.storeName}
      storeLogoUrl={props.storeLogoUrl}
      categories={props.categories ?? []}
      accent={props.accent}
    />
  );
}

export function HandmadeFooterAdapter(props: ScaffoldFooterProps) {
  return (
    <HandmadeFooter
      store={{
        id: props.store.id,
        name: props.store.name,
        slug: props.store.slug,
        description: props.store.description,
        tagline: props.store.tagline,
        contactEmail: props.store.contactEmail,
        contactPhone: props.store.contactPhone,
        facebookUrl: props.store.facebookUrl,
        messengerUrl: props.store.messengerUrl,
        instagramUrl: props.store.instagramUrl,
        twitterUrl: props.store.twitterUrl,
        lineId: props.store.lineId,
        addressLine1: props.store.addressLine1,
        addressLine2: props.store.addressLine2,
        subdistrict: props.store.subdistrict,
        district: props.store.district,
        province: props.store.province,
        postalCode: props.store.postalCode,
      }}
      categories={props.categories ?? []}
      accent={props.accent}
    />
  );
}

export function HandmadeStripAdapter(props: ScaffoldStripProps) {
  return (
    <HandmadeStrip
      storeName={props.storeName}
      message={props.message}
      mobileMessage={props.mobileMessage}
    />
  );
}

// Re-export the palette for downstream callers (e.g. registry wiring
// that wants to pass raw hexes to block adapters).
export { HANDMADE_PALETTE } from './palette';
export type { HandmadePaletteShape } from './palette';
