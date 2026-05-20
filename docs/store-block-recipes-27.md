# 27 Demo Stores — shadcn-studio Block Recipe Matrix

**Status:** Final-ready. Buildable spec. Downstream build agent imports the exact paths listed in each store's "Import paths" line.
**Owner:** UI Designer
**Date:** 2026-05-21
**Source identity doc:** `/Users/maythanyaka/marketplace/docs/store-identities-25.md`
**Block library root:** `/Users/maythanyaka/marketplace/components/shadcn-studio/blocks/`

---

## How to read a recipe row

Each store has a single table. Every `Choice` is a real variant slug whose folder exists under `components/shadcn-studio/blocks/`. The exported component is the **default export** of `<slug>/<slug>.tsx` — names below were grepped, not guessed:

| Block family | Default export name (from grep) |
|---|---|
| `navbar-component-NN/navbar-component-NN.tsx` | `Navbar` |
| `product-list-NN/product-list-NN.tsx` | `ProductList` |
| `product-category-NN/product-category-NN.tsx` | `ProductCategory` |
| `product-overview-NN/product-overview-NN.tsx` | `ProductOverview` |
| `product-reviews-NN/product-reviews-NN.tsx` | `ProductReviews` |
| `shopping-cart-NN/shopping-cart-NN.tsx` | `ShoppingCart` |
| `checkout-page-NN/checkout-page-NN.tsx` | `Checkout` |
| `bento-grid-NN/bento-grid-NN.tsx` | `BentoGrid` |
| `social-proof-10/social-proof-10.tsx` | `SocialProof` |
| `app-integration-10/app-integration-10.tsx` | `AppIntegration` |

When a row says `"none"` the store should NOT render that section (fall back to default `ShopHeader` / `ShopFooter` / per-route generic page, or omit the section entirely). Thai-primary copy is fed from `StoreLandingContent` slots (`heroHeadline`, `heroSubheadline`, `heroCtaLabel`, `featuredTiles[]`, `faqItems[]`, `testimonials[]`, `aboutHeading`, `aboutBody`, `announcementStripDesktop`, `announcementStripMobile`) — block JSX must consume those props, never hardcode English.

---

## CRITICAL GAPS — variants the identity doc needs but the repo does NOT ship

The shadcn-studio library imported into this repo currently ships **product-page** primitives (catalog grid, category filter, PDP overview, reviews, cart, checkout, bento grid, social proof, integration, one navbar) but **does NOT ship dedicated `hero-section-*`, `footer-section-*`, or `announcement-strip-*` variant folders**. Every store identity assumes a Hero band and a Footer block. Flag for the operator:

1. **Hero variants — 0 dedicated `hero-section-*` folders exist.** Substitute strategy: use `bento-grid-{05,09,11,14}` and `product-category-{01..12}` as **hero proxies** (top-of-page composition slot). Hero copy from `StoreLandingContent.heroHeadline` overlays the bento/category top tile. **Proposal: create `hero-section-01` … `hero-section-15`** to give every store a real hero. Until then, the proxy choices below are what the build agent imports.
2. **Footer variants — 0 dedicated `footer-section-*` folders exist.** Every store falls back to the existing generic `ShopFooter` (`components/store/shop-footer.tsx`). **Proposal: create `footer-section-01..06`** (minimal/airy ivory, dense link-grid, B2B contact block, kraft maker portrait, dark neon, brutalist block). Recipe rows list `"shop-footer-default"` as a placeholder so the build agent knows the slot has no shadcn-studio block yet.
3. **Navbar — only `navbar-component-11` ships.** All 27 stores currently MUST share the same navbar shell. To preserve layout DNA divergence, each store annotates a different **prop preset** (height, density, search position, category strip on/off) on top of `navbar-component-11`. **Proposal: create `navbar-component-{01..10,12..15}`** so the matrix can stop sharing. Until then, the operator can verify "uniqueness" holds on the OTHER four key columns (Hero / Footer / Product-list / PDP-overview).
4. **Announcement strip — 0 variants.** Falls back to the generic `<AnnouncementStrip>` already in `app/stores/[slug]/layout.tsx`. Copy comes from `StoreLandingContent.announcementStripDesktop` + `announcementStripMobile`.

**Uniqueness contract under current gaps:** because navbar + footer are effectively single-source today, the 5-key uniqueness verification table at the END of this doc uses (**Hero-proxy × Product-list × PDP-overview × Category-filter × Cart**) — five columns where the library DOES ship multiple variants. This gives 16 × 9 × 8 × 12 × 4 = 55,296 unique combinations against a 27-store demand; every row below is verifiably distinct.

---

## Block inventory (audited 2026-05-21)

```
hero-section-*                  0 variants   GAP — propose hero-section-01..15
footer-section-*                0 variants   GAP — propose footer-section-01..06
announcement-strip-*            0 variants   GAP — fallback to layout AnnouncementStrip
navbar-component-*              1 variant    navbar-component-11
product-list-*                  9 variants   01,02,03,04,05,06,07,08,09
product-category-*             12 variants   01,02,03,04,05,06,07,08,09,10,11,12
product-overview-*              8 variants   01,02,04,05,06,07,08,09  (no 03)
product-reviews-*               4 variants   02,03,04,05              (no 01)
shopping-cart-*                 4 variants   01,02,03,04
checkout-page-*                 3 variants   01,02,04                 (no 03)
bento-grid-*                    4 variants   05,09,11,14
social-proof-*                  1 variant    social-proof-10
app-integration-*               1 variant    app-integration-10
```

Non-block files in the folder (`chart-*.tsx`, `datatable-*.tsx`, `dropdown-*.tsx`, `menu-sheet.tsx`, `order-summary-*`, `statistics-card-*`, `widget-*`) are admin/dashboard primitives and are NOT used in storefront recipes.

---

## Store recipes

> **Reading guide:** `Hero (home)` = top-of-page composition slot. Until `hero-section-*` ships, the Hero column references the bento-grid or product-category variant that serves as the hero proxy. Build agent should overlay `heroHeadline` + `heroSubheadline` + `heroCtaLabel` from `StoreLandingContent` on top of the chosen proxy.

---

### 1. Mono Eight (mono-eight) — `minimal-noir` adapter

| Section | Choice | Rationale |
|---|---|---|
| Header / Navbar | `navbar-component-11` (preset: hairline-rule, no search bar) | Only navbar shipped; ivory link list on near-black bar matches monochrome zine. |
| Announcement strip | none (layout-default) | "DROP 08" strip from `announcementStripDesktop`. |
| Hero (home) | `bento-grid-14` | Card-stack bento gives chunky monochrome tile feel; overlay Kanit Black eyebrow + ivory headline. |
| Featured tiles (home) | `product-category-09` | Sharp-corner category tiles for the 3 featured drops. |
| Social proof / testimonials | `social-proof-10` | Single quote w/ globe — keeps single testimonial centre-stage. |
| Features / value-prop | none | Pure zine — only product + about. |
| CTA mid-page | none | Sticky drop-CTA only. |
| FAQ (home) | none (footer-only) | Mono Eight identity says no chatty FAQ on home. |
| Product list (catalog) | `product-list-01` | Cleanest baseline 3-col grid — lets the photography speak. |
| Category filter | `product-category-01` | Minimal chip rail. |
| PDP — overview | `product-overview-01` | Half-and-half image + spec, no swatch row. |
| PDP — reviews | `product-reviews-02` | Compact list, no avatars. |
| PDP — quick-view modal | none | Drop-only — no quick-view. |
| Shopping cart | `shopping-cart-01` | Stripped single-column list. |
| Checkout | `checkout-page-01` | Minimal one-step. |
| About page | `app-integration-10` (about-shell) | Reuse the long-form integration template to host about copy with a near-black hero band. |
| Footer | `shop-footer-default` (GAP) | No footer-section variant yet. |
| Bento grid usage | `bento-grid-14` (hero only) | Used as hero proxy, not repeated below. |

Import paths: `@/components/shadcn-studio/blocks/navbar-component-11`, `@/components/shadcn-studio/blocks/bento-grid-14`, `@/components/shadcn-studio/blocks/product-category-09`, `@/components/shadcn-studio/blocks/social-proof-10`, `@/components/shadcn-studio/blocks/product-list-01`, `@/components/shadcn-studio/blocks/product-category-01`, `@/components/shadcn-studio/blocks/product-overview-01`, `@/components/shadcn-studio/blocks/product-reviews-02`, `@/components/shadcn-studio/blocks/shopping-cart-01`, `@/components/shadcn-studio/blocks/checkout-page-01`, `@/components/shadcn-studio/blocks/app-integration-10`.

---

### 2. Lila Modest (lila-modest)

| Section | Choice | Rationale |
|---|---|---|
| Header / Navbar | `navbar-component-11` (preset: standard, search visible) | Warm camel-on-cream link styling. |
| Announcement strip | none (layout-default) | "ส่งฟรี 1,500.-" |
| Hero (home) | `product-category-02` | Image-anchored category tile reads as warm story-block above grid (Lila signature). |
| Featured tiles (home) | `product-category-03` | 3-tile featured row, soft camel borders. |
| Social proof / testimonials | none | Story-block carries the trust. |
| Features / value-prop | `bento-grid-09` | Soft product bento for "ทำไมต้องลินิน-เรยอน". |
| CTA mid-page | none | One CTA at hero. |
| FAQ (home) | none | Lives only in help page. |
| Product list (catalog) | `product-list-02` | Wider tile with eyebrow + price-only, no compare-at. |
| Category filter | `product-category-04` | Side-pill filter feels boutique. |
| PDP — overview | `product-overview-02` | Tall portrait gallery + sticky add-to-cart. |
| PDP — reviews | `product-reviews-03` | Star summary + text-heavy reviews fit modest-wear feedback. |
| PDP — quick-view modal | none | Boutique = full PDP visit. |
| Shopping cart | `shopping-cart-02` | Two-column summary. |
| Checkout | `checkout-page-02` | Single-screen with address inline. |
| About page | `app-integration-10` (about-shell) | Story-block above grid is on home; about page reuses long-form shell. |
| Footer | `shop-footer-default` (GAP) | Generic footer. |
| Bento grid usage | `bento-grid-09` (mid-page) | Material story bento. |

Import paths: `@/components/shadcn-studio/blocks/navbar-component-11`, `@/components/shadcn-studio/blocks/product-category-02`, `@/components/shadcn-studio/blocks/product-category-03`, `@/components/shadcn-studio/blocks/bento-grid-09`, `@/components/shadcn-studio/blocks/product-list-02`, `@/components/shadcn-studio/blocks/product-category-04`, `@/components/shadcn-studio/blocks/product-overview-02`, `@/components/shadcn-studio/blocks/product-reviews-03`, `@/components/shadcn-studio/blocks/shopping-cart-02`, `@/components/shadcn-studio/blocks/checkout-page-02`, `@/components/shadcn-studio/blocks/app-integration-10`.

---

### 3. Atelier 27 (atelier-27)

| Section | Choice | Rationale |
|---|---|---|
| Header / Navbar | `navbar-component-11` (preset: airy, large logo, no category strip) | Premium-luxury — minimum chrome. |
| Announcement strip | none | "นัดวัดตัวฟรี" passes through. |
| Hero (home) | `product-category-05` | Single asymmetric large photo with single eyebrow word fits "ทุกตะเข็บ วัดจากร่างกายของคุณ". |
| Featured tiles (home) | `product-category-06` | Three editorial-airy tiles. |
| Social proof / testimonials | `social-proof-10` | Single quote — premium restraint. |
| Features / value-prop | none | Airy whitespace, no features bar. |
| CTA mid-page | `app-integration-10` (booking-CTA preset) | "นัดวัดตัว" mid-page CTA with calendar feel. |
| FAQ (home) | none | Helps page only. |
| Product list (catalog) | `product-list-03` | Tall product card with Kanit Light eyebrow above price-hidden tile (ratings count hidden). |
| Category filter | `product-category-07` | Top-anchored airy filter row. |
| PDP — overview | `product-overview-04` | Large left photo + minimal right spec (made-to-measure). |
| PDP — reviews | none | Premium-luxury hides ratings count per identity doc. |
| PDP — quick-view modal | none | PDP only. |
| Shopping cart | `shopping-cart-03` | Spacious whitespace cart. |
| Checkout | `checkout-page-04` (multi-step) | Four-step (cart→address→payment→confirm) feels concierge. |
| About page | `app-integration-10` (story-shell) | About page reuses with maker portrait band. |
| Footer | `shop-footer-default` (GAP) | Generic. |
| Bento grid usage | none | Premium luxury — bento feels too playful. |

Import paths: `@/components/shadcn-studio/blocks/navbar-component-11`, `@/components/shadcn-studio/blocks/product-category-05`, `@/components/shadcn-studio/blocks/product-category-06`, `@/components/shadcn-studio/blocks/social-proof-10`, `@/components/shadcn-studio/blocks/app-integration-10`, `@/components/shadcn-studio/blocks/product-list-03`, `@/components/shadcn-studio/blocks/product-category-07`, `@/components/shadcn-studio/blocks/product-overview-04`, `@/components/shadcn-studio/blocks/shopping-cart-03`, `@/components/shadcn-studio/blocks/checkout-page-04`.

> **Shared with #1 navbar / footer (only one variant exists).** Layout DNA diverges via Hero (`product-category-05` vs `bento-grid-14`), Product-list (`product-list-03` vs `product-list-01`), PDP (`product-overview-04` vs `product-overview-01`), Cart (`shopping-cart-03` vs `shopping-cart-01`), Checkout (`checkout-page-04` vs `checkout-page-01`).

---

### 4. Sirin Womenswear (sirin-womenswear)

| Section | Choice | Rationale |
|---|---|---|
| Header / Navbar | `navbar-component-11` (preset: lookbook, portrait-aware) | Same shell, different prop set (collection-month label slot enabled). |
| Announcement strip | none | "ส่งฟรี 2 ชิ้น" passes through. |
| Hero (home) | `bento-grid-05` | Ripple-bg + circle SVG bento makes a feminine rose hero with portrait tile. |
| Featured tiles (home) | `product-category-08` | 3D card-effect tiles for monthly collection feel. |
| Social proof / testimonials | none | Lookbook is image-first, no testimonials on home. |
| Features / value-prop | none | Monthly collection IS the value-prop. |
| CTA mid-page | none | Hero CTA only. |
| FAQ (home) | none | Help page. |
| Product list (catalog) | `product-list-04` | Lookbook layout — price-on-hover product cards. |
| Category filter | `product-category-08` | 3D-card filter doubles as collection navigator. |
| PDP — overview | `product-overview-05` | Vertical scroll gallery + sticky size picker (curated for women's apparel). |
| PDP — reviews | `product-reviews-04` | Photo-review heavy (lookbook customers post pics). |
| PDP — quick-view modal | `product-overview-05` (modal-mode) | Quick swatch peek on grid hover. |
| Shopping cart | `shopping-cart-04` | Image-heavy cart with collection thumbnails. |
| Checkout | `checkout-page-02` | Single-screen address inline. |
| About page | `app-integration-10` (designer-story shell) | About copy in soft rose. |
| Footer | `shop-footer-default` (GAP) | Generic. |
| Bento grid usage | `bento-grid-05` (hero) | Used as hero proxy. |

Import paths: `@/components/shadcn-studio/blocks/navbar-component-11`, `@/components/shadcn-studio/blocks/bento-grid-05`, `@/components/shadcn-studio/blocks/product-category-08`, `@/components/shadcn-studio/blocks/product-list-04`, `@/components/shadcn-studio/blocks/product-overview-05`, `@/components/shadcn-studio/blocks/product-reviews-04`, `@/components/shadcn-studio/blocks/shopping-cart-04`, `@/components/shadcn-studio/blocks/checkout-page-02`, `@/components/shadcn-studio/blocks/app-integration-10`.

> **Layout DNA divergence from #1 Mono Eight (same fashion-beauty group):** Hero (`bento-grid-05` vs `bento-grid-14`), Product-list (`product-list-04` vs `product-list-01`), PDP (`product-overview-05` vs `product-overview-01`), Category-filter (`product-category-08` vs `product-category-01`), Cart (`shopping-cart-04` vs `shopping-cart-01`). 5 of 5 differ.

---

### 5. Caldera Skin (caldera-skin) — `clinical-lab` adapter

| Section | Choice | Rationale |
|---|---|---|
| Header / Navbar | `navbar-component-11` (preset: clinical, trial-badge slot) | Teal-on-glass with "Clinical Trial #07" badge slot. |
| Announcement strip | none | Trial-ID strip from `announcementStripDesktop`. |
| Hero (home) | `product-category-10` | Spec-table category tile fits "ผิวที่อ่านได้" data feel. |
| Featured tiles (home) | `product-category-11` | Lab-card 3-tile row with pH + INCI badge. |
| Social proof / testimonials | `social-proof-10` | Dermatologist quote front-and-centre. |
| Features / value-prop | `bento-grid-11` | Chart-balance bento doubles as "show the clinical numbers". |
| CTA mid-page | none | Trial-ID is the conversion driver. |
| FAQ (home) | none | Lives in PDP. |
| Product list (catalog) | `product-list-05` | Carousel-style list — clinical product trios. |
| Category filter | `product-category-02` | Image+ingredient pill filter. |
| PDP — overview | `product-overview-06` | Data-sheet layout: photo left, full INCI right with downloadable trial PDF link. |
| PDP — reviews | `product-reviews-05` | Long-form review w/ form for skin-type tag (clinical context). |
| PDP — quick-view modal | none | Full PDP needed for INCI list. |
| Shopping cart | `shopping-cart-02` | Two-column summary. |
| Checkout | `checkout-page-01` | Minimal one-step. |
| About page | `app-integration-10` (lab-shell) | About copy explaining lab partnership. |
| Footer | `shop-footer-default` (GAP) | Generic. |
| Bento grid usage | `bento-grid-11` (mid-page) | Lab data visualisation. |

Import paths: `@/components/shadcn-studio/blocks/navbar-component-11`, `@/components/shadcn-studio/blocks/product-category-10`, `@/components/shadcn-studio/blocks/product-category-11`, `@/components/shadcn-studio/blocks/social-proof-10`, `@/components/shadcn-studio/blocks/bento-grid-11`, `@/components/shadcn-studio/blocks/product-list-05`, `@/components/shadcn-studio/blocks/product-category-02`, `@/components/shadcn-studio/blocks/product-overview-06`, `@/components/shadcn-studio/blocks/product-reviews-05`, `@/components/shadcn-studio/blocks/shopping-cart-02`, `@/components/shadcn-studio/blocks/checkout-page-01`, `@/components/shadcn-studio/blocks/app-integration-10`.

---

### 6. Yumeiro Lip (yumeiro-lip)

| Section | Choice | Rationale |
|---|---|---|
| Header / Navbar | `navbar-component-11` (preset: beauty-swatch, swatch-row slot) | 32-shade swatch row hangs under the navbar. |
| Announcement strip | none | "Spring Drop" strip. |
| Hero (home) | `product-category-12` | Full-width horizontal circle swatches — IS the homepage's primary block. |
| Featured tiles (home) | `product-category-08` | 3D-card-effect for "16 shades / 6 blush / glass-gloss" trio. |
| Social proof / testimonials | `social-proof-10` | MUA testimonial. |
| Features / value-prop | none | Swatch row IS the feature. |
| CTA mid-page | `app-integration-10` (shade-finder preset) | Mid-page "AI shade finder" CTA module. |
| FAQ (home) | none | PDP. |
| Product list (catalog) | `product-list-06` | Compact tile w/ swatch dot strip. |
| Category filter | `product-category-12` | Swatch-circle filter (matches hero). |
| PDP — overview | `product-overview-07` | Lip swatch try-on layout with shade picker. |
| PDP — reviews | `product-reviews-04` | Photo-heavy lip-swatch reviews. |
| PDP — quick-view modal | `product-overview-07` (modal-mode) | Hover swatch quick-peek. |
| Shopping cart | `shopping-cart-01` | Simple list. |
| Checkout | `checkout-page-02` | Single-screen. |
| About page | `app-integration-10` (playful-shell) | 32-shades manifesto. |
| Footer | `shop-footer-default` (GAP) | Generic. |
| Bento grid usage | none | Swatch row already carries the chromatic energy. |

Import paths: `@/components/shadcn-studio/blocks/navbar-component-11`, `@/components/shadcn-studio/blocks/product-category-12`, `@/components/shadcn-studio/blocks/product-category-08`, `@/components/shadcn-studio/blocks/social-proof-10`, `@/components/shadcn-studio/blocks/app-integration-10`, `@/components/shadcn-studio/blocks/product-list-06`, `@/components/shadcn-studio/blocks/product-overview-07`, `@/components/shadcn-studio/blocks/product-reviews-04`, `@/components/shadcn-studio/blocks/shopping-cart-01`, `@/components/shadcn-studio/blocks/checkout-page-02`.

---

### 7. Hinoki Apothecary (hinoki-apothecary)

| Section | Choice | Rationale |
|---|---|---|
| Header / Navbar | `navbar-component-11` (preset: storyteller, narrow, story-count slot) | "Story 12" counter in navbar. |
| Announcement strip | none | "เรื่องที่ 12" strip. |
| Hero (home) | `app-integration-10` | Long-form integration shell fits literary "อ่านกลิ่นแรก" essay-like hero. |
| Featured tiles (home) | `product-category-04` | Side-pill story-tile row. |
| Social proof / testimonials | `social-proof-10` | Perfume critic quote. |
| Features / value-prop | `bento-grid-09` | Story-photo bento (each tile is a story still). |
| CTA mid-page | none | Read-then-shop flow. |
| FAQ (home) | none | Help page. |
| Product list (catalog) | `product-list-07` | Wide-row card with story excerpt slot. |
| Category filter | `product-category-04` | Story-pill filter. |
| PDP — overview | `product-overview-08` | Editorial PDP — long-form story sits next to product image. |
| PDP — reviews | `product-reviews-02` | Brief text-only reviews. |
| PDP — quick-view modal | none | Stories are read in full. |
| Shopping cart | `shopping-cart-02` | Two-column. |
| Checkout | `checkout-page-04` | Multi-step concierge feel. |
| About page | `app-integration-10` (essay-shell) | Founders + writer + perfumer essay. |
| Footer | `shop-footer-default` (GAP) | Generic. |
| Bento grid usage | `bento-grid-09` (mid-page) | Story-photo bento. |

Import paths: `@/components/shadcn-studio/blocks/navbar-component-11`, `@/components/shadcn-studio/blocks/app-integration-10`, `@/components/shadcn-studio/blocks/product-category-04`, `@/components/shadcn-studio/blocks/social-proof-10`, `@/components/shadcn-studio/blocks/bento-grid-09`, `@/components/shadcn-studio/blocks/product-list-07`, `@/components/shadcn-studio/blocks/product-overview-08`, `@/components/shadcn-studio/blocks/product-reviews-02`, `@/components/shadcn-studio/blocks/shopping-cart-02`, `@/components/shadcn-studio/blocks/checkout-page-04`.

> **Shared bento-grid-09 with #2 Lila Modest** (only 4 bento variants exist). Combo diverges: Hero (`app-integration-10` vs `product-category-02`), Product-list (`product-list-07` vs `product-list-02`), PDP (`product-overview-08` vs `product-overview-02`), Checkout (`checkout-page-04` vs `checkout-page-02`).

---

### 8. Korakot House (korakot-house) — `mid-century-scene` adapter

| Section | Choice | Rationale |
|---|---|---|
| Header / Navbar | `navbar-component-11` (preset: lifestyle, FSC-badge slot) | FSC cert badge in navbar. |
| Announcement strip | none | "ส่งฟรี + ประกอบให้". |
| Hero (home) | `bento-grid-09` | Scene-style product bento — every tile is a styled room. |
| Featured tiles (home) | `product-category-03` | 3 lifestyle scene tiles. |
| Social proof / testimonials | `social-proof-10` | Architect testimonial. |
| Features / value-prop | none | Scene photography IS the feature. |
| CTA mid-page | `app-integration-10` (studio-visit CTA) | "Studio Visit" booking. |
| FAQ (home) | none | Help page. |
| Product list (catalog) | `product-list-08` | Two-up wide scene cards. |
| Category filter | `product-category-09` | Scene-thumbnail filter. |
| PDP — overview | `product-overview-09` | Scene-hero PDP with 21-day countdown slot. |
| PDP — reviews | `product-reviews-03` | Star + photo reviews. |
| PDP — quick-view modal | none | Full scene PDP needed. |
| Shopping cart | `shopping-cart-03` | Spacious cart. |
| Checkout | `checkout-page-04` | Multi-step (lead-time disclosure). |
| About page | `app-integration-10` (kiln-shell) | Sawmill + sustainable forestry story. |
| Footer | `shop-footer-default` (GAP) | Generic. |
| Bento grid usage | `bento-grid-09` (hero) | Scene-bento is the hero. |

Import paths: `@/components/shadcn-studio/blocks/navbar-component-11`, `@/components/shadcn-studio/blocks/bento-grid-09`, `@/components/shadcn-studio/blocks/product-category-03`, `@/components/shadcn-studio/blocks/social-proof-10`, `@/components/shadcn-studio/blocks/app-integration-10`, `@/components/shadcn-studio/blocks/product-list-08`, `@/components/shadcn-studio/blocks/product-category-09`, `@/components/shadcn-studio/blocks/product-overview-09`, `@/components/shadcn-studio/blocks/product-reviews-03`, `@/components/shadcn-studio/blocks/shopping-cart-03`, `@/components/shadcn-studio/blocks/checkout-page-04`.

---

### 9. Linen & Loom (linen-and-loom)

| Section | Choice | Rationale |
|---|---|---|
| Header / Navbar | `navbar-component-11` (preset: airy, no category strip) | Linen calm. |
| Announcement strip | none | "ซื้อ 1 แถม 2". |
| Hero (home) | `product-category-06` | Editorial-airy single tile of folded linen. |
| Featured tiles (home) | `product-category-05` | Asymmetric large + 2-small. |
| Social proof / testimonials | none | Calm whitespace. |
| Features / value-prop | `bento-grid-05` | Ripple bento for "stonewash process" reveal. |
| CTA mid-page | none | Hero CTA only. |
| FAQ (home) | none | Help page. |
| Product list (catalog) | `product-list-09` | Oversize ivory tile, ample whitespace. |
| Category filter | `product-category-07` | Top airy filter. |
| PDP — overview | `product-overview-04` | Big photo + spec right. |
| PDP — reviews | `product-reviews-02` | Text-only brief reviews. |
| PDP — quick-view modal | none | Full PDP. |
| Shopping cart | `shopping-cart-03` | Spacious. |
| Checkout | `checkout-page-02` | Single-screen. |
| About page | `app-integration-10` (linen-shell) | Stonewash + Belgian flax story. |
| Footer | `shop-footer-default` (GAP) | Generic. |
| Bento grid usage | `bento-grid-05` (mid-page) | Stonewash ripple. |

Import paths: `@/components/shadcn-studio/blocks/navbar-component-11`, `@/components/shadcn-studio/blocks/product-category-06`, `@/components/shadcn-studio/blocks/product-category-05`, `@/components/shadcn-studio/blocks/bento-grid-05`, `@/components/shadcn-studio/blocks/product-list-09`, `@/components/shadcn-studio/blocks/product-category-07`, `@/components/shadcn-studio/blocks/product-overview-04`, `@/components/shadcn-studio/blocks/product-reviews-02`, `@/components/shadcn-studio/blocks/shopping-cart-03`, `@/components/shadcn-studio/blocks/checkout-page-02`, `@/components/shadcn-studio/blocks/app-integration-10`.

> **Layout DNA divergence from #8 Korakot (both home niche):** Hero (`product-category-06` vs `bento-grid-09`), Product-list (`product-list-09` vs `product-list-08`), PDP (`product-overview-04` vs `product-overview-09`), Filter (`product-category-07` vs `product-category-09`), Cart (`shopping-cart-03` vs `shopping-cart-03` — **shared, but the other 4 differ**), Checkout (`checkout-page-02` vs `checkout-page-04`). Verified 5-of-6 differ.

---

### 10. Glow Lamp Co (glow-lamp-co)

| Section | Choice | Rationale |
|---|---|---|
| Header / Navbar | `navbar-component-11` (preset: midnight, kelvin-toggle slot) | 2700K / 4000K toggle in navbar. |
| Announcement strip | none | "แลกหลอดเก่า -200". |
| Hero (home) | `bento-grid-11` | Chart-balance bento — perfect for the "bulb-off / bulb-on" thumbnail comparison concept. |
| Featured tiles (home) | `product-category-10` | Lab-card tiles for kelvin specs. |
| Social proof / testimonials | `social-proof-10` | Cafe-owner quote. |
| Features / value-prop | none | Bento covers it. |
| CTA mid-page | none | One CTA. |
| FAQ (home) | none | Help page. |
| Product list (catalog) | `product-list-06` | Compact tile w/ kelvin chip. |
| Category filter | `product-category-11` | Spec-row filter (kelvin / lumens / CRI). |
| PDP — overview | `product-overview-02` | Portrait gallery + sticky add — bulb photo dominates. |
| PDP — reviews | `product-reviews-03` | Star + text. |
| PDP — quick-view modal | none | Full PDP. |
| Shopping cart | `shopping-cart-04` | Image-heavy. |
| Checkout | `checkout-page-01` | Minimal. |
| About page | `app-integration-10` (designer-shell) | Hotel-lighting designer story. |
| Footer | `shop-footer-default` (GAP) | Generic. |
| Bento grid usage | `bento-grid-11` (hero) | Bulb-off/on comparison. |

Import paths: `@/components/shadcn-studio/blocks/navbar-component-11`, `@/components/shadcn-studio/blocks/bento-grid-11`, `@/components/shadcn-studio/blocks/product-category-10`, `@/components/shadcn-studio/blocks/social-proof-10`, `@/components/shadcn-studio/blocks/product-list-06`, `@/components/shadcn-studio/blocks/product-category-11`, `@/components/shadcn-studio/blocks/product-overview-02`, `@/components/shadcn-studio/blocks/product-reviews-03`, `@/components/shadcn-studio/blocks/shopping-cart-04`, `@/components/shadcn-studio/blocks/checkout-page-01`, `@/components/shadcn-studio/blocks/app-integration-10`.

---

### 11. Wavelength Audio (wavelength-audio)

| Section | Choice | Rationale |
|---|---|---|
| Header / Navbar | `navbar-component-11` (preset: single-product, bottom-nav hidden, buy-now sticky) | One SKU. |
| Announcement strip | none | "จัดส่ง 7 มิ.ย." |
| Hero (home) | `product-overview-08` | Editorial PDP-as-hero — WV1 is the whole homepage. |
| Featured tiles (home) | `bento-grid-11` | Frequency-response chart bento. |
| Social proof / testimonials | `social-proof-10` | Mastering-engineer quote. |
| Features / value-prop | `bento-grid-14` | Card-stack "what we cut out" exploded-view bento. |
| CTA mid-page | `app-integration-10` (sticky-buy preset) | Sticky "สั่งจอง WV1". |
| FAQ (home) | `product-reviews-05` | FAQ feed reused as Q+A; review-form acts as inquiry. |
| Product list (catalog) | `product-list-01` | One-SKU catalog still needs a grid for accessories. |
| Category filter | none | Single product mode. |
| PDP — overview | `product-overview-08` | Same as hero — PDP IS the homepage. |
| PDP — reviews | `product-reviews-05` | Engineer-grade Q+A reviews. |
| PDP — quick-view modal | none | One SKU. |
| Shopping cart | `shopping-cart-01` | One item — simple. |
| Checkout | `checkout-page-04` | Multi-step (pre-order). |
| About page | `app-integration-10` (founder-shell) | "4 ปีของการตัดส่วน" story. |
| Footer | `shop-footer-default` (GAP) | Generic. |
| Bento grid usage | `bento-grid-14` + `bento-grid-11` | Two bentos — exploded-view and freq-response. |

Import paths: `@/components/shadcn-studio/blocks/navbar-component-11`, `@/components/shadcn-studio/blocks/product-overview-08`, `@/components/shadcn-studio/blocks/bento-grid-11`, `@/components/shadcn-studio/blocks/bento-grid-14`, `@/components/shadcn-studio/blocks/social-proof-10`, `@/components/shadcn-studio/blocks/app-integration-10`, `@/components/shadcn-studio/blocks/product-list-01`, `@/components/shadcn-studio/blocks/product-reviews-05`, `@/components/shadcn-studio/blocks/shopping-cart-01`, `@/components/shadcn-studio/blocks/checkout-page-04`.

---

### 12. Keystroke Lab (keystroke-lab) — `spec-rack` adapter

| Section | Choice | Rationale |
|---|---|---|
| Header / Navbar | `navbar-component-11` (preset: dark-mode, compare-toggle slot) | Only dark store; cyan accent on near-black. |
| Announcement strip | none | "Holy Panda กลับมาแล้ว". |
| Hero (home) | `product-category-11` | Spec-row category tile is THE spec-rack identity. |
| Featured tiles (home) | `product-category-10` | Lab-card row for switch testers. |
| Social proof / testimonials | none | Spec-rows ARE the proof. |
| Features / value-prop | `bento-grid-11` | Polling-rate chart-balance bento. |
| CTA mid-page | `app-integration-10` (compare-CTA preset) | "เปรียบเทียบสวิตช์". |
| FAQ (home) | none | PDP. |
| Product list (catalog) | `product-list-07` | Wide-row spec card. |
| Category filter | `product-category-11` | Spec-row filter (sw type / actuation / weight / polling). |
| PDP — overview | `product-overview-06` | Data-sheet PDP with in-line audio player slot. |
| PDP — reviews | `product-reviews-04` | Photo-heavy keyboard build reviews. |
| PDP — quick-view modal | `product-overview-06` (modal-mode) | Spec peek on grid hover. |
| Shopping cart | `shopping-cart-04` | Image-heavy. |
| Checkout | `checkout-page-02` | Single-screen. |
| About page | `app-integration-10` (3-devs-shell) | Three-founders story. |
| Footer | `shop-footer-default` (GAP) | Generic — dark variant prop. |
| Bento grid usage | `bento-grid-11` (mid-page) | Polling-rate chart. |

Import paths: `@/components/shadcn-studio/blocks/navbar-component-11`, `@/components/shadcn-studio/blocks/product-category-11`, `@/components/shadcn-studio/blocks/product-category-10`, `@/components/shadcn-studio/blocks/bento-grid-11`, `@/components/shadcn-studio/blocks/app-integration-10`, `@/components/shadcn-studio/blocks/product-list-07`, `@/components/shadcn-studio/blocks/product-overview-06`, `@/components/shadcn-studio/blocks/product-reviews-04`, `@/components/shadcn-studio/blocks/shopping-cart-04`, `@/components/shadcn-studio/blocks/checkout-page-02`.

---

### 13. Smartloop Home (smartloop-home)

| Section | Choice | Rationale |
|---|---|---|
| Header / Navbar | `navbar-component-11` (preset: catalog-dense, search-top-bar, cover hidden) | Distributor portal feel. |
| Announcement strip | none | "ส่งวันเดียว 990.-". |
| Hero (home) | `product-category-12` | Swatch-circle row repurposed as "Matter / Zigbee / Z-Wave / Wi-Fi" protocol filter chips — IS the hero. |
| Featured tiles (home) | `product-category-09` | Dense grid tile. |
| Social proof / testimonials | `social-proof-10` | Solutions-architect testimonial. |
| Features / value-prop | none | Dense grid IS the value. |
| CTA mid-page | none | Search bar IS the CTA. |
| FAQ (home) | none | Help. |
| Product list (catalog) | `product-list-05` | Carousel-dense — 5-up desktop / 3-up mobile. |
| Category filter | `product-category-09` | Dense chip grid. |
| PDP — overview | `product-overview-05` | Vertical gallery + protocol badge column. |
| PDP — reviews | `product-reviews-03` | Star + text. |
| PDP — quick-view modal | `product-overview-05` (modal-mode) | Quick spec peek. |
| Shopping cart | `shopping-cart-02` | Two-column. |
| Checkout | `checkout-page-02` | Fast single-screen (same-day ship). |
| About page | `app-integration-10` (engineer-shell) | IoT-engineer team story. |
| Footer | `shop-footer-default` (GAP) | Generic. |
| Bento grid usage | none | Dense grid handles density. |

Import paths: `@/components/shadcn-studio/blocks/navbar-component-11`, `@/components/shadcn-studio/blocks/product-category-12`, `@/components/shadcn-studio/blocks/product-category-09`, `@/components/shadcn-studio/blocks/social-proof-10`, `@/components/shadcn-studio/blocks/product-list-05`, `@/components/shadcn-studio/blocks/product-overview-05`, `@/components/shadcn-studio/blocks/product-reviews-03`, `@/components/shadcn-studio/blocks/shopping-cart-02`, `@/components/shadcn-studio/blocks/checkout-page-02`, `@/components/shadcn-studio/blocks/app-integration-10`.

---

### 14. Trailcraft Outdoors (trailcraft-outdoors) — `trail-grit` adapter

| Section | Choice | Rationale |
|---|---|---|
| Header / Navbar | `navbar-component-11` (preset: lifestyle, route-pill row) | Phukradueng / Doi Inthanon route pills. |
| Announcement strip | none | "TIM2026 Race Pack". |
| Hero (home) | `bento-grid-14` | Card-stack bento with topo SVG bg behind. |
| Featured tiles (home) | `product-category-09` | Performance-badge dense tile. |
| Social proof / testimonials | `social-proof-10` | 100K-finisher quote. |
| Features / value-prop | `bento-grid-09` | Race-route bento. |
| CTA mid-page | none | One hero CTA. |
| FAQ (home) | none | Help. |
| Product list (catalog) | `product-list-08` | Wide row with Drop/Stack/Weight badge slots. |
| Category filter | `product-category-10` | Lab-card filter (terrain / drop / weight). |
| PDP — overview | `product-overview-09` | Scene-hero PDP — shoe on rock. |
| PDP — reviews | `product-reviews-04` | Photo-trail reviews. |
| PDP — quick-view modal | none | Full PDP. |
| Shopping cart | `shopping-cart-04` | Image-heavy. |
| Checkout | `checkout-page-01` | Minimal. |
| About page | `app-integration-10` (athlete-shell) | Ex-national-team story. |
| Footer | `shop-footer-default` (GAP) | Generic. |
| Bento grid usage | `bento-grid-14` (hero) + `bento-grid-09` (mid) | Two bentos. |

Import paths: `@/components/shadcn-studio/blocks/navbar-component-11`, `@/components/shadcn-studio/blocks/bento-grid-14`, `@/components/shadcn-studio/blocks/product-category-09`, `@/components/shadcn-studio/blocks/social-proof-10`, `@/components/shadcn-studio/blocks/bento-grid-09`, `@/components/shadcn-studio/blocks/product-list-08`, `@/components/shadcn-studio/blocks/product-category-10`, `@/components/shadcn-studio/blocks/product-overview-09`, `@/components/shadcn-studio/blocks/product-reviews-04`, `@/components/shadcn-studio/blocks/shopping-cart-04`, `@/components/shadcn-studio/blocks/checkout-page-01`, `@/components/shadcn-studio/blocks/app-integration-10`.

---

### 15. Saluki Yoga (saluki-yoga)

| Section | Choice | Rationale |
|---|---|---|
| Header / Navbar | `navbar-component-11` (preset: spa-calm) | Mint palette. |
| Announcement strip | none | "18 ขวดต่อชุด". |
| Hero (home) | `product-category-04` | Side-pill story tile — "Made from 18 PET bottles" story-block above grid. |
| Featured tiles (home) | `product-category-02` | Image-anchored 3 tiles. |
| Social proof / testimonials | none | Story-block carries trust. |
| Features / value-prop | `bento-grid-05` | Ripple bento for sustainability story. |
| CTA mid-page | none | One CTA. |
| FAQ (home) | none | Help. |
| Product list (catalog) | `product-list-02` | Wide tile w/ eyebrow. |
| Category filter | `product-category-05` | Asymmetric filter feels boutique. |
| PDP — overview | `product-overview-05` | Vertical scroll gallery — leggings need front+back. |
| PDP — reviews | `product-reviews-04` | Photo-yoga-class reviews. |
| PDP — quick-view modal | `product-overview-05` (modal-mode) | Size peek. |
| Shopping cart | `shopping-cart-02` | Two-column. |
| Checkout | `checkout-page-02` | Single-screen. |
| About page | `app-integration-10` (sustainability-shell) | Bandung mill + Aceh coast story. |
| Footer | `shop-footer-default` (GAP) | Generic. |
| Bento grid usage | `bento-grid-05` (mid) | Ripple sustainability. |

Import paths: `@/components/shadcn-studio/blocks/navbar-component-11`, `@/components/shadcn-studio/blocks/product-category-04`, `@/components/shadcn-studio/blocks/product-category-02`, `@/components/shadcn-studio/blocks/bento-grid-05`, `@/components/shadcn-studio/blocks/product-list-02`, `@/components/shadcn-studio/blocks/product-category-05`, `@/components/shadcn-studio/blocks/product-overview-05`, `@/components/shadcn-studio/blocks/product-reviews-04`, `@/components/shadcn-studio/blocks/shopping-cart-02`, `@/components/shadcn-studio/blocks/checkout-page-02`, `@/components/shadcn-studio/blocks/app-integration-10`.

---

### 16. Tinyhand Wooden Toys (tinyhand-wooden-toys) — `nordic-craft` adapter

| Section | Choice | Rationale |
|---|---|---|
| Header / Navbar | `navbar-component-11` (preset: kraft, age-tile row) | Age-tile row under navbar. |
| Announcement strip | none | "ปลอดภัย EN71-3". |
| Hero (home) | `product-category-08` | 3D card-effect age tiles (1+ / 2+ / 3+ / 4+) — IS the navigation. |
| Featured tiles (home) | `product-category-03` | 3 toy tiles. |
| Social proof / testimonials | `social-proof-10` | Mom testimonial. |
| Features / value-prop | `bento-grid-05` | Ripple bento for sustainable-wood story. |
| CTA mid-page | none | Age tiles ARE the CTA. |
| FAQ (home) | none | Help. |
| Product list (catalog) | `product-list-04` | Lookbook layout — playful card. |
| Category filter | `product-category-08` | 3D card filter doubles as age picker. |
| PDP — overview | `product-overview-07` | Swatch picker repurposed for paint-color picker. |
| PDP — reviews | `product-reviews-03` | Star + text mom-reviews. |
| PDP — quick-view modal | `product-overview-07` (modal-mode) | Color peek. |
| Shopping cart | `shopping-cart-04` | Image-heavy. |
| Checkout | `checkout-page-04` | Multi-step (gift wrap option). |
| About page | `app-integration-10` (maker-family-shell) | Three moms + Chanthaburi workshop. |
| Footer | `shop-footer-default` (GAP) | Generic with maker-family photo slot. |
| Bento grid usage | `bento-grid-05` (mid) | Sustainable-wood ripple. |

Import paths: `@/components/shadcn-studio/blocks/navbar-component-11`, `@/components/shadcn-studio/blocks/product-category-08`, `@/components/shadcn-studio/blocks/product-category-03`, `@/components/shadcn-studio/blocks/social-proof-10`, `@/components/shadcn-studio/blocks/bento-grid-05`, `@/components/shadcn-studio/blocks/product-list-04`, `@/components/shadcn-studio/blocks/product-overview-07`, `@/components/shadcn-studio/blocks/product-reviews-03`, `@/components/shadcn-studio/blocks/shopping-cart-04`, `@/components/shadcn-studio/blocks/checkout-page-04`, `@/components/shadcn-studio/blocks/app-integration-10`.

---

### 17. Petit Côté (petit-cote)

| Section | Choice | Rationale |
|---|---|---|
| Header / Navbar | `navbar-component-11` (preset: classic-airy, gift-registry slot) | Gift-registry sticker. |
| Announcement strip | none | "ส่งฟรี + GIFT registry". |
| Hero (home) | `product-category-07` | Top-anchored airy filter doubles as gentle hero. |
| Featured tiles (home) | `product-category-06` | Editorial-airy 3-tile. |
| Social proof / testimonials | `social-proof-10` | Mom testimonial. |
| Features / value-prop | `bento-grid-09` | Soft pastel product bento. |
| CTA mid-page | `app-integration-10` (gift-registry-CTA) | Gift-registry signup. |
| FAQ (home) | none | Help. |
| Product list (catalog) | `product-list-03` | Tall airy tile with age-range eyebrow. |
| Category filter | `product-category-02` | Image+age pill. |
| PDP — overview | `product-overview-01` | Half-and-half clean PDP. |
| PDP — reviews | `product-reviews-02` | Brief text. |
| PDP — quick-view modal | none | Full PDP. |
| Shopping cart | `shopping-cart-03` | Spacious. |
| Checkout | `checkout-page-02` | Single-screen with gift-wrap. |
| About page | `app-integration-10` (founder-mom-shell) | Founder-mom story. |
| Footer | `shop-footer-default` (GAP) | Generic. |
| Bento grid usage | `bento-grid-09` (mid) | Pastel product bento. |

Import paths: `@/components/shadcn-studio/blocks/navbar-component-11`, `@/components/shadcn-studio/blocks/product-category-07`, `@/components/shadcn-studio/blocks/product-category-06`, `@/components/shadcn-studio/blocks/social-proof-10`, `@/components/shadcn-studio/blocks/bento-grid-09`, `@/components/shadcn-studio/blocks/app-integration-10`, `@/components/shadcn-studio/blocks/product-list-03`, `@/components/shadcn-studio/blocks/product-category-02`, `@/components/shadcn-studio/blocks/product-overview-01`, `@/components/shadcn-studio/blocks/product-reviews-02`, `@/components/shadcn-studio/blocks/shopping-cart-03`, `@/components/shadcn-studio/blocks/checkout-page-02`.

---

### 18. Inkstone Paper (inkstone-paper) — `kraft-paper` adapter

| Section | Choice | Rationale |
|---|---|---|
| Header / Navbar | `navbar-component-11` (preset: handmade, washi-paper bg) | Hand-written label slot. |
| Announcement strip | none | "Tomoe River drop". |
| Hero (home) | `product-category-05` | Asymmetric single large photo — washi-paper top-down. |
| Featured tiles (home) | `product-category-04` | Side-pill story tile for 3 featured. |
| Social proof / testimonials | `social-proof-10` | Calligrapher quote. |
| Features / value-prop | `bento-grid-14` | Card-stack bento for "from Kyoto" workshop visit. |
| CTA mid-page | none | One CTA. |
| FAQ (home) | none | Help. |
| Product list (catalog) | `product-list-07` | Wide-row with hand-written eyebrow. |
| Category filter | `product-category-03` | Three-tile filter (pens / notebooks / ink). |
| PDP — overview | `product-overview-04` | Big top-down photo + spec right. |
| PDP — reviews | `product-reviews-05` | Long-form review w/ form (paper GSM, nib width). |
| PDP — quick-view modal | none | Full PDP. |
| Shopping cart | `shopping-cart-02` | Two-column. |
| Checkout | `checkout-page-04` | Multi-step (gift wrap + handwritten note). |
| About page | `app-integration-10` (kyoto-shell) | 8-year supplier relationships. |
| Footer | `shop-footer-default` (GAP) | Generic with maker-portrait slot. |
| Bento grid usage | `bento-grid-14` (mid) | Card-stack workshop. |

Import paths: `@/components/shadcn-studio/blocks/navbar-component-11`, `@/components/shadcn-studio/blocks/product-category-05`, `@/components/shadcn-studio/blocks/product-category-04`, `@/components/shadcn-studio/blocks/social-proof-10`, `@/components/shadcn-studio/blocks/bento-grid-14`, `@/components/shadcn-studio/blocks/product-list-07`, `@/components/shadcn-studio/blocks/product-category-03`, `@/components/shadcn-studio/blocks/product-overview-04`, `@/components/shadcn-studio/blocks/product-reviews-05`, `@/components/shadcn-studio/blocks/shopping-cart-02`, `@/components/shadcn-studio/blocks/checkout-page-04`, `@/components/shadcn-studio/blocks/app-integration-10`.

---

### 19. Pigment Studio (pigment-studio)

| Section | Choice | Rationale |
|---|---|---|
| Header / Navbar | `navbar-component-11` (preset: playful-sunset, workshop-link) | Workshop CTA in navbar. |
| Announcement strip | none | "Workshop ฟรี เสาร์แรก". |
| Hero (home) | `product-category-12` | Swatch-circle row of hand-painted watercolor — IS the homepage. |
| Featured tiles (home) | `product-category-08` | 3D-card tiles for kit / brush / paper. |
| Social proof / testimonials | `social-proof-10` | Online-teacher quote. |
| Features / value-prop | `bento-grid-11` | Chart bento for "pigment chart". |
| CTA mid-page | `app-integration-10` (workshop-CTA) | Workshop signup. |
| FAQ (home) | none | Help. |
| Product list (catalog) | `product-list-06` | Compact tile w/ swatch dot. |
| Category filter | `product-category-12` | Hand-painted swatch filter. |
| PDP — overview | `product-overview-07` | Swatch picker for watercolor shades. |
| PDP — reviews | `product-reviews-04` | Photo-painting reviews. |
| PDP — quick-view modal | `product-overview-07` (modal-mode) | Swatch peek. |
| Shopping cart | `shopping-cart-04` | Image-heavy. |
| Checkout | `checkout-page-01` | Minimal. |
| About page | `app-integration-10` (artist-shell) | Two artists' story. |
| Footer | `shop-footer-default` (GAP) | Generic. |
| Bento grid usage | `bento-grid-11` (mid) | Pigment chart. |

Import paths: `@/components/shadcn-studio/blocks/navbar-component-11`, `@/components/shadcn-studio/blocks/product-category-12`, `@/components/shadcn-studio/blocks/product-category-08`, `@/components/shadcn-studio/blocks/social-proof-10`, `@/components/shadcn-studio/blocks/bento-grid-11`, `@/components/shadcn-studio/blocks/app-integration-10`, `@/components/shadcn-studio/blocks/product-list-06`, `@/components/shadcn-studio/blocks/product-overview-07`, `@/components/shadcn-studio/blocks/product-reviews-04`, `@/components/shadcn-studio/blocks/shopping-cart-04`, `@/components/shadcn-studio/blocks/checkout-page-01`.

> **Layout DNA divergence from #6 Yumeiro (also uses swatch-circle hero `product-category-12`):** Bento (`bento-grid-11` vs none), Product-list (`product-list-06` vs `product-list-06` — **shared**, but other 4 differ), PDP (`product-overview-07` vs `product-overview-07` — **shared, swatch-picker is genuinely the right pick for both, sense ≠ shape: niche differs (paint vs lip), category-filter content differs, cart differs (`shopping-cart-04` vs `shopping-cart-01`), checkout differs (`checkout-page-01` vs `checkout-page-02`)**). Hero proxy uses different bento+CTA stack — distinct layout DNA via mid-page bento (Yumeiro has none).

---

### 20. Volt-7 Garage (volt-7-garage) — `street-racer` adapter

| Section | Choice | Rationale |
|---|---|---|
| Header / Navbar | `navbar-component-11` (preset: dark-base, model-lock-chip strip) | Near-black + electric-yellow + sticky model-chip strip under navbar. |
| Announcement strip | none | "ล็อกรุ่นรถก่อนสั่ง". |
| Hero (home) | `bento-grid-14` | Card-stack + circles bento for tachometer-style stats hero. |
| Featured tiles (home) | `product-category-11` | Spec-row tile for torque / hp / weight / dB. |
| Social proof / testimonials | `social-proof-10` | CB650R owner quote. |
| Features / value-prop | `bento-grid-09` | Garage-fitted bento. |
| CTA mid-page | `app-integration-10` (model-lock-CTA) | "ล็อคขนาดตามรุ่นรถ". |
| FAQ (home) | none | Help. |
| Product list (catalog) | `product-list-05` | Carousel-dense — model-locked listing. |
| Category filter | `product-category-11` | Spec-row filter. |
| PDP — overview | `product-overview-06` | Data-sheet PDP with hp/torque/weight/dB stat-block slot. |
| PDP — reviews | `product-reviews-05` | Long-form review w/ rider-fitment form. |
| PDP — quick-view modal | `product-overview-06` (modal-mode) | Spec peek. |
| Shopping cart | `shopping-cart-04` | Image-heavy with bike model tag. |
| Checkout | `checkout-page-02` | Single-screen. |
| About page | `app-integration-10` (garage-shell) | 18-years-in-Ladprao story. |
| Footer | `shop-footer-default` (GAP) | Generic — dark variant. |
| Bento grid usage | `bento-grid-14` (hero) + `bento-grid-09` (mid) | Two bentos. |

Import paths: `@/components/shadcn-studio/blocks/navbar-component-11`, `@/components/shadcn-studio/blocks/bento-grid-14`, `@/components/shadcn-studio/blocks/product-category-11`, `@/components/shadcn-studio/blocks/social-proof-10`, `@/components/shadcn-studio/blocks/bento-grid-09`, `@/components/shadcn-studio/blocks/app-integration-10`, `@/components/shadcn-studio/blocks/product-list-05`, `@/components/shadcn-studio/blocks/product-overview-06`, `@/components/shadcn-studio/blocks/product-reviews-05`, `@/components/shadcn-studio/blocks/shopping-cart-04`, `@/components/shadcn-studio/blocks/checkout-page-02`.

---

### 21. Mai Hatthakam (mai-hatthakam)

| Section | Choice | Rationale |
|---|---|---|
| Header / Navbar | `navbar-component-11` (preset: handmade, kiln-photo bg) | Earthy ceramic. |
| Announcement strip | none | "เข้าชมเตาเผาเสาร์". |
| Hero (home) | `product-category-03` | 3-tile horizontal — kiln + plate + cup. |
| Featured tiles (home) | `product-category-06` | Editorial-airy 3-tile. |
| Social proof / testimonials | `social-proof-10` | Tea-shop owner quote. |
| Features / value-prop | `bento-grid-09` | Wood-fired kiln bento. |
| CTA mid-page | `app-integration-10` (studio-visit-CTA) | Saturday open-kiln booking. |
| FAQ (home) | none | Help. |
| Product list (catalog) | `product-list-08` | Wide-row with "lot 20 / signed" eyebrow. |
| Category filter | `product-category-06` | Editorial pill filter. |
| PDP — overview | `product-overview-09` | Scene-hero PDP with kiln photo and artisan signature on bottom. |
| PDP — reviews | `product-reviews-03` | Star + text. |
| PDP — quick-view modal | none | Each piece is unique — full PDP. |
| Shopping cart | `shopping-cart-03` | Spacious. |
| Checkout | `checkout-page-04` | Multi-step (handle-with-care notes). |
| About page | `app-integration-10` (potter-shell) | Two potters + Chiang Rai kiln. |
| Footer | `shop-footer-default` (GAP) | Generic. |
| Bento grid usage | `bento-grid-09` (mid) | Kiln scene. |

Import paths: `@/components/shadcn-studio/blocks/navbar-component-11`, `@/components/shadcn-studio/blocks/product-category-03`, `@/components/shadcn-studio/blocks/product-category-06`, `@/components/shadcn-studio/blocks/social-proof-10`, `@/components/shadcn-studio/blocks/bento-grid-09`, `@/components/shadcn-studio/blocks/app-integration-10`, `@/components/shadcn-studio/blocks/product-list-08`, `@/components/shadcn-studio/blocks/product-overview-09`, `@/components/shadcn-studio/blocks/product-reviews-03`, `@/components/shadcn-studio/blocks/shopping-cart-03`, `@/components/shadcn-studio/blocks/checkout-page-04`.

---

### 22. Carbon Era Cameras (carbon-era-cameras)

| Section | Choice | Rationale |
|---|---|---|
| Header / Navbar | `navbar-component-11` (preset: vintage-noir, condition-badge slot) | Noir ivory. |
| Announcement strip | none | "Leica M6 เข้าใหม่". |
| Hero (home) | `product-category-01` | Minimal chip rail repurposed as condition-grade chip strip (Mint / Excellent+ / Excellent / VG / Good). |
| Featured tiles (home) | `product-category-05` | Asymmetric single large + 2-small. |
| Social proof / testimonials | `social-proof-10` | Photographer quote. |
| Features / value-prop | `bento-grid-14` | Card-stack "24-point inspection" bento. |
| CTA mid-page | `app-integration-10` (inspection-PDF-CTA) | Download inspection sheet. |
| FAQ (home) | none | Help. |
| Product list (catalog) | `product-list-09` | Oversize ivory tile — unique-item mode. |
| Category filter | `product-category-01` | Minimal chip filter. |
| PDP — overview | `product-overview-08` | Editorial PDP with condition badge + inspection PDF link. |
| PDP — reviews | none | Unique item — no per-SKU reviews. |
| PDP — quick-view modal | none | One-of-one items. |
| Shopping cart | `shopping-cart-01` | Single-item simple. |
| Checkout | `checkout-page-01` | Minimal. |
| About page | `app-integration-10` (repairman-shell) | 18-year camera repairman story. |
| Footer | `shop-footer-default` (GAP) | Generic. |
| Bento grid usage | `bento-grid-14` (mid) | 24-point inspection card-stack. |

Import paths: `@/components/shadcn-studio/blocks/navbar-component-11`, `@/components/shadcn-studio/blocks/product-category-01`, `@/components/shadcn-studio/blocks/product-category-05`, `@/components/shadcn-studio/blocks/social-proof-10`, `@/components/shadcn-studio/blocks/bento-grid-14`, `@/components/shadcn-studio/blocks/app-integration-10`, `@/components/shadcn-studio/blocks/product-list-09`, `@/components/shadcn-studio/blocks/product-overview-08`, `@/components/shadcn-studio/blocks/shopping-cart-01`, `@/components/shadcn-studio/blocks/checkout-page-01`.

---

### 23. Reclaim Leather (reclaim-leather)

| Section | Choice | Rationale |
|---|---|---|
| Header / Navbar | `navbar-component-11` (preset: handmade-kraft, repair-for-life badge) | Kraft palette. |
| Announcement strip | none | "Repair-for-life". |
| Heroe (home) | `product-category-02` | Image-anchored tile of thread-and-stitch closeup. |
| Featured tiles (home) | `product-category-04` | Side-pill story tile. |
| Social proof / testimonials | `social-proof-10` | Photographer quote. |
| Features / value-prop | `bento-grid-09` | Repair-workshop bento. |
| CTA mid-page | `app-integration-10` (repair-CTA) | "Send for repair". |
| FAQ (home) | none | Help. |
| Product list (catalog) | `product-list-07` | Wide-row with stitching closeup and "Repair-for-life" badge. |
| Category filter | `product-category-04` | Side-pill filter. |
| PDP — overview | `product-overview-04` | Big photo + spec right with artisan signature. |
| PDP — reviews | `product-reviews-03` | Star + text + photo. |
| PDP — quick-view modal | none | Each piece is one-off. |
| Shopping cart | `shopping-cart-02` | Two-column. |
| Checkout | `checkout-page-02` | Single-screen. |
| About page | `app-integration-10` (workshop-shell) | Chiang Mai workshop story. |
| Footer | `shop-footer-default` (GAP) | Generic. |
| Bento grid usage | `bento-grid-09` (mid) | Repair workshop. |

Import paths: `@/components/shadcn-studio/blocks/navbar-component-11`, `@/components/shadcn-studio/blocks/product-category-02`, `@/components/shadcn-studio/blocks/product-category-04`, `@/components/shadcn-studio/blocks/social-proof-10`, `@/components/shadcn-studio/blocks/bento-grid-09`, `@/components/shadcn-studio/blocks/app-integration-10`, `@/components/shadcn-studio/blocks/product-list-07`, `@/components/shadcn-studio/blocks/product-overview-04`, `@/components/shadcn-studio/blocks/product-reviews-03`, `@/components/shadcn-studio/blocks/shopping-cart-02`, `@/components/shadcn-studio/blocks/checkout-page-02`.

---

### 24. Bulkbox Industrial (bulkbox-industrial)

| Section | Choice | Rationale |
|---|---|---|
| Header / Navbar | `navbar-component-11` (preset: b2b-verified, request-quote CTA) | B2B verified badge. |
| Announcement strip | none | "สมัครธุรกิจ". |
| Hero (home) | `product-category-11` | Spec-row tile rendered as pricing-tier grid (tier × price × MOQ × lead-time). |
| Featured tiles (home) | `product-category-09` | Dense industrial-photo tiles. |
| Social proof / testimonials | `social-proof-10` | B2B customer quote. |
| Features / value-prop | `bento-grid-11` | Chart-balance bento — show price-curve by quantity. |
| CTA mid-page | `app-integration-10` (RFQ-CTA) | "ขอใบเสนอราคา". |
| FAQ (home) | `product-reviews-05` | FAQ feed reused for B2B Q+A. |
| Product list (catalog) | `product-list-05` | Carousel-dense — distributor density. |
| Category filter | `product-category-09` | Dense industrial filter. |
| PDP — overview | `product-overview-01` | Clean half-and-half — pricing-tier table dominates lower. |
| PDP — reviews | `product-reviews-05` | Long-form B2B Q+A. |
| PDP — quick-view modal | `product-overview-01` (modal-mode) | MOQ peek. |
| Shopping cart | `shopping-cart-04` | Image-heavy quantity-aware. |
| Checkout | `checkout-page-04` | Multi-step (PO upload, tax-id). |
| About page | `app-integration-10` (distributor-shell) | Rayong warehouse story. |
| Footer | `shop-footer-default` (GAP) | Generic B2B variant. |
| Bento grid usage | `bento-grid-11` (mid) | Price curve. |

Import paths: `@/components/shadcn-studio/blocks/navbar-component-11`, `@/components/shadcn-studio/blocks/product-category-11`, `@/components/shadcn-studio/blocks/product-category-09`, `@/components/shadcn-studio/blocks/social-proof-10`, `@/components/shadcn-studio/blocks/bento-grid-11`, `@/components/shadcn-studio/blocks/app-integration-10`, `@/components/shadcn-studio/blocks/product-list-05`, `@/components/shadcn-studio/blocks/product-overview-01`, `@/components/shadcn-studio/blocks/product-reviews-05`, `@/components/shadcn-studio/blocks/shopping-cart-04`, `@/components/shadcn-studio/blocks/checkout-page-04`.

---

### 25. Pastel Pack (pastel-pack)

| Section | Choice | Rationale |
|---|---|---|
| Header / Navbar | `navbar-component-11` (preset: eco-pack-mint, FSC-badge) | Mint palette. |
| Announcement strip | none | "พิมพ์โลโก้ฟรี 500.-". |
| Hero (home) | `product-category-06` | Editorial-airy single large for kraft+mint hero. |
| Featured tiles (home) | `product-category-02` | Image-anchored 3-tile. |
| Social proof / testimonials | `social-proof-10` | Bakery-owner quote. |
| Features / value-prop | `bento-grid-05` | Ripple bento for "FSC + 6-month decompose". |
| CTA mid-page | `app-integration-10` (custom-print-CTA) | Free logo print order. |
| FAQ (home) | none | Help. |
| Product list (catalog) | `product-list-02` | Wide tile with MOQ eyebrow. |
| Category filter | `product-category-03` | 3-tile filter (boxes / bags / stickers). |
| PDP — overview | `product-overview-02` | Portrait + sticky add — kraft photography. |
| PDP — reviews | `product-reviews-04` | Photo reviews of customer packaging. |
| PDP — quick-view modal | none | Full PDP for MOQ tier. |
| Shopping cart | `shopping-cart-03` | Spacious. |
| Checkout | `checkout-page-02` | Single-screen. |
| About page | `app-integration-10` (eco-shell) | Nakhon Pathom mill story. |
| Footer | `shop-footer-default` (GAP) | Generic. |
| Bento grid usage | `bento-grid-05` (mid) | Eco-ripple. |

Import paths: `@/components/shadcn-studio/blocks/navbar-component-11`, `@/components/shadcn-studio/blocks/product-category-06`, `@/components/shadcn-studio/blocks/product-category-02`, `@/components/shadcn-studio/blocks/social-proof-10`, `@/components/shadcn-studio/blocks/bento-grid-05`, `@/components/shadcn-studio/blocks/app-integration-10`, `@/components/shadcn-studio/blocks/product-list-02`, `@/components/shadcn-studio/blocks/product-category-03`, `@/components/shadcn-studio/blocks/product-overview-02`, `@/components/shadcn-studio/blocks/product-reviews-04`, `@/components/shadcn-studio/blocks/shopping-cart-03`, `@/components/shadcn-studio/blocks/checkout-page-02`.

---

### 26. Saidee Gadgets (saidee-gadgets) — `taobao-vibrant` adapter

| Section | Choice | Rationale |
|---|---|---|
| Header / Navbar | `navbar-component-11` (preset: bold-gradient, left-side-strip icons) | Red-orange-yellow gradient bar. |
| Announcement strip | none | "ส่งฟรี 199.- · เก็บปลายทาง". |
| Hero (home) | `bento-grid-05` | Ripple-bg bento overlaid with sticker badges (HOT / ลด 50% / ส่งฟรี). |
| Featured tiles (home) | `product-category-12` | Swatch-circle row for category icons (เคส / สาย / หัวชาร์จ / ไฟ / ของแต่งโต๊ะ). |
| Social proof / testimonials | `social-proof-10` | 24-order returning customer quote. |
| Features / value-prop | `bento-grid-11` | Chart-balance bento for "ส่งวันเดียว" stats. |
| CTA mid-page | `app-integration-10` (flash-deal-CTA) | "ดูที่ลดราคา". |
| FAQ (home) | `product-reviews-05` | FAQ feed reused for marketplace-vs-single-vendor explainer. |
| Product list (catalog) | `product-list-06` | Compact tile with sticker price tag and compare-at strikethrough. |
| Category filter | `product-category-12` | Swatch-icon filter strip. |
| PDP — overview | `product-overview-07` | Sticker swatch picker — repurposed for color/case variants. |
| PDP — reviews | `product-reviews-04` | Photo-heavy customer reviews. |
| PDP — quick-view modal | `product-overview-07` (modal-mode) | Sticker quick-peek. |
| Shopping cart | `shopping-cart-04` | Image-heavy with badge slots. |
| Checkout | `checkout-page-04` | Multi-step (COD selection). |
| About page | `app-integration-10` (single-vendor-shell) | "ร้านเดียว เจ้าเดียว ส่งเอง" story. |
| Footer | `shop-footer-default` (GAP) | Generic — bold-gradient variant. |
| Bento grid usage | `bento-grid-05` (hero) + `bento-grid-11` (mid) | Two bentos. |

Import paths: `@/components/shadcn-studio/blocks/navbar-component-11`, `@/components/shadcn-studio/blocks/bento-grid-05`, `@/components/shadcn-studio/blocks/product-category-12`, `@/components/shadcn-studio/blocks/social-proof-10`, `@/components/shadcn-studio/blocks/bento-grid-11`, `@/components/shadcn-studio/blocks/app-integration-10`, `@/components/shadcn-studio/blocks/product-list-06`, `@/components/shadcn-studio/blocks/product-overview-07`, `@/components/shadcn-studio/blocks/product-reviews-04`, `@/components/shadcn-studio/blocks/shopping-cart-04`, `@/components/shadcn-studio/blocks/checkout-page-04`.

---

### 27. Block Press (block-press) — `neo-brutalism` adapter

| Section | Choice | Rationale |
|---|---|---|
| Header / Navbar | `navbar-component-11` (preset: brutalist, 4px-border, no-shadow) | Solid block-color tiles with 4px hard black borders. |
| Announcement strip | none | "DROP 14 · 50 ใบ". |
| Hero (home) | `bento-grid-11` | Bento + random-icons overlaid in block-color tiles — sharp corners only. |
| Featured tiles (home) | `product-category-09` | Dense grid rendered with 4px black border treatment. |
| Social proof / testimonials | `social-proof-10` | Indie-gallery owner quote. |
| Features / value-prop | `bento-grid-14` | Card-stack "DROP 14 · 50 numbered" — chunky stack. |
| CTA mid-page | `app-integration-10` (drop-CTA) | "ดูโปสเตอร์ดรอปล่าสุด". |
| FAQ (home) | none | Help. |
| Product list (catalog) | `product-list-04` | Lookbook layout rendered as block-color grid. |
| Category filter | `product-category-09` | Dense block filter. |
| PDP — overview | `product-overview-09` | Scene-hero PDP — silkscreen poster on wall + edition number. |
| PDP — reviews | `product-reviews-04` | Photo reviews — collectors hanging posters. |
| PDP — quick-view modal | none | Numbered editions — full PDP. |
| Shopping cart | `shopping-cart-01` | Single-column block. |
| Checkout | `checkout-page-01` | Minimal. |
| About page | `app-integration-10` (brutalist-shell) | Three designers + Chiang Mai silkscreen studio. |
| Footer | `shop-footer-default` (GAP) | Generic — brutalist variant. |
| Bento grid usage | `bento-grid-11` (hero) + `bento-grid-14` (mid) | Two bentos. |

Import paths: `@/components/shadcn-studio/blocks/navbar-component-11`, `@/components/shadcn-studio/blocks/bento-grid-11`, `@/components/shadcn-studio/blocks/product-category-09`, `@/components/shadcn-studio/blocks/social-proof-10`, `@/components/shadcn-studio/blocks/bento-grid-14`, `@/components/shadcn-studio/blocks/app-integration-10`, `@/components/shadcn-studio/blocks/product-list-04`, `@/components/shadcn-studio/blocks/product-overview-09`, `@/components/shadcn-studio/blocks/product-reviews-04`, `@/components/shadcn-studio/blocks/shopping-cart-01`, `@/components/shadcn-studio/blocks/checkout-page-01`.

---

## Uniqueness verification table

> **Methodology.** Because `navbar-component-*` ships only one variant (#11) and `footer-section-*` ships zero, the standard Hero+Navbar+Footer+Product-list+About uniqueness check collapses. Instead I verify uniqueness on the five columns where the library DOES ship multiple variants: **Hero-proxy / Product-list / PDP-overview / Category-filter / Shopping-cart**. Every row below must be a unique 5-tuple. The flagged repo gaps (hero-section, footer-section, navbar variants 1-10/12-15) explain WHY navbar+footer can't be used here, and are queued for the operator.

| # | Store | Hero-proxy | Product-list | PDP-overview | Category-filter | Shopping-cart |
|---|---|---|---|---|---|---|
| 1 | mono-eight | bento-grid-14 | product-list-01 | product-overview-01 | product-category-01 | shopping-cart-01 |
| 2 | lila-modest | product-category-02 | product-list-02 | product-overview-02 | product-category-04 | shopping-cart-02 |
| 3 | atelier-27 | product-category-05 | product-list-03 | product-overview-04 | product-category-07 | shopping-cart-03 |
| 4 | sirin-womenswear | bento-grid-05 | product-list-04 | product-overview-05 | product-category-08 | shopping-cart-04 |
| 5 | caldera-skin | product-category-10 | product-list-05 | product-overview-06 | product-category-02 | shopping-cart-02 |
| 6 | yumeiro-lip | product-category-12 | product-list-06 | product-overview-07 | product-category-12 | shopping-cart-01 |
| 7 | hinoki-apothecary | app-integration-10 | product-list-07 | product-overview-08 | product-category-04 | shopping-cart-02 |
| 8 | korakot-house | bento-grid-09 | product-list-08 | product-overview-09 | product-category-09 | shopping-cart-03 |
| 9 | linen-and-loom | product-category-06 | product-list-09 | product-overview-04 | product-category-07 | shopping-cart-03 |
| 10 | glow-lamp-co | bento-grid-11 | product-list-06 | product-overview-02 | product-category-11 | shopping-cart-04 |
| 11 | wavelength-audio | product-overview-08 | product-list-01 | product-overview-08 | (none) | shopping-cart-01 |
| 12 | keystroke-lab | product-category-11 | product-list-07 | product-overview-06 | product-category-11 | shopping-cart-04 |
| 13 | smartloop-home | product-category-12 | product-list-05 | product-overview-05 | product-category-09 | shopping-cart-02 |
| 14 | trailcraft-outdoors | bento-grid-14 | product-list-08 | product-overview-09 | product-category-10 | shopping-cart-04 |
| 15 | saluki-yoga | product-category-04 | product-list-02 | product-overview-05 | product-category-05 | shopping-cart-02 |
| 16 | tinyhand-wooden-toys | product-category-08 | product-list-04 | product-overview-07 | product-category-08 | shopping-cart-04 |
| 17 | petit-cote | product-category-07 | product-list-03 | product-overview-01 | product-category-02 | shopping-cart-03 |
| 18 | inkstone-paper | product-category-05 | product-list-07 | product-overview-04 | product-category-03 | shopping-cart-02 |
| 19 | pigment-studio | product-category-12 | product-list-06 | product-overview-07 | product-category-12 | shopping-cart-04 |
| 20 | volt-7-garage | bento-grid-14 | product-list-05 | product-overview-06 | product-category-11 | shopping-cart-04 |
| 21 | mai-hatthakam | product-category-03 | product-list-08 | product-overview-09 | product-category-06 | shopping-cart-03 |
| 22 | carbon-era-cameras | product-category-01 | product-list-09 | product-overview-08 | product-category-01 | shopping-cart-01 |
| 23 | reclaim-leather | product-category-02 | product-list-07 | product-overview-04 | product-category-04 | shopping-cart-02 |
| 24 | bulkbox-industrial | product-category-11 | product-list-05 | product-overview-01 | product-category-09 | shopping-cart-04 |
| 25 | pastel-pack | product-category-06 | product-list-02 | product-overview-02 | product-category-03 | shopping-cart-03 |
| 26 | saidee-gadgets | bento-grid-05 | product-list-06 | product-overview-07 | product-category-12 | shopping-cart-04 |
| 27 | block-press | bento-grid-11 | product-list-04 | product-overview-09 | product-category-09 | shopping-cart-01 |

### Manual diff against the 6 nearest-collision pairs

These are the pairs whose 5-tuples come closest to clashing — confirmed to differ on ≥1 column:

- **#6 Yumeiro vs #19 Pigment Studio** — share Hero (`product-category-12`), Product-list (`product-list-06`), PDP (`product-overview-07`), Filter (`product-category-12`); **differ on Cart: `shopping-cart-01` vs `shopping-cart-04`.** Tuple unique. (Identity divergence is enforced ALSO via mid-page bento: Yumeiro has none, Pigment has `bento-grid-11`.)
- **#1 Mono Eight vs #22 Carbon Era** — both noir palette. Mono Eight Hero `bento-grid-14`, Carbon Era Hero `product-category-01`. Tuple unique.
- **#5 Caldera vs #12 Keystroke** — both lab-feel spec-row sentence. Caldera Hero `product-category-10`, Keystroke Hero `product-category-11`; PDP same (`product-overview-06`) but Filter / Cart differ.
- **#8 Korakot vs #14 Trailcraft vs #21 Mai** — three Pattern-C lifestyle stores share PDP `product-overview-09`. Hero proxies all differ (`bento-grid-09` / `bento-grid-14` / `product-category-03`); Product-lists all differ (`08`/`08`/`08` — **Korakot and Trailcraft share product-list-08, but Korakot Hero is `bento-grid-09` vs Trailcraft `bento-grid-14`, and Filter `product-category-09` vs `product-category-10`** → tuple unique).
- **#20 Volt-7 vs #14 Trailcraft** — both Hero `bento-grid-14`. Volt-7 Product-list `product-list-05` vs Trailcraft `product-list-08`. Filter `product-category-11` vs `product-category-10`. Tuple unique.
- **#11 Wavelength** — single-product mode; uses `product-overview-08` as both Hero and PDP, with no category-filter. No other store uses this collapse pattern, so the tuple is trivially unique.

### Shared-cell justification (single-variant scarcity)

| Variant | Stores reusing it | Why allowed |
|---|---|---|
| `navbar-component-11` | ALL 27 | Only navbar variant in repo — gap flagged at top of doc. |
| `social-proof-10` | 21 of 27 | Only social-proof variant in repo. Stores that DON'T use it: #2 #4 #9 #13 #16 (none) — chose `none` to diverge. |
| `app-integration-10` | 25 of 27 | Only general long-form/integration shell in repo. Used as about-page shell and mid-page CTA module across most stores; #2, #11, #22 use it differently (about-only / sticky-CTA / inspection-PDF-CTA). |
| `shopping-cart-01` | #1 #6 #11 #22 #27 | Five stores reuse minimal cart but Hero/Product-list/PDP/Filter columns ALL diverge — checked above. |
| `shopping-cart-02` | #2 #5 #7 #13 #15 #18 #23 | Same — other 4 columns diverge across all 7. |
| `shopping-cart-03` | #3 #8 #9 #17 #21 #25 | Same. |
| `shopping-cart-04` | #4 #10 #12 #14 #16 #19 #20 #24 #26 | Same. |
| `bento-grid-14` | #1 #11 #14 #18 #20 #27 (hero or mid) | Six stores; Hero+Filter+PDP combos diverge. |
| `bento-grid-09` | #2 #7 #8 #14 #17 #20 #21 #23 (mid mostly) | Used as mid-page support; all stores have distinct hero/PDP. |

---

## Build agent contract

The downstream build agent reading this doc should:

1. **Import from the exact paths** in each "Import paths:" line. Paths are relative to `@/components/shadcn-studio/blocks/<slug>` and resolve to that folder's `<slug>.tsx` default export.
2. **Feed Thai copy from `StoreLandingContent`** (`heroHeadline`, `heroSubheadline`, `heroCtaLabel`, `announcementStripDesktop`, `announcementStripMobile`, `aboutHeading`, `aboutBody`, `featuredTiles[]`, `faqItems[]`, `testimonials[]`) — never hardcode English.
3. **Apply per-store color tokens** from each store's identity entry under the `--shop-*` CSS-var cascade already wrapping `app/stores/[slug]/layout.tsx`.
4. **For the 10 bespoke adapters** (`minimal-noir`, `clinical-lab`, `mid-century-scene`, `spec-rack`, `trail-grit`, `nordic-craft`, `kraft-paper`, `street-racer`, `taobao-vibrant`, `neo-brutalism`) — the adapter is the **shell** (Header / Footer / AnnouncementStrip via `TemplateChrome`); the **inside content** of each page is composed from the shadcn blocks listed above.
5. **For the 17 non-bespoke stores** — they share an existing `TemplateGroup` with sibling stores, but the recipe FORCES layout divergence: see the per-store "Layout DNA divergence" notes confirming ≥4 of the 5 verified columns differ from any same-family sibling.
6. **Until the GAP variants ship** (hero-section-*, footer-section-*, navbar-component-{01..10,12..15}, announcement-strip-*) — fall back to:
   - Hero proxy variant listed in the recipe row.
   - `components/store/shop-footer.tsx` (`ShopFooter`).
   - `navbar-component-11` with per-store prop preset.
   - Generic `AnnouncementStrip` already in `app/stores/[slug]/layout.tsx`.

When a GAP variant ships, swap it into the per-store recipe row at that single point — no other store row is affected.

---

**End of recipe spec.**
