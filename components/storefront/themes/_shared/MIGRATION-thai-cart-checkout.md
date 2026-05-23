# Migration · Thai Cart + Checkout adapters

This worktree adds two new generic adapter factories to
`components/storefront/themes/_shared/`:

| File | Replaces | What it adds |
|------|----------|--------------|
| `thai-cart-adapter.tsx` | `cart-adapter.tsx` (`makeCartAdapter`) | Live `useCart` zustand store, THB pricing, free-shipping progress bar, coupon-code input, working checkout CTA |
| `thai-checkout-adapter.tsx` | `checkout-adapter.tsx` (`makeCheckoutAdapter`) | 4-step inline checkout (cart → address → payment → confirm), POST to `/api/checkout`, `clearStore(slug)` after success |

The original `make*Adapter('XX')` helpers stay in place — they still
back themes that haven't been migrated. **Migration is opt-in,
one theme at a time.**

---

## Why migrate

`makeCartAdapter('XX')` and `makeCheckoutAdapter('XX')` lazy-load the
shadcn-studio shopping-cart / checkout-page blocks (01–04). Those
blocks are English/USD demo UI and ignore the live zustand cart,
which means a storefront pointed at them shows:

- prices rendered as `$` (e.g. `$29.99`) instead of THB
- placeholder demo items instead of `useCart()` contents
- a "Checkout" CTA that goes nowhere meaningful
- no free-shipping progress bar, no coupon flow, no `/api/checkout`
  call when the buyer hits the primary action

`makeThai*Adapter()` is the same one-line registration but renders
the bespoke Thai/THB flow that real customers can actually finish.

---

## Registry entry diff

### Before (one of the shadcn-studio shared variants)

```ts
// lib/templates/registry.ts
import { makeCartAdapter } from '@/components/storefront/themes/_shared/cart-adapter';
import { makeCheckoutAdapter } from '@/components/storefront/themes/_shared/checkout-adapter';

'hinoki-apothecary': {
  id: 'hinoki-apothecary',
  // ...
  pages: {
    home: enhanceHomepage(HinokiHomepageAdapter, '06'),
    catalog: makeCatalogAdapter('04'),
    pdp: makePdpAdapter('04', '05'),
    cart: makeCartAdapter('01'),              // ← English/USD, no zustand
    checkout: makeCheckoutAdapter('04'),      // ← English/USD, no /api/checkout
  },
},
```

### After (Thai/THB adapters)

```ts
// lib/templates/registry.ts
import { makeThaiCartAdapter } from '@/components/storefront/themes/_shared/thai-cart-adapter';
import { makeThaiCheckoutAdapter } from '@/components/storefront/themes/_shared/thai-checkout-adapter';

'hinoki-apothecary': {
  id: 'hinoki-apothecary',
  // ...
  pages: {
    home: enhanceHomepage(HinokiHomepageAdapter, '06'),
    catalog: makeCatalogAdapter('04'),
    pdp: makePdpAdapter('04', '05'),
    cart: makeThaiCartAdapter(),              // ← Thai/THB, useCart wired
    checkout: makeThaiCheckoutAdapter(),      // ← 4-step Thai checkout
  },
},
```

That's the entire migration when defaults are good enough. Per-theme
tuning (heading copy, palette override, custom shipping methods)
goes through the optional config object — see "Customising" below.

---

## Customising

Both factories accept an optional config. Everything in the config
is optional; leaving the object out (`makeThaiCartAdapter()`) ships
the sensible Thai defaults.

### `makeThaiCartAdapter(config?)`

```ts
makeThaiCartAdapter({
  // Palette override — any subset of fields. Anything omitted
  // resolves to the var(--shop-*) cascade the layout already
  // seeds, so most themes pass no palette at all.
  palette: {
    primary: 'var(--shop-primary)',           // brand color
    surfaceMuted: 'var(--shop-muted)',        // softer card background
  },

  freeShippingThreshold: 990,                 // default 990
  flatShippingTHB: 50,                        // default 50

  heading: 'ตะกร้าสินค้า',                     // default "ตะกร้าสินค้า"
  emptyStateMessage: 'ตะกร้าของคุณยังว่างอยู่',
  emptyStateSubMessage: 'เริ่มเลือกสินค้าที่คุณชอบ',
  checkoutCtaLabel: 'ดำเนินการชำระเงิน',

  // Trust strip — three pills below the order summary.
  trustStrip: [
    { icon: 'truck', label: 'ส่งฟรี ฿990+' },
    { icon: 'rotate', label: 'คืนได้ 7 วัน' },
    { icon: 'banknote', label: 'COD ได้' },
  ],

  showCouponField: true,                      // /api/coupons/validate
  showTrustStrip: true,
});
```

### `makeThaiCheckoutAdapter(config?)`

```ts
makeThaiCheckoutAdapter({
  palette: { /* same shape as above */ },

  freeShippingThreshold: 990,

  stepLabels: {
    cart: 'ตะกร้า',
    address: 'ที่อยู่จัดส่ง',
    payment: 'การชำระเงิน',
    confirm: 'ยืนยัน',
  },

  // Override the shipping methods. Default = EMS + REGISTERED.
  shippingOptions: [
    { id: 'EMS', name: 'EMS', priceTHB: 50, eta: '1-2 วัน' },
    { id: 'REGISTERED', name: 'ลงทะเบียนไปรษณีย์ไทย', priceTHB: 30, eta: '3-5 วัน' },
  ],

  // Default = AnyPay only. Add more if the store wires extra
  // gateways; the /api/checkout endpoint must accept the id.
  paymentOptions: [
    { id: 'ANYPAY', name: 'ชำระผ่าน AnyPay (PromptPay / บัตรเครดิต)' },
  ],

  heading: 'ชำระเงิน',
  submitCtaLabel: 'ยืนยันคำสั่งซื้อ',
  highlightFreeShipping: true,                // "ส่งฟรี" tag when subtotal >= threshold
});
```

---

## What is intentionally NOT carried over

To keep the adapters generic, several family-specific features
from the legacy `app/stores/[slug]/cart/cart-client.tsx` and the
multi-route checkout (`address` + `confirm`) flow were dropped:

| Feature | Why dropped | Workaround |
|---------|-------------|------------|
| Saved address-book lookup (`GET /api/addresses?storeSlug=`) | Requires logged-in session; guest checkout is the common path. | Themes that need the address book should NOT register `pages.checkout` — the per-store layout will redirect to `/stores/<slug>/checkout/address` and the existing multi-route flow takes over. |
| Volume-discount banner ("Tier 1 / 2 / 3") | business-model family only — calls `bmActiveTier(itemCount)`. | If a theme needs it, ship a bespoke `pages.cart`. |
| Electronics-tech SKU line (`ET-XXXXXX`) | Tech-family only — derived from product id. | Bespoke `pages.cart`. |
| Lifestyle squiggle decoration, Trust maison serif header, Specialty hand-script eyebrow | Per-family typography branches. | Pass a custom `heading` + palette; or ship bespoke pages. |
| `sessionStorage.checkout.addressId` round-trip | Specific to the multi-route flow. | The inline checkout keeps state in component memory only — refresh = lose typed-in address (matches a guest single-page checkout). |
| Family-specific empty-state copy ("Your edit is empty", "the maker's basket", etc.) | Out of scope for a generic adapter. | Pass `emptyStateMessage` / `emptyStateSubMessage` overrides. |

---

## Endpoints used

| Endpoint | When | Behaviour on failure |
|----------|------|----------------------|
| `POST /api/coupons/validate` | When the buyer applies a coupon in the cart | 401 (guest) → "กรุณาเข้าสู่ระบบเพื่อใช้คูปอง"; other errors → "คูปองไม่ถูกต้องหรือหมดอายุ". Cart still finishes without the coupon. |
| `POST /api/checkout` | "ยืนยันคำสั่งซื้อ" on the confirm step | Server error message bubbles up to a red banner above the CTA. On success: `clearStore(store.slug)` + render success panel with the returned `orderRef`. |

Note: the original spec mentioned `/api/coupons/preview`. That
endpoint doesn't exist in this repo — `validate` is the live one
and is what the adapter uses.

---

## Migration candidates (low-risk first)

Three themes that are good first migrations because they have no
bespoke cart/checkout logic and their current shadcn variant is the
generic English block:

1. **hinoki-apothecary** — `cart('01')` + `checkout('04')` → `Thai*()`
2. **yumeiro-lip** — `cart('01')` + `checkout('01')` → `Thai*()`
3. **glow-lamp-co** — `cart('01')` + `checkout('02')` → `Thai*()`

After each migration, smoke-test on `/stores/<slug>/cart` and
`/stores/<slug>/checkout`:

- [ ] Add a product from the catalog, land on cart — line shows up
- [ ] Subtotal renders THB (`฿X,XXX`), no `$`
- [ ] Free-shipping progress bar fills as you adjust qty
- [ ] "ดำเนินการชำระเงิน" → goes to checkout (inline or address route)
- [ ] Place a guest order — `/api/checkout` succeeds, cart clears,
      success panel shows `orderRef`

---

## Rollback

If a migrated theme regresses, revert just that theme's two import
lines in `lib/templates/registry.ts` — the legacy `makeCartAdapter` /
`makeCheckoutAdapter` factories are untouched.
