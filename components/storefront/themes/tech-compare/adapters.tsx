'use client';
import React from 'react';
import type {
  HeaderProps as ScaffoldHeaderProps,
  FooterProps as ScaffoldFooterProps,
  AnnouncementStripProps as ScaffoldStripProps,
} from '@/lib/templates/types';

import { Header as TechCompareHeader } from './chrome/Header';
import { Footer as TechCompareFooter } from './chrome/Footer';
import { AnnouncementStrip as TechCompareStrip } from './chrome/AnnouncementStrip';

export function TechCompareHeaderAdapter(props: ScaffoldHeaderProps) {
  return (
    <TechCompareHeader
      storeSlug={props.storeSlug}
      storeName={props.storeName}
      storeLogoUrl={props.storeLogoUrl}
      categories={props.categories ?? []}
      accent={props.accent}
    />
  );
}

export function TechCompareFooterAdapter(props: ScaffoldFooterProps) {
  return (
    <TechCompareFooter
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

export function TechCompareStripAdapter(props: ScaffoldStripProps) {
  return <TechCompareStrip storeName={props.storeName} />;
}
