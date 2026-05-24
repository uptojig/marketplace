import { notFound } from "next/navigation";
import Link from "next/link";
import { waitUntil } from "@/lib/wait-until";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { translateProductTitlesForStore } from "@/lib/translate-titles";

/**
 * In-memory rate-limit so the storefront-render auto-translate
 * trigger doesn't fire on every page view when a busy store has
 * untranslated products. Map<storeId, lastTriggeredAt-ms>. Process
 * restart resets — fine, single trigger per cold-start is plenty.
 *
 * 5 min cooldown is generous for the operator's UX (visitor #1 at
 * t=0s triggers; #2 at t=5s sees translation in progress; by
 * t=30-60s it's done) but tight enough to retry quickly if a Claude
 * call legitimately failed.
 */
const recentBackfillTriggers = new Map<string, number>();
const BACKFILL_COOLDOWN_MS = 5 * 60 * 1000;
import { ShopFloatingButtons } from "@/components/shop/ShopFloatingButtons";
import { CookiesBar } from "@/components/shop/CookiesBar";
import { CartDrawer } from "@/components/storefront/cart-drawer";
import { resolveFamily } from "@/lib/landing/families";
import { resolveStoreTheme } from "@/lib/storefront/resolve-store-theme";
import { getStoreBySlug } from "@/lib/storefront/get-store";
import { isV12Schema } from "@/lib/multi-page-migration";
import { isHtmlSchema } from "@/components/storefront/HtmlRenderer";
import { isReactTemplateSchema } from "@/components/storefront/templates/registry";
import { ShopHeader } from "@/components/storefront/chrome/ShopHeader";
import { ShopFooter } from "@/components/storefront/chrome/ShopFooter";
import {
  presetForFamily,
  resolveChromeTokens,
  tokensToCssVars,
} from "@/components/storefront/chrome/tokens";
import {
  landingContentAnnouncement,
  landingContentCssVars,
} from "@/lib/store/landing-content-runtime";
import type { ColorOverrides } from "@/lib/store/landing-content";
import { templates as STORE_TEMPLATES } from "@/lib/templates/registry";
import type { ShellShape, TemplateId } from "@/lib/templates/types";
import { effectiveTemplateId } from "@/lib/landing/legacy-slug-template";

export const dynamic = "force-dynamic";

/**
 * Outer page skeleton variants — each template can opt into a shape
 * via `chrome.shellShape`. Same inputs (className / theme vars /
 * announcement strip / header / main / footer / floating chrome)
 * compose into different wrappers so storefronts feel structurally
 * distinct, not just visually re-skinned.
 *
 * The `className` we receive already encodes the theme + family +
 * shop-page hooks the CSS cascade needs — we keep it intact and let
 * Tailwind's last-wins ordering layer the shape's layout on top.
 * Non-centered shapes therefore pass `min-h-screen` via the input
 * className and add their own grid/positioning utilities.
 */
function StoreShell({
  shape,
  className,
  style,
  strip,
  header,
  main,
  footer,
  floating,
}: {
  shape: ShellShape;
  className: string;
  style: React.CSSProperties;
  strip: React.ReactNode;
  header: React.ReactNode;
  main: React.ReactNode;
  footer: React.ReactNode;
  floating: React.ReactNode;
}) {
  switch (shape) {
    case "sidebar-left":
      // 240px sticky nav on desktop, header collapses to a horizontal
      // strip on mobile. Header renders TWICE — once inside the
      // <aside> for desktop and once above <main> for mobile — and
      // the CSS-only `lg:hidden` / `hidden lg:block` toggles pick the
      // right one without any JS-side viewport detection.
      return (
        <div
          className={`${className} lg:grid lg:grid-cols-[240px_1fr]`}
          style={style}
        >
          <aside
            className="hidden lg:block lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto border-r"
            style={{ borderColor: "var(--shop-border)" }}
          >
            {header}
          </aside>
          <div className="flex flex-col lg:min-h-screen">
            <div className="lg:hidden">{header}</div>
            {strip}
            <main className="flex-1">{main}</main>
            {footer}
          </div>
          {floating}
        </div>
      );

    case "split-hero":
      // Header renders directly under {strip}; <main> overlaps with `-mt-px`
      // and templates can pull their hero up via `-mt-16 relative z-10` on
      // the first child. The header keeps the outer shop-page wrapper as its
      // containing block, so any `position: sticky` inside the bespoke
      // Header component continues to work after scroll.
      return (
        <div className={className} style={style}>
          {strip}
          {header}
          <main className="flex-1 -mt-px">{main}</main>
          {footer}
          {floating}
        </div>
      );

    case "full-bleed":
      // Header is absolutely positioned across the top so the hero
      // can extend edge-to-edge under it. Templates using this shape
      // must add their own top padding (or a tall hero) so content
      // clears the floating chrome. `relative` is added so the
      // absolutely-positioned header anchors to this wrapper.
      return (
        <div className={`${className} relative`} style={style}>
          {strip}
          <div className="absolute inset-x-0 top-0 z-30">{header}</div>
          <main className="flex-1 pt-0">{main}</main>
          {footer}
          {floating}
        </div>
      );

    case "magazine":
      // Marker shape for editorial / handmade templates. Templates that
      // opt in own their internal layout (max-w + px-* on their own
      // sections); the shell stays pass-through so we don't compound
      // gutters with the template's existing containers.
      return (
        <div className={className} style={style}>
          {strip}
          {header}
          <main className="flex-1">{main}</main>
          {footer}
          {floating}
        </div>
      );

    case "centered":
    default:
      // Input className already carries the centered defaults
      // (`shop-page min-h-screen flex flex-col` plus theme + family).
      return (
        <div className={className} style={style}>
          {strip}
          {header}
          <main className="flex-1">{main}</main>
          {footer}
          {floating}
        </div>
      );
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const store = await prisma.store.findUnique({
    where: { slug: params.slug },
    select: { name: true, tagline: true, description: true },
  });
  if (!store) {
    return { title: "ไม่พบร้านค้า" };
  }
  const description = store.description
    ? `${store.description} - ${store.name}`
    : store.tagline
      ? `${store.tagline} - ${store.name}`
      : `ช้อปสินค้าออนไลน์ ส่งฟรีทั่วประเทศ จาก ${store.name}`;
  return {
    title: {
      template: `%s | ${store.name}`,
      default: store.name,
    },
    description,
    openGraph: {
      title: store.name,
      description,
    },
  };
}

export default async function ShopLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const store = await getStoreBySlug(params.slug);
  if (!store) notFound();

  // Editable storefront content (1:1 with Store) — colors, hero, announcement,
  // and all repeatables. May be null when the operator hasn't saved anything
  // yet, in which case every consumer below falls back to template defaults.
  const landingContent = await prisma.storeLandingContent.findUnique({
    where: { storeId: store.id },
  });
  const lcColorVars = landingContentCssVars(
    (landingContent?.colorOverrides as ColorOverrides | null | undefined) ??
      null,
  );
  const lcAnnouncement = landingContentAnnouncement(landingContent);

  // Which customer-service pages have real content for this store?
  // Footers use this to hide links whose target would render the
  // empty "ยังไม่มีเนื้อหา — Regenerate landing page" stub.
  // /help/* pages always have content (HELP_PAGES is static).
  //
  // Gate on `blocks.length > 0`, not just "slug appears in pages"
  // — agents sometimes emit a placeholder page with the slug
  // declared but no blocks, and MultiPageRenderer would render
  // nothing visible (or a near-empty page) which is the same UX as
  // the stub. Operators want those hidden too.
  const availableSupportPages: string[] = (() => {
    const slugs: string[] = [];
    const blocks = store.landingBlocks;
    if (blocks && typeof blocks === "object" && isV12Schema(blocks)) {
      for (const p of (blocks as { pages: { slug: string; blocks?: unknown[] }[] }).pages) {
        if (Array.isArray(p.blocks) && p.blocks.length > 0) {
          slugs.push(p.slug);
        }
      }
    }
    return slugs;
  })();

  // ── Auto-translate trigger ──────────────────────────────────
  // Stores imported BEFORE the auto-translate waitUntil hook
  // (commit 8eee8ad) have products with titleTh=null which then
  // render in English on category / search / PDP / fallback grids.
  // Operators can fix this manually via the dashboard button, but
  // we also auto-trigger here on the first storefront render to
  // self-heal: visitor #1 kicks Claude in the background, by the
  // time visitor #2 lands the rows are translated.
  //
  // Cheap COUNT query gates the trigger — costs one DB roundtrip
  // per render once everything is translated (then count=0 and we
  // bail). Rate-limited to 1 fire per 5min per process via the
  // Map above so we don't spam Claude on hot stores.
  const lastFire = recentBackfillTriggers.get(store.id) ?? 0;
  if (Date.now() - lastFire > BACKFILL_COOLDOWN_MS) {
    const untranslated = await prisma.product.count({
      where: { storeId: store.id, active: true, titleTh: null },
    });
    if (untranslated > 0) {
      recentBackfillTriggers.set(store.id, Date.now());
      waitUntil(
        translateProductTitlesForStore(store.id).catch((err) => {
          console.error(
            `[storefront-layout] auto-translate failed (${store.slug}):`,
            err,
          );
        }),
      );
    }
  }

  // Approval gate. Must run BEFORE the HTML/v12 short-circuit so
  // non-approved stores can't bypass via that path either.
  //
  // Visibility matrix:
  //   APPROVED  → everyone
  //   PENDING / REJECTED / SUSPENDED:
  //     - ADMIN          → full preview
  //     - store owner    → full preview (so they can QA before approval)
  //     - everyone else  → friendly "รอตรวจสอบ" page (NOT bare 404 — old
  //                        behaviour was a debugging dead-end where
  //                        owners thought the store was broken)
  if (store.approvalStatus !== "APPROVED") {
    const session = await getServerSession(authOptions);
    const viewer = session?.user?.email
      ? await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { id: true, role: true },
        })
      : null;
    const isAdmin = viewer?.role === "ADMIN";
    const isOwner = !!viewer && viewer.id === store.ownerId;
    if (!isAdmin && !isOwner) {
      const labelByStatus: Record<string, string> = {
        PENDING: "ร้านนี้กำลังรอตรวจสอบโดยทีมงาน",
        REJECTED: "ร้านนี้ยังไม่ผ่านการตรวจสอบ",
        SUSPENDED: "ร้านนี้ถูกระงับชั่วคราว",
      };
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-stone-50 px-6 text-center">
          <div className="rounded-full bg-amber-100 p-4 text-3xl">⏳</div>
          <h1 className="text-2xl font-bold text-stone-900">{store.name}</h1>
          <p className="max-w-md text-sm text-stone-600">
            {labelByStatus[store.approvalStatus] ?? "ร้านนี้ยังไม่เปิดให้ดูสาธารณะ"}
            <br />
            กรุณากลับมาใหม่อีกครั้งหลังจากร้านได้รับการอนุมัติ
          </p>
          <Link
            href="/"
            className="rounded-md border bg-white px-4 py-2 text-sm hover:bg-stone-50"
          >
            ← กลับหน้าหลัก
          </Link>
        </div>
      );
    }
  }

  // 🟢 โค้ดใหม่ที่ปรับปรุงแล้ว
  const blocksData = store.landingBlocks as any;

  // 1. ตรวจสอบว่าเป็นเว็บที่ใช้ AI Multi-page หรือไม่
  // (ถ้าระบบ v12Schema เช็คไม่เจอ ให้เช็คสำรองจากโครงสร้าง globalHeader และ pages ที่เราเจนมา)
  const isAiMultiPage =
    blocksData &&
    typeof blocksData === "object" &&
    (isV12Schema(blocksData) ||
      (blocksData.globalHeader && Array.isArray(blocksData.pages)) ||
      blocksData.type === "block_registry_v1");

  // 2. ถ้าเป็น HTML เดิม ให้ Return {children} แบบเพียวๆ ทันที (HtmlRenderer จัดการ header/footer ให้แล้ว)
  if (blocksData && isHtmlSchema(blocksData)) {
    return <>{children}</>;
  }

  // Chrome theme — single source of truth (skin class + CSS vars + accent +
  // button shape). resolveStoreTheme().chrome reproduces the previous
  // per-family cascade EXACTLY (raw templateId; precedence FB → trust →
  // business-model → lifestyle → electronics-tech → specialty → packaging →
  // taobao → community; FB wins ties). NOTE: this is the CHROME ladder — it
  // intentionally has no pet-house/case-studio singletons and no `everyday`
  // (those only affect the CONTENT theme in page.tsx). See
  // lib/storefront/resolve-store-theme.ts.
  const { familyClass, familyVars, familyAccent, familyButtonShape } =
    resolveStoreTheme(store).chrome;

  // 2b. React templates — every variant (caselnw-v1, mini-mops-v1, …)
  //     uses the same ShopHeader/ShopFooter pair. Visual personality
  //     comes from a token preset keyed off the template id (accent,
  //     decoration glyph, announcement bar, button shape) plus an
  //     optional `theme-<name>` body skin in globals.css. Every
  //     sub-page (cart / product / category / …) inherits the same
  //     chrome and tokens as the landing.
  if (blocksData && isReactTemplateSchema(blocksData)) {
    const categoryRows = await prisma.product.findMany({
      where: { storeId: store.id, active: true, categoryName: { not: null } },
      select: { categoryName: true },
      distinct: ["categoryName"],
      orderBy: { categoryName: "asc" },
      take: 12,
    });
    const categories = categoryRows
      .map((r) => r.categoryName)
      .filter((c): c is string => !!c);

    const { tokens, themeClass } = resolveChromeTokens({
      templateId: blocksData.template,
      primaryColor: store.primaryColor,
      override: blocksData.accentHex
        ? { accent: blocksData.accentHex }
        : undefined,
    });

    return (
      <div
        className={`shop-page min-h-screen flex flex-col${themeClass ? ` ${themeClass}` : ""}${familyClass ? ` ${familyClass}` : ""}`}
        style={{ ...tokensToCssVars(tokens), ...familyVars, ...lcColorVars }}
      >
        <ShopHeader
          storeSlug={store.slug}
          storeName={store.name}
          storeLogoUrl={store.logoUrl}
          categories={categories}
          accent={familyAccent ?? tokens.accent}
          decorationGlyph={tokens.decorationGlyph}
          glyphStyle={tokens.glyphStyle}
          announcement={lcAnnouncement ?? tokens.announcement}
          buttonShape={familyButtonShape ?? tokens.buttonShape}
        />
        <main className="flex-1">{children}</main>
        <ShopFooter
          store={store}
          categories={categories}
          accent={familyAccent ?? tokens.accent}
          decorationGlyph={tokens.decorationGlyph}
          glyphStyle={tokens.glyphStyle}
        />
      </div>
    );
  }

  // 3. AI Multi-page schema → ShopHeader/Footer with the resolved
  //    design family's preset (Phase 2). Each family A-I maps to its
  //    own token set (accent + glyph + button shape + theme-X body
  //    skin). Sub-pages (cart / category / product / wishlist) all
  //    inherit the same chrome and tokens as the landing.
  if (isAiMultiPage) {
    const family = resolveFamily(blocksData.designFamily || store.landingThemeVariant);
    const familyCode = (blocksData.designFamily || "A") as string;
    const fontClass = family?.fontClass ?? "font-sans";

    const categoryRows = await prisma.product.findMany({
      where: { storeId: store.id, active: true, categoryName: { not: null } },
      select: { categoryName: true },
      distinct: ["categoryName"],
      orderBy: { categoryName: "asc" },
      take: 12,
    });
    const dbCategories = categoryRows
      .map((r) => r.categoryName)
      .filter((c): c is string => !!c);

    // Prefer the AI-curated nav as category labels (operator-tuned
    // ordering); fall back to product-derived list. Filter out items
    // that look like full-page nav (about / contact) so they don't
    // pollute the category chip strip.
    const aiNav = (blocksData.globalHeader?.nav as Array<{
      text: string;
      href?: string;
    }> | undefined) ?? [];
    const navCategories =
      aiNav.length > 0
        ? aiNav
            .map((n) => n.text)
            .filter(
              (t): t is string =>
                !!t && !/about|contact|home|หน้าแรก|เกี่ยวกับ|ติดต่อ/i.test(t),
            )
        : dbCategories;

    const preset = family
      ? presetForFamily(familyCode, family)
      : { tokens: undefined, themeClass: undefined };
    const { tokens, themeClass } = resolveChromeTokens({
      templateId: undefined,
      primaryColor: family?.themeColor ?? store.primaryColor,
      override: preset.tokens,
    });
    // Family E retains its theme-cyber back-compat alias.
    const themeClassFinal = `${themeClass ? `${themeClass} ` : ""}${familyCode === "E" ? "theme-cyber " : ""}theme-${familyCode}`;

    // The AI Multi-page path doesn't consult the registry's
    // `chrome.shellShape` (the schema-driven flow predates per-template
    // chrome adapters), but routing it through StoreShell keeps the
    // markup consistent with the other render paths and means adding
    // an AI-multi-page-specific shape in the future is a one-line
    // change here.
    return (
      <StoreShell
        shape="centered"
        className={`shop-page min-h-screen flex flex-col ${fontClass} ${themeClassFinal} ${familyClass}`.trim()}
        style={{ ...tokensToCssVars(tokens), ...familyVars, ...lcColorVars }}
        strip={null}
        header={
          <ShopHeader
            storeSlug={store.slug}
            storeName={store.name}
            storeLogoUrl={store.logoUrl}
            categories={navCategories}
            accent={familyAccent ?? tokens.accent}
            decorationGlyph={tokens.decorationGlyph}
            glyphStyle={tokens.glyphStyle}
            announcement={lcAnnouncement ?? tokens.announcement}
            buttonShape={familyButtonShape ?? tokens.buttonShape}
          />
        }
        main={children}
        footer={
          <ShopFooter
            store={store}
            categories={navCategories}
            accent={familyAccent ?? tokens.accent}
            decorationGlyph={tokens.decorationGlyph}
            glyphStyle={tokens.glyphStyle}
          />
        }
        floating={
          <>
            <CookiesBar />
            <ShopFloatingButtons primaryColor={familyAccent ?? tokens.accent} />
            <CartDrawer storeSlug={store.slug} />
          </>
        }
      />
    );
  }

  // Primary accent precedence:
  //   1. Design family's themeColor (resolveFamily handles A-I codes
  //      AND legacy "minimal" / "cute" via LEGACY_TO_FAMILY mapping)
  //   2. Operator-set store.primaryColor (manual override)
  //   3. Default brand blue
  // Operator picks a family in the landing-form picker, and we expect
  // the WHOLE storefront (cart / product / contact / category) to
  // cascade to the same accent — not just the agent-rendered home.
  // Legacy values that pre-date the v3 picker still get a real family
  // color so old stores aren't stuck on default blue.
  const effectiveTpl = effectiveTemplateId(store);
  const template = effectiveTpl && effectiveTpl in STORE_TEMPLATES
    ? STORE_TEMPLATES[effectiveTpl as TemplateId]
    : null;

  const family = resolveFamily(store.landingThemeVariant);
  const primary = family?.themeColor ?? store.primaryColor ?? "#0f172a";

  const categoryRows = await prisma.product.findMany({
    where: { storeId: store.id, active: true, categoryName: { not: null } },
    select: { categoryName: true },
    distinct: ["categoryName"],
    orderBy: { categoryName: "asc" },
    take: 12,
  });
  const categories = categoryRows
    .map((r) => r.categoryName)
    .filter((c): c is string => !!c);

  const { tokens, themeClass } = resolveChromeTokens({
    primaryColor: primary,
  });

  const CustomHeader = template?.chrome?.Header;
  const CustomFooter = template?.chrome?.Footer;
  const CustomStrip = template?.chrome?.AnnouncementStrip;
  const accent = familyAccent ?? tokens.accent;
  // Resolved shell shape — registry-defined per template. Absent
  // (or 'centered') keeps the current default markup; other values
  // re-shape the outer skeleton via StoreShell so storefronts feel
  // structurally distinct, not just visually re-skinned.
  const shellShape: ShellShape = template?.chrome?.shellShape ?? "centered";

  return (
    <StoreShell
      shape={shellShape}
      className={`shop-page min-h-screen flex flex-col${themeClass ? ` ${themeClass}` : ""}${familyClass ? ` ${familyClass}` : ""}`}
      style={{ ...tokensToCssVars(tokens), ...familyVars, ...lcColorVars }}
      strip={
        CustomStrip ? (
          <CustomStrip
            storeName={store.name}
            message={lcAnnouncement?.message ?? tokens.announcement?.message}
            mobileMessage={
              lcAnnouncement?.mobileMessage ?? tokens.announcement?.mobileMessage
            }
          />
        ) : null
      }
      header={
        CustomHeader ? (
          <CustomHeader
            storeSlug={store.slug}
            storeName={store.name}
            storeLogoUrl={store.logoUrl}
            categories={categories}
            accent={accent}
          />
        ) : (
          <ShopHeader
            storeSlug={store.slug}
            storeName={store.name}
            storeLogoUrl={store.logoUrl}
            categories={categories}
            accent={accent}
            decorationGlyph={tokens.decorationGlyph}
            glyphStyle={tokens.glyphStyle}
            announcement={lcAnnouncement ?? tokens.announcement}
            buttonShape={familyButtonShape ?? tokens.buttonShape}
          />
        )
      }
      main={children}
      footer={
        CustomFooter ? (
          <CustomFooter
            store={store}
            categories={categories}
            accent={accent}
            availableSupportPages={availableSupportPages}
          />
        ) : (
          <ShopFooter
            store={store}
            categories={categories}
            accent={accent}
            decorationGlyph={tokens.decorationGlyph}
            glyphStyle={tokens.glyphStyle}
          />
        )
      }
      floating={
        <>
          <CookiesBar />
          <ShopFloatingButtons primaryColor={accent} />
          <CartDrawer storeSlug={store.slug} />
        </>
      }
    />
  );
}
