/**
 * Shared about adapter — generic brand-story page used by templates
 * that don't ship a bespoke About component.
 *
 * IMPORTANT: this module must NOT be `'use client'`. lib/templates/registry.ts
 * CALLS `makeAboutAdapter()` at module top-level while building its `templates`
 * map, and registry is reachable from server modules (e.g. /api/admin/stores
 * → lib/store/template-fields → registry). If the factory lived in a client
 * module the call resolved to a client-reference proxy and threw
 * "TypeError: rS is not a function" while collecting page data — breaking
 * every build (same pattern that broke pdp-adapter; see commit 6122a97).
 * The component renders only static JSX (no hooks) so it can live in a
 * server module; client-only children (none here) would handle their own
 * boundary.
 *
 * Everything is CSS-var-driven (`--shop-primary`, `--shop-accent`,
 * `--shop-bg`, `--shop-ink`, `--shop-ink-muted`, `--shop-card`,
 * `--shop-border`) so the family palette of each group cascades in
 * without per-template overrides.
 *
 * Usage in `lib/templates/registry.ts`:
 *
 *   pages: {
 *     about: makeAboutAdapter(),
 *   }
 *
 * Optional palette overrides are forwarded as inline CSS vars on the
 * outer wrapper for templates that want to tint the shared page
 * differently from the rest of their chrome.
 */

import React from 'react';
import Link from 'next/link';
import { Sparkles, Leaf, Award, Heart, ArrowRight } from 'lucide-react';
import type { AboutProps } from '@/lib/templates/types';

export interface BlockPalette {
  primary?: string;
  accent?: string;
  ink?: string;
  inkMuted?: string;
  bg?: string;
  card?: string;
  border?: string;
}

interface ValueCard {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const DEFAULT_VALUES: ValueCard[] = [
  {
    icon: <Sparkles className="h-6 w-6" style={{ color: 'var(--shop-primary)' }} />,
    title: 'คุณภาพคัดสรร',
    description: 'เราคัดเลือกสินค้าทุกชิ้นด้วยมาตรฐานเดียวกับที่ใช้กับครอบครัวของเราเอง',
  },
  {
    icon: <Heart className="h-6 w-6" style={{ color: 'var(--shop-accent)' }} />,
    title: 'ใส่ใจลูกค้า',
    description: 'ทีมงานพร้อมให้คำปรึกษาและดูแลทุกออเดอร์ตั้งแต่สั่งซื้อจนถึงมือคุณ',
  },
  {
    icon: <Leaf className="h-6 w-6" style={{ color: 'var(--shop-primary)' }} />,
    title: 'รับผิดชอบต่อสังคม',
    description: 'เลือกใช้บรรจุภัณฑ์ที่เป็นมิตรกับสิ่งแวดล้อม และทำงานร่วมกับช่างฝีมือท้องถิ่น',
  },
  {
    icon: <Award className="h-6 w-6" style={{ color: 'var(--shop-accent)' }} />,
    title: 'รับประกันคุณภาพ',
    description: 'หากสินค้ามีปัญหาเรายินดีเปลี่ยนหรือคืนเงินภายใน 30 วัน ไม่มีเงื่อนไขซ่อนเร้น',
  },
];

function paletteStyle(palette?: BlockPalette): React.CSSProperties {
  if (!palette) return {};
  const style: Record<string, string> = {};
  if (palette.primary) style['--shop-primary'] = palette.primary;
  if (palette.accent) style['--shop-accent'] = palette.accent;
  if (palette.ink) style['--shop-ink'] = palette.ink;
  if (palette.inkMuted) style['--shop-ink-muted'] = palette.inkMuted;
  if (palette.bg) style['--shop-bg'] = palette.bg;
  if (palette.card) style['--shop-card'] = palette.card;
  if (palette.border) style['--shop-border'] = palette.border;
  return style as React.CSSProperties;
}

export function makeAboutAdapter(palette?: BlockPalette) {
  return function AboutAdapter(props: AboutProps) {
    const { store } = props;
    const tagline = store.tagline ?? store.description ?? 'แบรนด์ที่เชื่อในคุณภาพและการใส่ใจรายละเอียด';
    const description = store.description
      ?? `${store.name} ก่อตั้งขึ้นด้วยความตั้งใจที่จะส่งมอบสินค้าและบริการที่ดีที่สุดให้กับลูกค้าทุกท่าน เราคัดสรรสินค้าด้วยมาตรฐานที่เข้มงวด และให้ความสำคัญกับประสบการณ์ของลูกค้าในทุกขั้นตอน`;

    return (
      <div
        className="min-h-screen"
        style={{
          ...paletteStyle(palette),
          backgroundColor: 'var(--shop-bg, #ffffff)',
          color: 'var(--shop-ink, #18181b)',
        }}
      >
        {/* Hero */}
        <section className="px-4 py-16 sm:py-24 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div
              className="mx-auto mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full"
              style={{
                backgroundColor: 'var(--shop-card, #f4f4f5)',
                border: '1px solid var(--shop-border, #e4e4e7)',
              }}
            >
              <Sparkles className="h-7 w-7" style={{ color: 'var(--shop-primary)' }} />
            </div>
            <h1
              className="mb-4 text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl"
              style={{ color: 'var(--shop-ink)' }}
            >
              เกี่ยวกับ {store.name}
            </h1>
            <p
              className="text-lg leading-relaxed"
              style={{ color: 'var(--shop-ink-muted, #71717a)' }}
            >
              {tagline}
            </p>
          </div>
        </section>

        {/* Story */}
        <section className="px-4 pb-16">
          <div
            className="mx-auto max-w-3xl rounded-2xl p-8 sm:p-12"
            style={{
              backgroundColor: 'var(--shop-card, #fafafa)',
              border: '1px solid var(--shop-border, #e4e4e7)',
            }}
          >
            <h2
              className="mb-4 text-2xl font-semibold"
              style={{ color: 'var(--shop-ink)' }}
            >
              เรื่องราวของเรา
            </h2>
            <p
              className="text-base leading-relaxed sm:text-lg"
              style={{ color: 'var(--shop-ink-muted, #52525b)' }}
            >
              {description}
            </p>
          </div>
        </section>

        {/* Values */}
        <section className="px-4 pb-16 sm:pb-24">
          <div className="mx-auto max-w-6xl">
            <h2
              className="mb-12 text-center text-2xl font-semibold sm:text-3xl"
              style={{ color: 'var(--shop-ink)' }}
            >
              สิ่งที่เราให้ความสำคัญ
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {DEFAULT_VALUES.map((value, i) => (
                <div
                  key={i}
                  className="rounded-xl p-6 transition-shadow hover:shadow-md"
                  style={{
                    backgroundColor: 'var(--shop-card, #ffffff)',
                    border: '1px solid var(--shop-border, #e4e4e7)',
                  }}
                >
                  <div
                    className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg"
                    style={{
                      backgroundColor: 'var(--shop-bg, #f4f4f5)',
                    }}
                  >
                    {value.icon}
                  </div>
                  <h3
                    className="mb-2 text-lg font-semibold"
                    style={{ color: 'var(--shop-ink)' }}
                  >
                    {value.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: 'var(--shop-ink-muted, #71717a)' }}
                  >
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 pb-20">
          <div
            className="mx-auto max-w-3xl rounded-2xl p-10 text-center sm:p-14"
            style={{
              backgroundColor: 'var(--shop-primary)',
              color: '#ffffff',
            }}
          >
            <h2 className="mb-4 text-2xl font-semibold sm:text-3xl">
              พร้อมเริ่มต้นช้อปกับ {store.name} แล้วใช่ไหม
            </h2>
            <p className="mb-8 text-base opacity-90 sm:text-lg">
              ดูสินค้าทั้งหมดของเราและค้นพบของชิ้นโปรดของคุณวันนี้
            </p>
            <Link
              href={`/stores/${store.slug}/category`}
              className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3 text-base font-semibold transition-opacity hover:opacity-90"
              style={{ color: 'var(--shop-primary)' }}
            >
              ดูสินค้าทั้งหมด
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </div>
    );
  };
}
