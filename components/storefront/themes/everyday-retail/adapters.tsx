'use client';
import React from 'react';
import type {
  HeaderProps as ScaffoldHeaderProps,
  FooterProps as ScaffoldFooterProps,
  AnnouncementStripProps as ScaffoldStripProps,
} from '@/lib/templates/types';

import { Header as EverydayRetailHeader } from './chrome/Header';
import { Footer as EverydayRetailFooter } from './chrome/Footer';
import { AnnouncementStrip as EverydayRetailStrip } from './chrome/AnnouncementStrip';

export function EverydayRetailHeaderAdapter(props: ScaffoldHeaderProps) {
  return (
    <EverydayRetailHeader
      storeSlug={props.storeSlug}
      storeName={props.storeName}
      storeLogoUrl={props.storeLogoUrl}
      categories={props.categories ?? []}
      accent={props.accent}
    />
  );
}

export function EverydayRetailFooterAdapter(props: ScaffoldFooterProps) {
  return (
    <EverydayRetailFooter
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

export function EverydayRetailStripAdapter(props: ScaffoldStripProps) {
  return <EverydayRetailStrip storeName={props.storeName} />;
}
