/**
 * Marketplace Store Templates — Type System
 *
 * A Template is a config that lists which Blocks to render in what order.
 * Adding a template = new config (no new code).
 * Adding a block type = new component + register in renderer.
 *
 * As of the multi-page-template refactor, a Template can ALSO ship its
 * own chrome (`Header` / `Footer` / `AnnouncementStrip`) and per-route
 * page components (`home` / `catalog` / `pdp` / `cart` / ...). When a
 * field is present, the per-store layout + route dispatchers defer to
 * it. When absent (the back-compat case for all 20 registry entries),
 * the generic `ShopHeader` / `ShopFooter` + per-route React UI keeps
 * rendering, so existing stores are untouched.
 */

import type { ComponentType } from 'react';

// Block primitives were removed — they were only used by the deleted
// StoreRenderer block system. Templates now render via bespoke
// pages.home components or family switch homepages.


// ============================================================================
// Template configuration
// ============================================================================

export type TemplateGroup =
  | 'trust'
  | 'fashion-beauty'
  | 'electronics-tech'
  | 'lifestyle'
  | 'community'
  | 'business-model'
  | 'specialty'
  | 'everyday'
  | 'taobao'
  | 'packaging'
  | 'neon'
;

export type TemplateId =
  // Legacy aliases — referenced by `LEGACY_SLUG_TEMPLATE`
  // (lib/landing/legacy-slug-template.ts) and the template-group map
  // (lib/templates/template-groups.ts). Kept in the union so the family
  // dispatcher and legacy-slug fallback both type-check.
  | 'classic'
  | 'lookbook'
  | 'tech-compare'
  | 'sport-active'
  | 'live-commerce'
  | 'wholesale-b2b'
  | 'handmade'
  | 'bikini-beach'
  | 'eco-pack'
  | 'mega-store'
  | 'everyday-retail'
  | 'taobao-style'
  | 'packaging-supply'
  | 'sai-sing'
  | 'talad-see-sod'
  | 'brutalist-thai'
  | 'mono-eight'
  | 'lila-modest'
  | 'atelier-27'
  | 'bulkbox-industrial'
  | 'caldera-skin'
  | 'carbon-era-cameras'
  | 'glow-lamp-co'
  | 'hinoki-apothecary'
  | 'inkstone-paper'
  | 'keystroke-lab'
  | 'korakot-house'
  | 'linen-and-loom'
  | 'mai-hatthakam'
  | 'pastel-pack'
  | 'petit-cote'
  | 'pigment-studio'
  | 'reclaim-leather'
  | 'saluki-yoga'
  | 'sirin-womenswear'
  | 'smartloop-home'
  | 'tinyhand-wooden-toys'
  | 'trailcraft-outdoors'
  | 'wavelength-audio'
  | 'yumeiro-lip'
  | 'neon-festival'
  | 'konvy'
  | 'omnipack'
  | 'blackwrapp'
  | 'gridmodu'
  | 'motofog'
  | 'casethep';




export interface BehaviorFlags {
  bottomNav?: 'visible' | 'hidden';
  stickyCart?: boolean;
  stickyCTA?: 'buy-now' | 'add-to-cart' | 'none';
  coverHidden?: boolean;
  searchInTopBar?: boolean;
  showTabs?: boolean;
  productGridDensity?: 'standard' | 'dense';
  hideRatingsCount?: boolean;
  liveBlock?: 'visible' | 'hidden';
  swatchRow?: 'visible' | 'hidden';
  categoryTilesColored?: boolean;
  performanceBadges?: 'visible' | 'hidden';
  countdownBanner?: 'visible' | 'hidden';
  stockIndicators?: 'visible' | 'hidden';
  dropCalendar?: 'visible' | 'hidden';
  recurringPlan?: 'enabled' | 'disabled';
  makerPortrait?: 'visible' | 'hidden';
  conditionBadges?: 'visible' | 'hidden';
  uniqueItemMode?: boolean;
  storyBlock?: 'inline-visible' | 'hidden';
  b2bMode?: boolean;
  singleProductMode?: boolean;
  // Per-template/PDP visual flags (extended for fashion / consumer themes).
  heroSize?: 'cover' | 'large' | 'portrait' | 'video' | 'live-tile' | 'none';
  badgeSlot?: 'official' | 'b2b' | 'condition' | 'performance';
  productCardStyle?: 'default' | 'minimal' | 'editorial' | 'spec-rows';
}




export interface Template {
  id: TemplateId;
  name: string;
  description: string;
  group: TemplateGroup;
  behavior: BehaviorFlags;
  /**
   * Optional bespoke chrome (header / footer / announcement strip).
   * When present, `app/stores/[slug]/layout.tsx` skips the default
   * `ShopHeader` / `ShopFooter` and mounts these instead. The CSS
   * cascade (--shop-* vars, theme-* class) still wraps everything.
   */
  chrome?: TemplateChrome;
  /**
   * Optional bespoke per-route page components. Each per-store
   * route dispatcher checks `template?.pages?.<route>` first and
   * defers to it; absent means the existing generic page renders.
   */
  pages?: TemplatePages;
}

// ============================================================================
// Per-template chrome + page components (multi-page template architecture)
// ============================================================================
//
// A Template can OPTIONALLY ship its own chrome (header, footer,
// announcement strip) and bespoke page components for the per-store
// routes. The per-store layout + per-route dispatchers check these
// fields first and defer to them; absent means the generic React UI
// keeps rendering, so the existing 20 templates remain valid without
// modification.

/**
 * Outer page skeleton variant — `app/stores/[slug]/layout.tsx`
 * branches on this to differentiate the wrapper markup across
 * templates so storefronts don't all share the same shell shape.
 *
 *   centered      current default — max-w + centered, header/main/footer
 *   sidebar-left  240px sticky left nav on desktop, content fills the rest
 *   split-hero    relative-positioned header so children can overlap it
 *   full-bleed    absolute-positioned header floats over the first viewport
 *   magazine      wide outer gutters on desktop, asymmetric grid friendly
 *
 * Absent or 'centered' = the current default markup. Templates opt
 * into other shapes via `chrome.shellShape` in lib/templates/registry.ts.
 */
export type ShellShape =
  | 'centered'
  | 'sidebar-left'
  | 'split-hero'
  | 'full-bleed'
  | 'magazine';

/** Bespoke chrome the template renders instead of the default ShopHeader / ShopFooter. */
export interface TemplateChrome {
  Header: ComponentType<HeaderProps>;
  Footer: ComponentType<FooterProps>;
  AnnouncementStrip?: ComponentType<AnnouncementStripProps>;
  /**
   * Outer page skeleton variant — `app/stores/[slug]/layout.tsx`
   * branches on this. Absent or 'centered' = the current default
   * markup. See `ShellShape` for the full list.
   */
  shellShape?: ShellShape;
}

/** Bespoke page components the template renders for each per-store route. */
export interface TemplatePages {
  home?: ComponentType<HomepageProps>;
  catalog?: ComponentType<CatalogProps>;
  pdp?: ComponentType<ProductDetailProps>;
  cart?: ComponentType<CartProps>;
  checkout?: ComponentType<CheckoutProps>;
  lookbook?: ComponentType<LookbookProps>;
  about?: ComponentType<AboutProps>;
  help?: ComponentType<HelpProps>;
  contact?: ComponentType<ContactProps>;
}

// ----------------------------------------------------------------------------
// Chrome props
// ----------------------------------------------------------------------------

/** Identity + nav data the template Header receives — matches what ShopHeader gets today. */
export interface HeaderProps {
  storeSlug: string;
  storeName: string;
  storeLogoUrl?: string | null;
  /** Category labels for the top-nav strip; usually derived from active products. */
  categories?: string[];
  /** Hex accent used for cart badges / focus rings / CTAs. */
  accent?: string;
}

/** Brand + contact metadata the template Footer receives — matches ShopFooter's `store` prop. */
export interface FooterProps {
  store: {
    id: string;
    slug: string;
    name: string;
    description?: string | null;
    tagline?: string | null;
    logoUrl?: string | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
    facebookUrl?: string | null;
    messengerUrl?: string | null;
    instagramUrl?: string | null;
    twitterUrl?: string | null;
    websiteUrl?: string | null;
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
  accent?: string;
  /** Page slugs that actually have content in this store's
   *  landingBlocks (`privacy`, `terms`, `shipping`, `returns`,
   *  `faq`, `about`). Footers should hide customer-service links
   *  whose target page would render the empty fallback stub. */
  availableSupportPages?: string[];
}

/** Sky-thin marketing/announcement strip rendered above the Header. */
export interface AnnouncementStripProps {
  storeName: string;
  /** Short banner copy. Optional — strip can be purely decorative. */
  message?: string;
  /** Mobile-shorter variant; falls back to `message`. */
  mobileMessage?: string;
}

// ----------------------------------------------------------------------------
// Page props — shapes derived from data already fetched in the per-route page
// files today. Designers don't have to mock extra fields a downstream agent
// would otherwise have to wire up.
// ----------------------------------------------------------------------------

/** Bare store identity surfaced on every page (logo + slug + primary color). */
export interface TemplateStoreSummary {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  tagline?: string | null;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  primaryColor?: string | null;
}

/** Trust / verification flags rendered on store cards and badges. */
export interface StoreBadges {
  official?: boolean;
  b2b?: boolean;
  verified?: boolean;
}

/** A storefront product card in its lightest form (catalog tiles, related rails, etc). */
export interface TemplateProductCard {
  id: string;
  title: string;
  imageUrl?: string | null;
  priceTHB: number;
  compareAtPriceTHB?: number | null;
  categoryName?: string | null;
}

/** Operator-editable hero/landing copy from `StoreLandingContent`.
 *  Optional everywhere — adapters apply theme-default fallbacks. */
export interface TemplateLandingContent {
  heroHeadline?: string | null;
  heroSubheadline?: string | null;
  heroCtaLabel?: string | null;
  heroCtaUrl?: string | null;
  heroImageUrl?: string | null;
  heroAlignment?: string | null;
  announcementMessage?: string | null;
}

/** Homepage — store + active products + nav categories already on the wire. */
export interface HomepageProps {
  store: TemplateStoreSummary;
  /** Top-N active products (the homepage today fetches up to 60 with `active: true`). */
  products: TemplateProductCard[];
  /** Distinct category labels derived from products (mirrors what ShopHeader gets). */
  categories: string[];
  /** Operator-edited hero/landing copy. Adapters apply theme-default fallbacks. */
  landingContent?: TemplateLandingContent | null;
}

/** Catalog (category list) — paginated filtered grid the existing `/category` page builds. */
export interface CatalogProps {
  store: TemplateStoreSummary;
  /** Products for the current page after filters/sort. */
  pageProducts: TemplateProductCard[];
  /** All distinct category labels for the sidebar / chip rail. */
  categoryNames: string[];
  /** Per-category counts to render alongside each filter chip. */
  categoryCounts: Record<string, number>;
  /** Selected category labels from the URL `?cat=` params. */
  selectedCats: string[];
  /** Current sort key — caller passes through whatever the URL holds. */
  sortKey: string;
  currentPage: number;
  totalPages: number;
  /** Total matching products across all pages. */
  filteredCount: number;
  /** Helper to build a URL with toggled cat / target page (mirrors the current page's helper). */
  buildUrl: (toggleCat?: string, page?: number) => string;
  buildSortUrl: (sort: string) => string;
}

/** Product detail — single product + variants + related rail + the parent store. */
export interface ProductDetailProps {
  store: TemplateStoreSummary;
  product: {
    id: string;
    title: string;
    description?: string | null;
    priceTHB: number;
    /** Strikethrough was-price (a.k.a. `compareAtPriceTHB`). */
    originalPriceTHB?: number | null;
    imageUrl?: string | null;
    /** Gallery (deduped against `imageUrl`). */
    images: string[];
    /** Per-variant options for the picker (color / size / material rows). */
    variants: {
      id: string;
      attributes: Record<string, string>;
      colorLabel?: string | null;
      sizeLabel?: string | null;
      materialLabel?: string | null;
      priceTHB: number;
      imageUrl?: string | null;
      /** Variant inventory; null when the supplier doesn't expose stock. */
      inventory: number | null;
    }[];
    stockLeft?: number | null;
    videoUrl?: string | null;
    categoryName?: string | null;
  };
  /** Up-to-N other products from the same store — for related rails. */
  related: TemplateProductCard[];
}

/** Cart line item carried in the per-store storefront cart (lib/store/cart). */
export interface CartLineItem {
  productId: string;
  title: string;
  imageUrl?: string | null;
  priceTHB: number;
  qty: number;
  storeSlug: string;
}

/** Cart — line items + thresholds. Cart pages are client components (zustand). */
export interface CartProps {
  store: TemplateStoreSummary;
  /** Line items for THIS store filtered out of the marketplace-wide cart. */
  items: CartLineItem[];
  /** Free-shipping minimum subtotal in THB (default 990). */
  freeShippingThreshold?: number;
  /** Flat shipping cost below the free threshold (default 50). */
  flatShippingTHB?: number;
}

/** Checkout — same store summary; the live form is rendered by downstream subroutes. */
export interface CheckoutProps {
  store: TemplateStoreSummary;
  items: CartLineItem[];
}

/** Lookbook — editorial story page. Pulls products with imagery as the primary asset. */
export interface LookbookProps {
  store: TemplateStoreSummary;
  /** Curated/recent products with hero imagery used as the magazine cards. */
  products: TemplateProductCard[];
}

/** About — store metadata for the brand-story page. */
export interface AboutProps {
  store: TemplateStoreSummary;
}

/** Help / size-guide / FAQ — schema-driven; falls back to legal placeholders today. */
export interface HelpProps {
  store: TemplateStoreSummary;
  /** When the store has a v12 schema, the matching `pages[]` entry. */
  schemaPage?: unknown;
  /** Page slug being rendered (e.g. "faq", "shipping"). */
  pageSlug?: string;
}

/** Contact — store metadata for the contact-us page. Pulls contact +
 *  address fields so a bespoke `Contact` component can render a form,
 *  channel cards, and an optional map. */
export interface ContactProps {
  store: TemplateStoreSummary;
}

// ============================================================================
// Store data
// ============================================================================




export interface Collection {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  productIds: string[];
  featured?: boolean;
  order?: number;
}

export interface Product {
  id: string;
  storeId: string;
  title: string;
  description?: string;
  price: number;
  originalPrice?: number;
  currency: 'THB';
  images: string[];
  thumbnailUrl: string;
  rating: number;
  reviewCount: number;
  soldCount: number;
  inStock: boolean;
  stockLeft?: number;
  variants?: ProductVariant[];
  attributes?: Record<string, string>;
  conditionLabel?: 'new' | 'like-new' | 'good' | 'fair' | 'refurbished';
  badges?: ('hot' | 'new' | 'limited' | 'pro' | 'official')[];
  pricingTiers?: PricingTier[];
}

export interface ProductVariant {
  id: string;
  name: string;
  type: 'color' | 'size' | 'material' | 'style';
  swatch?: string;
  available: boolean;
}

export interface PricingTier {
  minQuantity: number;
  pricePerUnit: number;
}

export interface LiveStreamInfo {
  isLive: boolean;
  streamUrl?: string;
  thumbnailUrl?: string;
  viewerCount: number;
  hostName: string;
  hostAvatarUrl?: string;
  replays?: { id: string; thumbnailUrl: string; title: string; duration: number }[];
}

// ============================================================================
// Block-specific data shapes (used via Block.data?.* — no caller-side links)
// ============================================================================

export interface FeaturedStore {
  id: string;
  slug: string;
  name: string;
  /** Used in carousel/grid card visual */
  bannerUrl?: string;
  logoUrl?: string;
  rating: number;
  followers: number;
  /** Re-uses existing StoreBadges interface */
  badges?: StoreBadges;
}

export interface MarketplaceCategory {
  id: string;
  /** Used in href: /stores/{storeSlug}/category/{slug} */
  slug: string;
  name: string;
  iconUrl?: string;
  /** Fallback emoji if no iconUrl */
  emoji?: string;
  productCount?: number;
}
