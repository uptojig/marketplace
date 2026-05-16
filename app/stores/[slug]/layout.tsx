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
import { resolveFamily } from "@/lib/landing/families";
import {
  FASHION_BEAUTY_BODY_CLASS,
  fashionBeautyCssVars,
  isFashionBeautyStore,
} from "@/lib/landing/fashion-beauty";
import {
  TRUST_BODY_CLASS,
  TRUST_TOKENS,
  trustCssVars,
  isTrustStore,
} from "@/lib/landing/trust";
import {
  BUSINESS_MODEL_BODY_CLASS,
  BUSINESS_MODEL_TOKENS,
  businessModelCssVars,
  isBusinessModelStore,
} from "@/lib/landing/business-model";
import {
  LIFESTYLE_BODY_CLASS,
  LIFESTYLE_TOKENS,
  lifestyleCssVars,
  isLifestyleStore,
} from "@/lib/landing/lifestyle";
import {
  PACKAGING_BODY_CLASS,
  packagingCssVars,
  isPackagingStore,
} from "@/lib/landing/packaging";
import {
  ELECTRONICS_TECH_BODY_CLASS,
  ELECTRONICS_TECH_TOKENS,
  electronicsTechCssVars,
  isElectronicsTechStore,
} from "@/lib/landing/electronics-tech";
import {
  SPECIALTY_BODY_CLASS,
  specialtyCssVars,
  isSpecialtyStore,
} from "@/lib/landing/specialty";
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

export const dynamic = "force-dynamic";

export default async function ShopLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const store = await prisma.store.findUnique({ where: { slug: params.slug } });
  if (!store) notFound();

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

  // Fashion-beauty pilot — single source of truth for the "is this
  // store in the fashion-beauty family?" check. Consulted by every
  // render path below to (a) add the .theme-fashion-beauty class and
  // (b) merge the family's CSS-var palette over the per-page tokens.
  // Detection looks at both Prisma `templateId` (registry-driven
  // stores) and `landingThemeVariant` (operator-picked or AI-multi-
  // page "B" code). See lib/landing/fashion-beauty.ts for the matrix.
  const isFB = isFashionBeautyStore({
    templateId: store.templateId,
    landingThemeVariant: store.landingThemeVariant,
  });
  const fbVars = isFB ? fashionBeautyCssVars() : {};
  const fbClass = isFB ? FASHION_BEAUTY_BODY_CLASS : "";

  // Trust family (DESIGN-B sibling). Stacked alongside FB so we never
  // break the FB cascade: if both somehow matched, FB wins because its
  // vars merge in last. In practice the template→group lookup is
  // disjoint (a store can only be in one TemplateGroup) so this is
  // belt-and-braces. Reads from lib/landing/trust.ts — same shape as
  // the fashion-beauty module.
  const isTrust = !isFB && isTrustStore({
    templateId: store.templateId,
    landingThemeVariant: store.landingThemeVariant,
  });
  const trustVars = isTrust ? trustCssVars() : {};
  const trustClass = isTrust ? TRUST_BODY_CLASS : "";

  // Business-model family (DESIGN-B sibling). Targets the deal /
  // wholesale templates (wholesale-b2b, flash-deal, subscription).
  // Stacked alongside FB + trust so we never break their cascades:
  // FB and trust are checked first; this only activates when neither
  // matched. The detection set is disjoint by template group so a
  // single store can only ever land in one family. Reads from
  // lib/landing/business-model.ts — same shape as the trust module.
  const isBusinessModel = !isFB && !isTrust && isBusinessModelStore({
    templateId: store.templateId,
    landingThemeVariant: store.landingThemeVariant,
  });
  const bmVars = isBusinessModel ? businessModelCssVars() : {};
  const bmClass = isBusinessModel ? BUSINESS_MODEL_BODY_CLASS : "";

  // Lifestyle family (warm catalog / outdoorsy). Stacked AFTER trust
  // and business-model in the chain — template→group is disjoint in
  // practice so this is belt-and-braces. Reads from
  // lib/landing/lifestyle.ts.
  const isLifestyle = !isFB && !isTrust && !isBusinessModel && isLifestyleStore({
    templateId: store.templateId,
    landingThemeVariant: store.landingThemeVariant,
  });
  const lifestyleVars = isLifestyle ? lifestyleCssVars() : {};
  const lifestyleClass = isLifestyle ? LIFESTYLE_BODY_CLASS : "";

  // Electronics-tech family (DESIGN-B sibling). Stacked after the four
  // earlier families so the dispatcher is a strict precedence ladder.
  // In practice the template→group lookup is disjoint (a store can
  // only be in one TemplateGroup) so this is belt-and-braces. Reads
  // from lib/landing/electronics-tech.ts.
  const isElectronicsTech = !isFB && !isTrust && !isBusinessModel && !isLifestyle && isElectronicsTechStore({
    templateId: store.templateId,
    landingThemeVariant: store.landingThemeVariant,
  });
  const etVars = isElectronicsTech ? electronicsTechCssVars() : {};
  const etClass = isElectronicsTech ? ELECTRONICS_TECH_BODY_CLASS : "";

  // Specialty family (artisan / vintage) — DESIGN-B sibling stacked
  // LAST in the dispatcher chain so the precedence ladder is
  // FB → trust → business-model → lifestyle → electronics-tech →
  // specialty. A store can only end up in one family (the template→
  // group lookup is disjoint); these guards are belt-and-braces. Same
  // wiring pattern: detect via templateId or landingThemeVariant,
  // merge CSS vars and add the .theme-specialty class so the kraft +
  // ochre + slab-serif palette cascades to every sub-page.
  const isSpecialty =
    !isFB && !isTrust && !isBusinessModel && !isLifestyle && !isElectronicsTech &&
    isSpecialtyStore({
      templateId: store.templateId,
      landingThemeVariant: store.landingThemeVariant,
    });
  const specialtyVars = isSpecialty ? specialtyCssVars() : {};
  const specialtyClass = isSpecialty ? SPECIALTY_BODY_CLASS : "";

  // Packaging family — vibrant coral + sunshine yellow palette. Same
  // priority order as specialty (last in chain).
  const isPackaging =
    !isFB && !isTrust && !isBusinessModel && !isLifestyle &&
    !isElectronicsTech && !isSpecialty &&
    isPackagingStore({
      templateId: store.templateId,
      landingThemeVariant: store.landingThemeVariant,
    });
  const packagingVars = isPackaging ? packagingCssVars() : {};
  const packagingClass = isPackaging ? PACKAGING_BODY_CLASS : "";

  // Convenience aliases — the layout's three render paths all want
  // "give me the active family's class + vars" without recomputing.
  // FB takes precedence by virtue of being checked first above; trust
  // is next, business-model, lifestyle, electronics-tech, then specialty.
  const familyClass = [fbClass, trustClass, bmClass, lifestyleClass, etClass, specialtyClass, packagingClass]
    .filter(Boolean)
    .join(" ");
  // Merge order matters — earlier checks win because their vars
  // shadow later ones. FB → trust → business-model → lifestyle → ET → specialty → packaging.
  const familyVars = { ...packagingVars, ...specialtyVars, ...etVars, ...lifestyleVars, ...bmVars, ...trustVars, ...fbVars };
  // Active family's accent — used by ShopHeader / ShopFooter to
  // paint chrome links + glyph fills. FB pink, trust gold, business-
  // model amber, lifestyle sage, electronics-tech cyan, specialty ochre.
  // The base primary stays in CTAs via the CSS-var cascade.
  const familyAccent = isFB
    ? "#f43f5e"
    : isTrust
      ? TRUST_TOKENS.colors.accent
      : isBusinessModel
        ? BUSINESS_MODEL_TOKENS.colors.accent
        : isLifestyle
          ? LIFESTYLE_TOKENS.colors.accent
          : isElectronicsTech
            ? ELECTRONICS_TECH_TOKENS.colors.accent
            : isSpecialty
              ? "#ca8a04"
              : null;
  // Button shape pinned per-family — FB pills, trust squared,
  // business-model squared, lifestyle pill, electronics-tech squared.
  // Falls through to the per-template default when none apply.
  // Specialty uses its own per-template default (rounded-md is enforced
  // via the .theme-specialty CSS in globals.css).
  const familyButtonShape: "pill" | "square" | null = isFB
    ? "pill"
    : isTrust
      ? "square"
      : isBusinessModel
        ? "square"
        : isLifestyle
          ? "pill"
          : isElectronicsTech
            ? "square"
            : null;

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
        style={{ ...tokensToCssVars(tokens), ...familyVars }}
      >
        <ShopHeader
          storeSlug={store.slug}
          storeName={store.name}
          storeLogoUrl={store.logoUrl}
          categories={categories}
          accent={familyAccent ?? tokens.accent}
          decorationGlyph={tokens.decorationGlyph}
          glyphStyle={tokens.glyphStyle}
          announcement={tokens.announcement}
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

    return (
      <div
        className={`shop-page min-h-screen flex flex-col ${fontClass} ${themeClassFinal} ${familyClass}`.trim()}
        style={{ ...tokensToCssVars(tokens), ...familyVars }}
      >
        <ShopHeader
          storeSlug={store.slug}
          storeName={store.name}
          storeLogoUrl={store.logoUrl}
          categories={navCategories}
          accent={familyAccent ?? tokens.accent}
          decorationGlyph={tokens.decorationGlyph}
          glyphStyle={tokens.glyphStyle}
          announcement={tokens.announcement}
          buttonShape={familyButtonShape ?? tokens.buttonShape}
        />
        <main className="flex-1">{children}</main>
        <ShopFooter
          store={store}
          categories={navCategories}
          accent={familyAccent ?? tokens.accent}
          decorationGlyph={tokens.decorationGlyph}
          glyphStyle={tokens.glyphStyle}
        />
        <CookiesBar />
        <ShopFloatingButtons primaryColor={familyAccent ?? tokens.accent} />
      </div>
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

  return (
    <div
      className={`shop-page min-h-screen flex flex-col${themeClass ? ` ${themeClass}` : ""}${familyClass ? ` ${familyClass}` : ""}`}
      style={{ ...tokensToCssVars(tokens), ...familyVars }}
    >
      <ShopHeader
        storeSlug={store.slug}
        storeName={store.name}
        storeLogoUrl={store.logoUrl}
        categories={categories}
        accent={familyAccent ?? tokens.accent}
        decorationGlyph={tokens.decorationGlyph}
        glyphStyle={tokens.glyphStyle}
        announcement={tokens.announcement}
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
      <CookiesBar />
      <ShopFloatingButtons primaryColor={familyAccent ?? tokens.accent} />
    </div>
  );
}
