'use client';
import React from 'react';
import type {
  HeaderProps as ScaffoldHeaderProps,
  FooterProps as ScaffoldFooterProps,
  AnnouncementStripProps as ScaffoldStripProps,
} from '@/lib/templates/types';

import { Header as WholesaleB2bHeader } from './chrome/Header';
import { Footer as WholesaleB2bFooter } from './chrome/Footer';
import { AnnouncementStrip as WholesaleB2bStrip } from './chrome/AnnouncementStrip';

export function WholesaleB2bHeaderAdapter(props: ScaffoldHeaderProps) {
  return (
    <WholesaleB2bHeader
      storeSlug={props.storeSlug}
      storeName={props.storeName}
      storeLogoUrl={props.storeLogoUrl}
      categories={props.categories ?? []}
      accent={props.accent}
    />
  );
}

export function WholesaleB2bFooterAdapter(props: ScaffoldFooterProps) {
  return (
    <WholesaleB2bFooter
      store={{
        name: props.store.name,
        slug: props.store.slug,
        facebookUrl: props.store.facebookUrl,
        instagramUrl: props.store.instagramUrl,
        twitterUrl: props.store.twitterUrl,
      }}
      categories={props.categories ?? []}
      accent={props.accent}
    />
  );
}

export function WholesaleB2bStripAdapter(props: ScaffoldStripProps) {
  return <WholesaleB2bStrip storeName={props.storeName} />;
}
