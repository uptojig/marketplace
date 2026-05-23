import type { Template, TemplateId } from './types';
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
import TaladSeeSodProductDetail from '@/components/storefront/themes/talad-see-sod/pages/ProductDetail';
import TaladSeeSodCart from '@/components/storefront/themes/talad-see-sod/pages/Cart';
import TaladSeeSodCatalog from '@/components/storefront/themes/talad-see-sod/pages/Catalog';
import TaladSeeSodCheckout from '@/components/storefront/themes/talad-see-sod/pages/Checkout';
import {
  NeonFestivalHeaderAdapter,
  NeonFestivalFooterAdapter,
  NeonFestivalStripAdapter,
  NeonFestivalHomepageAdapter,
  NeonFestivalAboutAdapter,
  NeonFestivalHelpAdapter,
  neon_festival_Catalog,
  neon_festival_ProductDetail,
  neon_festival_Cart,
  neon_festival_Checkout,
  neon_festival_Contact,
} from '@/components/storefront/themes/neon-festival/adapters';
import {
  BrutalistThaiHeaderAdapter,
  BrutalistThaiFooterAdapter,
  BrutalistThaiStripAdapter,
  BrutalistThaiHomepageAdapter,
} from '@/components/storefront/themes/brutalist-thai/adapters';
import BrutalistCatalog from '@/components/storefront/themes/brutalist-thai/pages/Catalog';
import BrutalistProductDetail from '@/components/storefront/themes/brutalist-thai/pages/ProductDetail';
import BrutalistCart from '@/components/storefront/themes/brutalist-thai/pages/Cart';
import { BRUTALIST_PALETTE } from '@/components/storefront/themes/brutalist-thai/palette';
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

import {
  EverydayRetailHeaderAdapter,
  EverydayRetailFooterAdapter,
  EverydayRetailStripAdapter,
} from '@/components/storefront/themes/everyday-retail/adapters';

import { makeCatalogAdapter } from '@/components/storefront/themes/_shared/catalog-adapter';
import { makePdpAdapter } from '@/components/storefront/themes/_shared/pdp-adapter';
import { enhanceHomepage } from '@/components/storefront/themes/_shared/homepage-enhancer';
import { makeCheckoutAdapter } from '@/components/storefront/themes/_shared/checkout-adapter';
import { makeCartAdapter } from '@/components/storefront/themes/_shared/cart-adapter';
import { makeThaiCartAdapter } from '@/components/storefront/themes/_shared/thai-cart-adapter';
import { makeThaiCheckoutAdapter } from '@/components/storefront/themes/_shared/thai-checkout-adapter';
import { makeAboutAdapter } from '@/components/storefront/themes/_shared/about-adapter';
import { makeHelpAdapter } from '@/components/storefront/themes/_shared/help-adapter';

// Bespoke PDP imports (Wave 3)
import { mono_eight_ProductDetail, mono_eight_Cart } from '@/components/storefront/themes/mono-eight/adapters';
import { atelier_27_ProductDetail, atelier_27_Cart } from '@/components/storefront/themes/atelier-27/adapters';
import { caldera_skin_ProductDetail, caldera_skin_Cart } from '@/components/storefront/themes/caldera-skin/adapters';
import { hinoki_apothecary_ProductDetail, hinoki_apothecary_Cart } from '@/components/storefront/themes/hinoki-apothecary/adapters';
import { linen_and_loom_ProductDetail, linen_and_loom_Cart } from '@/components/storefront/themes/linen-and-loom/adapters';
import { reclaim_leather_ProductDetail, reclaim_leather_Cart } from '@/components/storefront/themes/reclaim-leather/adapters';
import { sirin_womenswear_ProductDetail, sirin_womenswear_Cart } from '@/components/storefront/themes/sirin-womenswear/adapters';
import { yumeiro_lip_ProductDetail, yumeiro_lip_Cart, yumeiro_lip_Catalog } from '@/components/storefront/themes/yumeiro-lip/adapters';
import { lila_modest_ProductDetail } from '@/components/storefront/themes/lila-modest/adapters';
import { carbon_era_cameras_ProductDetail, carbon_era_cameras_Cart, carbon_era_cameras_Catalog } from '@/components/storefront/themes/carbon-era-cameras/adapters';
import { keystroke_lab_ProductDetail, keystroke_lab_Cart } from '@/components/storefront/themes/keystroke-lab/adapters';
import { smartloop_home_ProductDetail } from '@/components/storefront/themes/smartloop-home/adapters';
import { wavelength_audio_ProductDetail } from '@/components/storefront/themes/wavelength-audio/adapters';
import { saluki_yoga_ProductDetail } from '@/components/storefront/themes/saluki-yoga/adapters';
import { korakot_house_ProductDetail } from '@/components/storefront/themes/korakot-house/adapters';
import { inkstone_paper_ProductDetail } from '@/components/storefront/themes/inkstone-paper/adapters';
import { tinyhand_wooden_toys_ProductDetail } from '@/components/storefront/themes/tinyhand-wooden-toys/adapters';
import { trailcraft_outdoors_ProductDetail } from '@/components/storefront/themes/trailcraft-outdoors/adapters';
import { petit_cote_ProductDetail } from '@/components/storefront/themes/petit-cote/adapters';
import { mai_hatthakam_ProductDetail } from '@/components/storefront/themes/mai-hatthakam/adapters';

// Bikini-beach Cart (was missing)
import BikiniCartBespoke from '@/components/storefront/themes/bikini-beach/pages/Cart';

// Brutalist-thai bespoke Checkout
import BrutalistCheckout from '@/components/storefront/themes/brutalist-thai/pages/Checkout';

// Eco-pack + Mega-store Contact pages
import EcoPackContact from '@/components/storefront/themes/eco-pack/pages/Contact';
import MegaStoreContact from '@/components/storefront/themes/mega-store/pages/Contact';

// Handmade chrome (Wave 2 F) — chrome only, page slots use shared adapters
import {
  HandmadeHeaderAdapter,
  HandmadeFooterAdapter,
  HandmadeStripAdapter,
} from '@/components/storefront/themes/handmade/adapters';

// Taobao-style + Packaging-supply full scaffolds (Wave 2 G/H)
import {
  TaobaoStyleHeaderAdapter,
  TaobaoStyleFooterAdapter,
  TaobaoStyleStripAdapter,
  TaobaoStyleHomepageAdapter,
  taobao_style_Catalog,
  taobao_style_ProductDetail,
  taobao_style_Cart,
  taobao_style_Checkout,
} from '@/components/storefront/themes/taobao-style/adapters';
import {
  PackagingSupplyHeaderAdapter,
  PackagingSupplyFooterAdapter,
  PackagingSupplyStripAdapter,
  PackagingSupplyHomepageAdapter,
  PackagingSupplyCatalog,
  PackagingSupplyProductDetail,
  PackagingSupplyCart,
  PackagingSupplyCheckout,
} from '@/components/storefront/themes/packaging-supply/adapters';




export const templates: Record<TemplateId, Template> = {
  handmade: {
    id: 'handmade',
    name: 'Handmade artisan',
    description: 'Maker portrait + small batch craft',
    group: 'specialty',
    behavior: { bottomNav: 'visible', makerPortrait: 'visible', storyBlock: 'inline-visible' },
    chrome: {
      Header: HandmadeHeaderAdapter,
      Footer: HandmadeFooterAdapter,
      AnnouncementStrip: HandmadeStripAdapter,
    },
    pages: {
      // Handmade theme has bespoke chrome but no bespoke homepage yet —
      // reuse Mai Hatthakam (Thai handicraft) homepage as closest match.
      home: enhanceHomepage(MaiHatthakamHomepageAdapter, '06'),
      catalog: makeCatalogAdapter('04'),
      pdp: makePdpAdapter('04', '05'),
      cart: makeThaiCartAdapter(),
      checkout: makeThaiCheckoutAdapter(),
      about: makeAboutAdapter(),
      help: makeHelpAdapter(),
    },
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
    behavior: { bottomNav: 'visible', hideRatingsCount: true },
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
      pdp: BikiniProductDetailAdapter,
      checkout: makeThaiCheckoutAdapter(),
      catalog: makeCatalogAdapter('12'),
      home: enhanceHomepage(BikiniHomepageAdapter, '01'),
      cart: BikiniCartBespoke,
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
    behavior: { bottomNav: 'visible' },
    chrome: {
      Header: EcoPackHeaderAdapter,
      Footer: EcoPackFooterAdapter,
      AnnouncementStrip: EcoPackStripAdapter,
      // Edge-to-edge nature photography under a floating header so the
      // hero reads as a single immersive frame.
      shellShape: 'full-bleed',
    },
    pages: {
      home: enhanceHomepage(EcoPackHomepageAdapter, '04'),
      catalog: EcoPackCatalogAdapter,
      pdp: EcoPackProductDetailAdapter,
      cart: EcoPackCartAdapter,
      checkout: EcoPackCheckoutAdapter,
      contact: EcoPackContact,
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
    behavior: { bottomNav: 'visible', searchInTopBar: true, productGridDensity: 'dense' },
    chrome: {
      Header: MegaStoreHeaderAdapter,
      Footer: MegaStoreFooterAdapter,
      AnnouncementStrip: MegaStoreStripAdapter,
      // Taobao-style high-density storefront — header floats over the
      // dense banner grid so promos can claim the full first viewport.
      shellShape: 'full-bleed',
    },
    pages: {
      home: enhanceHomepage(MegaStoreHomepageAdapter, '02'),
      catalog: MegaStoreCatalogAdapter,
      pdp: MegaStoreProductDetailAdapter,
      cart: MegaStoreCartAdapter,
      checkout: MegaStoreCheckoutAdapter,
      contact: MegaStoreContact,
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
    behavior: { bottomNav: 'visible', stickyCTA: 'buy-now' },
    chrome: {
      Header: EverydayRetailHeaderAdapter,
      Footer: EverydayRetailFooterAdapter,
      AnnouncementStrip: EverydayRetailStripAdapter,
    },
    pages: {
      catalog: makeCatalogAdapter('01'),
      pdp: makePdpAdapter('03', '02'),
      checkout: makeThaiCheckoutAdapter(),
    },
  },

  'taobao-style': {
    id: 'taobao-style',
    name: 'Taobao Marketplace',
    description: 'Bold orange/red/pink gradient marketplace · flash deals · countdown',
    group: 'taobao',
    behavior: { bottomNav: 'visible', countdownBanner: 'visible', stockIndicators: 'visible' },
    chrome: {
      Header: TaobaoStyleHeaderAdapter,
      Footer: TaobaoStyleFooterAdapter,
      AnnouncementStrip: TaobaoStyleStripAdapter,
    },
    pages: {
      home: TaobaoStyleHomepageAdapter,
      catalog: taobao_style_Catalog,
      pdp: taobao_style_ProductDetail,
      cart: taobao_style_Cart,
      checkout: taobao_style_Checkout,
      about: makeAboutAdapter(),
      help: makeHelpAdapter(),
    },
  },

  'packaging-supply': {
    id: 'packaging-supply',
    name: 'Packaging Supply',
    description: 'Pink / yellow / sky / white cheerful packaging-supply storefront',
    group: 'packaging',
    behavior: { bottomNav: 'visible' },
    chrome: {
      Header: PackagingSupplyHeaderAdapter,
      Footer: PackagingSupplyFooterAdapter,
      AnnouncementStrip: PackagingSupplyStripAdapter,
    },
    pages: {
      home: PackagingSupplyHomepageAdapter,
      catalog: PackagingSupplyCatalog,
      pdp: PackagingSupplyProductDetail,
      cart: PackagingSupplyCart,
      checkout: PackagingSupplyCheckout,
      about: makeAboutAdapter(),
      help: makeHelpAdapter(),
    },
  },

  'sai-sing': {
    id: 'sai-sing',
    name: 'Sai Sing',
    description: 'ท่อสูตร อะไหล่ซิ่ง รถแต่ง สไตล์มอเตอร์ไซค์สปอร์ต',
    group: 'specialty',
    behavior: { bottomNav: 'visible' },
    chrome: {
      Header: SaiSingHeaderAdapter,
      Footer: SaiSingFooterAdapter,
      AnnouncementStrip: SaiSingStripAdapter,
    },
    pages: {
      catalog: makeCatalogAdapter('01'),
      pdp: makePdpAdapter('08', '03'),
      checkout: makeThaiCheckoutAdapter(),
      home: enhanceHomepage(SaiSingHomepageAdapter, '05'),
      about: makeAboutAdapter(),
      help: makeHelpAdapter(),
    },
  },

  'talad-see-sod': {
    id: 'talad-see-sod',
    name: 'Talad See Sod',
    description: 'ร้านขายไอทีแกดเจ็ต สีสันสดใส เน้นโปรโมชั่นสะดุดตา',
    group: 'everyday',
    behavior: { bottomNav: 'visible' },
    chrome: {
      Header: TaladSeeSodHeaderAdapter,
      Footer: TaladSeeSodFooterAdapter,
      AnnouncementStrip: TaladSeeSodStripAdapter,
    },
    pages: {
      home: TaladSeeSodHomepageAdapter,
      pdp: TaladSeeSodProductDetail,
      catalog: TaladSeeSodCatalog,
      cart: TaladSeeSodCart,
      checkout: TaladSeeSodCheckout,
      about: makeAboutAdapter(),
      help: makeHelpAdapter(),
    },
  },

  'neon-festival': {
    id: 'neon-festival',
    name: 'Neon Festival',
    description: 'ร้านสายงานเทศกาล แสงนีออน ของแต่งคอนเสิร์ต สไตล์ Neo-Brutalism Pop-Art',
    group: 'neon',
    behavior: { bottomNav: 'visible', stickyCTA: 'buy-now' },
    chrome: {
      Header: NeonFestivalHeaderAdapter,
      Footer: NeonFestivalFooterAdapter,
      AnnouncementStrip: NeonFestivalStripAdapter,
    },
    pages: {
      home: NeonFestivalHomepageAdapter,
      catalog: neon_festival_Catalog,
      pdp: neon_festival_ProductDetail,
      cart: neon_festival_Cart,
      checkout: neon_festival_Checkout,
      about: NeonFestivalAboutAdapter,
      help: NeonFestivalHelpAdapter,
      contact: neon_festival_Contact,
    },
  },

  'neon-festival': {
    id: 'neon-festival',
    name: 'Neon Festival',
    description: 'ร้านสายงานเทศกาล แสงนีออน ของแต่งคอนเสิร์ต สไตล์ Neo-Brutalism Pop-Art',
    group: 'neon',
    behavior: { bottomNav: 'visible', stickyCTA: 'buy-now' },
    chrome: {
      Header: NeonFestivalHeaderAdapter,
      Footer: NeonFestivalFooterAdapter,
      AnnouncementStrip: NeonFestivalStripAdapter,
    },
    pages: {
      home: NeonFestivalHomepageAdapter,
      catalog: neon_festival_Catalog,
      pdp: neon_festival_ProductDetail,
      cart: neon_festival_Cart,
      checkout: neon_festival_Checkout,
      about: NeonFestivalAboutAdapter,
      help: NeonFestivalHelpAdapter,
      contact: neon_festival_Contact,
    },
  },

  'brutalist-thai': {
    id: 'brutalist-thai',
    name: 'Brutalist Thai',
    description: 'โรงพิมพ์และร้านขายโปสเตอร์อาร์ต ดีไซน์ดิบ ดุดัน สไตล์ Brutalist',
    group: 'fashion-beauty',
    behavior: { bottomNav: 'visible' },
    chrome: {
      Header: BrutalistThaiHeaderAdapter,
      Footer: BrutalistThaiFooterAdapter,
      AnnouncementStrip: BrutalistThaiStripAdapter,
    },
    pages: {
      home: enhanceHomepage(BrutalistThaiHomepageAdapter, '01', BRUTALIST_PALETTE),
      catalog: BrutalistCatalog,
      pdp: BrutalistProductDetail,
      cart: BrutalistCart,
      checkout: BrutalistCheckout,
      about: makeAboutAdapter(),
      help: makeHelpAdapter(),
    },
  },

  'mono-eight': {
    id: 'mono-eight',
    name: 'Mono Eight',
    description: 'แฟชั่นสตรีทแวร์ลิมิเต็ด สไตล์ zine ขาวดำ',
    group: 'fashion-beauty',
    behavior: { bottomNav: 'visible', hideRatingsCount: true },
    chrome: {
      Header: MonoEightHeaderAdapter,
      Footer: MonoEightFooterAdapter,
      AnnouncementStrip: MonoEightStripAdapter,
    },
    pages: {
      home: enhanceHomepage(MonoEightHomepageAdapter, '03'),
      catalog: makeCatalogAdapter('05'),
      pdp: mono_eight_ProductDetail,
      cart: mono_eight_Cart,
      checkout: makeThaiCheckoutAdapter(),
      about: makeAboutAdapter(),
      help: makeHelpAdapter(),
    },
  },

  'lila-modest': {
    id: 'lila-modest',
    name: 'Lila Modest',
    description: 'เดรสยาวและผ้าคลุม modest-wear โทนอุ่น',
    group: 'fashion-beauty',
    behavior: { bottomNav: 'visible', storyBlock: 'inline-visible' },
    chrome: {
      Header: LilaModestHeaderAdapter,
      Footer: LilaModestFooterAdapter,
      AnnouncementStrip: LilaModestStripAdapter,
      // Editorial modest-fashion lookbook — wider desktop gutters give
      // imagery room to breathe alongside long-form captions.
      shellShape: 'magazine',
    },
    pages: {
      home: enhanceHomepage(LilaModestHomepageAdapter, '05'),
      catalog: makeCatalogAdapter('04'),
      pdp: lila_modest_ProductDetail,
      cart: makeThaiCartAdapter(),
      checkout: makeThaiCheckoutAdapter(),
      about: makeAboutAdapter(),
      help: makeHelpAdapter(),
    },
  },

  'atelier-27': {
    id: 'atelier-27',
    name: 'Atelier 27',
    description: 'สูทตัดเฉพาะบุคคล premium luxury สไตล์ Hermès',
    group: 'trust',
    behavior: { bottomNav: 'visible', hideRatingsCount: true },
    chrome: {
      Header: Atelier27HeaderAdapter,
      Footer: Atelier27FooterAdapter,
      AnnouncementStrip: Atelier27StripAdapter,
      // Atelier-style editorial — asymmetric grids land better with
      // extra desktop gutters than against the viewport edge.
      shellShape: 'magazine',
    },
    pages: {
      home: enhanceHomepage(Atelier27HomepageAdapter, '02'),
      catalog: makeCatalogAdapter('12'),
      pdp: atelier_27_ProductDetail,
      cart: atelier_27_Cart,
      checkout: makeThaiCheckoutAdapter(),
      about: makeAboutAdapter(),
      help: makeHelpAdapter(),
    },
  },

  'bulkbox-industrial': {
    id: 'bulkbox-industrial',
    name: 'Bulkbox Industrial',
    description: 'Auto-generated theme for bulkbox-industrial',
    group: 'business-model',
    behavior: { bottomNav: 'visible' },
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
      catalog: makeCatalogAdapter('12'),
      home: enhanceHomepage(BulkboxHomepageAdapter, '08'),
          pdp: makePdpAdapter('08', '04'),
      checkout: makeThaiCheckoutAdapter(),
      about: makeAboutAdapter(),
      help: makeHelpAdapter(),
    },
  },

  'caldera-skin': {
    id: 'caldera-skin',
    name: 'Caldera Skin',
    description: 'Auto-generated theme for caldera-skin',
    group: 'fashion-beauty',
    behavior: { bottomNav: 'visible' },
    chrome: {
      Header: CalderaSkinHeaderAdapter,
      Footer: CalderaSkinFooterAdapter,
      AnnouncementStrip: CalderaSkinStripAdapter,
      // Skincare brand site — hero shot of the bottle overlaps the
      // header for that magazine-cover feeling.
      shellShape: 'split-hero',
    },
    pages: {
      home: enhanceHomepage(CalderaSkinHomepageAdapter, '04'),
      catalog: makeCatalogAdapter('05'),
      pdp: caldera_skin_ProductDetail,
      cart: caldera_skin_Cart,
      checkout: makeThaiCheckoutAdapter(),
      about: makeAboutAdapter(),
      help: makeHelpAdapter(),
    },
  },

  'carbon-era-cameras': {
    id: 'carbon-era-cameras',
    name: 'Carbon Era Cameras',
    description: 'Auto-generated theme for carbon-era-cameras',
    group: 'electronics-tech',
    behavior: { bottomNav: 'visible' },
    chrome: {
      Header: CarbonEraCamerasHeaderAdapter,
      Footer: CarbonEraCamerasFooterAdapter,
      AnnouncementStrip: CarbonEraCamerasStripAdapter,
      // TODO(sidebar-left): see Bulkbox note — horizontal header doesn't
      // fit the 240px aside; re-enable once a vertical adapter ships.
    },
    pages: {
      catalog: carbon_era_cameras_Catalog,
      pdp: carbon_era_cameras_ProductDetail,
      cart: carbon_era_cameras_Cart,
      checkout: makeThaiCheckoutAdapter(),
      home: enhanceHomepage(CarbonEraCamerasHomepageAdapter, '07'),
      about: makeAboutAdapter(),
      help: makeHelpAdapter(),
    },
  },

  'glow-lamp-co': {
    id: 'glow-lamp-co',
    name: 'Glow Lamp Co',
    description: 'Auto-generated theme for glow-lamp-co',
    group: 'lifestyle',
    behavior: { bottomNav: 'visible' },
    chrome: {
      Header: GlowLampCoHeaderAdapter,
      Footer: GlowLampCoFooterAdapter,
      AnnouncementStrip: GlowLampCoStripAdapter,
    },
    pages: {
      home: enhanceHomepage(GlowLampCoHomepageAdapter, '06'),
      catalog: makeCatalogAdapter('02'),
      pdp: makePdpAdapter('02', '03'),
          checkout: makeThaiCheckoutAdapter(),
      about: makeAboutAdapter(),
      help: makeHelpAdapter(),
    },
  },

  'hinoki-apothecary': {
    id: 'hinoki-apothecary',
    name: 'Hinoki Apothecary',
    description: 'Auto-generated theme for hinoki-apothecary',
    group: 'fashion-beauty',
    behavior: { bottomNav: 'visible' },
    chrome: {
      Header: HinokiHeaderAdapter,
      Footer: HinokiFooterAdapter,
      AnnouncementStrip: HinokiStripAdapter,
    },
    pages: {
      home: enhanceHomepage(HinokiHomepageAdapter, '09'),
      catalog: makeCatalogAdapter('09'),
      pdp: hinoki_apothecary_ProductDetail,
      cart: hinoki_apothecary_Cart,
      checkout: makeThaiCheckoutAdapter(),
      about: makeAboutAdapter(),
      help: makeHelpAdapter(),
    },
  },

  'inkstone-paper': {
    id: 'inkstone-paper',
    name: 'Inkstone Paper',
    description: 'Auto-generated theme for inkstone-paper',
    group: 'lifestyle',
    behavior: { bottomNav: 'visible' },
    chrome: {
      Header: InkstonePaperHeaderAdapter,
      Footer: InkstonePaperFooterAdapter,
      AnnouncementStrip: InkstonePaperStripAdapter,
    },
    pages: {
      home: enhanceHomepage(InkstonePaperHomepageAdapter, '01'),
      catalog: makeCatalogAdapter('05'),
      pdp: inkstone_paper_ProductDetail,
      checkout: makeThaiCheckoutAdapter(),
      about: makeAboutAdapter(),
      help: makeHelpAdapter(),
    },
  },

  'keystroke-lab': {
    id: 'keystroke-lab',
    name: 'Keystroke Lab',
    description: 'Auto-generated theme for keystroke-lab',
    group: 'electronics-tech',
    behavior: { bottomNav: 'visible' },
    chrome: {
      Header: KeystrokeLabHeaderAdapter,
      Footer: KeystrokeLabFooterAdapter,
      AnnouncementStrip: KeystrokeLabStripAdapter,
      // Mechanical keyboard launch site — the hero shot of the focus
      // board overlaps the header for a hardware-reveal hierarchy.
      shellShape: 'split-hero',
    },
    pages: {
      home: enhanceHomepage(KeystrokeLabHomepageAdapter, '03'),
      catalog: makeCatalogAdapter('06'),
      pdp: keystroke_lab_ProductDetail,
      cart: keystroke_lab_Cart,
      checkout: makeThaiCheckoutAdapter(),
      about: makeAboutAdapter(),
      help: makeHelpAdapter(),
    },
  },

  'korakot-house': {
    id: 'korakot-house',
    name: 'Korakot House',
    description: 'Auto-generated theme for korakot-house',
    group: 'lifestyle',
    behavior: { bottomNav: 'visible' },
    chrome: {
      Header: KorakotHouseHeaderAdapter,
      Footer: KorakotHouseFooterAdapter,
      AnnouncementStrip: KorakotHouseStripAdapter,
    },
    pages: {
      home: enhanceHomepage(KorakotHouseHomepageAdapter, '05'),
      catalog: makeCatalogAdapter('02'),
      pdp: korakot_house_ProductDetail,
      checkout: makeThaiCheckoutAdapter(),
      about: makeAboutAdapter(),
      help: makeHelpAdapter(),
    },
  },

  'linen-and-loom': {
    id: 'linen-and-loom',
    name: 'Linen And Loom',
    description: 'Auto-generated theme for linen-and-loom',
    group: 'fashion-beauty',
    behavior: { bottomNav: 'visible' },
    chrome: {
      Header: LinenAndLoomHeaderAdapter,
      Footer: LinenAndLoomFooterAdapter,
      AnnouncementStrip: LinenAndLoomStripAdapter,
      // Slow-textile editorial — wider gutters echo the printed-catalog
      // feeling the brand voice leans on.
      shellShape: 'magazine',
    },
    pages: {
      home: enhanceHomepage(LinenAndLoomHomepageAdapter, '02'),
      catalog: makeCatalogAdapter('04'),
      pdp: linen_and_loom_ProductDetail,
      cart: linen_and_loom_Cart,
      checkout: makeThaiCheckoutAdapter(),
      about: makeAboutAdapter(),
      help: makeHelpAdapter(),
    },
  },

  'mai-hatthakam': {
    id: 'mai-hatthakam',
    name: 'Mai Hatthakam',
    description: 'Auto-generated theme for mai-hatthakam',
    group: 'specialty',
    behavior: { bottomNav: 'visible' },
    chrome: {
      Header: MaiHatthakamHeaderAdapter,
      Footer: MaiHatthakamFooterAdapter,
      AnnouncementStrip: MaiHatthakamStripAdapter,
    },
    pages: {
      catalog: makeCatalogAdapter('04'),
      pdp: mai_hatthakam_ProductDetail,
      checkout: makeThaiCheckoutAdapter(),
      home: enhanceHomepage(MaiHatthakamHomepageAdapter, '04'),
      about: makeAboutAdapter(),
      help: makeHelpAdapter(),
    },
  },

  'pastel-pack': {
    id: 'pastel-pack',
    name: 'Pastel Pack',
    description: 'Auto-generated theme for pastel-pack',
    group: 'packaging',
    behavior: { bottomNav: 'visible' },
    chrome: {
      Header: PastelPackHeaderAdapter,
      Footer: PastelPackFooterAdapter,
      AnnouncementStrip: PastelPackStripAdapter,
    },
    pages: {
      home: enhanceHomepage(PastelPackHomepageAdapter, '06'),
          pdp: makePdpAdapter('02', '03'),
      checkout: makeThaiCheckoutAdapter(),
      about: makeAboutAdapter(),
      help: makeHelpAdapter(),
    },
  },

  'petit-cote': {
    id: 'petit-cote',
    name: 'Petit Cote',
    description: 'Auto-generated theme for petit-cote',
    group: 'lifestyle',
    behavior: { bottomNav: 'visible' },
    chrome: {
      Header: PetitCoteHeaderAdapter,
      Footer: PetitCoteFooterAdapter,
      AnnouncementStrip: PetitCoteStripAdapter,
      // Petit-Cote leans editorial-boutique — magazine gutters keep
      // its product stories feeling curated, not crammed.
      shellShape: 'magazine',
    },
    pages: {
      home: enhanceHomepage(PetitCoteHomepageAdapter, '07'),
      catalog: makeCatalogAdapter('02'),
      pdp: petit_cote_ProductDetail,
      checkout: makeThaiCheckoutAdapter(),
      about: makeAboutAdapter(),
      help: makeHelpAdapter(),
    },
  },

  'pigment-studio': {
    id: 'pigment-studio',
    name: 'Pigment Studio',
    description: 'Auto-generated theme for pigment-studio',
    group: 'specialty',
    behavior: { bottomNav: 'visible' },
    chrome: {
      Header: PigmentStudioHeaderAdapter,
      Footer: PigmentStudioFooterAdapter,
      AnnouncementStrip: PigmentStudioStripAdapter,
      // Pigment Studio is a maker/atelier brand — magazine gutters
      // frame the colourway swatches like a printed lookbook.
      shellShape: 'magazine',
    },
    pages: {
      home: enhanceHomepage(PigmentStudioHomepageAdapter, '08'),
      catalog: makeCatalogAdapter('08'),
          pdp: makePdpAdapter('05', '04'),
      checkout: makeThaiCheckoutAdapter(),
      about: makeAboutAdapter(),
      help: makeHelpAdapter(),
    },
  },

  'reclaim-leather': {
    id: 'reclaim-leather',
    name: 'Reclaim Leather',
    description: 'Auto-generated theme for reclaim-leather',
    group: 'fashion-beauty',
    behavior: { bottomNav: 'visible' },
    chrome: {
      Header: ReclaimLeatherHeaderAdapter,
      Footer: ReclaimLeatherFooterAdapter,
      AnnouncementStrip: ReclaimLeatherStripAdapter,
    },
    pages: {
      home: enhanceHomepage(ReclaimLeatherHomepageAdapter, '09'),
      catalog: makeCatalogAdapter('07'),
      pdp: reclaim_leather_ProductDetail,
      cart: reclaim_leather_Cart,
      checkout: makeThaiCheckoutAdapter(),
      about: makeAboutAdapter(),
      help: makeHelpAdapter(),
    },
  },

  'saluki-yoga': {
    id: 'saluki-yoga',
    name: 'Saluki Yoga',
    description: 'Auto-generated theme for saluki-yoga',
    group: 'lifestyle',
    behavior: { bottomNav: 'visible' },
    chrome: {
      Header: SalukiYogaHeaderAdapter,
      Footer: SalukiYogaFooterAdapter,
      AnnouncementStrip: SalukiYogaStripAdapter,
    },
    pages: {
      home: enhanceHomepage(SalukiYogaHomepageAdapter, '01'),
      catalog: makeCatalogAdapter('07'),
      pdp: saluki_yoga_ProductDetail,
      checkout: makeThaiCheckoutAdapter(),
      about: makeAboutAdapter(),
      help: makeHelpAdapter(),
    },
  },

  'sirin-womenswear': {
    id: 'sirin-womenswear',
    name: 'Sirin Womenswear',
    description: 'Auto-generated theme for sirin-womenswear',
    group: 'fashion-beauty',
    behavior: { bottomNav: 'visible' },
    chrome: {
      Header: SirinHeaderAdapter,
      Footer: SirinFooterAdapter,
      AnnouncementStrip: SirinStripAdapter,
      // Sirin womenswear — editorial lookbook style benefits from
      // wider outer gutters on desktop for asymmetric imagery.
      shellShape: 'magazine',
    },
    pages: {
      home: enhanceHomepage(SirinHomepageAdapter, '03'),
      catalog: makeCatalogAdapter('03'),
      pdp: sirin_womenswear_ProductDetail,
      cart: sirin_womenswear_Cart,
      checkout: makeThaiCheckoutAdapter(),
      about: makeAboutAdapter(),
      help: makeHelpAdapter(),
    },
  },

  'smartloop-home': {
    id: 'smartloop-home',
    name: 'Smartloop Home',
    description: 'Auto-generated theme for smartloop-home',
    group: 'electronics-tech',
    behavior: { bottomNav: 'visible' },
    chrome: {
      Header: SmartloopHomeHeaderAdapter,
      Footer: SmartloopHomeFooterAdapter,
      AnnouncementStrip: SmartloopHomeStripAdapter,
      // Smart-home hardware brand — flagship product hero rises into
      // the header band for a launch-page hierarchy.
      shellShape: 'split-hero',
    },
    pages: {
      home: enhanceHomepage(SmartloopHomeHomepageAdapter, '02'),
      catalog: makeCatalogAdapter('09'),
      pdp: smartloop_home_ProductDetail,
      checkout: makeThaiCheckoutAdapter(),
      about: makeAboutAdapter(),
      help: makeHelpAdapter(),
    },
  },

  'tinyhand-wooden-toys': {
    id: 'tinyhand-wooden-toys',
    name: 'Tinyhand Wooden Toys',
    description: 'Auto-generated theme for tinyhand-wooden-toys',
    group: 'lifestyle',
    behavior: { bottomNav: 'visible' },
    chrome: {
      Header: TinyhandWoodenToysHeaderAdapter,
      Footer: TinyhandWoodenToysFooterAdapter,
      AnnouncementStrip: TinyhandWoodenToysStripAdapter,
    },
    pages: {
      home: enhanceHomepage(TinyhandWoodenToysHomepageAdapter, '04'),
      catalog: makeCatalogAdapter('02'),
      pdp: tinyhand_wooden_toys_ProductDetail,
      checkout: makeThaiCheckoutAdapter(),
      about: makeAboutAdapter(),
      help: makeHelpAdapter(),
    },
  },

  'trailcraft-outdoors': {
    id: 'trailcraft-outdoors',
    name: 'Trailcraft Outdoors',
    description: 'Auto-generated theme for trailcraft-outdoors',
    group: 'lifestyle',
    behavior: { bottomNav: 'visible' },
    chrome: {
      Header: TrailcraftHeaderAdapter,
      Footer: TrailcraftFooterAdapter,
      AnnouncementStrip: TrailcraftStripAdapter,
    },
    pages: {
      home: enhanceHomepage(TrailcraftHomepageAdapter, '05'),
      catalog: makeCatalogAdapter('07'),
      pdp: trailcraft_outdoors_ProductDetail,
      checkout: makeThaiCheckoutAdapter(),
      about: makeAboutAdapter(),
      help: makeHelpAdapter(),
    },
  },

  'wavelength-audio': {
    id: 'wavelength-audio',
    name: 'Wavelength Audio',
    description: 'Auto-generated theme for wavelength-audio',
    group: 'electronics-tech',
    behavior: { bottomNav: 'visible' },
    chrome: {
      Header: WavelengthAudioHeaderAdapter,
      Footer: WavelengthAudioFooterAdapter,
      AnnouncementStrip: WavelengthAudioStripAdapter,
      // Hi-fi audio — product hero overlaps the header for a single-
      // product launch feeling on the homepage.
      shellShape: 'split-hero',
    },
    pages: {
      home: enhanceHomepage(WavelengthAudioHomepageAdapter, '06'),
      catalog: makeCatalogAdapter('07'),
      pdp: wavelength_audio_ProductDetail,
      checkout: makeThaiCheckoutAdapter(),
      about: makeAboutAdapter(),
      help: makeHelpAdapter(),
    },
  },

  'yumeiro-lip': {
    id: 'yumeiro-lip',
    name: 'Yumeiro Lip',
    description: 'Auto-generated theme for yumeiro-lip',
    group: 'fashion-beauty',
    behavior: { bottomNav: 'visible' },
    chrome: {
      Header: YumeiroLipHeaderAdapter,
      Footer: YumeiroLipFooterAdapter,
      AnnouncementStrip: YumeiroLipStripAdapter,
      // Yumeiro lip — beauty editorial. Magazine gutters keep the
      // colour-story imagery centered like a glossy spread.
      shellShape: 'magazine',
    },
    pages: {
      home: enhanceHomepage(YumeiroLipHomepageAdapter, '07'),
      catalog: yumeiro_lip_Catalog,
      pdp: yumeiro_lip_ProductDetail,
      cart: yumeiro_lip_Cart,
      checkout: makeThaiCheckoutAdapter(),
      about: makeAboutAdapter(),
      help: makeHelpAdapter(),
    },
  },
};



// Re-export from the single source of truth.
// Import TEMPLATE_GROUPS_MAP and alias for backwards compat.
export { TEMPLATE_GROUPS_MAP as templateGroups } from './template-groups';

