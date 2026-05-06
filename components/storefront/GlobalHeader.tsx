"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCart, Search, X, Menu } from "lucide-react";
import { CartDrawer } from "@/components/shop/CartDrawer";
import { CyberLogo } from "./CyberLogo";
import { SearchOverlay } from "./SearchOverlay";
import { WishlistNavLink } from "./Wishlist";
import type { GlobalHeader as GlobalHeaderSchema } from "@/types/multi-page-schema";
import type { ThemeVariant } from "@/lib/landing/families";

/**
 * Heuristic: is this an agent-emitted placeholder rather than a
 * real brand asset? Used so we know when to fall back to the
 * programmatic CyberLogo on Family E. Includes the placehold.co
 * family + the legacy "blank string / undefined" cases.
 */
function isPlaceholderLogo(url?: string): boolean {
  if (!url || !url.trim()) return true;
  const lower = url.toLowerCase();
  return (
    lower.includes("placehold.co") ||
    lower.includes("placehold.it") ||
    lower.includes("placeholder.com") ||
    lower.includes("dummyimage.com")
  );
}

interface Props {
  content: GlobalHeaderSchema;
  theme: ThemeVariant;
  storeSlug: string;
}

export function GlobalHeader({ content, theme, storeSlug }: Props) {
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Defensive: Haiku may omit fields
  const logo = content?.logo ?? {} as GlobalHeaderSchema["logo"];
  const nav = content?.nav ?? [];

  const stickyClass = content?.sticky !== false ? "sticky top-0 z-50" : "";
  const sizeClass = {
    sm: "h-8",
    md: "h-10",
    lg: "h-14",
  }[logo?.size ?? "md"];

  // Rewrite header nav hrefs to be relative to /stores/{slug}
  const resolveHref = (href?: string) => {
    if (!href) return `/stores/${storeSlug}`;
    if (href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:")) return href;
    if (href === "/" || href === "") return `/stores/${storeSlug}`;
    const clean = href.startsWith("/") ? href.slice(1) : href;
    return `/stores/${storeSlug}/${clean}`;
  };

  return (
    <>
      {/* Announcement banner */}
      {content?.banner && !bannerDismissed && (
        <div className="relative w-full bg-stone-900 text-white" role="region" aria-label="Announcement">
          <div className="container mx-auto px-4 py-2.5 flex items-center justify-center gap-3 text-sm">
            <span className="text-center">{content?.banner.text}</span>
            {content?.banner.ctaText && content?.banner.ctaLink && (
              <Link
                href={resolveHref(content?.banner.ctaLink)}
                className="font-medium underline underline-offset-2 hover:no-underline whitespace-nowrap"
              >
                {content?.banner.ctaText}
              </Link>
            )}
            {content?.banner.dismissible !== false && (
              <button
                type="button"
                onClick={() => setBannerDismissed(true)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:opacity-70"
                aria-label="ปิด banner"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <header
        className={`
          ${stickyClass}
          bg-white/95 backdrop-blur-md
          border-b border-stone-200
        `}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo — image OR text, not both. Image (svg/img) wins when present. */}
            <Link
              href={resolveHref(logo?.linkTo ?? "/")}
              className="flex items-center gap-3"
              aria-label={logo?.altText ?? logo?.brandText ?? "Logo"}
            >
              {logo?.svgCode ? (
                <div
                  className={`${sizeClass} w-auto flex items-center [&>svg]:w-full [&>svg]:h-full`}
                  dangerouslySetInnerHTML={{ __html: logo.svgCode }}
                />
              ) : logo?.imageUrl && !isPlaceholderLogo(logo.imageUrl) ? (
                // Real (non-placeholder) image wins for every theme.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logo.imageUrl}
                  alt={logo?.altText ?? logo?.brandText ?? "Logo"}
                  className={`${sizeClass} w-auto`}
                  loading="eager"
                />
              ) : theme === "E" ? (
                // Family E without a real logoUrl: render the
                // programmatic cyberpunk lockup (smartphone + crown +
                // gradient text). Beats showing a placehold.co square
                // or an unstyled brand name string.
                <CyberLogo
                  storeSlug={storeSlug}
                  brandText={logo?.brandText}
                />
              ) : logo?.brandText ? (
                <span className="text-lg md:text-xl font-semibold text-stone-900">
                  {logo.brandText}
                </span>
              ) : null}
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-8">
              {nav.map((link, i) => (
                <Link
                  key={i}
                  href={resolveHref(link.href ?? (link as Record<string, unknown>).url as string ?? "/")}
                  target={link.isExternal ? "_blank" : undefined}
                  rel={link.isExternal ? "noopener noreferrer" : undefined}
                  className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
                >
                  {link.text}
                </Link>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-3">
              {content?.showSearch && (
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  className="p-2 text-stone-600 hover:text-stone-900 transition-colors"
                  aria-label="ค้นหา"
                >
                  <Search className="h-5 w-5" />
                </button>
              )}

              <WishlistNavLink storeSlug={storeSlug} />

              {content?.showCart !== false && (
                <CartDrawer />
              )}

              {/* Mobile menu toggle */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2"
                aria-label="เปิดเมนู"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile nav */}
          {mobileMenuOpen && (
            <nav className="md:hidden border-t border-stone-200 py-4">
              <div className="flex flex-col gap-1">
                {nav.map((link, i) => (
                  <Link
                    key={i}
                    href={resolveHref(link.href ?? (link as Record<string, unknown>).url as string ?? "/")}
                    target={link.isExternal ? "_blank" : undefined}
                    rel={link.isExternal ? "noopener noreferrer" : undefined}
                    className="px-3 py-3 text-base font-medium text-stone-700 hover:bg-stone-50 rounded"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.text}
                  </Link>
                ))}
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Search overlay — full-screen on mobile, modal on desktop.
          Renders OUTSIDE the sticky header (z-60) so backdrop covers
          the whole viewport including the header itself. */}
      <SearchOverlay
        storeSlug={storeSlug}
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </>
  );
}
