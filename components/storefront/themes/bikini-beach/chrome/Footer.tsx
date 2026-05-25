'use client';

import React from 'react';
import {
  IconBrandInstagram,
  IconBrandTiktok,
  IconBrandLine,
  IconBrandFacebook,
  IconBrandPinterest,
  IconMail,
  IconPhone,
  IconMapPin,
  IconBrandApple,
  IconBrandGooglePlay,
} from '@tabler/icons-react';

export interface FooterNavColumn {
  heading: string;
  links: { label: string; href: string }[];
}

export interface SocialLink {
  network:
    | 'instagram'
    | 'tiktok'
    | 'line'
    | 'facebook'
    | 'pinterest'
    | (string & {});
  href: string;
  label?: string;
}

export interface FooterProps {
  storeName?: string;
  storeLogoUrl?: string | null;
  tagline?: string;
  navColumns?: FooterNavColumn[];
  paymentMethods?: string[];
  socialLinks?: SocialLink[];
  /** Optional contact rows shown in the right column */
  contact?: { line?: string; email?: string; phone?: string; address?: string };
  /** Show app store buttons */
  showAppButtons?: boolean;
  /** Copyright line; defaults to current year + storeName */
  copyright?: string;
  bottomLinks?: { label: string; href: string }[];
}

// Empty defaults — the adapter (`adapters.tsx`) is the single source of
// truth for nav columns + bottom links, threading per-store URLs from
// `storeUrls(slug)`. Previously this file shipped `DEFAULT_NAV` with
// hardcoded `/shop?cat=...` / `/help#...` / `/about` paths that worked
// for the designer's standalone preview but would have routed to wrong
// (non-existent) marketplace routes if ever rendered without an adapter.
// Kept empty so a missing-adapter bug renders a visibly empty footer
// instead of silently broken links.
const DEFAULT_NAV: FooterNavColumn[] = [];

const DEFAULT_SOCIAL: SocialLink[] = [
  { network: 'instagram', href: 'https://instagram.com/bikini551' },
  { network: 'tiktok', href: 'https://tiktok.com/@bikini551' },
  { network: 'line', href: 'https://line.me/R/ti/p/@bikini551' },
  { network: 'facebook', href: 'https://facebook.com/bikini551' },
  { network: 'pinterest', href: 'https://pinterest.com/bikini551' },
];

const DEFAULT_PAYMENT = [
  'Thai QR PromptPay',
];

const SOCIAL_ICON: Record<string, React.ReactNode> = {
  instagram: <IconBrandInstagram size={16} />,
  tiktok: <IconBrandTiktok size={16} />,
  line: <IconBrandLine size={16} />,
  facebook: <IconBrandFacebook size={16} />,
  pinterest: <IconBrandPinterest size={16} />,
};

/**
 * Footer — multi-column footer with brand block, navigation,
 * social, contact, payment pills and bottom strip.
 */
export function Footer({
  storeName = 'BIKINI551',
  storeLogoUrl,
  tagline = 'Fashion beachwear · Quality goods · Fast shipping · บีกีนี่และชุดว่ายน้ำสำหรับผู้หญิงเอเชีย ทุก body shape · ตั้งแต่ปี 2566',
  navColumns = DEFAULT_NAV,
  paymentMethods = DEFAULT_PAYMENT,
  socialLinks = DEFAULT_SOCIAL,
  contact = {},
  showAppButtons = true,
  copyright,
  bottomLinks = [],
}: FooterProps) {
  const year = new Date().getFullYear() + 543; // Buddhist year
  const copyText =
    copyright ??
    `© ${year} ${storeName} · All rights reserved · 时尚泳装 · 淘你喜欢`;

  return (
    <footer className="bk-footer" role="contentinfo">
      <div className="bk-container">
        <div className="bk-footer-grid">
          <div>
            {storeLogoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={storeLogoUrl}
                alt={storeName}
                style={{
                  maxHeight: 56,
                  width: 'auto',
                  display: 'block',
                  marginBottom: 12,
                }}
              />
            ) : (
              <h4>{storeName}</h4>
            )}
            <p className="bk-footer-tag">{tagline}</p>
            <div className="bk-footer-social">
              {socialLinks.map((s) => (
                <a
                  key={s.network}
                  href={s.href}
                  aria-label={s.label ?? `${storeName} on ${s.network}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {SOCIAL_ICON[s.network] ?? (
                    <span aria-hidden="true">{s.network[0]?.toUpperCase()}</span>
                  )}
                </a>
              ))}
            </div>
            {showAppButtons && (
              <div style={{ display: 'flex', gap: 8 }}>
                <a
                  href="#app-store"
                  style={{
                    display: 'flex',
                    gap: 8,
                    alignItems: 'center',
                    padding: '8px 14px',
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 12,
                    fontSize: 11,
                  }}
                  aria-label="Download on the App Store"
                >
                  <IconBrandApple size={20} />
                  <div>
                    <span style={{ fontSize: 9, opacity: 0.7, display: 'block' }}>
                      Download on
                    </span>
                    <b style={{ fontSize: 12, fontWeight: 800 }}>App Store</b>
                  </div>
                </a>
                <a
                  href="#google-play"
                  style={{
                    display: 'flex',
                    gap: 8,
                    alignItems: 'center',
                    padding: '8px 14px',
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 12,
                    fontSize: 11,
                  }}
                  aria-label="Get it on Google Play"
                >
                  <IconBrandGooglePlay size={20} />
                  <div>
                    <span style={{ fontSize: 9, opacity: 0.7, display: 'block' }}>
                      Get it on
                    </span>
                    <b style={{ fontSize: 12, fontWeight: 800 }}>Google Play</b>
                  </div>
                </a>
              </div>
            )}
          </div>

          {navColumns.map((col) => (
            <div key={col.heading}>
              <h5>{col.heading}</h5>
              <ul>
                {col.links.map((l) => (
                  <li key={l.href}>
                    <a href={l.href}>{l.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h5>Get in Touch</h5>
            <div className="bk-footer-contact">
              {contact.line && (
                <div className="bk-footer-contact-item">
                  <IconBrandLine size={14} />
                  <div>
                    LINE {contact.line}
                    <br />
                    <span style={{ fontSize: 10, opacity: 0.7 }}>ตอบเร็ว 24 ชม.</span>
                  </div>
                </div>
              )}
              {contact.email && (
                <div className="bk-footer-contact-item">
                  <IconMail size={14} />
                  {contact.email}
                </div>
              )}
              {contact.phone && (
                <div className="bk-footer-contact-item">
                  <IconPhone size={14} />
                  {contact.phone}
                </div>
              )}
              {contact.address && (
                <div className="bk-footer-contact-item">
                  <IconMapPin size={14} />
                  {contact.address}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bk-footer-bottom">
          <div>{copyText}</div>
          <div style={{ display: 'flex', gap: 18 }}>
            {bottomLinks.map((l) => (
              <a key={l.href} href={l.href}>
                {l.label}
              </a>
            ))}
          </div>
          <div className="bk-payment-pills">
            {paymentMethods.map((m) => (
              <div key={m} className="pi">
                {m}
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
