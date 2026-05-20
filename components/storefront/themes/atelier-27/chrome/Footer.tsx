'use client';
import React from 'react';

export interface FooterProps {
  store: {
    name: string;
    slug: string;
    facebookUrl?: string | null;
    instagramUrl?: string | null;
    twitterUrl?: string | null;
  };
  categories: string[];
  accent?: string;
}

export function Footer({ store, categories }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const urls = {
    home: `/stores/${store.slug}`,
    shop: `/stores/${store.slug}/category`,
    about: `/stores/${store.slug}/about`,
    shipping: `/stores/${store.slug}/shipping`,
  };

  return (
    <footer className="bg-[#1c1917] text-[#a8a29e]">
      {/* Upper section — generous whitespace */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-20 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-8">

          {/* Brand column */}
          <div className="md:col-span-5 space-y-6">
            <span className="font-[family:var(--font-kanit)] font-light text-2xl tracking-[0.35em] uppercase text-[#fafaf9]">
              Atelier 27
            </span>
            <p className="font-[family:var(--font-prompt)] text-sm leading-relaxed text-[#78716c] max-w-sm">
              สูทตัดเฉพาะบุคคล สั่งจองล่วงหน้า 14 วัน
            </p>
            <p className="font-[family:var(--font-prompt)] text-xs leading-relaxed text-[#57534e]">
              สุขุมวิท 27 กรุงเทพมหานคร<br />
              เปิดเฉพาะนัดล่วงหน้า
            </p>
          </div>

          {/* Categories */}
          <div className="md:col-span-3">
            <h4 className="font-[family:var(--font-kanit)] font-light text-[11px] tracking-[0.35em] uppercase text-[#fafaf9] mb-6">
              คอลเลกชัน
            </h4>
            <ul className="space-y-3">
              {categories.slice(0, 5).map((category) => (
                <li key={category}>
                  <a
                    href={`${urls.shop}?cat=${encodeURIComponent(category)}`}
                    className="font-[family:var(--font-prompt)] text-xs tracking-wide text-[#78716c] hover:text-[#fafaf9] transition-colors duration-300"
                  >
                    {category}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Links */}
          <div className="md:col-span-2">
            <h4 className="font-[family:var(--font-kanit)] font-light text-[11px] tracking-[0.35em] uppercase text-[#fafaf9] mb-6">
              ข้อมูล
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href={urls.about}
                  className="font-[family:var(--font-prompt)] text-xs tracking-wide text-[#78716c] hover:text-[#fafaf9] transition-colors duration-300"
                >
                  เกี่ยวกับเรา
                </a>
              </li>
              <li>
                <a
                  href={urls.shipping}
                  className="font-[family:var(--font-prompt)] text-xs tracking-wide text-[#78716c] hover:text-[#fafaf9] transition-colors duration-300"
                >
                  การจัดส่ง
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div className="md:col-span-2">
            <h4 className="font-[family:var(--font-kanit)] font-light text-[11px] tracking-[0.35em] uppercase text-[#fafaf9] mb-6">
              ติดตาม
            </h4>
            <div className="flex flex-col gap-3">
              {store.instagramUrl && (
                <a
                  href={store.instagramUrl}
                  className="font-[family:var(--font-prompt)] text-xs tracking-wide text-[#78716c] hover:text-[#fafaf9] transition-colors duration-300"
                >
                  Instagram
                </a>
              )}
              {store.facebookUrl && (
                <a
                  href={store.facebookUrl}
                  className="font-[family:var(--font-prompt)] text-xs tracking-wide text-[#78716c] hover:text-[#fafaf9] transition-colors duration-300"
                >
                  Facebook
                </a>
              )}
              {!store.instagramUrl && !store.facebookUrl && (
                <span className="font-[family:var(--font-prompt)] text-xs tracking-wide text-[#57534e]">
                  @atelier27bkk
                </span>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Bottom rule */}
      <div className="border-t border-[#292524]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-[family:var(--font-prompt)] text-[10px] tracking-[0.15em] text-[#57534e]">
            © {currentYear} {store.name}
          </p>
          <p className="font-[family:var(--font-prompt)] text-[10px] tracking-[0.15em] text-[#44403c]">
            Bespoke Tailoring · Bangkok
          </p>
        </div>
      </div>
    </footer>
  );
}
