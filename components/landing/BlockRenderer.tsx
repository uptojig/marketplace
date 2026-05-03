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

export type ThemeVariant = "minimal" | "cute";

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
  const bg = theme === "cute" ? "bg-pink-50/30" : "bg-[#faf7f2]";
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
      return <Nav content={c} theme={theme} storeSlug={storeSlug} />;
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
      return <Footer content={c} theme={theme} storeSlug={storeSlug} />;
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

/* ─── Theme tokens ─────────────────────────────────── */

const T = {
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
        theme === "cute" ? "border-pink-100 bg-white/90" : "border-stone-200 bg-[#faf7f2]"
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
  const cute = theme === "cute";
  const headline = s(content.headline) ?? "";
  const sub = s(content.subheadline);
  const badge = s(content.badge);
  const img = s(content.image_url);
  const cta = s(content.cta_text) ?? "ซื้อเลย";
  const href = productHref(storeSlug, content.product_id);
  const price = n(content.price_thb);
  const compare = n(content.compare_at_thb);
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
            <span
              className={`inline-block rounded-full px-3 py-1 text-sm font-bold shadow-sm ${
                cute
                  ? "border border-orange-200 bg-orange-100 text-orange-600"
                  : "text-xs uppercase tracking-widest text-stone-500"
              }`}
            >
              {badge}
            </span>
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
            <Link
              href={href}
              className={`inline-flex items-center gap-2 ${t.btnRadius} ${t.bgAccent} px-8 py-4 text-lg font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 ${t.bgAccentHover}`}
            >
              <ShoppingCart className="h-5 w-5" />
              {cta}
            </Link>
            {s(content.secondary_cta_text) && (
              <Link
                href={s(content.secondary_cta_url) ?? href}
                className={`inline-flex items-center px-4 py-2 font-semibold ${t.accent} hover:underline`}
              >
                {s(content.secondary_cta_text)}
              </Link>
            )}
          </div>
        </div>
        {img && (
          <div className="relative order-1 md:order-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img}
              alt={s(content.image_alt) ?? headline}
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
    <section className={`px-6 py-14 ${theme === "cute" ? "bg-white" : "bg-white"}`}>
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
  const items = arr<Record<string, unknown>>(content.items);
  if (items.length === 0) return null;
  return (
    <section
      className={`px-6 py-14 lg:py-20 ${
        theme === "cute" ? "bg-amber-50/40" : "bg-[#faf7f2]"
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
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it, i) => {
            const href = productHref(storeSlug, it.product_id);
            const img = s(it.image_url);
            const title = s(it.title) ?? "";
            const desc = s(it.description);
            const price = n(it.price_thb);
            const compare = n(it.compare_at_thb);
            const stock = n(it.stockRemaining);
            return (
              <Link
                key={i}
                href={href}
                className={`group flex flex-col overflow-hidden border bg-white shadow-md transition hover:shadow-xl ${t.cardRadius} ${
                  theme === "cute" ? "border-stone-100" : "border-stone-200"
                }`}
              >
                <div className="relative aspect-square overflow-hidden bg-stone-100">
                  {s(it.badge) && (
                    <span
                      className={`absolute left-3 top-3 z-10 rounded px-2 py-1 text-xs font-bold shadow-sm backdrop-blur-sm ${
                        theme === "cute"
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
                      alt={title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="mb-2 line-clamp-1 text-lg font-bold text-stone-800 group-hover:text-pink-600">
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
                        theme === "cute" ? "bg-stone-900" : "bg-stone-900"
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
              className={`p-6 ${t.cardRadius} ${theme === "cute" ? "bg-pink-50" : "border border-stone-200 bg-white"}`}
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
      className={`px-6 py-14 ${theme === "cute" ? "bg-emerald-50" : "bg-[#b8956a]"}`}
    >
      <div
        className={`mx-auto flex max-w-4xl flex-col items-center text-center ${t.cardRadius} bg-white p-8 shadow-lg md:p-12`}
      >
        {s(content.badge) && (
          <span
            className={`mb-6 rounded-full px-4 py-1.5 font-bold ${
              theme === "cute" ? "bg-emerald-100 text-emerald-700" : "bg-stone-100 text-stone-800"
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
              theme === "cute" ? "bg-emerald-500 hover:bg-emerald-600" : t.bgAccent
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
    <section className={`px-6 py-14 ${theme === "cute" ? "bg-pink-50/40" : "bg-white"}`}>
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
                    className={`h-4 w-4 ${theme === "cute" ? "text-pink-500" : "text-stone-700"}`}
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
                  alt={s(it.alt) ?? ""}
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
    <section className={`px-6 py-14 ${theme === "cute" ? "bg-pink-50/30" : "bg-[#faf7f2]"}`}>
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
    <section className={`px-6 py-12 text-center ${theme === "cute" ? "bg-amber-50" : "bg-stone-900 text-white"}`}>
      {s(content.headline) && (
        <h2
          className={`mb-3 text-3xl md:text-4xl ${
            theme === "cute" ? t.headline : "font-medium"
          }`}
        >
          {s(content.headline)}
        </h2>
      )}
      {s(content.subheadline) && (
        <p
          className={`mb-6 ${
            theme === "cute" ? "text-stone-600" : "text-stone-300"
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
    <section className={`px-6 py-14 ${theme === "cute" ? "bg-pink-50/40" : "bg-[#faf7f2]"}`}>
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
                theme === "cute"
                  ? "border-pink-100 bg-gradient-to-r from-pink-100 via-rose-50 to-amber-50"
                  : "border-stone-200 bg-stone-50"
              }`}
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  theme === "cute" ? "bg-white/80 text-pink-600" : "bg-white text-stone-700"
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
        theme === "cute" ? "bg-stone-900 text-stone-300" : "bg-[#1c1917] text-stone-400"
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
