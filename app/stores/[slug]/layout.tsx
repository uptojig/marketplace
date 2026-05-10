import { notFound } from "next/navigation";
import Link from "next/link";
import { waitUntil } from "@vercel/functions";
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
import { isV12Schema } from "@/lib/multi-page-migration";
import { isHtmlSchema } from "@/components/storefront/HtmlRenderer";
import { isReactTemplateSchema } from "@/components/storefront/templates/registry";
import { CaselNwHeader } from "@/components/storefront/templates/caselnw/Header";
import { CaselNwFooter } from "@/components/storefront/templates/caselnw/Footer";
import { MiniMopsHeader } from "@/components/storefront/templates/mini-mops/Header";
import { MiniMopsFooter } from "@/components/storefront/templates/mini-mops/Footer";
import { ShopHeader } from "@/components/storefront/chrome/ShopHeader";
import { ShopFooter } from "@/components/storefront/chrome/ShopFooter";
import {
  resolveChromeTokens,
  tokensToCssVars,
} from "@/components/storefront/chrome/tokens";
import { GlobalHeader } from "@/components/storefront/GlobalHeader";
import { GlobalFooter } from "@/components/storefront/GlobalFooter";
import { safeHeader, safeFooter } from "@/components/storefront/MultiPageRenderer";

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

  // 2b. React templates — chrome is per-template so every sub-page (cart,
  //     product, category, …) renders with the same look as the landing.
  if (blocksData && isReactTemplateSchema(blocksData)) {
    if (blocksData.template === "caselnw-v1") {
      const categoryRows = await prisma.product.findMany({
        where: { storeId: store.id, active: true, categoryName: { not: null } },
        select: { categoryName: true },
        distinct: ["categoryName"],
        orderBy: { categoryName: "asc" },
        take: 8,
      });
      const navCategories = categoryRows
        .map((r) => r.categoryName)
        .filter((c): c is string => !!c)
        .map((c) => ({ label: c, category: c }));
      const accent = blocksData.accentHex ?? "#f97316";
      return (
        <div
          className="shop-page theme-caselnw min-h-screen flex flex-col bg-white text-slate-900"
          style={
            {
              ["--shop-primary" as string]: accent,
              ["--shop-accent" as string]: accent,
              ["--shop-bg" as string]: "#f8fafc",
              ["--shop-card" as string]: "#ffffff",
              ["--shop-ink" as string]: "#0f172a",
              ["--shop-ink-muted" as string]:
                "color-mix(in srgb, #0f172a 60%, transparent)",
              ["--shop-border" as string]:
                "color-mix(in srgb, #0f172a 12%, transparent)",
            } as React.CSSProperties
          }
        >
          <CaselNwHeader
            storeSlug={store.slug}
            storeName={store.name}
            navCategories={navCategories}
            accent={accent}
          />
          <main className="flex-1">{children}</main>
          <CaselNwFooter
            storeSlug={store.slug}
            storeName={store.name}
            storeDescription={store.description}
            navCategories={navCategories}
            accent={accent}
          />
        </div>
      );
    }
    if (blocksData.template === "mini-mops-v1") {
      const categoryRows = await prisma.product.findMany({
        where: { storeId: store.id, active: true, categoryName: { not: null } },
        select: { categoryName: true },
        distinct: ["categoryName"],
        orderBy: { categoryName: "asc" },
        take: 8,
      });
      const navCategories = categoryRows
        .map((r) => r.categoryName)
        .filter((c): c is string => !!c)
        .map((c) => ({ label: c, category: c }));
      const accent = blocksData.accentHex ?? "#10b981";
      return (
        <div
          className="shop-page theme-mini-mops min-h-screen flex flex-col bg-gray-50 text-gray-800"
          style={
            {
              ["--shop-primary" as string]: accent,
              ["--shop-accent" as string]: accent,
              ["--shop-bg" as string]: "#f9fafb",
              ["--shop-card" as string]: "#ffffff",
              ["--shop-ink" as string]: "#1f2937",
              ["--shop-ink-muted" as string]:
                "color-mix(in srgb, #1f2937 60%, transparent)",
              ["--shop-border" as string]:
                "color-mix(in srgb, #1f2937 12%, transparent)",
            } as React.CSSProperties
          }
        >
          <MiniMopsHeader
            storeSlug={store.slug}
            storeName={store.name}
            navCategories={navCategories}
            accent={accent}
          />
          <main className="flex-1">{children}</main>
          <MiniMopsFooter
            storeSlug={store.slug}
            storeName={store.name}
            storeDescription={store.description}
            navCategories={navCategories}
            accent={accent}
          />
        </div>
      );
    }
    // Unknown React template — render bare children as a safe fallback.
    return <>{children}</>;
  }

  // 3. ถ้าเป็น AI Multi-page ให้ครอบด้วย GlobalHeader และ GlobalFooter สำหรับทุกหน้าในร้าน!
  if (isAiMultiPage) {
    // Pass store.logoUrl as override — agent emits a placehold.co
    // URL by default; once the operator uploads a real logo via
    // /admin/stores/<id>, that takes precedence on every page.
    const header = safeHeader(
      blocksData.globalHeader,
      store.slug,
      store.name,
      store.logoUrl,
    );
    const footer = safeFooter(blocksData.globalFooter, store.name, store.logoUrl);
    const family = resolveFamily(blocksData.designFamily || store.landingThemeVariant);
    const primary = family?.themeColor ?? store.primaryColor ?? "#008BF8";
    const theme = (blocksData.designFamily || "A") as any;
    const bgHex = family?.bgHex ?? (theme === "cute" || theme === "I" ? "#fdf2f8" : "#faf7f2");
    const textHex = family?.textHex ?? "#1a1a2e";
    const cardHex = family?.cardHex ?? "#ffffff";
    // Family E exposes a second accent (cyan) for the cyberpunk
    // purple→cyan gradients. Other families fall back to mixing the
    // primary, so existing themes look unchanged.
    const accentHex =
      (family as { accentHex?: string } | undefined)?.accentHex ?? primary;

    const fontClass = family?.fontClass ?? "font-sans";

    // theme-* class flags expose family-specific styling (typography,
    // button shape, glows, gradients) to the storefront CSS layer
    // without touching every block component. We always emit a
    // `theme-{LETTER}` class for the design family A-I; Family E
    // additionally gets `theme-cyber` as a back-compat alias since
    // older CSS targets that name. Per-family rules live in
    // app/globals.css under "Family-aware design system".
    const themeClass = `theme-${theme}${theme === "E" ? " theme-cyber" : ""}`;

    return (
      <div
        className={`shop-page min-h-screen flex flex-col ${fontClass} ${themeClass}`.trim()}
        style={{
          ["--shop-primary" as string]: primary,
          ["--shop-accent" as string]: accentHex,
          ["--shop-bg" as string]: bgHex,
          ["--shop-ink" as string]: textHex,
          ["--shop-ink-muted" as string]: "color-mix(in srgb, var(--shop-ink) 60%, transparent)",
          ["--shop-card" as string]: cardHex,
          ["--shop-border" as string]: "color-mix(in srgb, var(--shop-ink) 15%, transparent)",
        } as React.CSSProperties}
      >
        <GlobalHeader content={header} theme={theme} storeSlug={store.slug} />
        <main className="flex-1">{children}</main>
        {footer && <GlobalFooter content={footer} theme={theme} storeSlug={store.slug} />}
        <CookiesBar />
        <ShopFloatingButtons primaryColor={primary} />
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

  const tokens = resolveChromeTokens({ primaryColor: primary });

  return (
    <div
      className="shop-page min-h-screen flex flex-col"
      style={tokensToCssVars(tokens)}
    >
      <ShopHeader
        storeSlug={store.slug}
        storeName={store.name}
        storeLogoUrl={store.logoUrl}
        categories={categories}
        accent={tokens.accent}
      />
      <main className="flex-1">{children}</main>
      <ShopFooter store={store} categories={categories} accent={tokens.accent} />
      <CookiesBar />
      <ShopFloatingButtons primaryColor={tokens.accent} />
    </div>
  );
}
