# Prompt: สร้างธีมใหม่ Bespoke 100% + Family Palette ใหม่ + shadcn

> **Output:** AI จะส่งคืน family palette ใหม่ (5 ไฟล์) + theme bespoke ครบทุกหน้า (15 ไฟล์) + wiring (5 ไฟล์) — รวม ~25 ไฟล์ พร้อม diff

---

## 🚀 วิธีใช้ — พิมพ์อะไร?

### Option A — Claude Code CLI (ที่คุณกำลังใช้อยู่)

พิมพ์ใน prompt input:

```
อ่าน @docs/prompts/new-bespoke-theme.md แล้วทำตามนั้น

ค่าตัวแปรของฉัน:
- FAMILY_GROUP_ID = neon
- FAMILY_GROUP_LABEL = Neon Festival Family
- THEME_ID = neon-festival
- THEME_NAME_TH = นีออน เฟสติวัล
- THEME_NAME_EN = Neon Festival
- BRAND_BLURB = ร้านสายงานเทศกาล แสงนีออน ของแต่งคอนเสิร์ต
- VIBE = night festival · neon glow · songkran-vibe
- SHELL_SHAPE = centered
- BEHAVIOR_FLAGS = { bottomNav: "visible", stickyCTA: "buy-now" }
- HEADING_FONT_VAR = var(--font-kanit)
- BODY_FONT_VAR = var(--font-prompt)
- IS_DARK_THEME = true

- SHOP_PRIMARY = #EA1C5C
- SHOP_ACCENT = #7A1AF2
- SHOP_SAVINGS = #FFD700
- SHOP_INK = #FFFFFF
- SHOP_INK_MUTED = #E0E0E0
- SHOP_BG = #030D3A
- SHOP_BG_SOFT = #0A1A5A
- SHOP_MUTED = #11236C
- SHOP_BORDER = #11236C

- PRIMARY_HOVER = #FF4081
- PRIMARY_DARK = #BB1649
- ACCENT_HOVER = #934AF6
- ACCENT_DARK = #590BBD
- SUCCESS_HEX = #00E676
- WARNING_HEX = #FFC400
- ERROR_HEX = #FF1744
- INFO_HEX = #2979FF

shadcn blocks ที่ฉันอยากใช้เป็น base (ปรับแต่งให้เข้ากับธีม):
- Catalog: product-category-08
- PDP: product-overview-06 + product-reviews-04
- Cart: shopping-cart-03
- Checkout: checkout-page-04
- FAQ: faq-component-17
- Hero: hero-section-01

เริ่ม Phase 1 ก่อน — สร้าง family palette neon
```

### Option B — Claude.ai (web) / IDE plugin

Copy เนื้อหา section "📋 Prompt Template" ด้านล่างทั้งก้อน → paste ใน chat → เติมค่าตัวแปร 22 ตัว → ส่ง

---

## 📋 Prompt Template (เนื้อหาสำหรับส่งให้ AI)

> AI: เริ่มอ่านจากบรรทัดนี้ลงไป

````markdown
# งาน: สร้าง Family Palette ใหม่ + Storefront Theme Bespoke 100% + shadcn integration

คุณคือ senior frontend engineer ที่ทำงานบน multi-tenant marketplace
repo นี้ (basketplace.co — Next.js App Router, TypeScript, Tailwind,
Prisma, shadcn/ui + shadcn-studio)

## เป้าหมาย

1. สร้าง **family palette ใหม่** (group ใหม่ใน TemplateGroup union)
   เพราะธีมนี้มีสีของตัวเองที่ไม่เข้ากับ 10 group เดิม
2. สร้าง **ธีม bespoke 100%** — ทุกหน้า (home / catalog / pdp / cart /
   checkout / about / help/faq / contact / shipping / returns /
   privacy / terms) เป็นของธีมนี้เอง รวมถึง PolicyShell ของตัวเอง
3. **ใช้ shadcn blocks เป็นโครงพื้นฐาน** ของหน้าหลัก — copy block ที่
   ระบุไว้จาก `components/shadcn-studio/blocks/<block-id>/` มาวางใน
   theme folder แล้วปรับแต่งเป็นของธีม (ไม่ import ตรงๆ จาก
   shadcn-studio path เพื่อให้แก้ได้อิสระ)
4. **ใช้ shadcn/ui primitives** จาก `@/components/ui/*` ทุกครั้งที่
   ต้องการ Button / Card / Dialog / Accordion / Carousel / Badge ฯลฯ
   — อย่าเขียน HTML ดิบเอง
5. **ห้ามใช้** adapter กลาง: `makeCatalogAdapter`, `makePdpAdapter`,
   `makeCheckoutAdapter`, `makeCartAdapter`, `enhanceHomepage` — เด็ดขาด

## ตัวแปรที่ผู้ใช้จะส่งมา

### Identity
- FAMILY_GROUP_ID      = <kebab-case>      เช่น "neon"
- FAMILY_GROUP_LABEL   = <ภาษาไทย>
- THEME_ID             = <kebab-case>      เช่น "neon-festival"
- THEME_NAME_TH        = <ภาษาไทย>
- THEME_NAME_EN        = <ภาษาอังกฤษ>
- BRAND_BLURB          = <คำบรรยาย 1 บรรทัด ไทย>
- VIBE                 = <คำบรรยายอารมณ์>
- SHELL_SHAPE          = <centered | sidebar-left | split-hero | full-bleed | magazine>
- BEHAVIOR_FLAGS       = <JSON BehaviorFlags>
- HEADING_FONT_VAR     = <var(--font-kanit) | var(--font-prompt) | var(--font-google-sans)>
- BODY_FONT_VAR        = <var(--font-prompt) | var(--font-google-sans)>
- IS_DARK_THEME        = <true | false>

### Palette (CSS vars 9 ตัว — ครบ)
- SHOP_PRIMARY    = <#xxxxxx>   CTA / ราคา
- SHOP_ACCENT     = <#xxxxxx>   hover / secondary
- SHOP_SAVINGS    = <#xxxxxx>   badge / discount
- SHOP_INK        = <#xxxxxx>   text หลัก
- SHOP_INK_MUTED  = <#xxxxxx>   text รอง
- SHOP_BG         = <#xxxxxx>   พื้นร้าน
- SHOP_BG_SOFT    = <#xxxxxx>   surface 1 (card)
- SHOP_MUTED      = <#xxxxxx>   surface 2 (hover)
- SHOP_BORDER     = <#xxxxxx>   border

### Extended palette
- PRIMARY_HOVER / PRIMARY_DARK
- ACCENT_HOVER / ACCENT_DARK
- SUCCESS_HEX / WARNING_HEX / ERROR_HEX / INFO_HEX

### shadcn blocks ที่จะใช้เป็น base
- CATALOG_BLOCK    = <product-category-01..12>
- PDP_BLOCK        = <product-overview-01..09>
- REVIEW_BLOCK     = <product-reviews-02..05>
- CART_BLOCK       = <shopping-cart-01..04>
- CHECKOUT_BLOCK   = <checkout-page-01..04>
- FAQ_BLOCK        = <faq-component-01 | 17>
- HERO_BLOCK       = <hero-section-01> (optional)

---

## Reference (อ่านก่อนเริ่ม)

1. **Family palette pattern:** `lib/landing/packaging.ts`
   (PACKAGING_TOKENS, packagingCssVars, isPackagingStore,
   PACKAGING_BODY_CLASS)
2. **Bespoke theme golden reference:**
   `components/storefront/themes/talad-see-sod/` (chrome + pages +
   adapters) + entry `'talad-see-sod'` ใน `lib/templates/registry.ts`
3. **Anti-pattern:** `components/storefront/themes/pastel-pack/` —
   ใช้ shared adapter ผสม → สีตีกัน ห้ามทำตาม
4. **Routing flow:**
   - `app/stores/[slug]/page.tsx` block "(b) Template bespoke homepage"
   - `app/stores/[slug]/layout.tsx` (StoreShell shellShape)
   - `app/stores/[slug]/_lib/render-schema-page.tsx`
     (wrapInFamilyShell — เพิ่ม branch ใหม่)
   - `app/stores/[slug]/{about,faq,shipping,returns,privacy,terms}/page.tsx`
5. **shadcn primitives:** `components/ui/*` (52 ตัว — accordion,
   alert, avatar, badge, button, card, carousel, checkbox,
   dialog, drawer, dropdown-menu, input, label, navigation-menu,
   pagination, popover, progress, select, separator, sheet, skeleton,
   slider, switch, table, tabs, textarea, toast, toggle, tooltip
   + custom: border-beam, glass-button, grow-button, neural-button,
   marquee, motion-preset, number-ticker, orbiting, circular-progress)
6. **shadcn-studio blocks:** `components/shadcn-studio/blocks/*` (82
   blocks สำหรับ storefront)
7. **Type contracts:** `lib/templates/types.ts`
8. **Cart store:** `lib/store/cart` — useCart

---

## Phase 1 — Family Palette ใหม่ (5 ไฟล์)

### 1.1 ไฟล์ใหม่: `lib/landing/<FAMILY_GROUP_ID>.ts`

Copy pattern จาก `lib/landing/packaging.ts`:

```ts
/**
 * <FAMILY_GROUP_LABEL>
 * <VIBE>
 */
import { templateIdsForGroup } from '@/lib/templates/template-groups';

const <FAMILY_UPPER>_TEMPLATE_IDS: ReadonlySet<string> =
  templateIdsForGroup('<FAMILY_GROUP_ID>');

const <FAMILY_UPPER>_VARIANT_VALUES: ReadonlySet<string> =
  new Set(['<FAMILY_GROUP_ID>']);

export function is<FamilyPascal>Store(input: {
  templateId?: string | null;
  landingThemeVariant?: string | null;
}): boolean {
  const tpl = input.templateId ?? '';
  const variant = input.landingThemeVariant ?? '';
  if (tpl && <FAMILY_UPPER>_TEMPLATE_IDS.has(tpl)) return true;
  if (variant && <FAMILY_UPPER>_VARIANT_VALUES.has(variant)) return true;
  return false;
}

export const <FAMILY_UPPER>_BODY_CLASS = 'theme-<FAMILY_GROUP_ID>';

export const <FAMILY_UPPER>_TOKENS = {
  primary:  '<SHOP_PRIMARY>',
  accent:   '<SHOP_ACCENT>',
  savings:  '<SHOP_SAVINGS>',
  ink:      '<SHOP_INK>',
  inkMuted: '<SHOP_INK_MUTED>',
  bg:       '<SHOP_BG>',
  bgSoft:   '<SHOP_BG_SOFT>',
  border:   '<SHOP_BORDER>',
  muted:    '<SHOP_MUTED>',
} as const;

export function <familyCamel>CssVars(): Record<string, string> {
  const c = <FAMILY_UPPER>_TOKENS;
  return {
    '--shop-primary':   c.primary,
    '--shop-accent':    c.accent,
    '--shop-savings':   c.savings,
    '--shop-ink':       c.ink,
    '--shop-ink-muted': c.inkMuted,
    '--shop-bg':        c.bg,
    '--shop-bg-soft':   c.bgSoft,
    '--shop-border':    c.border,
    '--shop-muted':     c.muted,
  };
}
```

### 1.2 `lib/templates/types.ts`
เพิ่ม `'<FAMILY_GROUP_ID>'` เข้า union `TemplateGroup` ตามตัวอักษร

### 1.3 `lib/templates/template-groups.ts`
เพิ่ม entry ใน `TEMPLATE_GROUPS_MAP`:
```ts
'<FAMILY_GROUP_ID>': ['<THEME_ID>'],
```

### 1.4 `lib/storefront/resolve-store-theme.ts`
4 จุด:
- เพิ่ม `'<FAMILY_GROUP_ID>'` เข้า `ThemeKey` union
- import: `is<FamilyPascal>Store`, `<FAMILY_UPPER>_BODY_CLASS`,
  `<FAMILY_UPPER>_TOKENS`, `<familyCamel>CssVars`
- เพิ่มใน chrome ladder ก่อน `else default`:
  ```ts
  else if (is<FamilyPascal>Store(key)) chromeKey = '<FAMILY_GROUP_ID>';
  ```
- เพิ่ม switch case:
  ```ts
  case '<FAMILY_GROUP_ID>':
    familyClass = <FAMILY_UPPER>_BODY_CLASS;
    familyVars = <familyCamel>CssVars();
    familyAccent = <FAMILY_UPPER>_TOKENS.accent;
    familyButtonShape = 'pill';   // ปรับตาม VIBE
    break;
  ```
- ใน `resolveContentThemeKey()`:
  ```ts
  if (is<FamilyPascal>Store(key)) return '<FAMILY_GROUP_ID>';
  ```

### 1.5 `app/globals.css`
เพิ่ม body skin + neon utility ถ้าเป็น dark/neon theme:
```css
.theme-<FAMILY_GROUP_ID> {
  color-scheme: <"dark" if IS_DARK_THEME else "light">;
}
.theme-<FAMILY_GROUP_ID> ::selection {
  background-color: <SHOP_PRIMARY>;
  color: <SHOP_INK>;
}
.theme-<FAMILY_GROUP_ID> .neon-glow-primary {
  box-shadow: 0 0 12px <SHOP_PRIMARY>, 0 0 24px <SHOP_PRIMARY>40;
}
.theme-<FAMILY_GROUP_ID> .neon-glow-accent {
  box-shadow: 0 0 12px <SHOP_ACCENT>, 0 0 24px <SHOP_ACCENT>40;
}
.theme-<FAMILY_GROUP_ID> .neon-text-glow {
  text-shadow: 0 0 8px currentColor, 0 0 16px currentColor;
}
```

---

## Phase 2 — Theme Files (16 ไฟล์ ทุกไฟล์ขึ้นต้น `'use client';`)

```
components/storefront/themes/<THEME_ID>/
├── palette.ts                          # BlockPalette + extended hex
├── adapters.tsx                        # adapters + page re-exports
├── PolicyShell.tsx                     # wrapper สำหรับ shipping/returns/privacy/terms
├── chrome/
│   ├── Header.tsx                      # ใช้ navbar-component-01 หรือ 11 เป็น base
│   ├── Footer.tsx                      # ใช้ footer-component-01 เป็น base
│   └── AnnouncementStrip.tsx
└── pages/
    ├── Homepage.tsx                    # ใช้ HERO_BLOCK + product-list-XX
    ├── Catalog.tsx                     # ใช้ CATALOG_BLOCK เป็น base
    ├── ProductDetail.tsx               # ใช้ PDP_BLOCK + REVIEW_BLOCK เป็น base
    ├── Cart.tsx                        # ใช้ CART_BLOCK เป็น base
    ├── Checkout.tsx                    # ใช้ CHECKOUT_BLOCK เป็น base
    ├── About.tsx
    ├── Help.tsx                        # ใช้ FAQ_BLOCK เป็น base
    └── Contact.tsx
```

### กฎการใช้ shadcn blocks

**วิธีปรับ shadcn block ให้เป็นของธีม:**

1. **Copy** เนื้อหาจาก `components/shadcn-studio/blocks/<BLOCK_ID>/<BLOCK_ID>.tsx`
   มาเป็นไฟล์ใหม่ใน `components/storefront/themes/<THEME_ID>/pages/`
   (อย่า import ตรงจาก shadcn-studio path — copy + rename)
2. **เปลี่ยน hardcoded data** ให้รับจาก props (CatalogProps,
   ProductDetailProps, etc.) — ดู type ใน `lib/templates/types.ts`
3. **Replace primitives** ที่มาจาก path อื่น → ให้ใช้
   `@/components/ui/*` (Button, Card, Badge, ฯลฯ) ทุกตัว
4. **Restyle ด้วย Tailwind className** ที่อ้าง CSS vars ของ family:
   - `bg-[var(--shop-bg)]` / `bg-[var(--shop-bg-soft)]`
   - `text-[var(--shop-ink)]` / `text-[var(--shop-ink-muted)]`
   - `border-[var(--shop-border)]`
   - `bg-[var(--shop-primary)]` สำหรับ CTA
5. **เพิ่ม neon-glow class** บน CTA + hero (ใช้ utility ใน globals.css)
6. **Font** — ทุก heading ใช้ `font-[family:var(--font-kanit)]` (หรือ
   ตาม HEADING_FONT_VAR), body ใช้ BODY_FONT_VAR

### กฎไฟล์รายไฟล์

**palette.ts** — export `<ThemeName>_PALETTE: BlockPalette` (จาก
`../_shared/palette`) + `<ThemeName>_HEX` (extended hex สำหรับ
hover/dark/semantic states)

**chrome/Header.tsx** — base จาก `navbar-component-01` (clean) หรือ
`navbar-component-11` (mega-menu). ต้องมี:
- Logo (storeLogoUrl → fallback อักษรย่อในกรอบ neon-glow)
- Search form `action=/stores/${slug}/search method=get name=q`
- Cart link + badge (useCart count) ครอบด้วย `neon-glow-primary`
- Category nav (max 6 chips) + mobile sheet (`@/components/ui/sheet`)
- ใช้ `@/components/ui/dropdown-menu` สำหรับ user menu

**chrome/Footer.tsx** — base จาก `footer-component-01`. ต้องแสดง:
- 4 columns: Brand / Categories / Customer Service / Contact
- ใช้ `@/components/ui/separator` คั่น
- Social icons (lucide-react: Facebook, Instagram, Twitter, MessageCircle)
- ลิงก์เฉพาะ `availableSupportPages` ที่มี content จริง

**chrome/AnnouncementStrip.tsx** — `@/components/ui/marquee` (มีอยู่แล้ว)
+ Megaphone icon + neon-text-glow

**PolicyShell.tsx** — wrapper รับ `{ title, children }`:
- Hero strip สี `bg-[var(--shop-bg-soft)]` + title font-kanit ใหญ่
- Sidebar TOC (sticky บน desktop) + content card สี
  `bg-[var(--shop-bg-soft)]` border `border-[var(--shop-border)]`
- ใช้ `@/components/ui/accordion` สำหรับ sections ใน policy

**pages/Homepage.tsx** — Compose:
1. AnnouncementStrip
2. Hero — copy จาก `hero-section-01` ปรับให้รับ
   `landingContent.heroHeadline/Subheadline/CtaLabel/CtaUrl/ImageUrl`
   ก่อน fallback default Thai
3. Category chip rail (`@/components/ui/button` variant=outline)
4. Featured grid 4 ชิ้น (`@/components/ui/card`) — neon hover border
5. Trending grid 8 ชิ้น (smaller card)
6. Brand story stripe (อ่าน landingContent ถ้ามี)
7. CTA section — copy จาก `cta-section-10` ปรับสี
8. Add-to-cart: `useCart((s) => s.add)` payload ครบ

**pages/Catalog.tsx** (`default export`) — base CATALOG_BLOCK:
- Category filter chips (`@/components/ui/button` variant=outline)
- Sort dropdown (`@/components/ui/select`)
- Product grid จาก pageProducts
- `@/components/ui/pagination` ที่ buildUrl(undefined, page)
- Empty state ภาษาไทย

**pages/ProductDetail.tsx** (`default export`) — base PDP_BLOCK + REVIEW_BLOCK:
- Gallery (`@/components/ui/carousel` หรือ aspect-ratio) — dedupe
  imageUrl + images, sticky desktop
- Variant picker (`@/components/ui/toggle-group` หรือ button group)
- Qty stepper (`@/components/ui/button` ± + `@/components/ui/input`)
- Price + compareAtPriceTHB strikethrough — ใช้ formatTHB
- Add-to-cart button (neon-glow-primary, ใหญ่)
- `@/components/ui/tabs` สำหรับ Description / Specs / Reviews / Shipping
- REVIEW_BLOCK component ทำ review section
- Related products rail (carousel)

**pages/Cart.tsx** (`default export`) — base CART_BLOCK:
- อ่าน cart จาก `useCart` (ไม่ใช่ props เพียว)
- Line items — `@/components/ui/card` ต่อรายการ
- Qty +/- + remove button
- Subtotal + shipping (50) + free-ship progress bar
  (`@/components/ui/progress`) เป้า 990
- Coupon input (`@/components/ui/input` + `@/lib/coupons/calculator`)
- ปุ่มไปหน้า checkout (neon-glow-primary, ใหญ่)
- Empty state Thai + CTA กลับไป catalog

**pages/Checkout.tsx** (`default export`) — base CHECKOUT_BLOCK:
- 4 steps stepper (custom + neon active state) — ตะกร้า → ที่อยู่ →
  ชำระเงิน → ยืนยัน
- อ่าน cart จาก useCart
- POST `/api/checkout`
- Shipping picker (`@/components/ui/radio-group`): EMS / ลงทะเบียน
- Payment method picker (PromptPay / โอน / COD)
- Order summary sticky sidebar

**pages/About.tsx** (`default export`) — `AboutProps`:
- Hero + brand story อ่าน landingContent.brandStory ถ้ามี
- Founder / team grid (`@/components/ui/avatar` + card)
- 4 values cards (mission / craft / promise / community)
- CTA กลับไปหน้าสินค้า

**pages/Help.tsx** (`default export`) — `HelpProps` มี pageSlug:
- Hero "ศูนย์ช่วยเหลือ"
- Search box (`@/components/ui/input`)
- ถ้า pageSlug = "faq" → ใช้ FAQ_BLOCK base — copy + ปรับ
- ถ้า pageSlug อื่น → render content จาก landingContent หรือ static
- Sidebar TOC (sticky)
- Contact CTA ด้านล่าง

**pages/Contact.tsx** — accept `{ store }` (ดู ContactProps ใน
`lib/templates/types.ts` — สร้างถ้ายังไม่มี):
- Hero "ติดต่อเรา"
- Contact methods grid 4 cards (`@/components/ui/card`):
  Phone / Email / LINE / Facebook
- Inquiry form (`@/components/ui/form` ถ้ามี, ไม่งั้น input + textarea):
  ชื่อ / อีเมล / หัวข้อ / ข้อความ
- POST `/api/stores/[slug]/contact` (ถ้ามี endpoint) หรือ
  mailto fallback
- Google Maps embed (ถ้ามี lat/lng ของร้าน)

**adapters.tsx**:
```ts
'use client';
import type {
  HomepageProps as ScaffoldHomepageProps,
  HeaderProps as ScaffoldHeaderProps,
  FooterProps as ScaffoldFooterProps,
  AnnouncementStripProps as ScaffoldStripProps,
  AboutProps as ScaffoldAboutProps,
  HelpProps as ScaffoldHelpProps,
  ContactProps as ScaffoldContactProps,
} from '@/lib/templates/types';

import { Header as <Theme>Header } from './chrome/Header';
import { Footer as <Theme>Footer } from './chrome/Footer';
import { AnnouncementStrip as <Theme>Strip } from './chrome/AnnouncementStrip';
import { Homepage as <Theme>Homepage } from './pages/Homepage';
import { About as <Theme>About } from './pages/About';
import { Help as <Theme>Help } from './pages/Help';

export function <Theme>HeaderAdapter(props: ScaffoldHeaderProps) { ... }
export function <Theme>FooterAdapter(props: ScaffoldFooterProps) { ... }
export function <Theme>StripAdapter(props: ScaffoldStripProps) { ... }
export function <Theme>HomepageAdapter(props: ScaffoldHomepageProps) { ... }
export function <Theme>AboutAdapter(props: ScaffoldAboutProps) { ... }
export function <Theme>HelpAdapter(props: ScaffoldHelpProps) { ... }

export { default as <theme_snake>_Catalog }       from './pages/Catalog';
export { default as <theme_snake>_ProductDetail } from './pages/ProductDetail';
export { default as <theme_snake>_Cart }          from './pages/Cart';
export { default as <theme_snake>_Checkout }      from './pages/Checkout';
export { default as <theme_snake>_Contact }       from './pages/Contact';
export { <Theme>PolicyShell }                     from './PolicyShell';
```

---

## Phase 3 — Register & Wire (5 ไฟล์)

### 3.1 `lib/templates/types.ts`
- เพิ่ม `'<THEME_ID>'` เข้า `TemplateId` union
- เพิ่ม `ContactProps` (ถ้ายังไม่มี):
  ```ts
  export interface ContactProps {
    store: StoreSummary;
  }
  ```
- เพิ่ม `contact?: ComponentType<ContactProps>` ใน `TemplatePages`

### 3.2 `lib/templates/registry.ts`
```ts
'<THEME_ID>': {
  id: '<THEME_ID>',
  name: '<THEME_NAME_EN>',
  description: '<BRAND_BLURB>',
  group: '<FAMILY_GROUP_ID>',
  behavior: <BEHAVIOR_FLAGS>,
  chrome: {
    Header: <Theme>HeaderAdapter,
    Footer: <Theme>FooterAdapter,
    AnnouncementStrip: <Theme>StripAdapter,
    shellShape: '<SHELL_SHAPE>',
  },
  pages: {
    home:     <Theme>HomepageAdapter,
    catalog:  <theme_snake>_Catalog,
    pdp:      <theme_snake>_ProductDetail,
    cart:     <theme_snake>_Cart,
    checkout: <theme_snake>_Checkout,
    about:    <Theme>AboutAdapter,
    help:     <Theme>HelpAdapter,
    contact:  <theme_snake>_Contact,
  },
},
```

### 3.3 ไฟล์ใหม่: `app/stores/[slug]/contact/page.tsx`
Copy pattern จาก `about/page.tsx` — dispatch:
template.pages.contact → v12 schema → fallback StoreSocialIcons

### 3.4 `app/stores/[slug]/_lib/render-schema-page.tsx`
ใน `wrapInFamilyShell()` เพิ่ม branch (ใช้ dynamic import เลี่ยง circular):
```ts
if (is<FamilyPascal>Store({
  templateId: effectiveTpl,
  landingThemeVariant: store.landingThemeVariant,
})) {
  const { <Theme>PolicyShell } = await import(
    '@/components/storefront/themes/<THEME_ID>/PolicyShell'
  );
  return <<Theme>PolicyShell title={title}>{body}</<Theme>PolicyShell>;
}
```

### 3.5 `lib/store/wizard-data.ts`
เพิ่ม entry ใน `TEMPLATES` array + recommendedTemplates ของ niche

---

## Phase 4 — Dark-theme polish (ถ้า IS_DARK_THEME = true)

ตรวจ component shared ที่อาจ hardcode `bg-white` / `text-gray-900`:
- `components/shop/CookiesBar.tsx`
- `components/shop/ShopFloatingButtons.tsx`
- `components/shop/cart-confirmation-modal.tsx`
- `app/stores/[slug]/error.tsx`, `not-found.tsx`

แก้เป็น `bg-[var(--shop-bg-soft)]` / `text-[var(--shop-ink)]` — PR แยกได้

---

## กฎเหล็ก

### shadcn discipline
- **Block-based**: copy block จาก `components/shadcn-studio/blocks/<id>/`
  มาแล้วปรับ — ไม่ import ตรงจาก path เดิม
- **Primitive-based**: Button/Card/Input/etc. ต้อง import จาก
  `@/components/ui/*` เสมอ — ไม่เขียน HTML ดิบ
- **Composition over copy**: ถ้า block ที่เลือกใหญ่เกินไป ตัดเฉพาะส่วน
  ที่ใช้ + รักษา accessibility (aria-* / keyboard nav) ของ shadcn ไว้

### Color discipline
- ภายใน chrome/pages เลือก 1 ใน 2:
  1. ใช้ `bg-[var(--shop-primary)]` / `text-[var(--shop-ink)]` ตลอด
     (เพื่อให้ themeAccentOverride ของ operator มีผล)
  2. Hardcode hex จาก `<FAMILY_UPPER>_TOKENS` + extended hex
     (เพื่อ neon-glow ที่ตรงเป๊ะ)
- ไม่ผสม approach

### Editability
- ทุก hero / brand story / FAQ อ่าน `landingContent` ก่อน fallback
- ห้าม hardcode product placeholder
- ห้ามใช้รูป external (Unsplash / picsum) — ใช้ SVG / gradient / สีพื้น
- Default copy ภาษาไทยทั้งหมด

### Font
- ใช้ font ที่ลงทะเบียนใน `app/layout.tsx` แล้วเท่านั้น
- Syntax: `font-[family:var(--font-kanit)]`
- ห้าม import font ใหม่

### Code
- ทุกไฟล์ขึ้นต้น `'use client';`
- ราคา → `formatTHB(...)` จาก `@/lib/utils` ห้าม `฿${...}`
- Icon → `lucide-react`
- Link → `next/link`
- Cart → `useCart` จาก `@/lib/store/cart`

---

## Output ที่ฉันต้องการ

ส่งเป็น **3 phases** แยก message:

### Message 1 — Phase 1
- Code block เต็มของ `lib/landing/<group>.ts`
- Diff 4 ไฟล์ที่แก้ (types.ts, template-groups.ts, resolve-store-theme.ts, globals.css)
- หยุดรอ confirm ก่อนไป Phase 2

### Message 2 — Phase 2
- Code block เต็ม 16 ไฟล์ใน `components/storefront/themes/<THEME_ID>/`
- หยุดรอ confirm ก่อนไป Phase 3

### Message 3 — Phase 3 + Checklist
- Diff/code ของ 5 ไฟล์ wiring
- Checklist ครบที่รันผ่านแล้ว
- Note ถ้ามี dependencies ที่ต้อง install เพิ่ม

````

---

## ✅ Post-generation Checklist

หลัง AI ส่งครบทั้ง 3 phases รันเช็คตามนี้ก่อน commit:

### Phase 1 (Family)
- [ ] `lib/landing/<group>.ts` ใหม่ — มี `is<X>Store`, `<X>_BODY_CLASS`, `<x>CssVars`
- [ ] `TemplateGroup` union มี `'<FAMILY_GROUP_ID>'`
- [ ] `TEMPLATE_GROUPS_MAP` มี entry ใหม่
- [ ] `resolveChromeTheme()` มี case ใหม่ใน switch + ladder
- [ ] `resolveContentThemeKey()` มี branch ใหม่
- [ ] `globals.css` มี `.theme-<group>` class

### Phase 2 (Theme)
- [ ] 16 ไฟล์ครบใน `components/storefront/themes/<theme-id>/`
- [ ] `'use client';` บรรทัดแรกทุกไฟล์
- [ ] **shadcn primitives** import จาก `@/components/ui/*` (ไม่ใช่ raw HTML)
- [ ] **shadcn blocks** copy มาเป็นไฟล์ของธีม (ไม่ import path เดิม)

### Phase 3 (Wiring)
- [ ] `TemplateId` union มี `'<THEME_ID>'`
- [ ] `ContactProps` + `contact?` slot ใน `TemplatePages`
- [ ] `registry.ts` entry ครบ chrome + 8 pages
- [ ] `app/stores/[slug]/contact/page.tsx` route ใหม่
- [ ] `wrapInFamilyShell()` มี branch ใหม่
- [ ] `wizard-data.ts` มี entry

### Anti-patterns (ห้ามมี — grep ตรวจ)
- [ ] `grep -rn "makeCatalogAdapter\|makePdpAdapter\|makeCheckoutAdapter\|makeCartAdapter\|enhanceHomepage" components/storefront/themes/<theme-id>/` ต้อง **empty**
- [ ] `grep -rn "from '@/components/shadcn-studio/blocks" components/storefront/themes/<theme-id>/` ต้อง **empty** (ใช้ copy ไม่ใช้ import path เดิม)

### Quality
- [ ] `pnpm typecheck` ผ่าน — เน้น `registry.ts` + `template-groups.ts`
- [ ] `pnpm lint` ผ่าน
- [ ] ตั้ง store ทดสอบ `templateId = '<THEME_ID>'` แล้วคลิกครบ 12 หน้า:
  `/`, `/category`, `/products/[id]`, `/cart`, `/checkout`,
  `/about`, `/contact`, `/faq`, `/shipping`, `/returns`,
  `/privacy`, `/terms`
- [ ] cart badge + CTA + footer + policy hero สีตรงกัน
- [ ] Dark theme: ตรวจ CookiesBar / FloatingButtons / cart-confirmation-modal — ไม่มี `bg-white` ตกค้าง

---

## 📚 Reference Files (ที่ AI ต้องอ้างอิงตลอด)

| Path | ใช้เป็น |
|---|---|
| `lib/landing/packaging.ts` | Family palette pattern |
| `components/storefront/themes/talad-see-sod/` | Bespoke theme golden reference |
| `lib/templates/registry.ts` (entry `talad-see-sod`) | Registry entry pattern |
| `components/shadcn-studio/blocks/` | Block library 82 ตัว |
| `components/ui/` | Primitive library 52 ตัว |
| `lib/templates/types.ts` | Type contracts |
| `app/stores/[slug]/about/page.tsx` | Dispatch route pattern |
| `app/stores/[slug]/_lib/render-schema-page.tsx` | PolicyShell wrap point |
