import type { Template, TemplateId } from './types';
import { defaultTheme, themePresets } from './theme';

export const templates: Record<TemplateId, Template> = {
  classic: {
    id: 'classic',
    name: 'Classic',
    description: 'Balanced default for general retail',
    group: 'trust',
    mobileBlocks: [
      { type: 'hero', variant: 'cover', id: 'hero' },
      { type: 'store-header', variant: 'standard', id: 'header' },
      { type: 'nav', variant: 'tabs', data: { tabs: ['home', 'products', 'promotions', 'reviews'] }, id: 'nav' },
      { type: 'collection', variant: 'featured-card', data: { source: 'featured' }, id: 'featured' },
      { type: 'product', variant: 'grid-2', data: { source: 'recommended' }, id: 'products' },
    ],
    desktopPattern: 'C',
    theme: defaultTheme,
    behavior: { bottomNav: 'visible', showTabs: true },
    gating: {},
    customizable: { canReorder: true, canHideBlocks: ['collection'], canAddBlocks: ['story', 'collection'] },
  },

  'official-brand': {
    id: 'official-brand',
    name: 'Official brand',
    description: 'Premium hero, certified badge, brand story',
    group: 'trust',
    mobileBlocks: [
      { type: 'hero', variant: 'large', id: 'hero' },
      { type: 'store-header', variant: 'with-badge', data: { badgeType: 'official' }, id: 'header' },
      { type: 'category', variant: 'anchor-circles', data: { curated: true }, id: 'cats' },
      { type: 'collection', variant: 'featured-card', id: 'featured' },
      { type: 'product', variant: 'grid-2', id: 'products' },
    ],
    desktopPattern: 'A',
    theme: defaultTheme,
    behavior: { bottomNav: 'visible', showTabs: false },
    gating: { requiresKYC: 'brand-verified' },
    customizable: { canReorder: false, canHideBlocks: [], canAddBlocks: ['story'] },
  },

  'premium-luxury': {
    id: 'premium-luxury',
    name: 'Premium luxury',
    description: 'Minimal, lots of whitespace, serif',
    group: 'trust',
    mobileBlocks: [
      { type: 'hero', variant: 'cover', id: 'hero' },
      { type: 'store-header', variant: 'compact', id: 'header' },
      { type: 'product', variant: 'grid-2', data: { minimal: true }, id: 'products' },
    ],
    desktopPattern: 'A',
    theme: themePresets.premium,
    behavior: { bottomNav: 'visible', hideRatingsCount: true },
    gating: {},
    customizable: { canReorder: false, canHideBlocks: [], canAddBlocks: ['story'] },
  },

  lookbook: {
    id: 'lookbook',
    name: 'Lookbook',
    description: 'Editorial fashion with portrait hero',
    group: 'fashion-beauty',
    mobileBlocks: [
      { type: 'hero', variant: 'portrait', id: 'hero' },
      { type: 'store-header', variant: 'compact', id: 'header' },
      { type: 'collection', variant: 'lookbook', data: { layout: 'magazine' }, id: 'collections' },
      { type: 'product', variant: 'editorial', id: 'products' },
    ],
    desktopPattern: 'A',
    theme: themePresets.lookbook,
    behavior: { bottomNav: 'visible', hideRatingsCount: true },
    gating: {},
    customizable: { canReorder: true, canHideBlocks: ['collection'], canAddBlocks: ['story'] },
  },

  'beauty-swatch': {
    id: 'beauty-swatch',
    name: 'Beauty swatch',
    description: 'Color swatches and shade picker',
    group: 'fashion-beauty',
    mobileBlocks: [
      { type: 'hero', variant: 'cover', id: 'hero' },
      { type: 'store-header', variant: 'standard', id: 'header' },
      { type: 'swatch', variant: 'row', id: 'swatches' },
      { type: 'product', variant: 'grid-2', id: 'products' },
    ],
    desktopPattern: 'C',
    theme: defaultTheme,
    behavior: { bottomNav: 'visible', swatchRow: 'visible' },
    gating: {},
    customizable: { canReorder: true, canHideBlocks: [], canAddBlocks: [] },
  },

  boutique: {
    id: 'boutique',
    name: 'Boutique',
    description: 'Small curated brand with story',
    group: 'fashion-beauty',
    mobileBlocks: [
      { type: 'hero', variant: 'cover', id: 'hero' },
      { type: 'store-header', variant: 'standard', id: 'header' },
      { type: 'story', variant: 'inline', id: 'story' },
      { type: 'collection', variant: 'featured-card', id: 'collection' },
      { type: 'product', variant: 'grid-2', id: 'products' },
    ],
    desktopPattern: 'A',
    theme: defaultTheme,
    behavior: { bottomNav: 'visible', storyBlock: 'inline-visible' },
    gating: {},
    customizable: { canReorder: true, canHideBlocks: [], canAddBlocks: [] },
  },

  'catalog-dense': {
    id: 'catalog-dense',
    name: 'Catalog dense',
    description: 'High-SKU electronics, search-first',
    group: 'electronics-tech',
    mobileBlocks: [
      { type: 'store-header', variant: 'compact', id: 'header' },
      { type: 'nav', variant: 'sticky-chips', data: { source: 'sub-categories' }, id: 'nav' },
      { type: 'product', variant: 'grid-3-dense', id: 'products' },
    ],
    desktopPattern: 'B',
    theme: themePresets.catalog,
    behavior: { bottomNav: 'visible', searchInTopBar: true, coverHidden: true, productGridDensity: 'dense' },
    gating: {},
    customizable: { canReorder: false, canHideBlocks: [], canAddBlocks: ['collection'] },
  },

  'tech-compare': {
    id: 'tech-compare',
    name: 'Tech compare',
    description: 'Spec comparison cards',
    group: 'electronics-tech',
    mobileBlocks: [
      { type: 'hero', variant: 'cover', id: 'hero' },
      { type: 'store-header', variant: 'compact', id: 'header' },
      { type: 'compare', variant: 'side-by-side', id: 'compare' },
      { type: 'product', variant: 'list-with-specs', id: 'products' },
    ],
    desktopPattern: 'B',
    theme: themePresets.catalog,
    behavior: { bottomNav: 'visible' },
    gating: {},
    customizable: { canReorder: true, canHideBlocks: ['compare'], canAddBlocks: [] },
  },

  'single-product': {
    id: 'single-product',
    name: 'Single product',
    description: 'One flagship product showcase',
    group: 'electronics-tech',
    mobileBlocks: [
      { type: 'hero', variant: 'large', id: 'hero' },
      { type: 'sticky', variant: 'buy-now', id: 'sticky' },
    ],
    desktopPattern: 'A',
    theme: defaultTheme,
    behavior: { bottomNav: 'hidden', stickyCTA: 'buy-now', singleProductMode: true },
    gating: {},
    customizable: { canReorder: false, canHideBlocks: [], canAddBlocks: [] },
  },

  'home-living': {
    id: 'home-living',
    name: 'Home & living',
    description: 'Lifestyle scenes for home decor',
    group: 'lifestyle',
    mobileBlocks: [
      { type: 'hero', variant: 'cover', id: 'hero' },
      { type: 'store-header', variant: 'compact', id: 'header' },
      { type: 'collection', variant: 'scene', id: 'scenes' },
      { type: 'product', variant: 'grid-2', id: 'products' },
    ],
    desktopPattern: 'C',
    theme: defaultTheme,
    behavior: { bottomNav: 'visible' },
    gating: {},
    customizable: { canReorder: true, canHideBlocks: [], canAddBlocks: [] },
  },

  'sport-active': {
    id: 'sport-active',
    name: 'Sport & active',
    description: 'Performance badges and action imagery',
    group: 'lifestyle',
    mobileBlocks: [
      { type: 'hero', variant: 'cover', id: 'hero' },
      { type: 'store-header', variant: 'compact', id: 'header' },
      { type: 'category', variant: 'chips', data: { performance: true }, id: 'cats' },
      { type: 'product', variant: 'grid-2', id: 'products' },
    ],
    desktopPattern: 'B',
    theme: defaultTheme,
    behavior: { bottomNav: 'visible', performanceBadges: 'visible' },
    gating: {},
    customizable: { canReorder: true, canHideBlocks: [], canAddBlocks: [] },
  },

  'kids-toys': {
    id: 'kids-toys',
    name: 'Kids & toys',
    description: 'Colorful category tiles, age-segmented',
    group: 'lifestyle',
    mobileBlocks: [
      { type: 'hero', variant: 'cover', id: 'hero' },
      { type: 'store-header', variant: 'standard', id: 'header' },
      { type: 'category', variant: 'colored-tiles', id: 'cats' },
      { type: 'product', variant: 'grid-2', id: 'products' },
    ],
    desktopPattern: 'C',
    theme: themePresets.playful,
    behavior: { bottomNav: 'visible', categoryTilesColored: true },
    gating: {},
    customizable: { canReorder: true, canHideBlocks: [], canAddBlocks: [] },
  },

  'live-commerce': {
    id: 'live-commerce',
    name: 'Live commerce',
    description: 'Live stream + replay + products from live',
    group: 'community',
    mobileBlocks: [
      { type: 'live', variant: 'tile', id: 'live' },
      { type: 'store-header', variant: 'with-portrait', id: 'header' },
      { type: 'live', variant: 'replay-carousel', id: 'replays' },
      { type: 'product', variant: 'grid-2', data: { source: 'from-live' }, id: 'products' },
    ],
    desktopPattern: 'D',
    theme: defaultTheme,
    behavior: { bottomNav: 'visible', liveBlock: 'visible' },
    gating: { requiresModule: ['live-commerce'] },
    customizable: { canReorder: false, canHideBlocks: [], canAddBlocks: [] },
  },

  'video-feed': {
    id: 'video-feed',
    name: 'Video feed',
    description: 'Vertical video tiles, TikTok-style',
    group: 'community',
    mobileBlocks: [
      { type: 'store-header', variant: 'compact', id: 'header' },
      { type: 'video-feed', variant: 'grid-2-portrait', id: 'videos' },
    ],
    desktopPattern: 'D',
    theme: defaultTheme,
    behavior: { bottomNav: 'visible', coverHidden: true },
    gating: { requiresModule: ['video-content'] },
    customizable: { canReorder: false, canHideBlocks: [], canAddBlocks: [] },
  },

  storyteller: {
    id: 'storyteller',
    name: 'Storyteller',
    description: 'Narrative-driven brand pages',
    group: 'community',
    mobileBlocks: [
      { type: 'hero', variant: 'cover', id: 'hero' },
      { type: 'store-header', variant: 'with-portrait', id: 'header' },
      { type: 'story', variant: 'narrative-blocks', id: 'story' },
      { type: 'product', variant: 'grid-2', id: 'products' },
    ],
    desktopPattern: 'A',
    theme: themePresets.premium,
    behavior: { bottomNav: 'visible', storyBlock: 'inline-visible' },
    gating: {},
    customizable: { canReorder: true, canHideBlocks: [], canAddBlocks: [] },
  },

  'wholesale-b2b': {
    id: 'wholesale-b2b',
    name: 'Wholesale B2B',
    description: 'Pricing tiers, MOQ, business buyer',
    group: 'business-model',
    mobileBlocks: [
      { type: 'hero', variant: 'cover', id: 'hero' },
      { type: 'store-header', variant: 'with-badge', data: { badgeType: 'b2b' }, id: 'header' },
      { type: 'pricing-tier', variant: 'table', id: 'pricing' },
      { type: 'product', variant: 'list-with-specs', id: 'products' },
    ],
    desktopPattern: 'B',
    theme: themePresets.catalog,
    behavior: { bottomNav: 'visible', b2bMode: true },
    gating: { requiresKYC: 'business-verified' },
    customizable: { canReorder: false, canHideBlocks: [], canAddBlocks: [] },
  },

  'flash-deal': {
    id: 'flash-deal',
    name: 'Flash deal',
    description: 'Countdown timers and urgency',
    group: 'business-model',
    mobileBlocks: [
      { type: 'hero', variant: 'cover', id: 'hero' },
      { type: 'countdown', variant: 'banner', id: 'countdown' },
      { type: 'store-header', variant: 'compact', id: 'header' },
      { type: 'product', variant: 'grid-2', data: { stockIndicators: true }, id: 'products' },
    ],
    desktopPattern: 'B',
    theme: defaultTheme,
    behavior: { bottomNav: 'visible', countdownBanner: 'visible', stockIndicators: 'visible' },
    gating: {},
    customizable: { canReorder: false, canHideBlocks: [], canAddBlocks: [] },
  },

  subscription: {
    id: 'subscription',
    name: 'Subscription box',
    description: 'Monthly drop calendar and past boxes',
    group: 'business-model',
    mobileBlocks: [
      { type: 'hero', variant: 'cover', id: 'hero' },
      { type: 'store-header', variant: 'standard', id: 'header' },
      { type: 'drop-calendar', variant: 'monthly-grid', id: 'calendar' },
      { type: 'product', variant: 'grid-2', data: { source: 'past-drops' }, id: 'products' },
    ],
    desktopPattern: 'C',
    theme: defaultTheme,
    behavior: { bottomNav: 'visible', dropCalendar: 'visible', recurringPlan: 'enabled' },
    gating: { requiresModule: ['subscription'] },
    customizable: { canReorder: true, canHideBlocks: [], canAddBlocks: [] },
  },

  handmade: {
    id: 'handmade',
    name: 'Handmade artisan',
    description: 'Maker portrait + small batch craft',
    group: 'specialty',
    mobileBlocks: [
      { type: 'hero', variant: 'cover', id: 'hero' },
      { type: 'store-header', variant: 'with-portrait', id: 'header' },
      { type: 'story', variant: 'inline', id: 'story' },
      { type: 'product', variant: 'grid-2', id: 'products' },
    ],
    desktopPattern: 'A',
    theme: themePresets.premium,
    behavior: { bottomNav: 'visible', makerPortrait: 'visible', storyBlock: 'inline-visible' },
    gating: {},
    customizable: { canReorder: true, canHideBlocks: [], canAddBlocks: [] },
  },

  vintage: {
    id: 'vintage',
    name: 'Vintage / pre-owned',
    description: 'Condition badges and unique items',
    group: 'specialty',
    mobileBlocks: [
      { type: 'hero', variant: 'cover', id: 'hero' },
      { type: 'store-header', variant: 'standard', id: 'header' },
      { type: 'product', variant: 'grid-2', data: { showCondition: true }, id: 'products' },
    ],
    desktopPattern: 'B',
    theme: defaultTheme,
    behavior: { bottomNav: 'visible', conditionBadges: 'visible', uniqueItemMode: true },
    gating: {},
    customizable: { canReorder: false, canHideBlocks: [], canAddBlocks: [] },
  },
};

export function getTemplate(id: TemplateId): Template {
  const t = templates[id];
  if (!t) throw new Error(`Template "${id}" not found`);
  return t;
}

/**
 * Recommend top templates for a given niche.
 * Real implementation: ML model or admin-curated mapping.
 */
export function getRecommendedTemplates(niche: string, limit = 3): Template[] {
  const recommendations: Record<string, TemplateId[]> = {
    electronics: ['catalog-dense', 'tech-compare', 'classic'],
    fashion: ['lookbook', 'boutique', 'classic'],
    beauty: ['beauty-swatch', 'lookbook', 'classic'],
    home: ['home-living', 'classic', 'lookbook'],
    sport: ['sport-active', 'classic', 'catalog-dense'],
    kids: ['kids-toys', 'classic', 'beauty-swatch'],
    handmade: ['handmade', 'boutique', 'storyteller'],
    vintage: ['vintage', 'lookbook', 'classic'],
    wholesale: ['wholesale-b2b', 'catalog-dense', 'classic'],
    streaming: ['live-commerce', 'video-feed', 'classic'],
    subscription: ['subscription', 'boutique', 'classic'],
    luxury: ['premium-luxury', 'official-brand', 'lookbook'],
    flash: ['flash-deal', 'classic', 'catalog-dense'],
  };

  const ids = recommendations[niche] ?? ['classic', 'official-brand', 'catalog-dense'];
  return ids.slice(0, limit).map(getTemplate);
}

export const templateGroups: Record<string, TemplateId[]> = {
  trust: ['classic', 'official-brand', 'premium-luxury'],
  'fashion-beauty': ['lookbook', 'beauty-swatch', 'boutique'],
  'electronics-tech': ['catalog-dense', 'tech-compare', 'single-product'],
  lifestyle: ['home-living', 'sport-active', 'kids-toys'],
  community: ['live-commerce', 'video-feed', 'storyteller'],
  'business-model': ['wholesale-b2b', 'flash-deal', 'subscription'],
  specialty: ['handmade', 'vintage'],
};
