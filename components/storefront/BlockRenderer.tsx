/**
 * Lightweight server-side BlockRenderer for agent-generated landing
 * pages. Renders the block types the PromptPage agent emits, styled
 * with Tailwind matching the agent's two themes (cute / minimal).
 * All CTAs link out to Basketplace's existing flows
 * (`/stores/<slug>/products/<id>`, `/stores/<slug>/cart`) so we
 * reuse the cart + checkout infra Basketplace already has.
 *
 * NOT a 1:1 port of PromptPage's components — those depend on
 * client-side providers (CheckoutModal / ProductDetail / Cart).
 * This renderer is server-rendered HTML with anchor-tag CTAs, which
 * is the right shape for storefronts that own their own checkout.
 *
 * Block types covered (Agent 01 v3 — 21 types):
 *   Branding & Visual:     Logo, Banner, HeroBanner, ImageSlide,
 *                          LogoCloud, CategoryBanner
 *   Product & Commerce:    Nav, ProductHero, OfferGrid, Pricing,
 *                          Gallery, Bundle
 *   Trust & Persuasion:    Stats, Features, Testimonial, Reviews, FAQ
 *   Conversion:            CTA, Countdown, Footer, ContactForm
 * Unknown types render a debug card.
 *
 * Image alt-text contract (Agent 01 v3): every <img> MUST have an
 * `alt` attribute. We pass `altText` from block content through to
 * each rendered <img> — empty alt = decorative.
 */
import Link from "next/link";
import {
  Truck,
  Banknote,
  RotateCcw,
  Flame,
  Mail,
  ShoppingCart,
  Star,
  ChevronRight,
} from "lucide-react";
import type { ThemeVariant } from "@/lib/landing/families";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export type { ThemeVariant };

export type Block = {
  blockType: string;
  content: Record<string, unknown>;
};

interface RenderProps {
  blocks: Block[];
  theme: ThemeVariant;
  storeSlug: string;
}

/* ─── Public API ─────────────────────────────────────── */

export function LandingPage({ blocks, theme, storeSlug }: RenderProps) {
  const bg = isPlayful(theme) ? "bg-pink-50/30" : "bg-[#faf7f2]";
  return (
    <main className={`min-h-screen ${bg}`}>
      {blocks.map((b, i) => (
        <BlockSwitch key={i} block={b} theme={theme} storeSlug={storeSlug} />
      ))}
    </main>
  );
}

function BlockSwitch({
  block,
  theme,
  storeSlug,
}: {
  block: Block;
  theme: ThemeVariant;
  storeSlug: string;
}) {
  // Agent 01 v3 emits `type` (not `blockType`); we accept either to stay
  // backward-compatible with v2 blocks already persisted.
  const blockType =
    block.blockType ?? ((block as Record<string, unknown>).type as string | undefined) ?? "";
  const c = (block.content ?? {}) as Record<string, unknown>;
  switch (blockType) {
    case "Logo":
      return <LogoBlock content={c} theme={theme} storeSlug={storeSlug} />;
    case "Banner":
      return <BannerBlock content={c} theme={theme} />;
    case "HeroBanner":
      return <HeroBanner content={c} theme={theme} storeSlug={storeSlug} />;
    case "ImageSlide":
      return <ImageSlide content={c} theme={theme} />;
    case "LogoCloud":
      return <LogoCloud content={c} theme={theme} />;
    case "Bundle":
      return <BundleBlock content={c} theme={theme} storeSlug={storeSlug} />;
    case "Reviews":
      return <Reviews content={c} theme={theme} />;
    case "CategoryBanner":
      return <CategoryBanner content={c} theme={theme} storeSlug={storeSlug} />;
    case "Nav":
      // Storefront layout already renders the marketplace nav (logo,
      // search, cart, account, language switcher). Agents are
      // instructed to emit a Nav block per their generic v3 spec, but
      // when the page is hosted INSIDE basketplace's /stores/<slug>
      // shell we skip it — otherwise users see two stacked nav bars
      // ("เมนูสองอัน"), one with working cart/search and one with
      // dead anchor links from the agent. The Nav component is kept
      // around for environments where this renderer is used outside
      // the storefront layout (e.g. /p/<slug> standalone pages).
      return null;
    case "ProductHero":
    case "Hero":
      return <ProductHero content={c} theme={theme} storeSlug={storeSlug} />;
    case "Stats":
    case "TipsterStats":
      return <Stats content={c} theme={theme} />;
    case "OfferGrid":
      return <OfferGrid content={c} theme={theme} storeSlug={storeSlug} />;
    case "Features":
      return <Features content={c} theme={theme} />;
    case "Pricing":
      return <Pricing content={c} theme={theme} />;
    case "CTA":
    case "Newsletter":
      return <CTA content={c} theme={theme} />;
    case "Testimonial":
      return <Testimonial content={c} theme={theme} />;
    case "Gallery":
    case "ProviderLogos":
      return <Gallery content={c} theme={theme} />;
    case "FAQ":
      return <FAQ content={c} theme={theme} />;
    case "Countdown":
    case "JackpotCounter":
      return <Countdown content={c} theme={theme} />;
    case "ContactForm":
    case "Contact":
      return <ContactFormBlock content={c} theme={theme} storeSlug={storeSlug} />;
    case "Footer":
      // Same reasoning as the Nav case above — basketplace's
      // storefront layout owns the footer (5-column commerce footer
      // with policies, customer service, payment icons). Agent's
      // Footer block would stack a second one beneath. Skip in this
      // renderer; the standalone /p/<slug> layout that doesn't have
      // a chrome footer would render Footer via a different path.
      return null;
    default:
      return (
        <div className="border-y-2 border-dashed border-amber-300 bg-amber-50 px-6 py-4 text-amber-900">
          <p className="font-mono text-xs uppercase tracking-wider">
            unknown block: {block.blockType}
          </p>
        </div>
      );
  }
}

/* ─── Theme behaviour helpers ─────────────────────────────────────── */

// Some legacy block branches branched on `theme === "cute"` for playful
// styling (rounded, pink-ish accents). With 9 v3 families we treat
// `cute` (legacy) and `I` (Playful Mass Commerce) as the two playful
// variants — every other family follows the "minimal/editorial" branch.
function isPlayful(theme: ThemeVariant): boolean {
  return theme === "cute" || theme === "I";
}

/* ─── Theme tokens — Agent 01 v3 design families (A-I) + legacy ───── */

const T = {
  // A — Editorial Minimal Warm (stone + amber, premium furniture/lifestyle)
  A: {
    accent: "text-amber-700",
    bgAccent: "bg-amber-700",
    bgAccentHover: "hover:bg-amber-800",
    ring: "ring-amber-200",
    softBg: "bg-stone-50",
    headline: "font-medium text-stone-900 tracking-tight",
    cardRadius: "rounded-none",
    btnRadius: "rounded-none",
  },
  // B — Editorial Soft Feminine (rose + serif, Korean fashion/jewelry)
  B: {
    accent: "text-rose-900",
    bgAccent: "bg-rose-700",
    bgAccentHover: "hover:bg-rose-800",
    ring: "ring-rose-200",
    softBg: "bg-rose-50",
    headline: "font-serif text-rose-900",
    cardRadius: "rounded-2xl",
    btnRadius: "rounded-full",
  },
  // C — Luxury Heritage Gold (black + pearl + gold, watches/heritage)
  C: {
    accent: "text-amber-400",
    bgAccent: "bg-amber-400",
    bgAccentHover: "hover:bg-amber-500",
    ring: "ring-amber-300",
    softBg: "bg-stone-900",
    headline: "font-serif font-bold text-amber-50",
    cardRadius: "rounded-none",
    btnRadius: "rounded-none",
  },
  // D — Industrial Masculine (zinc + black, men's leather/automotive)
  D: {
    accent: "text-zinc-100",
    bgAccent: "bg-zinc-900",
    bgAccentHover: "hover:bg-zinc-800",
    ring: "ring-zinc-300",
    softBg: "bg-zinc-100",
    headline: "font-bold uppercase text-zinc-900 tracking-tight",
    cardRadius: "rounded-none",
    btnRadius: "rounded-none",
  },
  // E — Cyberpunk Gaming Neon (purple + green dual neon, gaming/esports)
  E: {
    accent: "text-purple-400",
    bgAccent: "bg-purple-600",
    bgAccentHover: "hover:bg-purple-500",
    ring: "ring-purple-300",
    softBg: "bg-stone-900",
    headline: "font-extrabold text-green-400 tracking-wide",
    cardRadius: "rounded-md",
    btnRadius: "rounded-md",
  },
  // F — Sport Editorial Action (blue + red + yellow, athletic/running)
  F: {
    accent: "text-blue-900",
    bgAccent: "bg-blue-900",
    bgAccentHover: "hover:bg-red-600",
    ring: "ring-blue-200",
    softBg: "bg-blue-50",
    headline: "font-extrabold uppercase text-blue-900 tracking-tight",
    cardRadius: "rounded-md",
    btnRadius: "rounded-md",
  },
  // G — Botanical Lifestyle Premium (green + cream, skincare/wellness)
  G: {
    accent: "text-green-700",
    bgAccent: "bg-green-700",
    bgAccentHover: "hover:bg-green-800",
    ring: "ring-green-200",
    softBg: "bg-stone-50",
    headline: "font-serif font-medium text-green-900",
    cardRadius: "rounded-2xl",
    btnRadius: "rounded-full",
  },
  // H — Cozy Niche Skeumorphism (warm textured amber, coffee/handmade)
  H: {
    accent: "text-amber-800",
    bgAccent: "bg-amber-700",
    bgAccentHover: "hover:bg-amber-800",
    ring: "ring-amber-200",
    softBg: "bg-amber-50",
    headline: "font-bold text-amber-900",
    cardRadius: "rounded-3xl",
    btnRadius: "rounded-full",
  },
  // I — Playful Mass Commerce (pink + yellow + blue, kids/toys/cute)
  I: {
    accent: "text-pink-600",
    bgAccent: "bg-pink-500",
    bgAccentHover: "hover:bg-pink-600",
    ring: "ring-pink-200",
    softBg: "bg-pink-50",
    headline: "font-extrabold text-stone-900",
    cardRadius: "rounded-2xl",
    btnRadius: "rounded-full",
  },
  // Legacy aliases — old data persisted before v3 still renders.
  // "cute" maps to family I (its closest sibling), "minimal" maps to family A.
  cute: {
    accent: "text-pink-600",
    bgAccent: "bg-pink-500",
    bgAccentHover: "hover:bg-pink-600",
    ring: "ring-pink-200",
    softBg: "bg-pink-50",
    headline: "font-extrabold text-stone-900",
    cardRadius: "rounded-2xl",
    btnRadius: "rounded-full",
  },
  minimal: {
    accent: "text-stone-900",
    bgAccent: "bg-stone-900",
    bgAccentHover: "hover:bg-stone-800",
    ring: "ring-stone-200",
    softBg: "bg-[#faf7f2]",
    headline: "font-medium text-stone-900",
    cardRadius: "rounded-none",
    btnRadius: "rounded-none",
  },
} as const;

/* ─── Helpers ─────────────────────────────────────── */

function s(v: unknown): string | undefined {
  return typeof v === "string" && v.length > 0 ? v : undefined;
}
function n(v: unknown): number | undefined {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const f = parseFloat(v);
    return Number.isFinite(f) ? f : undefined;
  }
  return undefined;
}
function arr<T = unknown>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}
function bahtFormat(v: number) {
  return v.toLocaleString("th-TH", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}
function productHref(storeSlug: string, productId: unknown) {
  const id = s(productId);
  return id ? `/stores/${storeSlug}/products/${id}` : `/stores/${storeSlug}`;
}

/* ─── Trust + FOMO strips (inline, no providers) ─────── */

function TrustChips({ content }: { content: Record<string, unknown> }) {
  const items: { icon: typeof Truck; label: string }[] = [];
  if (content.isFreeShipping === true) items.push({ icon: Truck, label: "✨ ส่งฟรีทั่วไทย" });
  if (content.hasCOD === true) items.push({ icon: Banknote, label: "💗 เก็บเงินปลายทาง" });
  const rd = n(content.returnDays);
  if (typeof rd === "number" && rd > 0)
    items.push({ icon: RotateCcw, label: `🎀 คืนได้ใน ${rd} วัน` });
  if (items.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((it, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white/70 px-3 py-1.5 text-xs font-medium text-stone-700 shadow-sm"
        >
          <it.icon className="h-3.5 w-3.5 text-emerald-600" />
          {it.label}
        </span>
      ))}
    </div>
  );
}

function FomoChips({ content }: { content: Record<string, unknown> }) {
  const items: { tone: string; label: string }[] = [];
  const stock = n(content.stockRemaining);
  if (content.showLowStock === true && typeof stock === "number" && stock > 0) {
    const tone =
      stock <= 5
        ? "bg-red-50 text-red-700 ring-red-200"
        : stock <= 15
          ? "bg-orange-50 text-orange-700 ring-orange-200"
          : "bg-amber-50 text-amber-800 ring-amber-200";
    items.push({ tone, label: `⚡ เหลือเพียง ${stock} ชิ้น` });
  }
  if (content.showCountdown === true) {
    const m = n(content.countdownMinutes) ?? 30;
    items.push({
      tone: "bg-amber-100 text-amber-800 ring-amber-200",
      label: `⏱ โปรเหลืออีก ~${m} นาที`,
    });
  }
  if (content.showLiveViewers === true) {
    const v = n(content.liveViewers) ?? 12;
    items.push({
      tone: "bg-rose-50 text-rose-700 ring-rose-200",
      label: `👀 มี ${v} คนกำลังดู`,
    });
  }
  if (items.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((it, i) => (
        <span
          key={i}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ring-1 ${it.tone}`}
        >
          {it.label}
        </span>
      ))}
    </div>
  );
}

/* ─── Blocks ─────────────────────────────────────── */

function Nav({
  content,
  theme,
  storeSlug,
}: {
  content: Record<string, unknown>;
  theme: ThemeVariant;
  storeSlug: string;
}) {
  const t = T[theme];
  const links = arr<{ href?: unknown; label?: unknown }>(content.links).flatMap((l) => {
    const href = s(l.href);
    const label = s(l.label);
    if (!href || !label || href === "#") return [];
    return [{ href, label }];
  });
  const cta = s(content.cta_text);
  const ctaHref = s(content.cta_url) ?? `/stores/${storeSlug}/cart`;
  const brand = s(content.brand) ?? "";
  return (
    <nav
      className={`sticky top-0 z-40 flex items-center justify-between border-b ${
        isPlayful(theme) ? "border-pink-100 bg-white/90" : "border-stone-200 bg-[#faf7f2]"
      } px-5 py-3 backdrop-blur-md sm:px-8`}
    >
      <Link href={`/stores/${storeSlug}`} className={`text-xl font-bold ${t.accent}`}>
        {brand}
      </Link>
      <div className="hidden items-center gap-6 md:flex">
        {links.map((l, i) => (
          <Link
            key={i}
            href={l.href}
            className="text-sm font-medium text-stone-600 transition-colors hover:text-stone-900"
          >
            {l.label}
          </Link>
        ))}
        {cta && (
          <Link
            href={ctaHref}
            className={`inline-flex items-center ${t.btnRadius} ${t.bgAccent} px-5 py-2 text-sm font-semibold text-white shadow-md transition ${t.bgAccentHover}`}
          >
            {cta}
          </Link>
        )}
      </div>
    </nav>
  );
}

function ProductHero({
  content,
  theme,
  storeSlug,
}: {
  content: Record<string, unknown>;
  theme: ThemeVariant;
  storeSlug: string;
}) {
  const t = T[theme];
  const cute = isPlayful(theme);
  // Accept both v3 camelCase (titleTh / imageUrl / priceTHB / ctaText) and
  // v12 snake_case (headline / image_url / price_thb / cta_text).
  const headline =
    s(content.headline) ?? s(content.titleTh) ?? s(content.title) ?? "";
  const sub = s(content.subheadline) ?? s(content.subtitle);
  const badge = s(content.badge);
  const img = s(content.image_url) ?? s(content.imageUrl);
  const cta = s(content.cta_text) ?? s(content.ctaText) ?? "ซื้อเลย";
  const href = productHref(storeSlug, content.product_id ?? content.productId);
  const price = n(content.price_thb) ?? n(content.priceTHB) ?? n(content.price);
  const compare =
    n(content.compare_at_thb) ??
    n(content.compareAtPriceTHB) ??
    n(content.compareAtTHB);
  const onSale = price !== undefined && compare !== undefined && compare > price;
  return (
    <section
      className={`relative overflow-hidden px-6 py-14 sm:py-20 md:px-12 lg:px-20 ${
        cute
          ? "bg-gradient-to-b from-pink-50 via-rose-50 to-amber-50"
          : "bg-[#faf7f2]"
      }`}
    >
      <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2 md:gap-16">
        <div className="order-2 flex flex-col items-start gap-5 md:order-1">
          {badge && (
            <Badge
              variant={cute ? "default" : "outline"}
              className={
                cute
                  ? "border border-orange-200 bg-orange-100 px-3 py-1 text-sm font-bold text-orange-600 shadow-sm"
                  : "px-3 py-1 text-xs font-semibold uppercase tracking-widest text-stone-500"
              }
            >
              {badge}
            </Badge>
          )}
          <h1
            className={`text-4xl leading-tight md:text-5xl lg:text-6xl ${t.headline}`}
          >
            {headline}
          </h1>
          {sub && <p className="text-lg leading-relaxed text-stone-600">{sub}</p>}
          {price !== undefined && (
            <div className="flex items-baseline gap-3">
              <span className={`text-3xl font-extrabold ${t.accent}`}>
                ฿{bahtFormat(price)}
              </span>
              {onSale && (
                <span className="text-base text-stone-400 line-through">
                  ฿{bahtFormat(compare!)}
                </span>
              )}
            </div>
          )}
          <FomoChips content={content} />
          <TrustChips content={content} />
          <div className="mt-2 flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              className={`h-auto gap-2 ${t.btnRadius} ${t.bgAccent} px-8 py-4 text-lg font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 ${t.bgAccentHover}`}
            >
              <Link href={href}>
                <ShoppingCart className="h-5 w-5" />
                {cta}
              </Link>
            </Button>
            {s(content.secondary_cta_text) && (
              <Button
                asChild
                variant="link"
                className={`h-auto px-4 py-2 text-base font-semibold ${t.accent}`}
              >
                <Link href={s(content.secondary_cta_url) ?? href}>
                  {s(content.secondary_cta_text)}
                </Link>
              </Button>
            )}
          </div>
        </div>
        {img && (
          <div className="relative order-1 md:order-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img}
              alt={s(content.altText) ?? s(content.image_alt) ?? headline}
              loading="lazy"
              className={`aspect-square w-full object-cover shadow-2xl ${
                cute ? "rounded-2xl border-4 border-white" : ""
              }`}
            />
          </div>
        )}
      </div>
    </section>
  );
}

function Stats({
  content,
  theme,
}: {
  content: Record<string, unknown>;
  theme: ThemeVariant;
}) {
  const t = T[theme];
  const items = arr<{ value?: unknown; label?: unknown; description?: unknown }>(
    content.items,
  );
  if (items.length === 0) return null;
  return (
    <section className={`px-6 py-14 ${isPlayful(theme) ? "bg-white" : "bg-white"}`}>
      <div className="mx-auto max-w-5xl">
        {s(content.headline) && (
          <h2 className={`mb-10 text-center text-3xl md:text-4xl ${t.headline}`}>
            {s(content.headline)}
          </h2>
        )}
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {items.map((it, i) => (
            <div key={i} className="text-center">
              <div className={`text-4xl md:text-5xl ${t.accent} font-extrabold`}>
                {String(it.value ?? "")}
              </div>
              <div className="mt-2 text-sm font-medium text-stone-700">
                {String(it.label ?? "")}
              </div>
              {s(it.description) && (
                <div className="mt-1 text-xs text-stone-500">
                  {s(it.description)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function OfferGrid({
  content,
  theme,
  storeSlug,
}: {
  content: Record<string, unknown>;
  theme: ThemeVariant;
  storeSlug: string;
}) {
  const t = T[theme];
  // Agent v3 emits `products`, older v12 schemas use `items`. Accept both —
  // per-field normalization happens at usage site below.
  const items = arr<Record<string, unknown>>(
    (content.items as unknown[]) ?? (content.products as unknown[]),
  );
  const layoutStyle = s(content.layoutStyle) || "grid";
  if (items.length === 0) return null;
  
  let wrapperClass = "grid gap-6 sm:grid-cols-2 lg:grid-cols-3";
  if (layoutStyle === "carousel") {
    wrapperClass = "flex overflow-x-auto snap-x snap-mandatory gap-4 pb-6 w-full hide-scrollbar";
  } else if (layoutStyle === "bento") {
    wrapperClass = "grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-3 auto-rows-fr";
  }

  return (
    <section
      className={`px-6 py-14 lg:py-20 ${
        isPlayful(theme) ? "bg-amber-50/40" : "bg-[#faf7f2]"
      }`}
    >
      <div className="mx-auto max-w-6xl">
        {(s(content.headline) || s(content.subheadline)) && (
          <div className="mb-10 text-center">
            {s(content.headline) && (
              <h2 className={`mb-2 text-3xl md:text-4xl ${t.headline}`}>
                {s(content.headline)}
              </h2>
            )}
            {s(content.subheadline) && (
              <p className="text-lg text-stone-600">{s(content.subheadline)}</p>
            )}
          </div>
        )}
        <div className={wrapperClass}>
          {items.map((it, i) => {
            // Read both v3 camelCase + v12 snake_case at usage site —
            // safer than upstream remapping which gets shadowed by hot
            // reload edge cases.
            const href = productHref(
              storeSlug,
              it.product_id ?? it.productId,
            );
            const img = s(it.image_url) ?? s(it.imageUrl);
            const title =
              s(it.title) ?? s(it.titleTh) ?? s(it.name) ?? "";
            const desc =
              s(it.description) ?? s(it.descriptionTh) ?? s(it.subtitle);
            const price =
              n(it.price_thb) ?? n(it.priceTHB) ?? n(it.price);
            const compare =
              n(it.compare_at_thb) ??
              n(it.compareAtPriceTHB) ??
              n(it.compareAtTHB);
            const stock = n(it.stockRemaining);
            let itemClass = `group flex flex-col overflow-hidden border bg-white shadow-md transition hover:shadow-xl ${t.cardRadius} ${isPlayful(theme) ? "border-stone-100" : "border-stone-200"}`;
            let imgWrapperClass = "relative aspect-square overflow-hidden bg-stone-100";
            
            if (layoutStyle === "carousel") {
              itemClass += " w-[280px] shrink-0 snap-center";
            } else if (layoutStyle === "bento" && i === 0) {
              itemClass += " sm:col-span-2 sm:row-span-2";
              imgWrapperClass = "relative aspect-[4/3] sm:aspect-auto sm:flex-1 overflow-hidden bg-stone-100";
            }

            return (
              <Link
                key={i}
                href={href}
                className={itemClass}
              >
                <div className={imgWrapperClass}>
                  {s(it.badge) && (
                    <span
                      className={`absolute left-3 top-3 z-10 rounded px-2 py-1 text-xs font-bold shadow-sm backdrop-blur-sm ${
                        isPlayful(theme)
                          ? "bg-white/90 text-pink-600"
                          : "bg-white/95 text-stone-900"
                      }`}
                    >
                      {s(it.badge)}
                    </span>
                  )}
                  {it.showLowStock === true && stock !== undefined && stock > 0 && (
                    <span
                      className={`absolute right-3 top-3 z-10 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-bold text-white shadow-sm ${
                        stock <= 5 ? "bg-red-500/95" : "bg-orange-500/95"
                      }`}
                    >
                      <Flame className="h-3 w-3" />
                      เหลือ {stock}
                    </span>
                  )}
                  {img && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={img}
                      alt={s(it.altText) ?? title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                </div>
                <div className={`flex flex-col p-5 ${layoutStyle === "bento" && i === 0 ? "sm:p-8" : "flex-1"}`}>
                  <h3 className={`mb-2 line-clamp-1 font-bold text-stone-800 group-hover:text-pink-600 ${layoutStyle === "bento" && i === 0 ? "text-2xl" : "text-lg"}`}>
                    {title}
                  </h3>
                  {desc && (
                    <p className="mb-4 line-clamp-2 flex-1 text-sm text-stone-500">
                      {desc}
                    </p>
                  )}
                  <div className="mt-auto flex items-end justify-between border-t border-stone-100 pt-3">
                    <div>
                      {compare !== undefined && (
                        <span className="mr-2 text-sm text-stone-400 line-through">
                          ฿{bahtFormat(compare)}
                        </span>
                      )}
                      {price !== undefined && (
                        <span className={`text-xl font-extrabold ${t.accent}`}>
                          ฿{bahtFormat(price)}
                        </span>
                      )}
                    </div>
                    <span
                      className={`inline-flex items-center rounded-lg p-2 text-white ${
                        isPlayful(theme) ? "bg-stone-900" : "bg-stone-900"
                      }`}
                    >
                      <ShoppingCart size={18} />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Features({
  content,
  theme,
}: {
  content: Record<string, unknown>;
  theme: ThemeVariant;
}) {
  const t = T[theme];
  const items = arr<{ title?: unknown; description?: unknown }>(content.items);
  if (items.length === 0) return null;
  return (
    <section className="bg-white px-6 py-14">
      <div className="mx-auto max-w-5xl">
        {s(content.headline) && (
          <h2 className={`mb-3 text-center text-3xl md:text-4xl ${t.headline}`}>
            {s(content.headline)}
          </h2>
        )}
        {s(content.subheadline) && (
          <p className="mb-10 text-center text-lg text-stone-600">
            {s(content.subheadline)}
          </p>
        )}
        <div className="grid gap-8 md:grid-cols-3">
          {items.map((it, i) => (
            <div
              key={i}
              className={`p-6 ${t.cardRadius} ${isPlayful(theme) ? "bg-pink-50" : "border border-stone-200 bg-white"}`}
            >
              <h3 className={`mb-2 text-xl font-bold ${t.accent}`}>
                {String(it.title ?? "")}
              </h3>
              <p className="text-stone-600">{String(it.description ?? "")}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing({
  content,
  theme,
}: {
  content: Record<string, unknown>;
  theme: ThemeVariant;
}) {
  const t = T[theme];
  const plans = arr<Record<string, unknown>>(content.plans);
  if (plans.length === 0) return null;
  return (
    <section className="bg-white px-6 py-14">
      <div className="mx-auto max-w-5xl">
        {s(content.headline) && (
          <h2 className={`mb-3 text-center text-3xl md:text-4xl ${t.headline}`}>
            {s(content.headline)}
          </h2>
        )}
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {plans.map((p, i) => {
            const features = arr<unknown>(p.features);
            const highlighted = p.highlighted === true;
            return (
              <div
                key={i}
                className={`flex flex-col p-8 shadow-md ${t.cardRadius} ${
                  highlighted
                    ? `${t.bgAccent} text-white`
                    : "border border-stone-200 bg-white"
                }`}
              >
                <h3 className="text-xl font-bold">{String(p.name ?? "")}</h3>
                <div className="mt-4 text-4xl font-extrabold">
                  {typeof p.price === "number" ? `฿${bahtFormat(p.price)}` : String(p.price ?? "")}
                </div>
                {s(p.period) && (
                  <div className="text-sm opacity-70">/ {s(p.period)}</div>
                )}
                <ul className="mt-6 flex-1 space-y-2 text-sm">
                  {features.map((f, j) => (
                    <li key={j}>• {String(f)}</li>
                  ))}
                </ul>
                {s(p.cta_text) && (
                  <div
                    className={`mt-6 ${t.btnRadius} px-6 py-3 text-center font-semibold ${
                      highlighted ? "bg-white text-stone-900" : `${t.bgAccent} text-white`
                    }`}
                  >
                    {s(p.cta_text)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CTA({
  content,
  theme,
}: {
  content: Record<string, unknown>;
  theme: ThemeVariant;
}) {
  const t = T[theme];
  const href = s(content.cta_url);
  const validHref = href && href !== "#" ? href : null;
  return (
    <section
      className={`px-6 py-14 ${isPlayful(theme) ? "bg-emerald-50" : "bg-[#b8956a]"}`}
    >
      <div
        className={`mx-auto flex max-w-4xl flex-col items-center text-center ${t.cardRadius} bg-white p-8 shadow-lg md:p-12`}
      >
        {s(content.badge) && (
          <span
            className={`mb-6 rounded-full px-4 py-1.5 font-bold ${
              isPlayful(theme) ? "bg-emerald-100 text-emerald-700" : "bg-stone-100 text-stone-800"
            }`}
          >
            {s(content.badge)}
          </span>
        )}
        <h2 className={`mb-4 text-3xl md:text-4xl ${t.headline}`}>
          {s(content.headline) ?? ""}
        </h2>
        {s(content.subheadline) && (
          <p className="mb-8 max-w-2xl text-lg text-stone-600">{s(content.subheadline)}</p>
        )}
        {s(content.cta_text) && validHref && (
          <Link
            href={validHref}
            className={`mb-4 inline-flex ${t.btnRadius} ${
              isPlayful(theme) ? "bg-emerald-500 hover:bg-emerald-600" : t.bgAccent
            } px-10 py-4 text-lg font-bold text-white shadow-md transition`}
          >
            {s(content.cta_text)}
          </Link>
        )}
        {s(content.helper_text) && (
          <p className="text-sm text-stone-500">{s(content.helper_text)}</p>
        )}
      </div>
    </section>
  );
}

function Testimonial({
  content,
  theme,
}: {
  content: Record<string, unknown>;
  theme: ThemeVariant;
}) {
  const t = T[theme];
  const quotes = arr<Record<string, unknown>>(content.quotes);
  if (quotes.length === 0) return null;
  return (
    <section className={`px-6 py-14 ${isPlayful(theme) ? "bg-pink-50/40" : "bg-white"}`}>
      <div className="mx-auto max-w-5xl">
        {s(content.headline) && (
          <h2 className={`mb-10 text-center text-3xl md:text-4xl ${t.headline}`}>
            {s(content.headline)}
          </h2>
        )}
        <div className="grid gap-6 md:grid-cols-3">
          {quotes.map((q, i) => (
            <div
              key={i}
              className={`p-6 ${t.cardRadius} bg-white shadow-md ring-1 ${t.ring}`}
            >
              <div className="mb-3 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star
                    key={j}
                    className={`h-4 w-4 ${isPlayful(theme) ? "text-pink-500" : "text-stone-700"}`}
                    fill="currentColor"
                  />
                ))}
              </div>
              <p className="mb-4 italic text-stone-700">&ldquo;{String(q.quote ?? "")}&rdquo;</p>
              <div className="text-sm">
                <p className="font-bold text-stone-900">{String(q.author ?? "")}</p>
                {s(q.role) && <p className="text-stone-500">{s(q.role)}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Gallery({
  content,
  theme,
}: {
  content: Record<string, unknown>;
  theme: ThemeVariant;
}) {
  const t = T[theme];
  const items = arr<Record<string, unknown>>(content.items);
  if (items.length === 0) return null;
  return (
    <section className="bg-white px-6 py-14">
      <div className="mx-auto max-w-6xl">
        {s(content.headline) && (
          <h2 className={`mb-10 text-center text-3xl md:text-4xl ${t.headline}`}>
            {s(content.headline)}
          </h2>
        )}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {items.map((it, i) => {
            const img = s(it.image_url);
            if (!img) return null;
            return (
              <div key={i} className={`overflow-hidden ${t.cardRadius} bg-stone-100`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img}
                  alt={s(it.altText) ?? s(it.alt) ?? ""}
                  className="aspect-square w-full object-cover"
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FAQ({
  content,
  theme,
}: {
  content: Record<string, unknown>;
  theme: ThemeVariant;
}) {
  const t = T[theme];
  const items = arr<Record<string, unknown>>(content.items);
  if (items.length === 0) return null;
  return (
    <section className={`px-6 py-14 ${isPlayful(theme) ? "bg-pink-50/30" : "bg-[#faf7f2]"}`}>
      <div className="mx-auto max-w-3xl">
        {s(content.headline) && (
          <h2 className={`mb-10 text-center text-3xl md:text-4xl ${t.headline}`}>
            {s(content.headline)}
          </h2>
        )}
        <div className="space-y-4">
          {items.map((it, i) => (
            <details
              key={i}
              className={`group bg-white p-5 shadow-sm ring-1 ${t.ring} ${t.cardRadius}`}
            >
              <summary className="flex cursor-pointer items-start justify-between gap-4 font-semibold text-stone-900">
                <span>{String(it.question ?? "")}</span>
                <ChevronRight className="h-5 w-5 shrink-0 text-stone-400 transition group-open:rotate-90" />
              </summary>
              <p className="mt-3 text-stone-600">{String(it.answer ?? "")}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function Countdown({
  content,
  theme,
}: {
  content: Record<string, unknown>;
  theme: ThemeVariant;
}) {
  const t = T[theme];
  return (
    <section className={`px-6 py-12 text-center ${isPlayful(theme) ? "bg-amber-50" : "bg-stone-900 text-white"}`}>
      {s(content.headline) && (
        <h2
          className={`mb-3 text-3xl md:text-4xl ${
            isPlayful(theme) ? t.headline : "font-medium"
          }`}
        >
          {s(content.headline)}
        </h2>
      )}
      {s(content.subheadline) && (
        <p
          className={`mb-6 ${
            isPlayful(theme) ? "text-stone-600" : "text-stone-300"
          }`}
        >
          {s(content.subheadline)}
        </p>
      )}
      {/* Static placeholder — a client-side ticker can replace this later */}
      <div className="inline-flex gap-3 font-mono text-3xl font-bold tracking-wider">
        <span>00</span>:<span>00</span>:<span>00</span>
      </div>
    </section>
  );
}

function ContactFormBlock({
  content,
  theme,
  storeSlug,
}: {
  content: Record<string, unknown>;
  theme: ThemeVariant;
  storeSlug: string;
}) {
  const t = T[theme];
  const email = s(content.contact_email);
  return (
    <section className={`px-6 py-14 ${isPlayful(theme) ? "bg-pink-50/40" : "bg-[#faf7f2]"}`}>
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <h2 className={`text-3xl md:text-4xl ${t.headline}`}>
            {s(content.headline) ?? "ติดต่อเรา"}
          </h2>
          {s(content.subheadline) && (
            <p className="mt-3 text-lg text-stone-600">{s(content.subheadline)}</p>
          )}
        </div>
        <div className={`mt-10 overflow-hidden bg-white shadow-md ring-1 ${t.ring} ${t.cardRadius}`}>
          {email && (
            <a
              href={`mailto:${email}`}
              className={`flex items-center gap-3 border-b px-6 py-4 ${
                isPlayful(theme)
                  ? "border-pink-100 bg-gradient-to-r from-pink-100 via-rose-50 to-amber-50"
                  : "border-stone-200 bg-stone-50"
              }`}
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  isPlayful(theme) ? "bg-white/80 text-pink-600" : "bg-white text-stone-700"
                } shadow-sm`}
              >
                <Mail className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className={`text-[11px] font-semibold uppercase tracking-wider ${t.accent}`}
                >
                  อีเมลร้าน
                </p>
                <p className="font-mono text-sm font-bold text-stone-900">{email}</p>
              </div>
            </a>
          )}
          <Link
            href={`/stores/${storeSlug}/contact`}
            className={`block py-8 text-center font-semibold ${t.accent} hover:underline`}
          >
            ไปที่หน้าฟอร์มติดต่อ →
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer({
  content,
  theme,
  storeSlug,
}: {
  content: Record<string, unknown>;
  theme: ThemeVariant;
  storeSlug: string;
}) {
  const links = arr<{ href?: unknown; label?: unknown }>(content.links).flatMap((l) => {
    const href = s(l.href);
    const label = s(l.label);
    if (!href || !label || href === "#") return [];
    return [{ href, label }];
  });
  const email = s(content.contact_email);
  return (
    <footer
      className={`flex flex-col items-center gap-4 px-6 py-12 text-center text-sm ${
        isPlayful(theme) ? "bg-stone-900 text-stone-300" : "bg-[#1c1917] text-stone-400"
      } sm:py-14`}
    >
      {s(content.brand) && (
        <div className="text-xl font-semibold tracking-wider text-white">
          {s(content.brand)}
        </div>
      )}
      {s(content.tagline) && (
        <p className="italic text-stone-500">{s(content.tagline)}</p>
      )}
      {email && (
        <a
          href={`mailto:${email}`}
          className="inline-flex items-center gap-2 rounded-full bg-stone-800 px-4 py-2 font-mono text-xs hover:bg-stone-700"
        >
          <Mail className="h-4 w-4 text-pink-400" />
          {email}
        </a>
      )}
      {links.length > 0 && (
        <div className="mt-2 flex flex-wrap justify-center gap-6">
          {links.map((l, i) => (
            <Link key={i} href={l.href} className="hover:text-white">
              {l.label}
            </Link>
          ))}
        </div>
      )}
      <div className="mt-4 text-xs text-stone-600">
        {s(content.copyright) ?? `© ${new Date().getFullYear()} /stores/${storeSlug}`}
      </div>
    </footer>
  );
}

/* ─── Agent 01 v3 — Branding & Visual blocks ───────── */

function LogoBlock({
  content,
  theme,
  storeSlug,
}: {
  content: Record<string, unknown>;
  theme: ThemeVariant;
  storeSlug: string;
}) {
  const t = T[theme];
  const imageUrl = s(content.imageUrl);
  const altText = s(content.altText) ?? s(content.brandText) ?? "logo";
  const brandText = s(content.brandText);
  const linkTo = s(content.linkTo) ?? `/stores/${storeSlug}`;
  const size = s(content.size) ?? "md";
  const sizeClass =
    size === "sm" ? "h-8" : size === "lg" ? "h-16" : "h-12";
  return (
    <div className="flex items-center justify-center px-6 py-6">
      <Link href={linkTo} className="flex items-center gap-3">
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={altText} className={`${sizeClass} w-auto object-contain`} />
        )}
        {brandText && (
          <span className={`text-xl font-bold ${t.accent}`}>{brandText}</span>
        )}
      </Link>
    </div>
  );
}

function BannerBlock({
  content,
  theme,
}: {
  content: Record<string, unknown>;
  theme: ThemeVariant;
}) {
  const t = T[theme];
  const text = s(content.text);
  const ctaText = s(content.ctaText);
  const ctaLink = s(content.ctaLink) ?? "#";
  const position = s(content.position) ?? "top";
  if (!text) return null;
  return (
    <div
      className={`flex flex-wrap items-center justify-center gap-3 px-4 py-2.5 text-center text-sm font-medium ${
        isPlayful(theme) ? "bg-pink-100 text-stone-900" : "bg-stone-900 text-stone-50"
      } ${position === "top" ? "" : ""}`}
    >
      <span>{text}</span>
      {ctaText && (
        <Link
          href={ctaLink}
          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
            isPlayful(theme) ? "bg-pink-500 text-white" : "bg-amber-400 text-stone-900"
          } ${t.bgAccentHover}`}
        >
          {ctaText} <ChevronRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  );
}

function HeroBanner({
  content,
  theme,
  storeSlug,
}: {
  content: Record<string, unknown>;
  theme: ThemeVariant;
  storeSlug: string;
}) {
  const t = T[theme];
  const imageUrl = s(content.imageUrl);
  const svgCode = s(content.svgCode);
  const imageMobileUrl = s(content.imageMobileUrl) ?? imageUrl;
  const altText = s(content.altText) ?? "";
  const headline = s(content.headline);
  const subheadline = s(content.subheadline);
  const ctaText = s(content.ctaText);
  const ctaLink = s(content.ctaLink) ?? `/stores/${storeSlug}`;
  const secondaryCtaText = s(content.secondaryCtaText);
  const secondaryCtaLink = s(content.secondaryCtaLink) ?? "#";
  const overlayOpacity = n(content.overlayOpacity) ?? 0.4;
  const textPosition = s(content.textPosition) ?? "center";
  const align =
    textPosition === "left"
      ? "items-start text-left"
      : textPosition === "right"
        ? "items-end text-right"
        : "items-center text-center";
  return (
    <section className="relative w-full overflow-hidden">
      {svgCode ? (
        <div 
          className="absolute inset-0 flex items-center justify-center opacity-40 [&>svg]:w-full [&>svg]:h-full [&>svg]:object-cover"
          dangerouslySetInnerHTML={{ __html: svgCode }} 
        />
      ) : imageUrl ? (
        <picture>
          <source media="(max-width: 640px)" srcSet={imageMobileUrl} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt={altText} className="h-[60vh] min-h-[420px] w-full object-cover sm:h-[75vh]" />
        </picture>
      ) : null}
      <div
        className="absolute inset-0 bg-black"
        style={{ opacity: overlayOpacity }}
        aria-hidden="true"
      />
      <div className={`absolute inset-0 flex flex-col justify-center gap-4 px-6 sm:px-12 ${align}`}>
        {headline && (
          <h2 className={`max-w-3xl text-3xl font-bold text-white drop-shadow-lg sm:text-5xl md:text-6xl ${t.headline}`}>
            {headline}
          </h2>
        )}
        {subheadline && (
          <p className="max-w-2xl text-lg text-white/95 drop-shadow sm:text-xl">{subheadline}</p>
        )}
        <div className="flex flex-wrap gap-3">
          {ctaText && (
            <Link
              href={ctaLink}
              className={`inline-flex items-center ${t.btnRadius} ${t.bgAccent} px-6 py-3 text-base font-semibold text-white shadow-lg transition ${t.bgAccentHover}`}
            >
              {ctaText}
            </Link>
          )}
          {secondaryCtaText && (
            <Link
              href={secondaryCtaLink}
              className={`inline-flex items-center ${t.btnRadius} border border-white/80 bg-white/10 px-6 py-3 text-base font-semibold text-white backdrop-blur-sm transition hover:bg-white/20`}
            >
              {secondaryCtaText}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

function ImageSlide({
  content,
  theme,
}: {
  content: Record<string, unknown>;
  theme: ThemeVariant;
}) {
  const slides = arr<Record<string, unknown>>(content.slides);
  const aspectRatio = s(content.aspectRatio) ?? "16/9";
  if (slides.length === 0) return null;
  // SSR-friendly horizontal scroll-snap carousel — no client JS, swipe/drag works on mobile.
  return (
    <section className={`${isPlayful(theme) ? "bg-pink-50/40" : "bg-stone-50"} py-8`}>
      <div className="overflow-x-auto">
        <div
          className="flex snap-x snap-mandatory gap-4 px-6"
          style={{ scrollbarWidth: "none" }}
        >
          {slides.map((slide, i) => {
            const imageUrl = s(slide.imageUrl);
            const altText = s(slide.altText) ?? `slide ${i + 1}`;
            const linkTo = s(slide.linkTo);
            const caption = s(slide.caption);
            if (!imageUrl) return null;
            const inner = (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt={altText}
                  className="h-full w-full object-cover"
                  style={{ aspectRatio }}
                />
                {caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <p className="text-sm font-medium text-white">{caption}</p>
                  </div>
                )}
              </>
            );
            return (
              <div
                key={i}
                className="relative w-[88%] flex-shrink-0 snap-center overflow-hidden rounded-lg sm:w-[60%] md:w-[48%]"
              >
                {linkTo ? (
                  <Link href={linkTo} className="block h-full w-full">
                    {inner}
                  </Link>
                ) : (
                  inner
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function LogoCloud({
  content,
  theme,
}: {
  content: Record<string, unknown>;
  theme: ThemeVariant;
}) {
  const title = s(content.title);
  const logos = arr<Record<string, unknown>>(content.logos);
  const grayscale = content.grayscale === true;
  if (logos.length === 0) return null;
  return (
    <section className={`${isPlayful(theme) ? "bg-white" : "bg-stone-50"} px-6 py-10`}>
      <div className="mx-auto max-w-5xl">
        {title && (
          <p className="mb-6 text-center text-xs font-medium uppercase tracking-widest text-stone-500">
            {title}
          </p>
        )}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
          {logos.map((logo, i) => {
            const url = s(logo.imageUrl);
            const altText = s(logo.altText) ?? `logo ${i + 1}`;
            if (!url) return null;
            return (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={url}
                alt={altText}
                className={`h-8 w-auto object-contain opacity-80 transition hover:opacity-100 sm:h-10 ${
                  grayscale ? "grayscale hover:grayscale-0" : ""
                }`}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

function BundleBlock({
  content,
  theme,
  storeSlug,
}: {
  content: Record<string, unknown>;
  theme: ThemeVariant;
  storeSlug: string;
}) {
  const t = T[theme];
  const title = s(content.title);
  const items = arr<Record<string, unknown>>(content.items);
  const bundlePrice = n(content.bundlePrice);
  const originalTotal = n(content.originalTotal);
  const savings = n(content.savings);
  const ctaText = s(content.ctaText) ?? "สั่งชุดนี้";
  const ctaLink = s(content.ctaLink) ?? `/stores/${storeSlug}/cart`;
  const badge = s(content.badge);
  return (
    <section className="px-6 py-12">
      <div
        className={`mx-auto max-w-5xl overflow-hidden ${t.cardRadius} border ${
          isPlayful(theme) ? "border-pink-200 bg-white" : "border-stone-200 bg-stone-50"
        } p-6 shadow-sm sm:p-10`}
      >
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          {title && <h2 className={`text-2xl font-bold sm:text-3xl ${t.headline}`}>{title}</h2>}
          {badge && (
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                isPlayful(theme) ? "bg-pink-500 text-white" : "bg-amber-500 text-white"
              }`}
            >
              {badge}
            </span>
          )}
        </div>

        {items.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {items.map((item, i) => {
              const name = s(item.name);
              const imageUrl = s(item.imageUrl);
              const altText = s(item.altText) ?? name ?? `item ${i + 1}`;
              const originalPrice = n(item.originalPrice);
              return (
                <div
                  key={i}
                  className={`overflow-hidden ${t.cardRadius} bg-white ring-1 ${t.ring}`}
                >
                  {imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imageUrl}
                      alt={altText}
                      className="aspect-square w-full object-cover"
                    />
                  )}
                  <div className="p-3">
                    {name && <p className="text-sm font-medium text-stone-900">{name}</p>}
                    {typeof originalPrice === "number" && (
                      <p className="mt-1 text-xs text-stone-500 line-through">
                        ฿{bahtFormat(originalPrice)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-stone-200 pt-6">
          <div>
            {typeof originalTotal === "number" && (
              <p className="text-xs text-stone-500 line-through">
                ฿{bahtFormat(originalTotal)}
              </p>
            )}
            {typeof bundlePrice === "number" && (
              <p className={`text-3xl font-bold ${t.accent}`}>
                ฿{bahtFormat(bundlePrice)}
              </p>
            )}
            {typeof savings === "number" && savings > 0 && (
              <p className="text-sm font-medium text-emerald-600">
                ประหยัด ฿{bahtFormat(savings)}
              </p>
            )}
          </div>
          <Link
            href={ctaLink}
            className={`inline-flex items-center gap-2 ${t.btnRadius} ${t.bgAccent} px-6 py-3 text-base font-semibold text-white shadow-md transition ${t.bgAccentHover}`}
          >
            <ShoppingCart className="h-4 w-4" />
            {ctaText}
          </Link>
        </div>
      </div>
    </section>
  );
}

function Reviews({
  content,
  theme,
}: {
  content: Record<string, unknown>;
  theme: ThemeVariant;
}) {
  const t = T[theme];
  const title = s(content.title);
  const subtitle = s(content.subtitle);
  const items = arr<Record<string, unknown>>(content.reviews);
  if (items.length === 0) return null;
  return (
    <section className={`${isPlayful(theme) ? "bg-pink-50/40" : "bg-stone-50"} px-6 py-12`}>
      <div className="mx-auto max-w-6xl">
        {title && (
          <h2 className={`mb-2 text-center text-2xl font-bold sm:text-3xl ${t.headline}`}>
            {title}
          </h2>
        )}
        {subtitle && (
          <p className="mb-8 text-center text-sm text-stone-600">{subtitle}</p>
        )}
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {items.map((r, i) => {
            const name = s(r.name) ?? "ลูกค้า";
            const rating = Math.max(0, Math.min(5, Math.round(n(r.rating) ?? 5)));
            const photoUrl = s(r.photoUrl);
            const altText = s(r.altText) ?? name;
            const comment = s(r.comment);
            const location = s(r.location);
            const date = s(r.date);
            return (
              <div
                key={i}
                className={`flex flex-col gap-3 ${t.cardRadius} bg-white p-5 ring-1 ${t.ring}`}
              >
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star
                      key={j}
                      className={`h-4 w-4 ${
                        j < rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-stone-300"
                      }`}
                    />
                  ))}
                </div>
                {comment && (
                  <p className="text-sm leading-relaxed text-stone-700">
                    &ldquo;{comment}&rdquo;
                  </p>
                )}
                <div className="flex items-center gap-3 border-t border-stone-100 pt-3">
                  {photoUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={photoUrl}
                      alt={altText}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-stone-900">{name}</p>
                    {(location || date) && (
                      <p className="truncate text-xs text-stone-500">
                        {[location, date].filter(Boolean).join(" · ")}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CategoryBanner({
  content,
  theme,
  storeSlug,
}: {
  content: Record<string, unknown>;
  theme: ThemeVariant;
  storeSlug: string;
}) {
  const t = T[theme];
  const title = s(content.title);
  const subtitle = s(content.subtitle);
  const layout = s(content.layout) ?? "grid-3";
  const aspectRatio = s(content.aspectRatio) ?? "4/3";
  const categories = arr<Record<string, unknown>>(content.categories);
  if (categories.length === 0) return null;

  // Layout → Tailwind grid/scroll classes.
  const containerClass =
    layout === "grid-2"
      ? "grid gap-4 sm:grid-cols-2"
      : layout === "grid-4"
        ? "grid grid-cols-2 gap-3 md:grid-cols-4"
        : layout === "masonry"
          ? "columns-2 gap-4 md:columns-3"
          : layout === "carousel"
            ? "flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2"
            : "grid gap-4 sm:grid-cols-2 md:grid-cols-3"; // grid-3 default

  return (
    <section className="px-6 py-12">
      <div className="mx-auto max-w-6xl">
        {title && (
          <h2 className={`mb-2 text-center text-2xl font-bold sm:text-3xl ${t.headline}`}>
            {title}
          </h2>
        )}
        {subtitle && (
          <p className="mb-8 text-center text-sm text-stone-600">{subtitle}</p>
        )}
        <div className={containerClass}>
          {categories.map((cat, i) => {
            const name = s(cat.name);
            const imageUrl = s(cat.imageUrl);
            const imageMobileUrl = s(cat.imageMobileUrl) ?? imageUrl;
            const altText = s(cat.altText) ?? name ?? `category ${i + 1}`;
            const linkTo = s(cat.linkTo);
            const ctaText = s(cat.ctaText) ?? "ดูสินค้า";
            const badge = s(cat.badge);
            const productCount = n(cat.productCount);

            const href =
              linkTo && linkTo.startsWith("/") && !linkTo.startsWith(`/stores/`)
                ? `/stores/${storeSlug}${linkTo}`
                : linkTo ?? `/stores/${storeSlug}`;

            const cardClass =
              layout === "carousel"
                ? `relative w-[80%] flex-shrink-0 snap-center overflow-hidden ${t.cardRadius} bg-white ring-1 ${t.ring} sm:w-[40%]`
                : layout === "masonry"
                  ? `relative mb-4 break-inside-avoid overflow-hidden ${t.cardRadius} bg-white ring-1 ${t.ring}`
                  : `relative overflow-hidden ${t.cardRadius} bg-white ring-1 ${t.ring}`;

            return (
              <Link key={i} href={href} className={`${cardClass} group block`}>
                {imageUrl && (
                  <picture>
                    <source media="(max-width: 640px)" srcSet={imageMobileUrl} />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageUrl}
                      alt={altText}
                      className="w-full object-cover transition duration-300 group-hover:scale-105"
                      style={{ aspectRatio }}
                    />
                  </picture>
                )}
                {badge && (
                  <span
                    className={`absolute left-3 top-3 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                      isPlayful(theme)
                        ? "bg-pink-500 text-white"
                        : "bg-amber-500 text-white"
                    }`}
                  >
                    {badge}
                  </span>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent p-4">
                  {name && (
                    <p className="text-lg font-bold text-white">{name}</p>
                  )}
                  <div className="mt-1 flex items-center justify-between gap-2 text-xs text-white/90">
                    {typeof productCount === "number" && (
                      <span>พบ {productCount.toLocaleString("th-TH")} รายการ</span>
                    )}
                    <span className="inline-flex items-center gap-1 font-semibold">
                      {ctaText} <ChevronRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
