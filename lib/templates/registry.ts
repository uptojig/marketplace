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
import TaladSeeSodCheckout from '@/components/storefront/themes/talad-see-sod/pages/Checkout';
import { TALAD_PALETTE } from '@/components/storefront/themes/talad-see-sod/palette';
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




export const templates: Record<TemplateId, Template> = {
  handmade: {
    id: 'handmade',
    name: 'Handmade artisan',
    description: 'Maker portrait + small batch craft',
    group: 'specialty',
        pages: {
      // STOPGAP: `HandmadeHomepageAdapter` was referenced here by the
      // template-pages commit but never created/exported (no
      // themes/handmade/adapters.tsx), which crashed the whole registry
      // module ("HandmadeHomepageAdapter is not defined") and 500'd every
      // page that imports it (e.g. /create-store). Reuse the Mai Hatthakam
      // (Thai handicraft) homepage — closest artisan match — until a real
      // handmade adapter is built.
      home: enhanceHomepage(MaiHatthakamHomepageAdapter, '06'),
      catalog: makeCatalogAdapter('04'),
      pdp: makePdpAdapter('04', '05'),
      checkout: makeCheckoutAdapter('01'),
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
      pdp: makePdpAdapter('06', '02'),
      checkout: makeCheckoutAdapter('02'),
      catalog: makeCatalogAdapter('12'),
      home: enhanceHomepage(BikiniHomepageAdapter, '01'),
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
      checkout: makeCheckoutAdapter('02'),
    },
  },

  'taobao-style': {
    id: 'taobao-style',
    name: 'Taobao Marketplace',
    description: 'Bold orange/red/pink gradient marketplace · flash deals · countdown',
    group: 'taobao',
    behavior: { bottomNav: 'visible', countdownBanner: 'visible', stockIndicators: 'visible' },
  },

  'packaging-supply': {
    id: 'packaging-supply',
    name: 'Packaging Supply',
    description: 'Pink / yellow / sky / white cheerful packaging-supply storefront',
    group: 'packaging',
    behavior: { bottomNav: 'visible' },
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
      checkout: makeCheckoutAdapter('02'),
      home: enhanceHomepage(SaiSingHomepageAdapter, '05'),
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
      home: enhanceHomepage(TaladSeeSodHomepageAdapter, '09', TALAD_PALETTE),
      pdp: TaladSeeSodProductDetail,
      cart: TaladSeeSodCart,
      checkout: TaladSeeSodCheckout,
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
      checkout: makeCheckoutAdapter('01'),
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
      pdp: makePdpAdapter('09', '05'),
      checkout: makeCheckoutAdapter('02'),
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
          pdp: makePdpAdapter('06', '03'),
      checkout: makeCheckoutAdapter('04'),
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
      pdp: makePdpAdapter('02', '03'),
      checkout: makeCheckoutAdapter('01'),
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
      checkout: makeCheckoutAdapter('02'),
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
      pdp: makePdpAdapter('04', '03'),
      checkout: makeCheckoutAdapter('04'),
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
      catalog: makeCatalogAdapter('09'),
      pdp: makePdpAdapter('07', '03'),
      checkout: makeCheckoutAdapter('01'),
      home: enhanceHomepage(CarbonEraCamerasHomepageAdapter, '07'),
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
          checkout: makeCheckoutAdapter('02'),
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
      pdp: makePdpAdapter('08', '04'),
      checkout: makeCheckoutAdapter('04'),
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
          pdp: makePdpAdapter('04', '05'),
      checkout: makeCheckoutAdapter('01'),
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
      pdp: makePdpAdapter('06', '03'),
      checkout: makeCheckoutAdapter('02'),
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
          pdp: makePdpAdapter('07', '02'),
      checkout: makeCheckoutAdapter('04'),
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
      pdp: makePdpAdapter('01', '05'),
      checkout: makeCheckoutAdapter('01'),
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
      pdp: makePdpAdapter('04', '05'),
      checkout: makeCheckoutAdapter('02'),
      home: enhanceHomepage(MaiHatthakamHomepageAdapter, '04'),
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
      checkout: makeCheckoutAdapter('04'),
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
      pdp: makePdpAdapter('05', '02'),
      checkout: makeCheckoutAdapter('01'),
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
          pdp: makePdpAdapter('05', '04'),
      checkout: makeCheckoutAdapter('02'),
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
      pdp: makePdpAdapter('06', '02'),
      checkout: makeCheckoutAdapter('04'),
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
          pdp: makePdpAdapter('03', '05'),
      checkout: makeCheckoutAdapter('01'),
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
      pdp: makePdpAdapter('07', '03'),
      checkout: makeCheckoutAdapter('02'),
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
      pdp: makePdpAdapter('08', '04'),
      checkout: makeCheckoutAdapter('04'),
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
      pdp: makePdpAdapter('04', '04'),
      checkout: makeCheckoutAdapter('01'),
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
      pdp: makePdpAdapter('09', '05'),
      checkout: makeCheckoutAdapter('02'),
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
          pdp: makePdpAdapter('09', '02'),
      checkout: makeCheckoutAdapter('04'),
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
      catalog: makeCatalogAdapter('05'),
      pdp: makePdpAdapter('04', '04'),
      checkout: makeCheckoutAdapter('01'),
    },
  },
};



// Re-export from the single source of truth.
// Import TEMPLATE_GROUPS_MAP and alias for backwards compat.
export { TEMPLATE_GROUPS_MAP as templateGroups } from './template-groups';

