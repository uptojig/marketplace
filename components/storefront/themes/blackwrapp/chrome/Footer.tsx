'use client';

import React from 'react';
import Link from 'next/link';
import { Facebook, Instagram, MessageCircle } from 'lucide-react';

interface Props {
  store: {
    name: string;
    slug: string;
    logoUrl?: string | null;
    description?: string | null;
    tagline?: string | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
    facebookUrl?: string | null;
    instagramUrl?: string | null;
    lineId?: string | null;
    addressLine1?: string | null;
    addressLine2?: string | null;
    subdistrict?: string | null;
    district?: string | null;
    province?: string | null;
    postalCode?: string | null;
    country?: string | null;
  };
  categories?: string[];
  availableSupportPages?: string[];
}

const SUPPORT_LABELS: Record<string, string> = {
  about: 'เกี่ยวกับเรา',
  faq: 'คำถามที่พบบ่อย',
  shipping: 'การจัดส่ง',
  returns: 'การคืนสินค้า',
  privacy: 'นโยบายความเป็นส่วนตัว',
  terms: 'ข้อกำหนดการใช้งาน',
};

/**
 * BlackWrapp — bespoke footer (scaffold).
 */
export function Footer({ store, categories = [], availableSupportPages = [] }: Props) {
  const supportLinks = availableSupportPages.filter((s) => SUPPORT_LABELS[s]);
  return (
    <footer
      className="bg-[var(--shop-bg-soft)] border-t border-[var(--shop-border)] text-[var(--shop-ink)] font-[family:var(--font-prompt)]"
    >
      <div className="max-w-7xl mx-auto px-4 py-12 grid gap-8 md:grid-cols-4">
        <div>
          <h3 className="font-[family:var(--font-kanit)] font-bold text-lg mb-2">
            {store.name}
          </h3>
          {store.tagline && (
            <p className="text-sm text-[var(--shop-ink-muted)]">{store.tagline}</p>
          )}
        </div>

        {categories.length > 0 && (
          <div>
            <h4 className="font-bold mb-2">หมวดหมู่</h4>
            <ul className="space-y-1 text-sm">
              {categories.slice(0, 6).map((cat) => (
                <li key={cat}>
                  <Link
                    href={`/stores/${store.slug}/category?cat=${encodeURIComponent(cat)}`}
                    className="hover:underline"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {supportLinks.length > 0 && (
          <div>
            <h4 className="font-bold mb-2">บริการลูกค้า</h4>
            <ul className="space-y-1 text-sm">
              {supportLinks.map((slug) => (
                <li key={slug}>
                  <Link href={`/stores/${store.slug}/${slug}`} className="hover:underline">
                    {SUPPORT_LABELS[slug]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <h4 className="font-bold mb-2">ติดต่อเรา</h4>
          <ul className="space-y-1 text-sm">
            {store.contactPhone && <li>โทร: {store.contactPhone}</li>}
            {store.contactEmail && <li>{store.contactEmail}</li>}
          </ul>
          <div className="flex gap-3 mt-3">
            {store.facebookUrl && (
              <a href={store.facebookUrl} aria-label="Facebook" target="_blank" rel="noreferrer">
                <Facebook className="h-5 w-5" />
              </a>
            )}
            {store.instagramUrl && (
              <a href={store.instagramUrl} aria-label="Instagram" target="_blank" rel="noreferrer">
                <Instagram className="h-5 w-5" />
              </a>
            )}
            {store.lineId && (
              <span aria-label="LINE" title={`LINE: ${store.lineId}`}>
                <MessageCircle className="h-5 w-5" />
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--shop-border)] py-4 text-center text-xs text-[var(--shop-ink-muted)]">
        © {new Date().getFullYear()} {store.name}
      </div>
    </footer>
  );
}
