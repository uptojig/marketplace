/**
 * MultiPageRenderer — v12 multi-page shop schema renderer.
 * Defensive: handles missing/malformed fields from any model.
 */

import type { MultiPageShopSchema, GlobalHeader as GlobalHeaderSchema, GlobalFooter as GlobalFooterSchema } from "@/types/multi-page-schema";
import type { ThemeVariant } from "@/lib/landing/families";
import { isValidThemeVariant } from "@/lib/landing/families";
import { findPageBySlug } from "@/lib/multi-page-migration";
import { DynamicBlockRenderer } from "@/components/DynamicBlockRenderer";
import { GlobalHeader } from "./GlobalHeader";
import { GlobalFooter } from "./GlobalFooter";

interface MultiPageRendererProps {
  schema: MultiPageShopSchema;
  pageSlug?: string;
  storeSlug: string;
  storeName?: string;
}

/** Safe defaults so components never crash on undefined fields */
export function safeHeader(raw: unknown, storeSlug: string, storeName?: string): GlobalHeaderSchema {
  if (!raw || typeof raw !== "object") {
    return {
      logo: { imageUrl: "", altText: storeName || storeSlug, linkTo: "/", brandText: storeName },
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
      imageUrl: String(logo.imageUrl ?? logo.image_url ?? logo.src ?? ""),
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

export function safeFooter(raw: unknown, storeName?: string): GlobalFooterSchema {
  const defaultFooter: GlobalFooterSchema = {
    brand: { name: storeName ?? "Store" },
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
  return { 
    ...f, 
    brand: f.brand ? (f.brand as any) : { name: storeName ?? "Store" },
    copyright: f.copyright ? String(f.copyright) : defaultFooter.copyright,
    columns, 
    socialLinks 
  } as GlobalFooterSchema;
}

export function MultiPageRenderer({ schema, pageSlug = "", storeSlug, storeName }: MultiPageRendererProps) {
  const raw = schema.designFamily ?? "A";
  const theme: ThemeVariant = isValidThemeVariant(raw) ? raw : "A";
  const page = findPageBySlug(schema, pageSlug);

  const header = safeHeader(schema.globalHeader, storeSlug, storeName);
  const footer = safeFooter(schema.globalFooter, storeName);

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

  const primaryColor = typeof schema.designFamily === 'string' ? undefined : undefined; // we rely on the layout's --shop-primary variable!

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
