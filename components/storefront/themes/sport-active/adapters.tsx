'use client';
import React from 'react';
import type {
  HeaderProps as ScaffoldHeaderProps,
  FooterProps as ScaffoldFooterProps,
  AnnouncementStripProps as ScaffoldStripProps,
} from '@/lib/templates/types';

import { Header as SportActiveHeader } from './chrome/Header';
import { Footer as SportActiveFooter } from './chrome/Footer';
import { AnnouncementStrip as SportActiveStrip } from './chrome/AnnouncementStrip';

export function SportActiveHeaderAdapter(props: ScaffoldHeaderProps) {
  return (
    <SportActiveHeader
      storeSlug={props.storeSlug}
      storeName={props.storeName}
      storeLogoUrl={props.storeLogoUrl}
      categories={props.categories ?? []}
      accent={props.accent}
    />
  );
}

export function SportActiveFooterAdapter(props: ScaffoldFooterProps) {
  return (
    <SportActiveFooter
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

export function SportActiveStripAdapter(props: ScaffoldStripProps) {
  return <SportActiveStrip storeName={props.storeName} />;
}
