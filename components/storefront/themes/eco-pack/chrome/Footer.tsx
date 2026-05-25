import React from 'react';
import { Package, Instagram, Facebook, Twitter } from 'lucide-react';

export interface FooterProps {
  storeName: string;
  logoUrl?: string | null;
  navColumns: { title: string; links: { label: string; url: string }[] }[];
  paymentMethods: string[];
  socialLinks: { platform: string; url: string }[];
}

export function Footer({ storeName, logoUrl, navColumns, paymentMethods, socialLinks }: FooterProps) {
  const getIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram': return <Instagram size={20} />;
      case 'facebook': return <Facebook size={20} />;
      case 'twitter': return <Twitter size={20} />;
      default: return null;
    }
  };

  return (
    <footer className="bg-[var(--shop-card)] border-t border-[var(--shop-border)] pt-16 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-12">
          
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              {logoUrl ? (
                <img src={logoUrl} alt={storeName} className="h-10 w-auto object-contain" />
              ) : (
                <>
                  <div className="w-8 h-8 rounded bg-[var(--shop-primary)] flex items-center justify-center text-white">
                    <Package size={18} />
                  </div>
                  <span className="font-bold text-xl text-[var(--eco-kraft-dark)]">{storeName}</span>
                </>
              )}
            </div>
            <p className="text-[var(--shop-ink-muted)] text-sm mb-6 max-w-sm leading-relaxed">
              Premium sustainable packaging for businesses. 
              We provide eco-friendly materials that help your brand stand out while protecting the planet.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((link) => (
                <a key={link.platform} href={link.url} className="text-[var(--shop-ink-muted)] hover:text-[var(--shop-primary)] transition-colors" aria-label={link.platform}>
                  {getIcon(link.platform)}
                </a>
              ))}
            </div>
          </div>

          {navColumns.map((col, idx) => (
            <div key={idx}>
              <h3 className="font-semibold text-[var(--shop-ink)] mb-4">{col.title}</h3>
              <ul className="space-y-3">
                {col.links.map((link, lIdx) => (
                  <li key={lIdx}>
                    <a href={link.url} className="text-sm text-[var(--shop-ink-muted)] hover:text-[var(--shop-primary)] transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-[var(--shop-border)] gap-4">
          <p className="text-sm text-[var(--shop-ink-muted)]">
            &copy; {new Date().getFullYear()} {storeName}. All rights reserved.
          </p>
          <div className="flex gap-3 items-center">
            {paymentMethods.map((pm, idx) => (
              <span key={idx} className="bg-[var(--shop-bg)] px-3 py-1 rounded text-xs font-medium text-[var(--shop-ink-muted)] border border-[var(--shop-border)]">
                {pm}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
