'use client';
import React from 'react';
import type {
  HeaderProps as ScaffoldHeaderProps,
  FooterProps as ScaffoldFooterProps,
  AnnouncementStripProps as ScaffoldStripProps,
} from '@/lib/templates/types';

import { Header as LookbookHeader } from './chrome/Header';
import { Footer as LookbookFooter } from './chrome/Footer';
import { AnnouncementStrip as LookbookStrip } from './chrome/AnnouncementStrip';

export function LookbookHeaderAdapter(props: ScaffoldHeaderProps) {
  return (
    <LookbookHeader
      storeSlug={props.storeSlug}
      storeName={props.storeName}
      storeLogoUrl={props.storeLogoUrl}
      categories={props.categories ?? []}
      accent={props.accent}
    />
  );
}

export function LookbookFooterAdapter(props: ScaffoldFooterProps) {
  return (
    <LookbookFooter
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

export function LookbookStripAdapter(props: ScaffoldStripProps) {
  return <LookbookStrip storeName={props.storeName} />;
}
