/**
 * MultiPageRenderer — v12 multi-page shop schema renderer.
 * Defensive: handles missing/malformed fields from any model.
 */

import type { MultiPageShopSchema, GlobalHeader as GlobalHeaderSchema, GlobalFooter as GlobalFooterSchema } from "@/types/multi-page-schema";
import { findPageBySlug } from "@/lib/multi-page-migration";
import { DynamicBlockRenderer } from "@/components/DynamicBlockRenderer";
import { applyStoreImagesToSchema } from "@/lib/storefront/apply-store-images";

interface MultiPageRendererProps {
  schema: MultiPageShopSchema;
  pageSlug?: string;
  storeSlug: string;
  storeName?: string;
  /** Operator-uploaded banner (Store.bannerUrl). When present,
   *  replaces any placeholder image URLs the agent emitted in
   *  HeroBanner blocks across every page in the schema. */
  storeBannerUrl?: string | null;
}

/** Safe defaults so components never crash on undefined fields.
 *
 * Logo precedence (highest → lowest):
 *   1. `storeLogoUrl` — operator-uploaded via /admin/stores/<id>
 *      (Store.logoUrl). Always wins when present, because the agent's
 *      generated placeholder is filler the operator paid no attention to.
 *   2. Agent-emitted `globalHeader.logo.imageUrl` from the v12 schema
 *      — usually a `placehold.co` URL with the brand name, OK as a
 *      fallback for stores that haven't uploaded yet.
 *   3. Empty string — GlobalHeader renders the brand text only.
 */
export function safeHeader(
  raw: unknown,
  storeSlug: string,
  storeName?: string,
  storeLogoUrl?: string | null,
): GlobalHeaderSchema {
  if (!raw || typeof raw !== "object") {
    return {
      logo: {
        imageUrl: storeLogoUrl ?? "",
        altText: storeName || storeSlug,
        linkTo: "/",
        brandText: storeName,
      },
      nav: [],
      showCart: true,
      sticky: true,
    };
  }
  const h = raw as Record<string, unknown>;
  const logo = (h.logo && typeof h.logo === "object" ? h.logo : {}) as Record<string, unknown>;
  const nav = Array.isArray(h.nav)
    ? h.nav.map((n: unknown) => {
        if (!n || typeof n !== "object") return { text: "", href: "/" };
        const item = n as Record<string, unknown>;
        return {
          text: String(item.text ?? item.label ?? ""),
          href: String(item.href ?? item.url ?? item.link ?? "/"),
          isExternal: Boolean(item.isExternal),
        };
      })
    : [];
  return {
    logo: {
      imageUrl:
        storeLogoUrl ??
        String(logo.imageUrl ?? logo.image_url ?? logo.src ?? ""),
      altText: String(logo.altText ?? logo.alt ?? storeName ?? storeSlug),
      linkTo: String(logo.linkTo ?? logo.href ?? "/"),
      brandText: logo.brandText ? String(logo.brandText) : storeName ? storeName : undefined,
      size: (logo.size as "sm" | "md" | "lg") ?? "md",
      svgCode: logo.svgCode ? String(logo.svgCode) : undefined,
    },
    nav,
    showCart: h.showCart !== false,
    showSearch: Boolean(h.showSearch),
    sticky: h.sticky !== false,
  };
}

export function safeFooter(
  raw: unknown,
  storeName?: string,
  storeLogoUrl?: string | null,
): GlobalFooterSchema {
  const defaultFooter: GlobalFooterSchema = {
    brand: {
      name: storeName ?? "Store",
      ...(storeLogoUrl ? { logoUrl: storeLogoUrl } : {}),
    },
    copyright: `© ${new Date().getFullYear()} ${storeName || "Store"}. All rights reserved.`,
    columns: [],
    socialLinks: []
  };

  if (!raw || typeof raw !== "object") return defaultFooter;
  const f = raw as Record<string, unknown>;
  const columns = Array.isArray(f.columns)
    ? f.columns.map((col: unknown) => {
        if (!col || typeof col !== "object") return { title: "", links: [] };
        const c = col as Record<string, unknown>;
        const links = Array.isArray(c.links)
          ? c.links.map((l: unknown) => {
              if (!l || typeof l !== "object") return { text: "", href: "/" };
              const link = l as Record<string, unknown>;
              return {
                text: String(link.text ?? link.label ?? ""),
                href: String(link.href ?? link.url ?? link.link ?? "/"),
              };
            })
          : [];
        return { title: String(c.title ?? ""), links };
      })
    : [];
  const socialLinks = Array.isArray(f.socialLinks)
    ? f.socialLinks.map((s: unknown) => {
        if (!s || typeof s !== "object") return { platform: "", href: "#" };
        const social = s as Record<string, unknown>;
        return {
          platform: String(social.platform ?? social.name ?? ""),
          href: String(social.href ?? social.url ?? social.link ?? "#"),
        };
      })
    : [];
  // Brand merge: prefer operator-uploaded logoUrl when present (same
  // precedence rule as safeHeader). Agent's placeholder loses to a
  // real upload.
  const brandRaw = (f.brand && typeof f.brand === "object"
    ? (f.brand as Record<string, unknown>)
    : {}) as Record<string, unknown>;
  const brand = {
    name: brandRaw.name ? String(brandRaw.name) : (storeName ?? "Store"),
    ...(brandRaw.tagline ? { tagline: String(brandRaw.tagline) } : {}),
    logoUrl:
      storeLogoUrl ??
      (brandRaw.logoUrl
        ? String(brandRaw.logoUrl)
        : brandRaw.logo_url
          ? String(brandRaw.logo_url)
          : undefined),
  };

  return {
    ...f,
    brand,
    copyright: f.copyright ? String(f.copyright) : defaultFooter.copyright,
    columns,
    socialLinks
  } as GlobalFooterSchema;
}

export function MultiPageRenderer({ schema, pageSlug = "", storeSlug, storeBannerUrl }: MultiPageRendererProps) {
  // Swap any placehold.co banner URLs the agent emitted with the
  // operator's uploaded banner before we look up the page. Pure
  // function; falls through unchanged when the operator hasn't
  // uploaded anything yet. Cast through Record<string, unknown> at
  // the boundary because MultiPageShopSchema is a strict named type
  // that doesn't carry an index signature; the transform's body
  // narrows back to its own LikeTypes before touching properties.
  const effectiveSchema = (storeBannerUrl
    ? (applyStoreImagesToSchema(
        schema as unknown as Record<string, unknown>,
        storeBannerUrl,
      ) as unknown as MultiPageShopSchema)
    : schema);

  const page = findPageBySlug(effectiveSchema, pageSlug);

  if (!page) {
    return (
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-lg">
          <h1 className="text-6xl font-bold text-stone-900 mb-4">404</h1>
          <p className="text-xl text-stone-500 mb-8">ไม่พบหน้านี้</p>
          <a href={`/stores/${storeSlug}`} className="inline-block px-6 py-3 bg-stone-900 text-white rounded hover:bg-stone-800 transition">
            กลับหน้าแรก
          </a>
        </div>
      </main>
    );
  }

  const blocks = (page.blocks ?? []).map((b) => ({
    type: b.blockType ?? b.type ?? "",
    props: b.content ?? {},
  }));

  return (
    <main className="flex-1">
      {blocks.map((block, i) => (
        <DynamicBlockRenderer
          key={i}
          block={block as any}
          storeSlug={storeSlug}
        />
      ))}
    </main>
  );
}
