import type { Template, TemplateId } from './types';
import { defaultTheme, themePresets } from './theme';
import {
  EcoPackHeaderAdapter,
  EcoPackFooterAdapter,
  EcoPackStripAdapter,
  EcoPackHomepageAdapter,
  EcoPackCatalogAdapter,
  EcoPackProductDetailAdapter,
  EcoPackCartAdapter,
  EcoPackCheckoutAdapter,
  EcoPackAboutAdapter,
  EcoPackHelpAdapter,
} from '@/components/storefront/themes/eco-pack/adapters';
import {
  BikiniHeaderAdapter,
  BikiniFooterAdapter,
  BikiniStripAdapter,
  BikiniHomepageAdapter,
  BikiniCatalogAdapter,
  BikiniProductDetailAdapter,
  BikiniCartAdapter,
  BikiniCheckoutAdapter,
  BikiniLookbookAdapter,
  BikiniAboutAdapter,
  BikiniHelpAdapter,
} from '@/components/storefront/themes/bikini-beach/adapters';
import {
  MegaStoreHeaderAdapter,
  MegaStoreFooterAdapter,
  MegaStoreStripAdapter,
  MegaStoreHomepageAdapter,
  MegaStoreCatalogAdapter,
  MegaStoreProductDetailAdapter,
  MegaStoreCartAdapter,
  MegaStoreCheckoutAdapter,
  MegaStoreAboutAdapter,
  MegaStoreHelpAdapter,
} from '@/components/storefront/themes/mega-store/adapters';

import {
  SaiSingHeaderAdapter,
  SaiSingFooterAdapter,
  SaiSingStripAdapter,
  SaiSingHomepageAdapter,
} from '@/components/storefront/themes/sai-sing/adapters';
import {
  TaladSeeSodHeaderAdapter,
  TaladSeeSodFooterAdapter,
  TaladSeeSodStripAdapter,
  TaladSeeSodHomepageAdapter,
} from '@/components/storefront/themes/talad-see-sod/adapters';
import {
  BrutalistThaiHeaderAdapter,
  BrutalistThaiFooterAdapter,
  BrutalistThaiStripAdapter,
  BrutalistThaiHomepageAdapter,
} from '@/components/storefront/themes/brutalist-thai/adapters';
import {
  MonoEightHeaderAdapter,
  MonoEightFooterAdapter,
  MonoEightStripAdapter,
  MonoEightHomepageAdapter,
} from '@/components/storefront/themes/mono-eight/adapters';
import {
  LilaModestHeaderAdapter,
  LilaModestFooterAdapter,
  LilaModestStripAdapter,
  LilaModestHomepageAdapter,
} from '@/components/storefront/themes/lila-modest/adapters';
import {
  Atelier27HeaderAdapter,
  Atelier27FooterAdapter,
  Atelier27StripAdapter,
  Atelier27HomepageAdapter,
} from '@/components/storefront/themes/atelier-27/adapters';


import {
  BulkboxHeaderAdapter,
  BulkboxFooterAdapter,
  BulkboxStripAdapter,
  BulkboxHomepageAdapter,
} from '@/components/storefront/themes/bulkbox-industrial/adapters';

import {
  CalderaSkinHeaderAdapter,
  CalderaSkinFooterAdapter,
  CalderaSkinStripAdapter,
  CalderaSkinHomepageAdapter,
} from '@/components/storefront/themes/caldera-skin/adapters';

import {
  CarbonEraCamerasHeaderAdapter,
  CarbonEraCamerasFooterAdapter,
  CarbonEraCamerasStripAdapter,
  CarbonEraCamerasHomepageAdapter,
} from '@/components/storefront/themes/carbon-era-cameras/adapters';

import {
  GlowLampCoHeaderAdapter,
  GlowLampCoFooterAdapter,
  GlowLampCoStripAdapter,
  GlowLampCoHomepageAdapter,
} from '@/components/storefront/themes/glow-lamp-co/adapters';

import {
  HinokiHeaderAdapter,
  HinokiFooterAdapter,
  HinokiStripAdapter,
  HinokiHomepageAdapter,
} from '@/components/storefront/themes/hinoki-apothecary/adapters';

import {
  InkstonePaperHeaderAdapter,
  InkstonePaperFooterAdapter,
  InkstonePaperStripAdapter,
  InkstonePaperHomepageAdapter,
} from '@/components/storefront/themes/inkstone-paper/adapters';

import {
  KeystrokeLabHeaderAdapter,
  KeystrokeLabFooterAdapter,
  KeystrokeLabStripAdapter,
  KeystrokeLabHomepageAdapter,
} from '@/components/storefront/themes/keystroke-lab/adapters';

import {
  KorakotHouseHeaderAdapter,
  KorakotHouseFooterAdapter,
  KorakotHouseStripAdapter,
  KorakotHouseHomepageAdapter,
} from '@/components/storefront/themes/korakot-house/adapters';

import {
  LinenAndLoomHeaderAdapter,
  LinenAndLoomFooterAdapter,
  LinenAndLoomStripAdapter,
  LinenAndLoomHomepageAdapter,
} from '@/components/storefront/themes/linen-and-loom/adapters';

import {
  MaiHatthakamHeaderAdapter,
  MaiHatthakamFooterAdapter,
  MaiHatthakamStripAdapter,
  MaiHatthakamHomepageAdapter,
} from '@/components/storefront/themes/mai-hatthakam/adapters';

import {
  PastelPackHeaderAdapter,
  PastelPackFooterAdapter,
  PastelPackStripAdapter,
  PastelPackHomepageAdapter,
} from '@/components/storefront/themes/pastel-pack/adapters';

import {
  PetitCoteHeaderAdapter,
  PetitCoteFooterAdapter,
  PetitCoteStripAdapter,
  PetitCoteHomepageAdapter,
} from '@/components/storefront/themes/petit-cote/adapters';

import {
  PigmentStudioHeaderAdapter,
  PigmentStudioFooterAdapter,
  PigmentStudioStripAdapter,
  PigmentStudioHomepageAdapter,
} from '@/components/storefront/themes/pigment-studio/adapters';

import {
  ReclaimLeatherHeaderAdapter,
  ReclaimLeatherFooterAdapter,
  ReclaimLeatherStripAdapter,
  ReclaimLeatherHomepageAdapter,
} from '@/components/storefront/themes/reclaim-leather/adapters';

import {
  SalukiYogaHeaderAdapter,
  SalukiYogaFooterAdapter,
  SalukiYogaStripAdapter,
  SalukiYogaHomepageAdapter,
} from '@/components/storefront/themes/saluki-yoga/adapters';

import {
  SirinHeaderAdapter,
  SirinFooterAdapter,
  SirinStripAdapter,
  SirinHomepageAdapter,
} from '@/components/storefront/themes/sirin-womenswear/adapters';

import {
  SmartloopHomeHeaderAdapter,
  SmartloopHomeFooterAdapter,
  SmartloopHomeStripAdapter,
  SmartloopHomeHomepageAdapter,
} from '@/components/storefront/themes/smartloop-home/adapters';

import {
  TinyhandWoodenToysHeaderAdapter,
  TinyhandWoodenToysFooterAdapter,
  TinyhandWoodenToysStripAdapter,
  TinyhandWoodenToysHomepageAdapter,
} from '@/components/storefront/themes/tinyhand-wooden-toys/adapters';

import {
  TrailcraftHeaderAdapter,
  TrailcraftFooterAdapter,
  TrailcraftStripAdapter,
  TrailcraftHomepageAdapter,
} from '@/components/storefront/themes/trailcraft-outdoors/adapters';

import {
  WavelengthAudioHeaderAdapter,
  WavelengthAudioFooterAdapter,
  WavelengthAudioStripAdapter,
  WavelengthAudioHomepageAdapter,
} from '@/components/storefront/themes/wavelength-audio/adapters';

import {
  YumeiroLipHeaderAdapter,
  YumeiroLipFooterAdapter,
  YumeiroLipStripAdapter,
  YumeiroLipHomepageAdapter,
} from '@/components/storefront/themes/yumeiro-lip/adapters';

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


  // Bikini Beach — full multi-page template (chrome + every per-route
  // page including the bespoke Lookbook editorial). BIKINI551 designer
  // deliverable, fashion-beauty group. Adapters translate scaffold
  // Props → designer Props; Cart + Checkout are client-side and read
  // useCart() for items + handlers.
  'bikini-beach': {
    id: 'bikini-beach',
    name: 'BIKINI 551',
    description: 'ชุดว่ายน้ำ ทะเลใส โทนสด · บีกีนี่สำหรับสาวเอเชีย',
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
    chrome: {
      Header: BikiniHeaderAdapter,
      Footer: BikiniFooterAdapter,
      AnnouncementStrip: BikiniStripAdapter,
      // Beach lookbook hero spans the full viewport with the header
      // floating over the imagery — see app/stores/[slug]/layout.tsx
      // for shape semantics.
      shellShape: 'full-bleed',
    },
    pages: {
      home: BikiniHomepageAdapter,
      catalog: BikiniCatalogAdapter,
      pdp: BikiniProductDetailAdapter,
      cart: BikiniCartAdapter,
      checkout: BikiniCheckoutAdapter,
      lookbook: BikiniLookbookAdapter,
      about: BikiniAboutAdapter,
      help: BikiniHelpAdapter,
    },
  },

  // Eco Pack — first full multi-page template (chrome + every per-route
  // page). Sustainable packaging vertical, business-model group. Adapters
  // translate scaffold Props → designer Props; Cart + Checkout are
  // client-side and read useCart() for items + handlers.
  'eco-pack': {
    id: 'eco-pack',
    name: 'Eco Pack',
    description: 'บรรจุภัณฑ์รักษ์โลก มินิมอล โทนธรรมชาติ และคราฟท์',
    group: 'business-model',
    mobileBlocks: [
      { type: 'hero', variant: 'cover', id: 'hero' },
      { type: 'store-header', variant: 'compact', id: 'header' },
      { type: 'category', variant: 'anchor-circles', id: 'cats' },
      { type: 'product', variant: 'grid-2', id: 'products' },
    ],
    desktopPattern: 'C',
    theme: themePresets.classic,
    behavior: { bottomNav: 'visible' },
    gating: {},
    customizable: { canReorder: false, canHideBlocks: [], canAddBlocks: [] },
    chrome: {
      Header: EcoPackHeaderAdapter,
      Footer: EcoPackFooterAdapter,
      AnnouncementStrip: EcoPackStripAdapter,
      // Edge-to-edge nature photography under a floating header so the
      // hero reads as a single immersive frame.
      shellShape: 'full-bleed',
    },
    pages: {
      home: EcoPackHomepageAdapter,
      catalog: EcoPackCatalogAdapter,
      pdp: EcoPackProductDetailAdapter,
      cart: EcoPackCartAdapter,
      checkout: EcoPackCheckoutAdapter,
      about: EcoPackAboutAdapter,
      help: EcoPackHelpAdapter,
    },
  },

  // Mega Store — Taobao-style high-density storefront, lifestyle group.
  // Adapters translate scaffold Props → designer Props; Cart + Checkout
  // are client-side and read useCart() for items + handlers.
  'mega-store': {
    id: 'mega-store',
    name: 'Mega Store',
    description: 'ร้านค้าสายช้อป อารมณ์ Taobao ของเยอะ โปรแน่น สีสันสดใส',
    group: 'lifestyle',
    mobileBlocks: [
      { type: 'hero', variant: 'cover', id: 'hero' },
      { type: 'store-header', variant: 'compact', id: 'header' },
      { type: 'category', variant: 'chips', id: 'cats' },
      { type: 'product', variant: 'grid-3-dense', id: 'products' },
    ],
    desktopPattern: 'B',
    theme: themePresets.catalog,
    behavior: { bottomNav: 'visible', searchInTopBar: true, productGridDensity: 'dense' },
    gating: {},
    customizable: { canReorder: false, canHideBlocks: [], canAddBlocks: [] },
    chrome: {
      Header: MegaStoreHeaderAdapter,
      Footer: MegaStoreFooterAdapter,
      AnnouncementStrip: MegaStoreStripAdapter,
      // Taobao-style high-density storefront — header floats over the
      // dense banner grid so promos can claim the full first viewport.
      shellShape: 'full-bleed',
    },
    pages: {
      home: MegaStoreHomepageAdapter,
      catalog: MegaStoreCatalogAdapter,
      pdp: MegaStoreProductDetailAdapter,
      cart: MegaStoreCartAdapter,
      checkout: MegaStoreCheckoutAdapter,
      about: MegaStoreAboutAdapter,
      help: MegaStoreHelpAdapter,
    },
  },

  // ─── Skin-only templates (PR #105) — no chrome/pages slots, render
  // via the family detector chain in layout.tsx + page.tsx.
  'everyday-retail': {
    id: 'everyday-retail',
    name: 'Everyday Retail',
    description: 'Shopee-style consumer retail — photo-forward, red CTA',
    group: 'everyday',
    mobileBlocks: [
      { type: 'hero', variant: 'cover', id: 'hero' },
      { type: 'store-header', variant: 'standard', id: 'header' },
      { type: 'product', variant: 'grid-2', id: 'products' },
    ],
    desktopPattern: 'C',
    theme: defaultTheme,
    behavior: { bottomNav: 'visible', stickyCTA: 'buy-now' },
    gating: {},
    customizable: { canReorder: true, canHideBlocks: [], canAddBlocks: [] },
  },

  'taobao-style': {
    id: 'taobao-style',
    name: 'Taobao Marketplace',
    description: 'Bold orange/red/pink gradient marketplace · flash deals · countdown',
    group: 'taobao',
    mobileBlocks: [
      { type: 'hero', variant: 'cover', id: 'hero' },
      { type: 'store-header', variant: 'standard', id: 'header' },
      { type: 'product', variant: 'grid-2', id: 'products' },
    ],
    desktopPattern: 'C',
    theme: defaultTheme,
    behavior: { bottomNav: 'visible', countdownBanner: 'visible', stockIndicators: 'visible' },
    gating: {},
    customizable: { canReorder: true, canHideBlocks: [], canAddBlocks: [] },
  },

  'packaging-supply': {
    id: 'packaging-supply',
    name: 'Packaging Supply',
    description: 'Pink / yellow / sky / white cheerful packaging-supply storefront',
    group: 'packaging',
    mobileBlocks: [
      { type: 'hero', variant: 'cover', id: 'hero' },
      { type: 'store-header', variant: 'standard', id: 'header' },
      { type: 'product', variant: 'grid-2', id: 'products' },
    ],
    desktopPattern: 'C',
    theme: defaultTheme,
    behavior: { bottomNav: 'visible' },
    gating: {},
    customizable: { canReorder: true, canHideBlocks: [], canAddBlocks: [] },
  },

  'sai-sing': {
    id: 'sai-sing',
    name: 'Sai Sing',
    description: 'ท่อสูตร อะไหล่ซิ่ง รถแต่ง สไตล์มอเตอร์ไซค์สปอร์ต',
    group: 'specialty',
    mobileBlocks: [
      { type: 'hero', variant: 'cover', id: 'hero' },
      { type: 'store-header', variant: 'compact', id: 'header' },
      { type: 'product', variant: 'grid-2', id: 'products' },
    ],
    desktopPattern: 'C',
    theme: defaultTheme,
    behavior: { bottomNav: 'visible' },
    gating: {},
    customizable: { canReorder: false, canHideBlocks: [], canAddBlocks: [] },
    chrome: {
      Header: SaiSingHeaderAdapter,
      Footer: SaiSingFooterAdapter,
      AnnouncementStrip: SaiSingStripAdapter,
    },
    pages: {
      home: SaiSingHomepageAdapter,
    },
  },

  'talad-see-sod': {
    id: 'talad-see-sod',
    name: 'Talad See Sod',
    description: 'ร้านขายไอทีแกดเจ็ต สีสันสดใส เน้นโปรโมชั่นสะดุดตา',
    group: 'everyday',
    mobileBlocks: [
      { type: 'hero', variant: 'cover', id: 'hero' },
      { type: 'store-header', variant: 'compact', id: 'header' },
      { type: 'product', variant: 'grid-2', id: 'products' },
    ],
    desktopPattern: 'C',
    theme: defaultTheme,
    behavior: { bottomNav: 'visible' },
    gating: {},
    customizable: { canReorder: false, canHideBlocks: [], canAddBlocks: [] },
    chrome: {
      Header: TaladSeeSodHeaderAdapter,
      Footer: TaladSeeSodFooterAdapter,
      AnnouncementStrip: TaladSeeSodStripAdapter,
    },
    pages: {
      home: TaladSeeSodHomepageAdapter,
    },
  },

  'brutalist-thai': {
    id: 'brutalist-thai',
    name: 'Brutalist Thai',
    description: 'โรงพิมพ์และร้านขายโปสเตอร์อาร์ต ดีไซน์ดิบ ดุดัน สไตล์ Brutalist',
    group: 'fashion-beauty',
    mobileBlocks: [
      { type: 'hero', variant: 'cover', id: 'hero' },
      { type: 'store-header', variant: 'compact', id: 'header' },
      { type: 'product', variant: 'grid-2', id: 'products' },
    ],
    desktopPattern: 'C',
    theme: defaultTheme,
    behavior: { bottomNav: 'visible' },
    gating: {},
    customizable: { canReorder: false, canHideBlocks: [], canAddBlocks: [] },
    chrome: {
      Header: BrutalistThaiHeaderAdapter,
      Footer: BrutalistThaiFooterAdapter,
      AnnouncementStrip: BrutalistThaiStripAdapter,
    },
    pages: {
      home: BrutalistThaiHomepageAdapter,
    },
  },

  'mono-eight': {
    id: 'mono-eight',
    name: 'Mono Eight',
    description: 'แฟชั่นสตรีทแวร์ลิมิเต็ด สไตล์ zine ขาวดำ',
    group: 'fashion-beauty',
    mobileBlocks: [
      { type: 'hero', variant: 'portrait', id: 'hero' },
      { type: 'store-header', variant: 'compact', id: 'header' },
      { type: 'product', variant: 'editorial', id: 'products' },
    ],
    desktopPattern: 'A',
    theme: themePresets.lookbook,
    behavior: { bottomNav: 'visible', hideRatingsCount: true },
    gating: {},
    customizable: { canReorder: false, canHideBlocks: [], canAddBlocks: [] },
    chrome: {
      Header: MonoEightHeaderAdapter,
      Footer: MonoEightFooterAdapter,
      AnnouncementStrip: MonoEightStripAdapter,
    },
    pages: {
      home: MonoEightHomepageAdapter,
    },
  },

  'lila-modest': {
    id: 'lila-modest',
    name: 'Lila Modest',
    description: 'เดรสยาวและผ้าคลุม modest-wear โทนอุ่น',
    group: 'fashion-beauty',
    mobileBlocks: [
      { type: 'hero', variant: 'cover', id: 'hero' },
      { type: 'store-header', variant: 'standard', id: 'header' },
      { type: 'story', variant: 'inline', id: 'story' },
      { type: 'product', variant: 'grid-2', id: 'products' },
    ],
    desktopPattern: 'A',
    theme: defaultTheme,
    behavior: { bottomNav: 'visible', storyBlock: 'inline-visible' },
    gating: {},
    customizable: { canReorder: true, canHideBlocks: [], canAddBlocks: [] },
    chrome: {
      Header: LilaModestHeaderAdapter,
      Footer: LilaModestFooterAdapter,
      AnnouncementStrip: LilaModestStripAdapter,
      // Editorial modest-fashion lookbook — wider desktop gutters give
      // imagery room to breathe alongside long-form captions.
      shellShape: 'magazine',
    },
    pages: {
      home: LilaModestHomepageAdapter,
    },
  },

  'atelier-27': {
    id: 'atelier-27',
    name: 'Atelier 27',
    description: 'สูทตัดเฉพาะบุคคล premium luxury สไตล์ Hermès',
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
    customizable: { canReorder: false, canHideBlocks: [], canAddBlocks: [] },
    chrome: {
      Header: Atelier27HeaderAdapter,
      Footer: Atelier27FooterAdapter,
      AnnouncementStrip: Atelier27StripAdapter,
      // Atelier-style editorial — asymmetric grids land better with
      // extra desktop gutters than against the viewport edge.
      shellShape: 'magazine',
    },
    pages: {
      home: Atelier27HomepageAdapter,
    },
  },

  'bulkbox-industrial': {
    id: 'bulkbox-industrial',
    name: 'Bulkbox Industrial',
    description: 'Auto-generated theme for bulkbox-industrial',
    group: 'business-model',
    mobileBlocks: [
      { type: 'hero', variant: 'cover', id: 'hero' },
      { type: 'store-header', variant: 'compact', id: 'header' },
      { type: 'product', variant: 'grid-2', id: 'products' },
    ],
    desktopPattern: 'C',
    theme: defaultTheme,
    behavior: { bottomNav: 'visible' },
    gating: {},
    customizable: { canReorder: false, canHideBlocks: [], canAddBlocks: [] },
    chrome: {
      Header: BulkboxHeaderAdapter,
      Footer: BulkboxFooterAdapter,
      AnnouncementStrip: BulkboxStripAdapter,
      // TODO(sidebar-left): the bespoke BulkboxHeaderAdapter is a horizontal
      // bar; rendering it inside the 240px sidebar-left aside collapses the
      // nav. Re-enable shellShape: 'sidebar-left' after a vertical SidebarNav
      // adapter ships for this template.
    },
    pages: {
      home: BulkboxHomepageAdapter,
    },
  },

  'caldera-skin': {
    id: 'caldera-skin',
    name: 'Caldera Skin',
    description: 'Auto-generated theme for caldera-skin',
    group: 'fashion-beauty',
    mobileBlocks: [
      { type: 'hero', variant: 'cover', id: 'hero' },
      { type: 'store-header', variant: 'compact', id: 'header' },
      { type: 'product', variant: 'grid-2', id: 'products' },
    ],
    desktopPattern: 'C',
    theme: defaultTheme,
    behavior: { bottomNav: 'visible' },
    gating: {},
    customizable: { canReorder: false, canHideBlocks: [], canAddBlocks: [] },
    chrome: {
      Header: CalderaSkinHeaderAdapter,
      Footer: CalderaSkinFooterAdapter,
      AnnouncementStrip: CalderaSkinStripAdapter,
      // Skincare brand site — hero shot of the bottle overlaps the
      // header for that magazine-cover feeling.
      shellShape: 'split-hero',
    },
    pages: {
      home: CalderaSkinHomepageAdapter,
    },
  },

  'carbon-era-cameras': {
    id: 'carbon-era-cameras',
    name: 'Carbon Era Cameras',
    description: 'Auto-generated theme for carbon-era-cameras',
    group: 'electronics-tech',
    mobileBlocks: [
      { type: 'hero', variant: 'cover', id: 'hero' },
      { type: 'store-header', variant: 'compact', id: 'header' },
      { type: 'product', variant: 'grid-2', id: 'products' },
    ],
    desktopPattern: 'C',
    theme: defaultTheme,
    behavior: { bottomNav: 'visible' },
    gating: {},
    customizable: { canReorder: false, canHideBlocks: [], canAddBlocks: [] },
    chrome: {
      Header: CarbonEraCamerasHeaderAdapter,
      Footer: CarbonEraCamerasFooterAdapter,
      AnnouncementStrip: CarbonEraCamerasStripAdapter,
      // TODO(sidebar-left): see Bulkbox note — horizontal header doesn't
      // fit the 240px aside; re-enable once a vertical adapter ships.
    },
    pages: {
      home: CarbonEraCamerasHomepageAdapter,
    },
  },

  'glow-lamp-co': {
    id: 'glow-lamp-co',
    name: 'Glow Lamp Co',
    description: 'Auto-generated theme for glow-lamp-co',
    group: 'lifestyle',
    mobileBlocks: [
      { type: 'hero', variant: 'cover', id: 'hero' },
      { type: 'store-header', variant: 'compact', id: 'header' },
      { type: 'product', variant: 'grid-2', id: 'products' },
    ],
    desktopPattern: 'C',
    theme: defaultTheme,
    behavior: { bottomNav: 'visible' },
    gating: {},
    customizable: { canReorder: false, canHideBlocks: [], canAddBlocks: [] },
    chrome: {
      Header: GlowLampCoHeaderAdapter,
      Footer: GlowLampCoFooterAdapter,
      AnnouncementStrip: GlowLampCoStripAdapter,
    },
    pages: {
      home: GlowLampCoHomepageAdapter,
    },
  },

  'hinoki-apothecary': {
    id: 'hinoki-apothecary',
    name: 'Hinoki Apothecary',
    description: 'Auto-generated theme for hinoki-apothecary',
    group: 'fashion-beauty',
    mobileBlocks: [
      { type: 'hero', variant: 'cover', id: 'hero' },
      { type: 'store-header', variant: 'compact', id: 'header' },
      { type: 'product', variant: 'grid-2', id: 'products' },
    ],
    desktopPattern: 'C',
    theme: defaultTheme,
    behavior: { bottomNav: 'visible' },
    gating: {},
    customizable: { canReorder: false, canHideBlocks: [], canAddBlocks: [] },
    chrome: {
      Header: HinokiHeaderAdapter,
      Footer: HinokiFooterAdapter,
      AnnouncementStrip: HinokiStripAdapter,
    },
    pages: {
      home: HinokiHomepageAdapter,
    },
  },

  'inkstone-paper': {
    id: 'inkstone-paper',
    name: 'Inkstone Paper',
    description: 'Auto-generated theme for inkstone-paper',
    group: 'lifestyle',
    mobileBlocks: [
      { type: 'hero', variant: 'cover', id: 'hero' },
      { type: 'store-header', variant: 'compact', id: 'header' },
      { type: 'product', variant: 'grid-2', id: 'products' },
    ],
    desktopPattern: 'C',
    theme: defaultTheme,
    behavior: { bottomNav: 'visible' },
    gating: {},
    customizable: { canReorder: false, canHideBlocks: [], canAddBlocks: [] },
    chrome: {
      Header: InkstonePaperHeaderAdapter,
      Footer: InkstonePaperFooterAdapter,
      AnnouncementStrip: InkstonePaperStripAdapter,
    },
    pages: {
      home: InkstonePaperHomepageAdapter,
    },
  },

  'keystroke-lab': {
    id: 'keystroke-lab',
    name: 'Keystroke Lab',
    description: 'Auto-generated theme for keystroke-lab',
    group: 'electronics-tech',
    mobileBlocks: [
      { type: 'hero', variant: 'cover', id: 'hero' },
      { type: 'store-header', variant: 'compact', id: 'header' },
      { type: 'product', variant: 'grid-2', id: 'products' },
    ],
    desktopPattern: 'C',
    theme: defaultTheme,
    behavior: { bottomNav: 'visible' },
    gating: {},
    customizable: { canReorder: false, canHideBlocks: [], canAddBlocks: [] },
    chrome: {
      Header: KeystrokeLabHeaderAdapter,
      Footer: KeystrokeLabFooterAdapter,
      AnnouncementStrip: KeystrokeLabStripAdapter,
      // Mechanical keyboard launch site — the hero shot of the focus
      // board overlaps the header for a hardware-reveal hierarchy.
      shellShape: 'split-hero',
    },
    pages: {
      home: KeystrokeLabHomepageAdapter,
    },
  },

  'korakot-house': {
    id: 'korakot-house',
    name: 'Korakot House',
    description: 'Auto-generated theme for korakot-house',
    group: 'lifestyle',
    mobileBlocks: [
      { type: 'hero', variant: 'cover', id: 'hero' },
      { type: 'store-header', variant: 'compact', id: 'header' },
      { type: 'product', variant: 'grid-2', id: 'products' },
    ],
    desktopPattern: 'C',
    theme: defaultTheme,
    behavior: { bottomNav: 'visible' },
    gating: {},
    customizable: { canReorder: false, canHideBlocks: [], canAddBlocks: [] },
    chrome: {
      Header: KorakotHouseHeaderAdapter,
      Footer: KorakotHouseFooterAdapter,
      AnnouncementStrip: KorakotHouseStripAdapter,
    },
    pages: {
      home: KorakotHouseHomepageAdapter,
    },
  },

  'linen-and-loom': {
    id: 'linen-and-loom',
    name: 'Linen And Loom',
    description: 'Auto-generated theme for linen-and-loom',
    group: 'fashion-beauty',
    mobileBlocks: [
      { type: 'hero', variant: 'cover', id: 'hero' },
      { type: 'store-header', variant: 'compact', id: 'header' },
      { type: 'product', variant: 'grid-2', id: 'products' },
    ],
    desktopPattern: 'C',
    theme: defaultTheme,
    behavior: { bottomNav: 'visible' },
    gating: {},
    customizable: { canReorder: false, canHideBlocks: [], canAddBlocks: [] },
    chrome: {
      Header: LinenAndLoomHeaderAdapter,
      Footer: LinenAndLoomFooterAdapter,
      AnnouncementStrip: LinenAndLoomStripAdapter,
      // Slow-textile editorial — wider gutters echo the printed-catalog
      // feeling the brand voice leans on.
      shellShape: 'magazine',
    },
    pages: {
      home: LinenAndLoomHomepageAdapter,
    },
  },

  'mai-hatthakam': {
    id: 'mai-hatthakam',
    name: 'Mai Hatthakam',
    description: 'Auto-generated theme for mai-hatthakam',
    group: 'specialty',
    mobileBlocks: [
      { type: 'hero', variant: 'cover', id: 'hero' },
      { type: 'store-header', variant: 'compact', id: 'header' },
      { type: 'product', variant: 'grid-2', id: 'products' },
    ],
    desktopPattern: 'C',
    theme: defaultTheme,
    behavior: { bottomNav: 'visible' },
    gating: {},
    customizable: { canReorder: false, canHideBlocks: [], canAddBlocks: [] },
    chrome: {
      Header: MaiHatthakamHeaderAdapter,
      Footer: MaiHatthakamFooterAdapter,
      AnnouncementStrip: MaiHatthakamStripAdapter,
    },
    pages: {
      home: MaiHatthakamHomepageAdapter,
    },
  },

  'pastel-pack': {
    id: 'pastel-pack',
    name: 'Pastel Pack',
    description: 'Auto-generated theme for pastel-pack',
    group: 'packaging',
    mobileBlocks: [
      { type: 'hero', variant: 'cover', id: 'hero' },
      { type: 'store-header', variant: 'compact', id: 'header' },
      { type: 'product', variant: 'grid-2', id: 'products' },
    ],
    desktopPattern: 'C',
    theme: defaultTheme,
    behavior: { bottomNav: 'visible' },
    gating: {},
    customizable: { canReorder: false, canHideBlocks: [], canAddBlocks: [] },
    chrome: {
      Header: PastelPackHeaderAdapter,
      Footer: PastelPackFooterAdapter,
      AnnouncementStrip: PastelPackStripAdapter,
    },
    pages: {
      home: PastelPackHomepageAdapter,
    },
  },

  'petit-cote': {
    id: 'petit-cote',
    name: 'Petit Cote',
    description: 'Auto-generated theme for petit-cote',
    group: 'lifestyle',
    mobileBlocks: [
      { type: 'hero', variant: 'cover', id: 'hero' },
      { type: 'store-header', variant: 'compact', id: 'header' },
      { type: 'product', variant: 'grid-2', id: 'products' },
    ],
    desktopPattern: 'C',
    theme: defaultTheme,
    behavior: { bottomNav: 'visible' },
    gating: {},
    customizable: { canReorder: false, canHideBlocks: [], canAddBlocks: [] },
    chrome: {
      Header: PetitCoteHeaderAdapter,
      Footer: PetitCoteFooterAdapter,
      AnnouncementStrip: PetitCoteStripAdapter,
      // Petit-Cote leans editorial-boutique — magazine gutters keep
      // its product stories feeling curated, not crammed.
      shellShape: 'magazine',
    },
    pages: {
      home: PetitCoteHomepageAdapter,
    },
  },

  'pigment-studio': {
    id: 'pigment-studio',
    name: 'Pigment Studio',
    description: 'Auto-generated theme for pigment-studio',
    group: 'specialty',
    mobileBlocks: [
      { type: 'hero', variant: 'cover', id: 'hero' },
      { type: 'store-header', variant: 'compact', id: 'header' },
      { type: 'product', variant: 'grid-2', id: 'products' },
    ],
    desktopPattern: 'C',
    theme: defaultTheme,
    behavior: { bottomNav: 'visible' },
    gating: {},
    customizable: { canReorder: false, canHideBlocks: [], canAddBlocks: [] },
    chrome: {
      Header: PigmentStudioHeaderAdapter,
      Footer: PigmentStudioFooterAdapter,
      AnnouncementStrip: PigmentStudioStripAdapter,
      // Pigment Studio is a maker/atelier brand — magazine gutters
      // frame the colourway swatches like a printed lookbook.
      shellShape: 'magazine',
    },
    pages: {
      home: PigmentStudioHomepageAdapter,
    },
  },

  'reclaim-leather': {
    id: 'reclaim-leather',
    name: 'Reclaim Leather',
    description: 'Auto-generated theme for reclaim-leather',
    group: 'fashion-beauty',
    mobileBlocks: [
      { type: 'hero', variant: 'cover', id: 'hero' },
      { type: 'store-header', variant: 'compact', id: 'header' },
      { type: 'product', variant: 'grid-2', id: 'products' },
    ],
    desktopPattern: 'C',
    theme: defaultTheme,
    behavior: { bottomNav: 'visible' },
    gating: {},
    customizable: { canReorder: false, canHideBlocks: [], canAddBlocks: [] },
    chrome: {
      Header: ReclaimLeatherHeaderAdapter,
      Footer: ReclaimLeatherFooterAdapter,
      AnnouncementStrip: ReclaimLeatherStripAdapter,
    },
    pages: {
      home: ReclaimLeatherHomepageAdapter,
    },
  },

  'saluki-yoga': {
    id: 'saluki-yoga',
    name: 'Saluki Yoga',
    description: 'Auto-generated theme for saluki-yoga',
    group: 'lifestyle',
    mobileBlocks: [
      { type: 'hero', variant: 'cover', id: 'hero' },
      { type: 'store-header', variant: 'compact', id: 'header' },
      { type: 'product', variant: 'grid-2', id: 'products' },
    ],
    desktopPattern: 'C',
    theme: defaultTheme,
    behavior: { bottomNav: 'visible' },
    gating: {},
    customizable: { canReorder: false, canHideBlocks: [], canAddBlocks: [] },
    chrome: {
      Header: SalukiYogaHeaderAdapter,
      Footer: SalukiYogaFooterAdapter,
      AnnouncementStrip: SalukiYogaStripAdapter,
    },
    pages: {
      home: SalukiYogaHomepageAdapter,
    },
  },

  'sirin-womenswear': {
    id: 'sirin-womenswear',
    name: 'Sirin Womenswear',
    description: 'Auto-generated theme for sirin-womenswear',
    group: 'fashion-beauty',
    mobileBlocks: [
      { type: 'hero', variant: 'cover', id: 'hero' },
      { type: 'store-header', variant: 'compact', id: 'header' },
      { type: 'product', variant: 'grid-2', id: 'products' },
    ],
    desktopPattern: 'C',
    theme: defaultTheme,
    behavior: { bottomNav: 'visible' },
    gating: {},
    customizable: { canReorder: false, canHideBlocks: [], canAddBlocks: [] },
    chrome: {
      Header: SirinHeaderAdapter,
      Footer: SirinFooterAdapter,
      AnnouncementStrip: SirinStripAdapter,
      // Sirin womenswear — editorial lookbook style benefits from
      // wider outer gutters on desktop for asymmetric imagery.
      shellShape: 'magazine',
    },
    pages: {
      home: SirinHomepageAdapter,
    },
  },

  'smartloop-home': {
    id: 'smartloop-home',
    name: 'Smartloop Home',
    description: 'Auto-generated theme for smartloop-home',
    group: 'electronics-tech',
    mobileBlocks: [
      { type: 'hero', variant: 'cover', id: 'hero' },
      { type: 'store-header', variant: 'compact', id: 'header' },
      { type: 'product', variant: 'grid-2', id: 'products' },
    ],
    desktopPattern: 'C',
    theme: defaultTheme,
    behavior: { bottomNav: 'visible' },
    gating: {},
    customizable: { canReorder: false, canHideBlocks: [], canAddBlocks: [] },
    chrome: {
      Header: SmartloopHomeHeaderAdapter,
      Footer: SmartloopHomeFooterAdapter,
      AnnouncementStrip: SmartloopHomeStripAdapter,
      // Smart-home hardware brand — flagship product hero rises into
      // the header band for a launch-page hierarchy.
      shellShape: 'split-hero',
    },
    pages: {
      home: SmartloopHomeHomepageAdapter,
    },
  },

  'tinyhand-wooden-toys': {
    id: 'tinyhand-wooden-toys',
    name: 'Tinyhand Wooden Toys',
    description: 'Auto-generated theme for tinyhand-wooden-toys',
    group: 'lifestyle',
    mobileBlocks: [
      { type: 'hero', variant: 'cover', id: 'hero' },
      { type: 'store-header', variant: 'compact', id: 'header' },
      { type: 'product', variant: 'grid-2', id: 'products' },
    ],
    desktopPattern: 'C',
    theme: defaultTheme,
    behavior: { bottomNav: 'visible' },
    gating: {},
    customizable: { canReorder: false, canHideBlocks: [], canAddBlocks: [] },
    chrome: {
      Header: TinyhandWoodenToysHeaderAdapter,
      Footer: TinyhandWoodenToysFooterAdapter,
      AnnouncementStrip: TinyhandWoodenToysStripAdapter,
    },
    pages: {
      home: TinyhandWoodenToysHomepageAdapter,
    },
  },

  'trailcraft-outdoors': {
    id: 'trailcraft-outdoors',
    name: 'Trailcraft Outdoors',
    description: 'Auto-generated theme for trailcraft-outdoors',
    group: 'lifestyle',
    mobileBlocks: [
      { type: 'hero', variant: 'cover', id: 'hero' },
      { type: 'store-header', variant: 'compact', id: 'header' },
      { type: 'product', variant: 'grid-2', id: 'products' },
    ],
    desktopPattern: 'C',
    theme: defaultTheme,
    behavior: { bottomNav: 'visible' },
    gating: {},
    customizable: { canReorder: false, canHideBlocks: [], canAddBlocks: [] },
    chrome: {
      Header: TrailcraftHeaderAdapter,
      Footer: TrailcraftFooterAdapter,
      AnnouncementStrip: TrailcraftStripAdapter,
    },
    pages: {
      home: TrailcraftHomepageAdapter,
    },
  },

  'wavelength-audio': {
    id: 'wavelength-audio',
    name: 'Wavelength Audio',
    description: 'Auto-generated theme for wavelength-audio',
    group: 'electronics-tech',
    mobileBlocks: [
      { type: 'hero', variant: 'cover', id: 'hero' },
      { type: 'store-header', variant: 'compact', id: 'header' },
      { type: 'product', variant: 'grid-2', id: 'products' },
    ],
    desktopPattern: 'C',
    theme: defaultTheme,
    behavior: { bottomNav: 'visible' },
    gating: {},
    customizable: { canReorder: false, canHideBlocks: [], canAddBlocks: [] },
    chrome: {
      Header: WavelengthAudioHeaderAdapter,
      Footer: WavelengthAudioFooterAdapter,
      AnnouncementStrip: WavelengthAudioStripAdapter,
      // Hi-fi audio — product hero overlaps the header for a single-
      // product launch feeling on the homepage.
      shellShape: 'split-hero',
    },
    pages: {
      home: WavelengthAudioHomepageAdapter,
    },
  },

  'yumeiro-lip': {
    id: 'yumeiro-lip',
    name: 'Yumeiro Lip',
    description: 'Auto-generated theme for yumeiro-lip',
    group: 'fashion-beauty',
    mobileBlocks: [
      { type: 'hero', variant: 'cover', id: 'hero' },
      { type: 'store-header', variant: 'compact', id: 'header' },
      { type: 'product', variant: 'grid-2', id: 'products' },
    ],
    desktopPattern: 'C',
    theme: defaultTheme,
    behavior: { bottomNav: 'visible' },
    gating: {},
    customizable: { canReorder: false, canHideBlocks: [], canAddBlocks: [] },
    chrome: {
      Header: YumeiroLipHeaderAdapter,
      Footer: YumeiroLipFooterAdapter,
      AnnouncementStrip: YumeiroLipStripAdapter,
      // Yumeiro lip — beauty editorial. Magazine gutters keep the
      // colour-story imagery centered like a glossy spread.
      shellShape: 'magazine',
    },
    pages: {
      home: YumeiroLipHomepageAdapter,
    },
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
    electronics: ['tech-compare', 'classic', 'wholesale-b2b'],
    fashion: ['lookbook', 'bikini-beach', 'classic'],
    beauty: ['lookbook', 'pigment-studio', 'classic'],
    home: ['sport-active', 'classic', 'lookbook'],
    sport: ['sport-active', 'classic', 'tech-compare'],
    kids: ['sport-active', 'classic', 'lookbook'],
    handmade: ['handmade', 'lookbook', 'classic'],
    vintage: ['handmade', 'lookbook', 'classic'],
    wholesale: ['wholesale-b2b', 'tech-compare', 'classic'],
    streaming: ['live-commerce', 'classic', 'lookbook'],
    subscription: ['wholesale-b2b', 'lookbook', 'classic'],
    luxury: ['classic', 'atelier-27', 'lookbook'],
    flash: ['wholesale-b2b', 'classic', 'tech-compare'],
  };

  const ids = recommendations[niche] ?? ['classic', 'tech-compare', 'lookbook'];
  return ids.slice(0, limit).map(getTemplate);
}

export const templateGroups: Record<string, TemplateId[]> = {
  trust: ['classic', 'atelier-27'],
  'fashion-beauty': ['lookbook', 'bikini-beach', 'mono-eight', 'lila-modest'],
  'electronics-tech': ['tech-compare'],
  lifestyle: ['sport-active', 'mega-store'],
  community: ['live-commerce'],
  'business-model': ['wholesale-b2b', 'eco-pack'],
  specialty: ['handmade', 'sai-sing', 'talad-see-sod', 'brutalist-thai'],
};
