'use client';
import React from 'react';
import type {
  HeaderProps as ScaffoldHeaderProps,
  FooterProps as ScaffoldFooterProps,
  AnnouncementStripProps as ScaffoldStripProps,
} from '@/lib/templates/types';

import { Header as LiveCommerceHeader } from './chrome/Header';
import { Footer as LiveCommerceFooter } from './chrome/Footer';
import { AnnouncementStrip as LiveCommerceStrip } from './chrome/AnnouncementStrip';

export function LiveCommerceHeaderAdapter(props: ScaffoldHeaderProps) {
  return (
    <LiveCommerceHeader
      storeSlug={props.storeSlug}
      storeName={props.storeName}
      storeLogoUrl={props.storeLogoUrl}
      categories={props.categories ?? []}
      accent={props.accent}
    />
  );
}

export function LiveCommerceFooterAdapter(props: ScaffoldFooterProps) {
  return (
    <LiveCommerceFooter
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

export function LiveCommerceStripAdapter(props: ScaffoldStripProps) {
  return <LiveCommerceStrip storeName={props.storeName} />;
}
