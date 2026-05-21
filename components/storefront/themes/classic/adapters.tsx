'use client';
import React from 'react';
import type {
  HeaderProps as ScaffoldHeaderProps,
  FooterProps as ScaffoldFooterProps,
  AnnouncementStripProps as ScaffoldStripProps,
} from '@/lib/templates/types';

import { Header as ClassicHeader } from './chrome/Header';
import { Footer as ClassicFooter } from './chrome/Footer';
import { AnnouncementStrip as ClassicStrip } from './chrome/AnnouncementStrip';

export function ClassicHeaderAdapter(props: ScaffoldHeaderProps) {
  return (
    <ClassicHeader
      storeSlug={props.storeSlug}
      storeName={props.storeName}
      storeLogoUrl={props.storeLogoUrl}
      categories={props.categories ?? []}
      accent={props.accent}
    />
  );
}

export function ClassicFooterAdapter(props: ScaffoldFooterProps) {
  return (
    <ClassicFooter
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

export function ClassicStripAdapter(props: ScaffoldStripProps) {
  return <ClassicStrip storeName={props.storeName} />;
}
