import {
  getPalette,
  getTemplate,
  slugify,
  type Template,
  type WizardState,
} from "@/lib/store/wizard-data";

type Props = {
  state: WizardState;
};

const DUMMY_PRODUCTS = [
  { name: "สินค้าตัวอย่าง A", price: "฿299" },
  { name: "สินค้าตัวอย่าง B", price: "฿459" },
  { name: "สินค้าตัวอย่าง C", price: "฿1,290" },
  { name: "สินค้าตัวอย่าง D", price: "฿89" },
];

const SPACING_PX: Record<Template["theme"]["spacing"], string> = {
  compact: "px-3 py-4",
  default: "px-5 py-6",
  airy: "px-8 py-10",
};

const RADIUS: Record<Template["theme"]["radius"], string> = {
  sharp: "rounded-none",
  default: "rounded-md",
  round: "rounded-2xl",
};

const FONT_FAMILY: Record<Template["theme"]["font"], string> = {
  sans: "font-sans",
  "sans-display": "font-sans tracking-tight",
  serif: "font-serif",
};

const TITLE_SIZE: Record<Template["theme"]["titleScale"], string> = {
  compact: "text-base",
  default: "text-xl",
  editorial: "text-2xl",
  display: "text-3xl",
};

export function LivePreview({ state }: Props) {
  const palette = getPalette(state.identity.paletteId);
  const template = state.layout.templateId
    ? getTemplate(state.layout.templateId)
    : null;
  const displayName = state.identity.name.trim() || "ชื่อร้านของคุณ";
  const slug = slugify(state.identity.name);
  const description =
    state.identity.description.trim() ||
    "เลือกสินค้าจากเราที่คัดสรรมาแล้วกว่า 1,000 ชิ้น";

  // Default theme if no template chosen yet
  const theme: Template["theme"] = template?.theme ?? {
    spacing: "default",
    radius: "default",
    titleScale: "default",
    font: "sans",
  };
  const behavior = template?.behavior ?? {};

  const isDark = template?.id === "premium-luxury";
  const bg = isDark ? "#0a0a0a" : "#ffffff";
  const fg = isDark ? "#fafafa" : "#0a0a0a";
  const subtle = isDark ? "#27272a" : "#f4f4f5";
  const muted = isDark ? "#a1a1aa" : "#71717a";

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-between text-[11px] text-zinc-500">
        <span className="font-mono">{slug}.basketplace.co</span>
        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-zinc-600">
          {template ? template.name : "ยังไม่เลือกเลย์เอาต์"} ·{" "}
          {template ? `Pattern ${template.desktopPattern}` : "default"}
        </span>
      </div>

      <div
        className={`overflow-hidden border border-zinc-200 shadow-sm ${RADIUS[theme.radius]} ${FONT_FAMILY[theme.font]}`}
        style={{ backgroundColor: bg, color: fg }}
      >
        {/* Header */}
        {!behavior.coverHidden && (
          <div
            className="flex items-center gap-3 border-b px-5 py-3"
            style={{ borderColor: subtle }}
          >
            {state.identity.logoDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={state.identity.logoDataUrl}
                alt={displayName}
                className="h-7 w-7 rounded-md object-cover"
              />
            ) : (
              <div
                className="flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold text-white"
                style={{ backgroundColor: palette.primary }}
              >
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-sm font-semibold">{displayName}</span>
            {behavior.badgeSlot === "official" && (
              <span className="rounded-full bg-blue-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
                Official ✓
              </span>
            )}
            {behavior.badgeSlot === "b2b" && (
              <span className="rounded-full bg-amber-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
                B2B
              </span>
            )}
            {behavior.searchInTopBar && (
              <div
                className="ml-auto h-6 flex-1 max-w-[180px] rounded-md text-[10px]"
                style={{ backgroundColor: subtle }}
              />
            )}
          </div>
        )}

        {/* Hero / Cover */}
        <PreviewHero
          template={template}
          displayName={displayName}
          description={description}
          palette={palette}
          bannerUrl={state.identity.bannerDataUrl}
          titleSize={TITLE_SIZE[theme.titleScale]}
          spacing={SPACING_PX[theme.spacing]}
        />

        {/* Behavior strips */}
        {behavior.swatchRow && (
          <div className="flex gap-1.5 px-5 py-3">
            {["#fda4af", "#fcd34d", "#a5b4fc", "#86efac", "#f9a8d4"].map((c) => (
              <span
                key={c}
                className="h-6 w-6 rounded-full ring-2 ring-white"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        )}
        {behavior.countdownBanner && (
          <div className="flex items-center justify-between bg-red-500 px-5 py-2 text-xs font-medium text-white">
            <span>⏰ Flash Deal เหลือเวลา</span>
            <span className="font-mono">02:34:17</span>
          </div>
        )}
        {behavior.storyBlock && (
          <div className="px-5 py-3" style={{ color: muted }}>
            <p className="text-xs italic">
              &ldquo;เราคัดสรรงานคราฟต์จากช่างฝีมือกว่า 50 ชุมชนทั่วประเทศ&rdquo;
            </p>
          </div>
        )}
        {behavior.compareBlock && (
          <div className="grid grid-cols-3 gap-2 px-5 py-3">
            {["A", "B", "C"].map((k) => (
              <div
                key={k}
                className="h-12 rounded-md text-center text-[9px]"
                style={{ backgroundColor: subtle }}
              />
            ))}
          </div>
        )}

        {/* Product grid */}
        <ProductGrid
          template={template}
          palette={palette}
          subtle={subtle}
          muted={muted}
        />
      </div>

      <p className="text-[11px] text-zinc-500">
        พรีวิวจะอัปเดตทันทีเมื่อคุณเปลี่ยนค่าใดๆ ทางซ้าย
      </p>
    </div>
  );
}

function PreviewHero({
  template,
  displayName,
  description,
  palette,
  bannerUrl,
  titleSize,
  spacing,
}: {
  template: Template | null;
  displayName: string;
  description: string;
  palette: ReturnType<typeof getPalette>;
  bannerUrl: string | null;
  titleSize: string;
  spacing: string;
}) {
  const behavior = template?.behavior ?? {};
  if (behavior.coverHidden && !behavior.heroSize) return null;

  if (behavior.heroSize === "live-tile") {
    return (
      <div className="relative aspect-video bg-zinc-900">
        <span className="absolute left-3 top-3 rounded-sm bg-red-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
          ● LIVE
        </span>
        <span className="absolute right-3 top-3 rounded-sm bg-black/60 px-1.5 py-0.5 text-[9px] text-white">
          👁 1.2k
        </span>
      </div>
    );
  }

  const aspectClass =
    behavior.heroSize === "portrait"
      ? "aspect-[3/4]"
      : behavior.heroSize === "large"
      ? "aspect-[16/9]"
      : "aspect-[4/1]";

  return (
    <div
      className={`relative ${aspectClass} overflow-hidden`}
      style={{
        background: bannerUrl
          ? undefined
          : `linear-gradient(135deg, ${palette.primary} 0%, ${palette.accent} 100%)`,
      }}
    >
      {bannerUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={bannerUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
      )}
      <div className={`relative ${spacing} text-white`}>
        <p className="text-[11px] uppercase tracking-widest opacity-80">
          คอลเล็กชั่นแรก
        </p>
        <h2 className={`mt-1 font-semibold ${titleSize}`}>
          ยินดีต้อนรับสู่ {displayName}
        </h2>
        <p className="mt-1 max-w-md text-sm opacity-90 line-clamp-2">
          {description}
        </p>
      </div>
    </div>
  );
}

function ProductGrid({
  template,
  palette,
  subtle,
  muted,
}: {
  template: Template | null;
  palette: ReturnType<typeof getPalette>;
  subtle: string;
  muted: string;
}) {
  const behavior = template?.behavior ?? {};

  if (behavior.singleProductMode) {
    return (
      <div className="px-5 py-6">
        <div className="aspect-square w-full rounded-lg" style={{ backgroundColor: subtle }} />
        <h3 className="mt-3 text-lg font-semibold">สินค้าหลักของร้าน</h3>
        <p className="text-xl font-bold" style={{ color: palette.primary }}>
          ฿1,990
        </p>
        <button
          type="button"
          className="mt-3 w-full rounded-md py-2.5 text-sm font-medium text-white"
          style={{ backgroundColor: palette.primary }}
        >
          ซื้อเลย
        </button>
      </div>
    );
  }

  if (behavior.videoFirstGrid) {
    return (
      <div className="grid grid-cols-2 gap-2 p-3">
        {DUMMY_PRODUCTS.map((p) => (
          <div
            key={p.name}
            className="aspect-[3/4] overflow-hidden rounded-lg"
            style={{
              background: `linear-gradient(160deg, ${palette.primary} 0%, ${palette.accent} 100%)`,
            }}
          />
        ))}
      </div>
    );
  }

  const cols = behavior.productGridDensity === "dense" ? "grid-cols-3" : "grid-cols-2";

  return (
    <div className="px-5 py-4">
      <div className="mb-3 flex items-center justify-between">
        <h3
          className="text-xs font-semibold uppercase tracking-wide"
          style={{ color: muted }}
        >
          สินค้าแนะนำ
        </h3>
        <span className="text-[11px]" style={{ color: muted }}>
          ดูทั้งหมด
        </span>
      </div>
      <div className={`grid ${cols} gap-3 sm:grid-cols-4`}>
        {DUMMY_PRODUCTS.map((p) => (
          <div
            key={p.name}
            className="overflow-hidden rounded-lg border"
            style={{ borderColor: subtle }}
          >
            <div
              className="aspect-square w-full relative"
              style={{ backgroundColor: subtle }}
            >
              {behavior.conditionBadges && (
                <span className="absolute left-1 top-1 rounded-sm bg-emerald-600 px-1 py-0.5 text-[8px] font-bold text-white">
                  สภาพดี
                </span>
              )}
              {behavior.stockIndicators && (
                <span className="absolute right-1 bottom-1 rounded-sm bg-red-500/90 px-1 py-0.5 text-[8px] font-bold text-white">
                  เหลือ 3 ชิ้น
                </span>
              )}
            </div>
            <div className="space-y-1 p-2">
              <p className="truncate text-[11px]">{p.name}</p>
              {!behavior.hideRatingsCount && (
                <p
                  className="text-xs font-semibold"
                  style={{ color: palette.primary }}
                >
                  {p.price}
                </p>
              )}
              {behavior.moqVisible && (
                <p className="text-[9px]" style={{ color: muted }}>
                  ขั้นต่ำ 10 ชิ้น
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
      {behavior.stickyCTA === "buy-now" && (
        <div
          className="mt-3 rounded-md py-2 text-center text-xs font-medium text-white"
          style={{ backgroundColor: palette.primary }}
        >
          🛒 ซื้อเลย (sticky bar)
        </div>
      )}
    </div>
  );
}
