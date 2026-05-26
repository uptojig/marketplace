# Six-store go-live audit

**Date:** 2026-05-14
**Audit base branch:** `feat/multi-tenant-provisioning` @ `75a8c89` (tip of PR #41 merge)
**Production target:** Full V1 — พร้อมรับลูกค้าจริงระยะยาว (durable for real customers long-term)
**Mode:** Read-only audit. No application code or schema changed.

This document is the gate document for taking the 6 real stores live. Every gap below either ships before launch or gets an explicit deferral with rationale (Section 5). The product owner has paused new roadmap work to focus on these 6 stores; this audit is the single source of truth for what "ready" means.

---

## Stores in scope

| Slug | Domain | Owner email | Products |
|---|---|---|---|
| `minimop24` | minimop24.com | minimop24@... | 92 |
| `zugarbox` | zugarbox.com | zugarbox@... | 75 |
| `ergobodies` | ergobodies.com | ergobodies@... | 74 |
| `Powerpuff678` | powerpuff678.com | Powerpuff678@... | 67 |
| `casethep` | casethep.com | casethep@... | 61 |
| `bikini551` | bikini551.com | uptojig@gmail.com | 25 |

All 6 are `APPROVED` in `/admin/stores`. None of them appear as literals in the codebase (only `bikini551` shows up in two code comments — `app/stores/[slug]/account/profile/page.tsx:5` and `lib/store/cart.ts:9` — as illustrative store names in a docstring; no runtime path keys off them).

---

## Section 1 — Family mapping (which design family covers which store)

### How families are detected at runtime

There are **two parallel template identification systems** in this codebase, and Section 1's audit requires reading both:

1. **`Store.templateId`** (`prisma/schema.prisma:122`) — references the 20-template registry at `lib/templates/registry.ts`. Set when a store was provisioned through the vendor wizard (`lib/store/wizard-data.ts`). Templates are grouped into 7 families in `templateGroups` (registry.ts:393-401):
   - `trust`: classic, official-brand, premium-luxury
   - `fashion-beauty`: lookbook, beauty-swatch, boutique
   - `electronics-tech`: catalog-dense, tech-compare, single-product
   - `lifestyle`: home-living, sport-active, kids-toys
   - `community`: live-commerce, video-feed, storyteller
   - `business-model`: wholesale-b2b, flash-deal, subscription
   - `specialty`: handmade, vintage

2. **`Store.landingThemeVariant`** (`prisma/schema.prisma:143`) — the AI-multi-page design family code (`A`–`I`) from `lib/landing/families.ts`. Set when a store was provisioned through the เป็ด landing-agent flow. The 9 design family codes (A=Editorial Minimal Warm, B=Editorial Soft Feminine, C=Luxury Heritage Gold, D=Industrial Masculine, E=Cyberpunk Gaming Neon, F=Sport Editorial Action, G=Botanical Lifestyle Premium, H=Cozy Niche Skeumorphism, I=Playful Mass Commerce) plus legacy values `"minimal"` → A and `"cute"` → I.

A given Store row may have **`templateId` set, OR `landingThemeVariant` set, OR neither (default render path)**. The storefront layout (`app/stores/[slug]/layout.tsx`) reads both and forks into three render branches: React-template / AI-multi-page / default.

### Family-pilot PR ↔ family coverage status

| Family | PR | Status (at audit) | Covers `templateId` | Covers `landingThemeVariant` |
|---|---|---|---|---|
| fashion-beauty | #38 | **MERGED** into `feat/multi-tenant-provisioning` | lookbook, beauty-swatch, boutique | (FB-detection via `isFashionBeautyStore()` reads `templateId` only) |
| trust | #41 | **MERGED** into `feat/multi-tenant-provisioning` (during this audit window) | classic, official-brand, premium-luxury | variant `"trust"`, `"C"` |
| specialty | #43 | OPEN (was stacked on #38; will need rebase on top of #41) | handmade, vintage | variant `"H"`, `"specialty"` |
| electronics-tech | (in flight, local branch `claude/design-electronics-tech-pilot`, not pushed) | NOT YET A PR | catalog-dense, tech-compare, single-product | — |
| lifestyle | (in flight, local branch `claude/design-lifestyle-pilot`, not pushed) | NOT YET A PR | home-living, sport-active, kids-toys | — |
| business-model | (in flight, local branch `claude/design-business-model-pilot`, not pushed) | NOT YET A PR | wholesale-b2b, flash-deal, subscription | — |
| community | (deliberately NOT being built) | — | live-commerce, video-feed, storyteller | — |

### Per-store templateId / family — DETERMINATION

> **The 6 stores' `templateId` and `landingThemeVariant` values cannot be determined from the codebase.** There is no seed data, fixture, hardcoded list, or static config anywhere that maps these specific slugs to template/family values. The stores exist only as rows in the production Postgres database. `prisma/seed.ts` seeds only the placeholder `alice-gadgets` / `bob-fashion` stores, not any of the 6 real ones.
>
> The audit must therefore propose the SQL to discover this. Run the following on the prod DB (or a fresh prod replica) before the launch window:

```sql
SELECT
  slug,
  name,
  "templateId",
  "landingThemeVariant",
  CASE
    WHEN "landingBlocks" IS NULL THEN 'default'
    WHEN "templateId" IS NOT NULL THEN 'react-template'
    ELSE 'ai-multi-page'
  END AS render_path,
  "approvalStatus",
  "customDomain"
FROM "Store"
WHERE slug IN ('minimop24', 'zugarbox', 'ergobodies', 'Powerpuff678', 'casethep', 'bikini551')
ORDER BY slug;
```

| Store | `templateId` | `landingThemeVariant` | Render path | Family covered? |
|---|---|---|---|---|
| `minimop24` | NEEDS PROD LOOKUP | NEEDS PROD LOOKUP | NEEDS PROD LOOKUP | NEEDS PROD LOOKUP |
| `zugarbox` | NEEDS PROD LOOKUP | NEEDS PROD LOOKUP | NEEDS PROD LOOKUP | NEEDS PROD LOOKUP |
| `ergobodies` | NEEDS PROD LOOKUP | NEEDS PROD LOOKUP | NEEDS PROD LOOKUP | NEEDS PROD LOOKUP |
| `Powerpuff678` | NEEDS PROD LOOKUP | NEEDS PROD LOOKUP | NEEDS PROD LOOKUP | NEEDS PROD LOOKUP |
| `casethep` | NEEDS PROD LOOKUP | NEEDS PROD LOOKUP | NEEDS PROD LOOKUP | NEEDS PROD LOOKUP |
| `bikini551` | NEEDS PROD LOOKUP | NEEDS PROD LOOKUP | NEEDS PROD LOOKUP | NEEDS PROD LOOKUP |

**Operator action:** run the SQL above, paste the result into a follow-up note on this PR, and only then can Sections 2.1 / 4 (merge order) be finalized.

### Family-coverage decision matrix once the SQL returns

Use this table to mark each store after the lookup:

- If `templateId` ∈ {lookbook, beauty-swatch, boutique} OR `landingThemeVariant` ∈ {"B"} → **covered by PR #38** (already merged) → store is good on design.
- If `templateId` ∈ {classic, official-brand, premium-luxury} OR `landingThemeVariant` ∈ {"trust", "C"} → **covered by PR #41** (merged) → store is good on design.
- If `templateId` ∈ {handmade, vintage} OR `landingThemeVariant` ∈ {"H", "specialty"} → blocked on PR #43 (open, stacked on #38) → store is good once #43 merges.
- If `templateId` ∈ {catalog-dense, tech-compare, single-product} → blocked on electronics-tech pilot (not yet a PR; branch exists locally).
- If `templateId` ∈ {home-living, sport-active, kids-toys} OR `landingThemeVariant` ∈ {"A", "F", "G", "I"} → blocked on lifestyle pilot (not yet a PR; branch exists locally).
- If `templateId` ∈ {wholesale-b2b, flash-deal, subscription} → blocked on business-model pilot (not yet a PR; branch exists locally).
- If `templateId` ∈ {live-commerce, video-feed, storyteller} → **community family will NOT be built** before launch. Operator should switch these stores to a covered family before launch (e.g. via `/admin/stores/[id]` → pick a different template), OR explicitly decide the default render path is acceptable.
- If `templateId` IS NULL AND `landingThemeVariant` IS NULL → default render path → already works (no family-pilot needed).
- If `landingThemeVariant` ∈ {"D", "E"} (industrial-masculine, cyberpunk-neon) → not covered by any in-flight family pilot. Either deferred or these stores need their variant changed.

Best educated guess based on the niches implied by slugs (purely heuristic — **do not act on this without the SQL**):
- `minimop24` (sounds like a curated label) — probably **fashion-beauty** (lookbook/boutique) — covered.
- `zugarbox` (sounds like subscription / boxed product) — probably **business-model** (subscription) — NOT covered.
- `ergobodies` (sounds like ergonomic fitness) — probably **lifestyle** (sport-active) — NOT covered.
- `Powerpuff678` (sounds like cute / playful goods) — possibly **lifestyle** (kids-toys) or `landingThemeVariant="I"` — NOT covered.
- `casethep` (sounds like phone cases / electronics accessories) — probably **electronics-tech** (catalog-dense) — NOT covered.
- `bikini551` (clearly fashion / swimwear) — probably **fashion-beauty** (lookbook/boutique) — covered.

> **The owner should treat the heuristic as a probability map for prioritisation, not a decision.** Only the SQL result is authoritative.

---

## Section 2 — Go-live gaps per store

Each store's checklist below is identical because the platform-level fixes apply to all six. Per-store deltas are noted inline; everything else is in Section 3.

### 2.1 Common checklist (applies to every store)

#### `[ ]` Design family covered

See Section 1 above. **3-of-6 stores most likely sit in not-yet-covered families** based on the heuristic, but this is gated on the prod SQL lookup. For any store whose family is in flight (local branch, no PR), the family pilot must be opened, reviewed, and merged. For any store in the deliberately-out-of-scope `community` family, the operator should switch the store's template to a covered family.

**Fix path:**
1. Run the Section 1 SQL.
2. For each store whose family is "OPEN PR" → review & merge that PR (see Section 4 merge order).
3. For each store whose family is "branch but no PR" → push the local branch, open the PR, get the review, merge.
4. For each store in the `community` family → either build that family (`docs` says it's NOT being built) or switch the store to `classic` / similar covered family in `/admin/stores/[id]/edit`.

#### `[ ]` Custom domain routing (e.g. `bikini551.com` → store)

The platform already has a complete custom-domain flow for the multi-tenant droplet model:

- DB columns on `Store.customDomain` (unique) and `ShopDeployment.customDomainVerified` / `customDomainVerifiedAt` / `customDomainLastChecked` (`prisma/schema.prisma:125`, `:710-712`).
- Caddy on-demand TLS template at `infra/shop-droplet/Caddyfile.template` with an `ask` endpoint pointing at `${CONTROL_PLANE_BASE_URL}/api/provisioner/caddy-ask`.
- `app/api/provisioner/caddy-ask/route.ts` correctly verifies that the requested SNI hostname is bound to an APPROVED store with `customDomainVerified=true`. Refuses unknown domains with 404 → Caddy aborts the cert request → Let's Encrypt rate limit safe.
- `app/api/internal/resolve-domain/route.ts` lets the platform's Next.js `middleware.ts` resolve `Host: bikini551.com` → `slug=bikini551` and rewrite the URL to `/stores/bikini551/...`.
- `middleware.ts:54-64` ALSO handles the single-tenant shop-droplet case (`SHOP_SLUG` env on the droplet) — every request gets routed to the slug, no Host-based DB lookup needed.

**Gaps:**
- The CSV says all 6 stores have a domain (e.g. `bikini551.com`). The audit cannot verify from the codebase whether the corresponding `Store.customDomain` rows are actually populated in prod, whether the DNS A records point at the per-droplet IP, or whether `ShopDeployment.customDomainVerified` is true.
- **Operator action:** for each of the 6 stores, confirm the operator runbook in `docs/multi-tenant-provisioning/runbook.md` has been completed end-to-end. Verify with:
  ```sql
  SELECT s.slug, s."customDomain", d.status, d."customDomainVerified", d."publicIpv4"
  FROM "Store" s LEFT JOIN "ShopDeployment" d ON d."storeId" = s.id
  WHERE s.slug IN ('minimop24','zugarbox','ergobodies','Powerpuff678','casethep','bikini551');
  ```
- **Live smoke test for each:** `curl -I https://bikini551.com` → must return `200 OK` with a valid LE certificate (issued by `R3` / `R10` / similar). `curl -I https://www.bikini551.com` → same. Both should serve from the per-store droplet (header `server: Caddy`), NOT the central marketplace.

#### `[ ]` Payment integration (Anypay)

**Two parallel payment paths exist** — this is a real source of risk:

1. **Legacy per-order create-payment path** (`lib/anypay/client.ts`, called from `app/api/checkout/route.ts`):
   - Uses env: `ANYPAY_MODE`, `ANYPAY_API_BASE`, `ANYPAY_MERCHANT_ID`, `ANYPAY_API_KEY`, `ANYPAY_SECRET`.
   - `MODE === "mock"` (default) routes to `/api/mock/anypay/checkout` — NO real money moves.
   - `return_url` is **hardcoded** to `${BASE_URL}/order-success?orderId=...` — this is the central marketplace's `/order-success`, NOT the per-store `/stores/[slug]/checkout/success`. **Gap.**
   - Webhook hits `${BASE_URL}/api/webhook/anypay`.

2. **Vendor-template intent path** (`lib/anypay/intent-server.ts`, called from `lib/checkout/...`):
   - Uses env: `ANYPAY_API_BASE`, `ANYPAY_SECRET_KEY`, `ANYPAY_WEBHOOK_SECRET`, `ANYPAY_RETURN_URL`, `ANYPAY_WEBHOOK_URL`.
   - `return_url` / `webhook_url` come from env — operator controls them.
   - Webhook hits `app/api/anypay/webhook/route.ts`, which verifies HMAC-SHA256 + 5-min anti-replay (correct), applies idempotent state transitions, consumes inventory, records coupon usage, and fires `sendOrderPaidEmail` AFTER the transaction commits (correct).
   - Both legacy `Payment` and new `PaymentIntent` models exist (`prisma/schema.prisma:503-524, 599-613`).

**Gaps:**

- **Mode**: `ANYPAY_MODE` is `mock` by default. **Production env must set `ANYPAY_MODE=live` and `ANYPAY_API_BASE` to the real Anypay endpoint.** Operator action.
- **Live credentials**: `ANYPAY_API_KEY`, `ANYPAY_SECRET`, `ANYPAY_SECRET_KEY`, `ANYPAY_WEBHOOK_SECRET` — none are in the codebase or `.env.example` we can read here. Operator must provision them and set them in the production env (and per-droplet env, per the `payment-whitelist.md` runbook).
- **`return_url` per store**: the legacy `client.ts` hardcodes `/order-success`. For per-droplet stores (`SHOP_SLUG` baked in), this URL gets rewritten by `middleware.ts` so the visitor lands on the right store domain — BUT the path resolves to the central `/order-success` which is a marketplace-level page (`app/(marketplace)/order-success`). The intended UX is `/stores/[slug]/checkout/success`, which already exists. The legacy code path needs the URL changed to `${BASE_URL}/stores/${storeSlug}/checkout/success?orderId=...` before launch, OR the legacy create-payment call site needs to be deleted in favour of the intent path.
- **`ANYPAY_RETURN_URL` per store**: the intent-server reads a single global env var for all stores. On the per-store droplet model this is fine because each droplet has its own env; on the central control plane it's not. Confirm which model the 6 stores actually use (single droplet per store, or central). Per the architecture in `docs/multi-tenant-provisioning/`, each store has its own droplet → single env per droplet → OK.
- **PG IP whitelisting**: the runbook (`docs/multi-tenant-provisioning/payment-whitelist.md`) describes a MANUAL workflow with Anypay because they don't expose an API. Per `ShopDeployment.paymentWhitelistStatus`, each of the 6 stores must reach `CONFIRMED`. Verify with:
  ```sql
  SELECT s.slug, d."paymentWhitelistStatus", d."paymentWhitelistConfirmedAt"
  FROM "Store" s JOIN "ShopDeployment" d ON d."storeId" = s.id
  WHERE s.slug IN ('minimop24','zugarbox','ergobodies','Powerpuff678','casethep','bikini551');
  ```
- **Webhook signing secret rotation**: `ANYPAY_WEBHOOK_SECRET` should be a per-environment value rotated on launch. The signature verifier (`lib/anypay/intent-server.ts:128-172`) is solid — HMAC-SHA256 + 5-min window + `timingSafeEqual`.

**Recommendation**: before launch, retire the legacy `lib/anypay/client.ts` / `app/api/checkout/route.ts` path entirely. It's a footgun. If retiring is too risky, at minimum patch line 45 of `client.ts` to point at the per-store success page.

#### `[ ]` Transactional emails (Resend) — PR #42 merged

PR #42 (`6be7a66`) IS merged into the base branch — `lib/transactional-email/{client,send,index}.ts`, 5 hooks, 5 templates. Architecture is correct (dev-mode console fallback, never-throw semantics, `replyTo` propagation, EMAIL_FROM env fallback to `orders@basketplace.co`).

**What's actually wired:**
- ✅ **PAID transition**: `app/api/anypay/webhook/route.ts:165-175` calls `sendOrderPaidEmail()` AFTER `$transaction` commits. Correct ordering — email cannot roll back the PAID state.
- ✅ **Legacy `markOrderPaid`** path also calls `sendOrderPaidEmail` (`lib/orders/markPaid.ts:5,53`).

**What's NOT wired (gaps):**
- ❌ `markOrderShipped` (`lib/orders/server-actions.ts:94-135`) does NOT call `sendOrderShippedEmail`. Comment in `anypay/webhook/route.ts:159-160` confirms this is a known Phase 2A todo.
- ❌ `markOrderDelivered` (`lib/orders/server-actions.ts:137-161`) does NOT call `sendOrderDeliveredEmail`. Same todo.
- ❌ `sendOrderRefundedEmail` has no caller. Phase 3C todo (refunds not implemented).
- ❌ `sendAbandonedCartEmail` has no caller. No cron / Inngest job is scheduled.

**Fix path before launch (small, contained PR):**
1. Edit `lib/orders/server-actions.ts:127` (`markOrderShipped`) — after the `prisma.order.update`, fire `sendOrderShippedEmail({ orderId })` (non-blocking, swallow errors).
2. Edit `lib/orders/server-actions.ts:154` (`markOrderDelivered`) — same pattern with `sendOrderDeliveredEmail`.
3. Leave `sendOrderRefundedEmail` and `sendAbandonedCartEmail` until their flows exist. Document as deferred.

**`RESEND_API_KEY` is configured?** The send wrapper's dev fallback (`send.ts:62-74`) skips Resend when `NODE_ENV !== "production"` OR when `getResendClient()` returns null (no key). In production this means: **if the key isn't set, emails are silently dropped to console**. Operator action: set `RESEND_API_KEY` AND `EMAIL_FROM=orders@basketplace.co` (or a per-store from-address — see Section 3) in the production environment, AND verify the `basketplace.co` sender domain in Resend (DKIM + SPF DNS records).

#### `[ ]` Address book scoped per-store — PR #39 merged

PR #39 (`02f9b3b`) IS merged. `prisma/schema.prisma:349-378` shows `Address.storeId NOT NULL`, composite index `[userId, storeId]`, FK to Store with ON DELETE CASCADE. The migration is at `prisma/migrations/20260513203551_add_address_storeid/migration.sql`.

**Production rollout risk:** the migration is the destructive form (adds `NOT NULL` storeId with no backfill). The migration's leading comment explicitly warns: "⚠️ Production rollout (HUMAN APPROVAL REQUIRED before applying)" with a per-user backfill SQL that picks the most-recently-active store. If there are existing Address rows in prod, this migration **will fail** to apply against them.

**Operator action before launch:**
1. Check `SELECT COUNT(*) FROM "Address";` in prod.
2. If `> 0`, run the backfill SQL embedded in the migration comment (lines 14-22) FIRST.
3. Confirm `SELECT COUNT(*) FROM "Address" WHERE "storeId" IS NULL;` returns 0.
4. Then apply the migration via `prisma migrate deploy`.

#### `[ ]` Per-store account pages — PR #37 merged

PR #37 (`392d046`) merged. `/account/*` moved to `/stores/[slug]/account/*`. Listed routes in worktree:
- `/stores/[slug]/account` (home)
- `/stores/[slug]/account/orders`
- `/stores/[slug]/account/orders/[id]`
- `/stores/[slug]/account/profile`

✓ No further action.

#### `[ ]` Customer model (Phase 1D — per-store customer)

The Q1=A architecture decision (each store owns its own customers, Shopify-style) is **only partially implemented**:
- ✅ Address has `storeId` (Phase 1C → PR #39, merged).
- ❌ The `User` model itself remains global (`prisma/schema.prisma:56-83`). There is no `Customer` model, no `(userId, storeId)` join, no per-store customer profile, no per-store email preferences, no per-store password reset.

**Implication for launch:**
- A buyer who signs up at `bikini551.com` and at `casethep.com` with the same email is the SAME `User` row.
- The signup form at `/stores/[slug]/signup` writes a unified user; the JWT session also is unified.
- `Order.userId` is global so the buyer's order history aggregates across stores. The buyer-facing per-store account pages at `/stores/[slug]/account/orders` filter by `storeId` to hide cross-store leakage (PR #34, `0ef7892`), so the UX *appears* per-store, but the underlying identity is shared.

**Recommendation (Phase 1D scope):**
- **Defer the full customer-model split for launch.** With the address-storeId fix in place and the per-store order filter in PR #34, the cross-store data isolation is good enough for a first paying customer. A Shopify-grade per-store customer model is a multi-week effort touching auth, sessions, orders, coupons, password reset, and email preferences. None of it is blocking.
- **Document the limitation** in the operator-facing privacy page so we don't surprise anyone later.

#### `[ ]` Vendor login + dashboard — PR #40 merged

PR #40 (`4d2b89c`) merged — `app/(marketplace)/dashboard/store/orders/page.tsx` + ship/deliver/cancel server actions in `lib/orders/server-actions.ts`. Dashboard exists at `/dashboard/store/orders`.

**Verify vendor accounts exist:**
```sql
SELECT u.email, u.role, u."isVerified", s.slug
FROM "User" u JOIN "Store" s ON s."ownerId" = u.id
WHERE s.slug IN ('minimop24','zugarbox','ergobodies','Powerpuff678','casethep','bikini551');
```
All 6 owner rows should have `role='VENDOR'`. If any are still `CUSTOMER`, promote them via `/admin/users` (`/api/admin/users`).

**Vendor sign-in path:** the magic-link / password flow lives in the central marketplace (NextAuth at `app/api/auth/[...nextauth]`). Each vendor logs in at `${MAIN_DOMAIN}/signin`. Vendors do NOT log in at their per-store domain — the dashboard is intentionally on the central marketplace so vendors of multiple stores have one login. Confirm the 6 owners know this URL.

---

## Section 3 — Platform-level gaps (cross-cutting)

### `[ ]` Anypay live keys

| Env var | Required for | Currently |
|---|---|---|
| `ANYPAY_MODE` | switch off mock | `mock` (default) — **must be `live` in prod** |
| `ANYPAY_API_BASE` | live endpoint | unset by default |
| `ANYPAY_MERCHANT_ID` | legacy create-payment | unset |
| `ANYPAY_API_KEY` | legacy create-payment | unset |
| `ANYPAY_SECRET` | legacy create-payment signing | unset |
| `ANYPAY_SECRET_KEY` | intent path | unset |
| `ANYPAY_WEBHOOK_SECRET` | webhook HMAC verification | unset |
| `ANYPAY_RETURN_URL` | intent return_url | unset |
| `ANYPAY_WEBHOOK_URL` | intent webhook_url | unset |

**Key rotation policy** is not documented. Add a runbook: rotate every 90 days, after any reported leak, when an admin offboards. Store keys in the password manager + per-droplet env (cloud-init template at `lib/provisioner/cloud-init.ts`).

### `[ ]` Resend live key + verified sender domain

- `RESEND_API_KEY` — must be set in prod. Currently absent.
- `EMAIL_FROM` — defaults to `orders@basketplace.co` (`lib/transactional-email/send.ts:30-31`). **Basketplace.co MUST be added + verified at https://resend.com/domains with DKIM + SPF DNS records.** Without this Resend will silently quarantine.

#### Per-store custom from-address?

The codebase **does support** Reply-To per store: `SendEmailOptions.replyTo` is plumbed through `send.ts:46, 83`. The hooks (`hooks/send-order-paid.ts` etc.) generally pass `store.contactEmail` as `replyTo`. Confirm by reading e.g. `lib/transactional-email/hooks/send-order-paid.ts`.

However the **From: address** is fixed to a single platform default. Each store ideally has its own `noreply@bikini551.com`, which requires:
1. A `Store.transactionalFromAddress` column (does not exist).
2. Each vendor domain verified in Resend (each is its own root domain → each needs DKIM + SPF DNS records).
3. Per-store sender configuration applied in the send hook.

**Recommendation:**
- **Defer per-store From: for launch.** Keep `orders@basketplace.co`, use store's `contactEmail` as `replyTo` (already implemented). Add a note in the customer-facing storefront footer that emails will come from `orders@basketplace.co` on behalf of `<store name>`. Saves multi-week DNS coordination across 6 domains.

### `[ ]` Cross-store data isolation tests (manual smoke)

Run these BEFORE flipping the public DNS for any of the 6:

1. **Cart isolation**: open `bikini551.com` → add product. Open `casethep.com` in the same browser session → cart should be empty (PR #35 `00e9013`).
2. **Address book isolation**: sign in as the same user on both stores → save an address at one → switch stores → address picker must NOT show the other store's address (PR #39 `02f9b3b`).
3. **Order history isolation**: as a buyer who has orders at multiple stores, visit `/stores/A/account/orders` → confirm ONLY A's orders show, not B's (PR #34 `0ef7892`).
4. **Profile name isolation**: not yet supported — same `User.name` shown at every store. Acceptable for launch (see Section 2.1, Customer model deferral).
5. **Wishlist isolation**: check `app/stores/[slug]/wishlist/` and confirm wishlist is store-scoped. (Not audited in depth; should be sanity-checked.)
6. **Coupon scope**: claim a `scope.type='store'` coupon at store A → confirm it doesn't apply at store B's checkout.
7. **PDP**: visit `bikini551.com/products/<product-from-casethep-id>` → must `notFound()`, never render someone else's product.

### `[ ]` SEO / metadata

**Gap: extensive.** Audit findings:

- `app/layout.tsx:50-54` has a single global `metadata` for the entire marketplace (`title: "Marketplace"`, generic description). This is the FALLBACK that storefront pages inherit.
- `app/stores/[slug]/layout.tsx` does NOT export `generateMetadata`. Every store inherits the generic "Marketplace" title and description in `<head>`.
- `app/stores/[slug]/page.tsx`, `app/stores/[slug]/products/[id]/page.tsx`, `app/stores/[slug]/category/[name]/page.tsx` — none export `generateMetadata`.
- **No `app/robots.ts` or `app/robots.txt`.**
- **No `app/sitemap.ts` or per-store `app/stores/[slug]/sitemap.ts`.**
- No OpenGraph image generator.
- `referrer: "no-referrer"` is set at the root which suppresses referrer headers — fine for privacy but reduces inbound attribution.

**Minimum fix-path for launch (small PR; recommend doing this before going live):**
1. Add `generateMetadata` to `app/stores/[slug]/layout.tsx` returning `{ title: store.name, description: store.tagline ?? store.description, openGraph: { ... }, alternates: { canonical: `https://${store.customDomain ?? `${store.slug}.${MAIN_DOMAIN}`}` } }`.
2. Add `generateMetadata` to PDP pages — title = `${product.title} · ${store.name}`, og:image = product.imageUrl.
3. Add `app/stores/[slug]/sitemap.ts` returning all approved products + main pages.
4. Add `app/robots.ts` — allow all on storefront, disallow `/dashboard*`, `/admin*`, `/api*`.

This is non-blocking from a "can a buyer place an order" standpoint but blocking from a "the store has any SEO presence" standpoint, so it's recommended pre-launch even if minor.

### `[ ]` Analytics

**No analytics wiring of any kind.** `grep -rn "Sentry|sentry|posthog|plausible|gtag|GA_TRACKING|Analytics"` across `app`, `lib`, `components` returns zero results. `package.json` has no analytics SDK.

**Recommendation:**
- Add **Plausible** (privacy-friendly, no consent banner needed) as a single `<Script>` in `app/layout.tsx` for the central marketplace, AND in `app/stores/[slug]/layout.tsx` for each storefront (custom domain support: Plausible accepts CNAME aliases).
- Add **Conversion tracking**: at minimum `addToCart`, `beginCheckout`, `purchase` events. These hook off existing client components (`AddToCartModal`, checkout pages) — small contained PR.
- **Defer**: full funnel analytics, attribution, A/B testing, server-side events. Not blocking.

### `[ ]` Error monitoring

**No Sentry / equivalent.** `grep -rn "Sentry|sentry"` returns zero across the repo. The current error visibility is:
- `console.log` / `console.warn` / `console.error` calls scattered throughout (~hundreds).
- `getNotifier()` returns the `consoleNotifier` no-op (`lib/notify/index.ts:6`). The Notifier interface is `info | warn | error` and has stubs for `line / email / discord` per the comment, but none implemented.
- Whatever the droplet's journald / PM2 / Docker logs retain locally (no central log shipping in place).

**Gap is significant for "durable for real customers long-term".**

**Recommendation:**
- Add **Sentry** (or **Highlight.io**, or **OpenTelemetry → Honeycomb**) before launch. At minimum wire `@sentry/nextjs` into `app/layout.tsx`. Configure `Sentry.captureException` from `getNotifier().error(...)` so existing notify calls also reach Sentry.
- Add `lib/notify/sentry.ts` that implements the `Notifier` interface against `Sentry.captureMessage` / `captureException` and switch `getNotifier()` to return it when `SENTRY_DSN` is set.
- This is the single most important missing piece for "long-term real customers". Treat as a launch-blocker.

### `[ ]` Page speed

`next.config.mjs` review:
- ✅ `output: "standalone"` — small Docker image.
- ✅ `images.remotePatterns: [{ protocol: 'https', hostname: '**' }]` — generic, but allows Next.js Image optimization.
- ❌ No `experimental.optimizePackageImports` — could shave 100s of kB on `lucide-react`, `@react-email/components`.
- ❌ No `headers()` for `Cache-Control` — every page is dynamic. Storefronts have many ISR-friendly pages (category, PDP) but the per-store layout uses `export const dynamic = "force-dynamic"` (line 36), which disables ISR universally. This is a perf risk at scale.
- ❌ No fonts subset configuration in `app/layout.tsx` beyond `subsets: ["latin"]` / `["thai", "latin"]` — fine. `display: "swap"` is set — good.
- ❌ No bundle analyzer wired (`@next/bundle-analyzer`) for ongoing watch.

**Recommendation:**
- Pre-launch: add `experimental.optimizePackageImports: ['lucide-react', '@react-email/components']` to next.config.mjs.
- Defer ISR migration (force-dynamic → revalidate=N) until after launch — it's a refactor, not a fix, and force-dynamic is the safe default.

### `[ ]` Mobile experience

Spot-check required (not auditable from code):
1. PDP `/stores/[slug]/products/[id]` — image gallery sized for mobile, variant picker not cramped, sticky CTA at bottom.
2. Cart `/stores/[slug]/cart` — line item rows tap-friendly, qty stepper works on touch, summary collapses sensibly.
3. Checkout `/stores/[slug]/checkout/address` + `/confirm` — form inputs respect iOS Safari (no zoom on focus → font-size ≥ 16px), PromptPay QR renders on small viewports.
4. `ShopHeader` mobile menu — drawer opens on tap, links work.
5. ShopFloatingButtons (`components/shop/ShopFloatingButtons.tsx`) don't overlap CTAs.

**Action:** before launch, sales-test each store on iPhone Safari and Android Chrome at 360px width.

---

## Section 4 — Recommended merge order for open PRs

### Inventory of open PRs targeting `feat/multi-tenant-provisioning`

| # | Title | State | Base | Risk |
|---|---|---|---|---|
| #41 | feat(design): trust family — 8 buyer pages redesigned | **MERGED** during audit window | `feat/multi-tenant-provisioning` | — |
| #43 | feat(design): specialty family — 8 buyer pages redesigned | open, non-draft, **was stacked on #38** | `feat/multi-tenant-provisioning` | must rebase on top of #41 before merge |
| #30 | chore: remove unused shadcn-studio dashboard demos | open, draft | `feat/multi-tenant-provisioning` | safe, cosmetic |
| #28 | feat(coupons): add public /coupons claim page | open, draft | `feat/multi-tenant-provisioning` | safe, additive |
| #27 | feat(system): app/global-error.tsx | open, draft | `feat/multi-tenant-provisioning` | safe, additive |
| #26 | fix(scaffold): wire dead /cart + /account/orders paths | open, draft | `feat/multi-tenant-provisioning` | safe, scaffolding |
| #25 | feat(system): app/not-found.tsx + error.tsx | open, draft | `feat/multi-tenant-provisioning` | safe, additive — **highly recommended for launch** |

Targets other than `feat/multi-tenant-provisioning` (against `main`): #5, #8, #17, #18, #19 — out of scope for this audit unless they're rebased onto the launch branch.

**Not yet PRs** (local branches per `git branch -a`):
- `claude/design-electronics-tech-pilot`
- `claude/design-lifestyle-pilot`
- `claude/design-business-model-pilot`
- `claude/design-community-pilot` (deliberately not being built per the prompt)

### Conflict analysis for the design-family PRs

All design-family pilots touch the same triad:
- `app/layout.tsx` (each adds a `next/font` import + a `--font-X` variable to the `<html className>`)
- `app/globals.css` (each appends a `.theme-X` skin block)
- `app/stores/[slug]/layout.tsx` (each adds an `isXStore()` detection branch into the combined `familyVars/familyClass/familyAccent` bag)
- `app/stores/[slug]/products/[id]/page.tsx` (each adds an `isX ? <XHero /> :` branch)
- `app/stores/[slug]/category/[name]/page.tsx` (similar)
- `app/stores/[slug]/cart/cart-client.tsx` (`isX` prop)
- `app/stores/[slug]/account/page.tsx`
- `app/stores/[slug]/signin/signin-client.tsx`
- `app/stores/[slug]/signup/signup-client.tsx`
- `app/stores/[slug]/checkout/success/page.tsx`

These are **mechanical conflicts** — same file modified in similar regions but adding different content. There is no semantic conflict (each family is gated on a different detection function, and the detection functions are mutually exclusive). Git's three-way merge will fail at the diff-context level, but a careful rebase succeeds in minutes.

### Recommended merge sequence

**Approach: coordinator-rebase.** Designate one person (or this audit's follow-up agent) to rebase each design PR onto the previous one's merge commit, in order. This keeps each PR atomic & reviewable; avoids a 10-family integration PR that nobody can read.

1. **First** — non-design hygiene PRs that don't conflict with design (low risk, easy wins, useful for launch):
   - **#25** (`app/not-found.tsx` + `app/error.tsx`) — MERGE FIRST. Highly recommended for launch — a friendly 404/500 page is a quality bar for "real customers".
   - **#27** (`app/global-error.tsx`) — MERGE after #25. Same family; layer-of-defense for root-layout crashes.
   - **#28** (`/coupons` claim page) — merge if the operator wants the public claim surface; otherwise defer (couponing isn't on the critical-path).
   - **#30** (drop dashboard demos) — merge for hygiene; deletes dead code.
   - **#26** (wire dead /cart + /account/orders paths) — merge if you want the dead scaffold cleaned up; otherwise defer.

2. **Second** — design family pilots, in dependency order:
   - **#38 (fashion-beauty)** — already merged.
   - **#41 (trust)** — already merged.
   - **#43 (specialty)** — was stacked on #38; rebase on tip (now includes #38 + #41). Merge.
   - **electronics-tech (not yet a PR)** — push branch `claude/design-electronics-tech-pilot`, open PR against `feat/multi-tenant-provisioning`, rebase on tip (now includes #38 + #41 + #43). Merge.
   - **lifestyle (not yet a PR)** — push branch, open PR, rebase, merge.
   - **business-model (not yet a PR)** — push branch, open PR, rebase, merge.
   - **community** — DO NOT BUILD. Either accept default render for the community-family stores, or have the operator switch those stores to another family.

3. **Third** — the small "missing-email-hooks" patch (Section 2.1):
   - New small PR: wire `sendOrderShippedEmail` to `markOrderShipped` and `sendOrderDeliveredEmail` to `markOrderDelivered`. Single file (`lib/orders/server-actions.ts`), 2 hunks, trivial review.

4. **Fourth** — the small "SEO metadata" patch (Section 3):
   - New small PR: `generateMetadata` on storefront layout + PDP + category, plus `app/robots.ts` and `app/stores/[slug]/sitemap.ts`. Reviewable, ~150 lines.

5. **Fifth** — the operational env wiring (no code; runbook):
   - Set live Anypay env vars in prod + each droplet.
   - Set `RESEND_API_KEY` and verify `basketplace.co` in Resend.
   - Set `SENTRY_DSN` (or chosen monitor) after the small PR that wires Sentry.
   - Run prod SQL (Section 1) and prod Address backfill (Section 2.1).
   - Run prod cross-store smoke tests (Section 3).

**Alternative: single integration PR.** If coordinator-rebase is too operationally heavy, an integration branch `feat/six-store-launch` can sequentially merge each design pilot, resolving conflicts inline. Trade-off: one giant PR is harder to review but a single merge point. Not recommended unless time pressure is extreme — the per-family review is the easiest way to catch design regressions.

---

## Section 5 — Recommended deferrals (Phase 3 roadmap)

For each item in the original Phase 3 roadmap, "blocking" means "a first paying customer at one of the 6 stores genuinely cannot complete a long-term relationship with the store without it." Everything else defers.

| Item | Status | Recommendation | Rationale |
|---|---|---|---|
| **Reviews** (PDP + post-purchase) | Not built | **DEFER** | Stores can launch without reviews. The competitive risk is real (no social proof), but it doesn't break the buy. Manually-curated testimonials in the landing schema cover the gap for V1. |
| **Shipments** (carrier integration, label printing, real tracking) | Manual tracking exists (`shippingCarrier` + `trackingNumber` columns + vendor `markOrderShipped` action) | **DEFER** carrier API; ship tracking number entry now | Vendors enter tracking by hand → buyer sees it on `/stores/[slug]/account/orders/[id]`. Adequate for a first paying customer. Carrier API (Kerry/Flash/J&T APIs) is a quarter-long integration project. |
| **Refunds** (buyer-initiated, server flow, money-back) | Not built; `OrderStatus.RETURNED` enum exists | **DEFER** for V1; build a manual admin-side refund workflow | Anypay supports refund APIs; wiring them is moderate work. For launch, a manual workflow (admin tools refund the order in Anypay's dashboard, then updates order status via `/admin/orders/[id]`) is enough. Tag the email template `sendOrderRefundedEmail` as ready-to-call from that admin action. |
| **Payouts** (vendor money received from sales, minus platform commission) | Not built | **DEFER** | Operator can do manual reconciliation for the first weeks. Six stores is small enough volume for SQL queries + bank transfers. Once volume crosses ~100 orders/week per store, automated payouts become urgent. |
| **SMS OTP** (sign-in / sign-up) | Not built | **DEFER** | Magic-link email is sufficient. SMS OTP costs money per send and requires Thai mobile-carrier integration. Add later if conversion data shows email-only is the bottleneck. |
| **Mobile PWA** (`manifest.json`, service worker, offline shell) | Not built | **DEFER** | Mobile responsive coverage (Section 3) is the actual blocker. PWA is a polish layer over that and adds complexity (cache invalidation, push notifications). Defer to Phase 4. |

### NOT deferred — must ship before launch

- **Sentry / equivalent error monitoring** (Section 3) — launch-blocker for "durable for real customers".
- **Resend live key + verified `basketplace.co` sender** (Section 3) — emails are silently dropped without this.
- **Anypay live keys + `ANYPAY_MODE=live`** (Section 3) — mock mode = no real money.
- **PG IP whitelisting confirmed for each droplet** (Section 2.1) — without this, Anypay rejects the live API call.
- **Address migration backfill + apply in prod** (Section 2.1) — without this, the Phase 1C migration breaks deploy.
- **SEO metadata `generateMetadata` + robots.ts + sitemap.ts** (Section 3) — without this, the stores are invisible to search engines and look broken in social sharing. Small PR.
- **`sendOrderShippedEmail` + `sendOrderDeliveredEmail` wiring** (Section 2.1) — without this, buyers don't get tracking emails. Small PR.
- **`app/not-found.tsx` + `app/error.tsx`** (PR #25) — friendly system pages are a quality bar. Small PR.

---

## Appendix A — Useful SQL one-liners

```sql
-- Section 1: template / family mapping
SELECT slug, name, "templateId", "landingThemeVariant",
  CASE WHEN "landingBlocks" IS NULL THEN 'default'
       WHEN "templateId" IS NOT NULL THEN 'react-template'
       ELSE 'ai-multi-page' END AS render_path,
  "approvalStatus", "customDomain"
FROM "Store"
WHERE slug IN ('minimop24','zugarbox','ergobodies','Powerpuff678','casethep','bikini551')
ORDER BY slug;

-- Section 2: custom-domain provisioning state
SELECT s.slug, s."customDomain", d.status, d."customDomainVerified",
       d."publicIpv4", d."paymentWhitelistStatus"
FROM "Store" s
LEFT JOIN "ShopDeployment" d ON d."storeId" = s.id
WHERE s.slug IN ('minimop24','zugarbox','ergobodies','Powerpuff678','casethep','bikini551');

-- Section 2: vendor accounts
SELECT u.email, u.role, u."isVerified", s.slug, s.name
FROM "User" u
JOIN "Store" s ON s."ownerId" = u.id
WHERE s.slug IN ('minimop24','zugarbox','ergobodies','Powerpuff678','casethep','bikini551');

-- Section 2: Address backfill prep (run BEFORE prisma migrate deploy on prod)
SELECT COUNT(*) FROM "Address";
-- if > 0, run per-user backfill picking latest-order's store:
-- UPDATE "Address" a SET "storeId" = (
--   SELECT o."storeId" FROM "Order" o
--   WHERE o."userId" = a."userId" AND o."storeId" IS NOT NULL
--   ORDER BY o."createdAt" DESC LIMIT 1
-- ) WHERE a."storeId" IS NULL;
SELECT COUNT(*) FROM "Address" WHERE "storeId" IS NULL;  -- must be 0
```

## Appendix B — Files referenced by this audit

- `app/admin/stores/page.tsx` — admin list-view of stores
- `app/api/anypay/webhook/route.ts` — Anypay intent webhook (verified, idempotent)
- `app/api/checkout/route.ts` — legacy create-payment entry point
- `app/api/internal/resolve-domain/route.ts` — custom-domain → slug lookup for middleware
- `app/api/provisioner/caddy-ask/route.ts` — Caddy on-demand TLS gate
- `app/layout.tsx` — root layout (single global metadata)
- `app/stores/[slug]/layout.tsx` — storefront layout (no per-store metadata)
- `infra/shop-droplet/Caddyfile.template` — per-droplet TLS config
- `lib/anypay/client.ts` — legacy create-payment (hardcoded `return_url`, needs fix)
- `lib/anypay/intent-server.ts` — modern intent path
- `lib/email/index.ts` — alias provider (NOT for outbound; only Cloudflare aliases)
- `lib/landing/families.ts` — 9 design families A-I
- `lib/notify/index.ts` — current "notifier" is a console no-op (Sentry gap)
- `lib/orders/markPaid.ts` — legacy paid hook (CALLS email)
- `lib/orders/server-actions.ts` — vendor ship/deliver actions (DO NOT call email — gap)
- `lib/templates/registry.ts` — 20-template + 7-family registry
- `lib/transactional-email/{index,send,client}.ts` — Resend wrapper + hooks
- `middleware.ts` — host-based routing (per-droplet SHOP_SLUG, subdomain, custom domain)
- `next.config.mjs` — perf config (mostly default)
- `prisma/schema.prisma` — Store, User, Address, PaymentIntent, ShopDeployment, ProvisioningJob
- `prisma/migrations/20260513203551_add_address_storeid/migration.sql` — Phase 1C migration (needs prod backfill)
