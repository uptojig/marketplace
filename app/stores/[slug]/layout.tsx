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
import {
  Search,
  ShoppingCart,
  User,
  ChevronDown,
  Menu,
} from "lucide-react";
import { ShopCartIndicator } from "@/components/shop/ShopCartIndicator";
import { ShopFloatingButtons } from "@/components/shop/ShopFloatingButtons";
import { CookiesBar } from "@/components/shop/CookiesBar";
import {
  StoreSocialIcons,
  StoreContactRows,
} from "@/components/shop/StoreSocialIcons";
import { formatStoreAddressLines } from "@/lib/format/storeAddress";
import { resolveFamily } from "@/lib/landing/families";
import { isV12Schema } from "@/lib/multi-page-migration";
import { isHtmlSchema } from "@/components/storefront/HtmlRenderer";
import { isReactTemplateSchema } from "@/components/storefront/templates/registry";
import { CaselNwHeader } from "@/components/storefront/templates/caselnw/Header";
import { CaselNwFooter } from "@/components/storefront/templates/caselnw/Footer";
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
          className="shop-page min-h-screen flex flex-col bg-white text-slate-900"
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
    // Other React templates (e.g. mini-mops-v1) self-render their chrome.
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
  const primary = family?.themeColor ?? store.primaryColor ?? "#008BF8";
  const logoPosition: "left" | "center" =
    store.logoPosition === "center" ? "center" : "left";
  const menuPosition: "left" | "center" | "right" =
    store.menuPosition === "left"
      ? "left"
      : store.menuPosition === "center"
        ? "center"
        : "right";

  const categoryRows = await prisma.product.findMany({
    where: { storeId: store.id, active: true, categoryName: { not: null } },
    select: { categoryName: true },
    distinct: ["categoryName"],
    orderBy: { categoryName: "asc" },
    take: 50,
  });
  const categories = categoryRows
    .map((r) => r.categoryName)
    .filter((c): c is string => !!c);

  return (
    <div
      className="shop-page min-h-screen"
      style={{
        ["--shop-primary" as string]: primary,
        ["--shop-bg" as string]: "#f5f6f8",
        ["--shop-card" as string]: "#ffffff",
      } as React.CSSProperties}
    >
      {/* Top header */}
      <header className="border-b" style={{ background: 'var(--shop-card)' }}>
        {/* Top bar — logo, search, lang, account, cart */}
        <div className="hidden lg:block" style={{ borderBottom: '1px solid var(--shop-border)' }}>
          <div className="container mx-auto max-w-[1200px] px-4 py-4">
            <div
              className={
                logoPosition === "center"
                  ? "grid items-center gap-4"
                  : "flex items-center justify-between gap-4"
              }
              style={
                logoPosition === "center"
                  ? { gridTemplateColumns: "1fr auto 1fr" }
                  : undefined
              }
            >
              {logoPosition === "center" && <div />}
              <Link
                href={`/stores/${store.slug}`}
                className={`flex items-center gap-3 ${
                  logoPosition === "center" ? "justify-center" : ""
                }`}
              >
                {store.logoUrl ? (
                  // Horizontal lockup. h-12 + w-auto + max-w lets
                  // wordmark logos render at their natural aspect
                  // without the old square crop. The store name
                  // text is hidden when a logo is present — the
                  // logo IS the brand identity, repeating the name
                  // beside it just clutters the toolbar.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={store.logoUrl}
                    alt={store.name}
                    className="h-12 w-auto max-w-[260px] object-contain"
                  />
                ) : (
                  <>
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded text-lg font-bold text-white"
                      style={{ backgroundColor: primary }}
                    >
                      {store.name.slice(0, 1).toUpperCase()}
                    </div>
                    <h1 className="text-xl font-semibold leading-tight">
                      {store.name}
                    </h1>
                  </>
                )}
              </Link>

              <div className="flex items-center gap-3">
                <form
                  action={`/stores/${store.slug}`}
                  className="flex items-center rounded-full pl-4 pr-1 py-1 w-72"
                  style={{ border: '1px solid var(--shop-border)', background: 'var(--shop-card)' }}
                >
                  <input
                    name="q"
                    placeholder="ค้นหา"
                    className="flex-1 bg-transparent text-sm focus:outline-none"
                  />
                  <button type="submit" aria-label="Search" className="p-2 text-gray-500 hover:text-gray-700">
                    <Search className="h-4 w-4" />
                  </button>
                </form>

                <button
                  type="button"
                  className="flex items-center gap-1 rounded p-1 hover:bg-gray-50"
                  aria-label="Languages"
                >
                  <span className="inline-block h-4 w-6 rounded-sm overflow-hidden">
                    <span className="block h-1/3 bg-red-600" />
                    <span className="block h-1/3 bg-white" />
                    <span className="block h-1/3 bg-blue-700" />
                  </span>
                </button>

                <Link
                  href="/signin"
                  aria-label="Account"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 text-xs font-semibold text-white"
                >
                  <User className="h-4 w-4" />
                </Link>

                <Link href={`/stores/${store.slug}/cart`} aria-label="Cart" className="relative p-2">
                  <ShoppingCart className="h-5 w-5" />
                  <ShopCartIndicator storeSlug={store.slug} />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Menu bar — categories + nav */}
        <div className="hidden lg:block">
          <div className="container mx-auto max-w-[1200px] px-4">
            <div
              className={
                menuPosition === "center"
                  ? "grid items-center gap-4"
                  : menuPosition === "left"
                    ? "flex items-center justify-start gap-4"
                    : "flex items-center justify-between gap-4"
              }
              style={
                menuPosition === "center"
                  ? { gridTemplateColumns: "auto 1fr auto" }
                  : undefined
              }
            >
              <div className="group relative">
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white"
                  style={{ backgroundColor: primary }}
                >
                  <Menu className="h-4 w-4" />
                  หมวดหมู่สินค้า
                  <ChevronDown className="h-3 w-3" />
                </button>
                <div className="absolute left-0 top-full z-30 hidden min-w-[260px] rounded-md border bg-white shadow-lg group-hover:block">
                  {categories.length === 0 ? (
                    <div className="px-4 py-3 text-xs text-gray-500">
                      ยังไม่มีหมวดหมู่ — import สินค้าก่อน
                    </div>
                  ) : (
                    <div className="max-h-[400px] overflow-y-auto py-1">
                      <Link
                        href={`/stores/${store.slug}`}
                        className="block px-4 py-2 text-sm font-medium hover:bg-gray-50"
                      >
                        ทั้งหมด
                      </Link>
                      {categories.map((cat) => (
                        <Link
                          key={cat}
                          href={`/stores/${store.slug}/category/${encodeURIComponent(cat)}`}
                          className="block px-4 py-2 text-sm hover:bg-gray-50"
                        >
                          {cat}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <nav
                className={`flex items-center gap-1 ${
                  menuPosition === "center" ? "justify-self-center" : ""
                }`}
              >
                <div className="group relative">
                  <button className="flex items-center gap-1 px-4 py-3 text-sm font-medium hover:text-[var(--shop-primary)]">
                    เกี่ยวกับร้าน <ChevronDown className="h-3 w-3" />
                  </button>
                  <div className="absolute right-0 top-full z-30 hidden min-w-[200px] rounded-md border bg-white shadow-lg group-hover:block">
                    <Link href={`/stores/${store.slug}`} className="block px-4 py-2 text-sm hover:bg-gray-50">
                      รายละเอียดร้าน
                    </Link>
                    <Link href={`/stores/${store.slug}/help/faq`} className="block px-4 py-2 text-sm hover:bg-gray-50">
                      คำถามที่พบบ่อย
                    </Link>
                    <Link href={`/stores/${store.slug}/help/order-guide`} className="block px-4 py-2 text-sm hover:bg-gray-50">
                      วิธีการสั่งซื้อ
                    </Link>
                    <Link href={`/stores/${store.slug}/help/privacy`} className="block px-4 py-2 text-sm hover:bg-gray-50">
                      นโยบายความเป็นส่วนตัว
                    </Link>
                    <Link href={`/stores/${store.slug}/help/terms`} className="block px-4 py-2 text-sm hover:bg-gray-50">
                      ข้อกำหนดการใช้งาน
                    </Link>
                  </div>
                </div>
                <Link href="/orders" className="px-4 py-3 text-sm font-medium hover:text-[var(--shop-primary)]">
                  การสั่งซื้อของฉัน
                </Link>
                <Link href={`/stores/${store.slug}/contact`} className="px-4 py-3 text-sm font-medium hover:text-[var(--shop-primary)]">
                  ติดต่อร้านค้า
                </Link>
              </nav>
              {menuPosition === "center" && <div />}
            </div>
          </div>
        </div>

        {/* Mobile compact header */}
        <div className="lg:hidden flex items-center justify-between gap-2 px-4 py-3">
          <button aria-label="Menu" className="p-1">
            <Menu className="h-5 w-5" />
          </button>
          <Link
            href={`/stores/${store.slug}`}
            className="flex-1 flex items-center justify-center"
          >
            {store.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={store.logoUrl}
                alt={store.name}
                className="h-8 w-auto max-w-[180px] object-contain"
              />
            ) : (
              <span className="text-base font-semibold truncate">
                {store.name}
              </span>
            )}
          </Link>
          <Link href={`/stores/${store.slug}/cart`} aria-label="Cart" className="relative p-1">
            <ShoppingCart className="h-5 w-5" />
            <ShopCartIndicator />
          </Link>
        </div>
      </header>

      <main>{children}</main>

      {/* Footer service section */}
      <footer className="mt-12 border-t" style={{ background: 'var(--shop-card)' }}>
        <div className="container mx-auto max-w-[1200px] px-4 py-8">
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h3 className="mb-3 font-semibold">ตัวเลือกการจัดส่ง</h3>
              <div className="flex flex-wrap gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/icons/shipping/thailand-post.svg"
                  alt="ไปรษณีย์ไทย"
                  title="ไปรษณีย์ไทย"
                  className="h-14 w-14 rounded border bg-white p-1"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/icons/shipping/flash-express.svg"
                  alt="Flash Express"
                  title="Flash Express"
                  className="h-14 w-14 rounded border bg-white p-1"
                />
              </div>
            </div>
            <div>
              <h3 className="mb-3 font-semibold">ตัวเลือกการชำระเงิน</h3>
              <div className="flex flex-wrap gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/icons/payment/scb.svg"
                  alt="SCB"
                  title="โอนผ่าน SCB"
                  className="h-14 w-14 rounded border bg-white p-1"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/icons/payment/other.svg"
                  alt="Other payments"
                  title="ช่องทางอื่น"
                  className="h-14 w-14 rounded border bg-white p-1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer info — 5 columns */}
        <div className="border-t" style={{ background: 'var(--shop-card)' }}>
          <div className="container mx-auto max-w-[1200px] px-4 py-10">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
              <div>
                <div className="mb-3 flex items-center gap-2">
                  {store.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={store.logoUrl}
                      alt={store.name}
                      className="h-9 w-9 rounded object-cover"
                    />
                  ) : (
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded text-sm font-bold text-white"
                      style={{ backgroundColor: primary }}
                    >
                      {store.name.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <h3 className="font-semibold">{store.name}</h3>
                </div>
                {store.tagline && (
                  <p className="text-sm text-gray-600">{store.tagline}</p>
                )}
              </div>
              <div>
                <h3 className="mb-3 font-semibold">ลูกค้าสัมพันธ์</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li><Link href={`/stores/${store.slug}/help/membership`} className="hover:text-gray-900">การสมัครสมาชิก</Link></li>
                  <li><Link href={`/stores/${store.slug}/help/payment`} className="hover:text-gray-900">วิธีการชำระเงิน</Link></li>
                  <li><Link href={`/stores/${store.slug}/help/tax-invoice`} className="hover:text-gray-900">วิธีการขอใบกำกับภาษี</Link></li>
                  <li><Link href={`/stores/${store.slug}/help/claim`} className="hover:text-gray-900">วิธีการเคลมสินค้า</Link></li>
                  <li><Link href={`/stores/${store.slug}/help/warranty`} className="hover:text-gray-900">การประกันสินค้า</Link></li>
                  <li><Link href={`/stores/${store.slug}/help/faq`} className="hover:text-gray-900">คำถามที่พบบ่อย (FAQs)</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="mb-3 font-semibold">รู้จักเรา</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li><Link href={`/stores/${store.slug}`} className="hover:text-gray-900">รายละเอียดร้าน</Link></li>
                  <li><Link href={`/stores/${store.slug}/help/order-guide`} className="hover:text-gray-900">วิธีการสั่งซื้อ</Link></li>
                  <li><Link href="/orders" className="hover:text-gray-900">การสั่งซื้อของฉัน</Link></li>
                  <li><Link href={`/stores/${store.slug}/help/privacy`} className="hover:text-gray-900">นโยบายความเป็นส่วนตัว</Link></li>
                  <li><Link href={`/stores/${store.slug}/help/terms`} className="hover:text-gray-900">ข้อกำหนดการใช้งาน</Link></li>
                  <li><Link href={`/stores/${store.slug}/help/refund`} className="hover:text-gray-900">นโยบายการคืนเงิน</Link></li>
                  <li><Link href={`/stores/${store.slug}/help/shipping`} className="hover:text-gray-900">นโยบายการจัดส่ง</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="mb-3 font-semibold">ที่อยู่ร้านค้า</h3>
                {(() => {
                  const lines = formatStoreAddressLines(store);
                  if (lines.length === 0) {
                    return (
                      <p className="text-sm text-gray-500">
                        {store.name}
                        <br />
                        Thailand
                      </p>
                    );
                  }
                  return (
                    <div className="space-y-1 text-sm text-gray-600">
                      {lines.map((l, i) => (
                        <p key={i}>{l}</p>
                      ))}
                    </div>
                  );
                })()}
                <div className="mt-3">
                  <StoreContactRows store={store} />
                </div>
              </div>
              <div>
                <h3 className="mb-3 font-semibold">ติดต่อเรา</h3>
                <StoreSocialIcons
                  store={store}
                  emptyText="ยังไม่ได้ตั้งค่า — เพิ่มได้ที่ /admin/stores"
                />
              </div>
            </div>
          </div>
        </div>
      </footer>

      <CookiesBar />
      <ShopFloatingButtons primaryColor={primary} />
    </div>
  );
}
