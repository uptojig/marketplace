"use client";

/**
 * Real-component template preview.
 *
 * Renders the ACTUAL chrome (Header/Footer) + pages.home component from
 * lib/templates/registry.ts at storefront size (1280px), scaled down with
 * transform: scale + pointer-events: none so it fits the wizard preview
 * pane and clicks don't mutate the user's real cart.
 *
 * Why this exists: the earlier preview-pages.tsx renders family-level
 * abstract sketches — picking talad-see-sod showed a generic "everyday
 * family" mock instead of the bespoke red-brutalist Thai chrome that
 * actually publishes. The user's complaint: "preview ยังไม่ตรงแสดงให้
 * ถูกต้อง". This component fixes that by mounting the real adapters with
 * mock products + the merchant's name.
 */

import { useMemo, useRef, useState, useEffect } from "react";
import { templates } from "@/lib/templates/registry";
import type { TemplateId } from "@/lib/templates/types";
import type { Palette } from "@/lib/store/wizard-data";

type Props = {
  templateId: string;
  displayName: string;
  slug: string;
  palette: Palette;
  page: "home";
};

const MOCK_CATEGORIES = ["เคส", "สายชาร์จ", "หัวชาร์จ", "ของแต่งโต๊ะ", "ไฟ"];

const MOCK_PRODUCTS = [
  {
    id: "preview-1",
    title: "สินค้าตัวอย่าง · เคสใสกันกระแทก",
    priceTHB: 290,
    compareAtPriceTHB: 490,
    imageUrl: "https://placehold.co/600x600/dc2626/ffffff?text=Demo+1",
    categoryName: "เคส",
  },
  {
    id: "preview-2",
    title: "สายชาร์จ Type-C เร็วพิเศษ",
    priceTHB: 159,
    compareAtPriceTHB: 259,
    imageUrl: "https://placehold.co/600x600/f97316/ffffff?text=Demo+2",
    categoryName: "สายชาร์จ",
  },
  {
    id: "preview-3",
    title: "หัวชาร์จ GaN 65W 3 พอร์ต",
    priceTHB: 690,
    compareAtPriceTHB: 990,
    imageUrl: "https://placehold.co/600x600/0f172a/ffffff?text=Demo+3",
    categoryName: "หัวชาร์จ",
  },
  {
    id: "preview-4",
    title: "ที่วางมือถือ Aluminum",
    priceTHB: 220,
    compareAtPriceTHB: null,
    imageUrl: "https://placehold.co/600x600/7c3aed/ffffff?text=Demo+4",
    categoryName: "ของแต่งโต๊ะ",
  },
  {
    id: "preview-5",
    title: "ไฟ LED RGB ใต้โต๊ะ",
    priceTHB: 350,
    compareAtPriceTHB: 590,
    imageUrl: "https://placehold.co/600x600/059669/ffffff?text=Demo+5",
    categoryName: "ไฟ",
  },
  {
    id: "preview-6",
    title: "แผ่นรองเมาส์ขนาดใหญ่",
    priceTHB: 199,
    compareAtPriceTHB: null,
    imageUrl: "https://placehold.co/600x600/ec4899/ffffff?text=Demo+6",
    categoryName: "ของแต่งโต๊ะ",
  },
];

export function isBespokeTemplate(templateId: string | null | undefined): boolean {
  if (!templateId) return false;
  const tpl = templates[templateId as TemplateId];
  return Boolean(tpl?.chrome?.Header && tpl?.pages?.home);
}

export function TemplatePreviewReal({
  templateId,
  displayName,
  slug,
  palette,
  page,
}: Props) {
  const tpl = templates[templateId as TemplateId];
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.42);

  // Recompute scale on resize so the 1280px storefront fits the available
  // wizard pane width. We render at full storefront size internally and use
  // CSS transform to shrink — pointer-events:none on the inner div prevents
  // clicks from leaking into the merchant's real cart store.
  useEffect(() => {
    const compute = () => {
      const w = wrapperRef.current?.clientWidth ?? 540;
      // 1280 = our internal render width; clamp to a sensible thumbnail range.
      setScale(Math.min(0.8, Math.max(0.25, w / 1280)));
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  const mockStore = useMemo(
    () => ({
      id: "preview",
      slug,
      name: displayName,
      description: "ร้านตัวอย่างสำหรับ preview",
      tagline: null,
      logoUrl: null,
      bannerUrl: null,
      primaryColor: palette.primary,
      // Footer adapters destructure these — provide nulls so destructuring
      // doesn't throw on missing keys.
      contactEmail: null,
      contactPhone: null,
      lineId: null,
      facebookUrl: null,
      instagramUrl: null,
      messengerUrl: null,
      twitterUrl: null,
      websiteUrl: null,
      addressLine1: null,
      addressLine2: null,
      subdistrict: null,
      district: null,
      province: null,
      postalCode: null,
      country: null,
    }),
    [slug, displayName, palette.primary],
  );

  if (!tpl) {
    return (
      <div className="grid h-full place-items-center text-xs text-zinc-500">
        ไม่พบ template ID: {templateId}
      </div>
    );
  }

  const HeaderComp = tpl.chrome?.Header;
  const FooterComp = tpl.chrome?.Footer;
  const StripComp = tpl.chrome?.AnnouncementStrip;
  const HomepageComp = tpl.pages?.home;

  return (
    <div
      ref={wrapperRef}
      className="relative overflow-hidden rounded-md border border-zinc-200 bg-white shadow-sm"
      style={{ height: 560 }}
    >
      <div
        style={{
          width: 1280,
          transformOrigin: "top left",
          transform: `scale(${scale})`,
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        {StripComp && (
          <StripComp storeName={displayName} message={undefined} mobileMessage={undefined} />
        )}
        {HeaderComp && (
          <HeaderComp
            storeSlug={slug}
            storeName={displayName}
            storeLogoUrl={null}
            categories={MOCK_CATEGORIES}
            accent={palette.accent}
          />
        )}
        {page === "home" && HomepageComp && (
          <HomepageComp
            store={mockStore}
            products={MOCK_PRODUCTS}
            categories={MOCK_CATEGORIES}
          />
        )}
        {FooterComp && (
          <FooterComp
            store={mockStore}
            categories={MOCK_CATEGORIES}
            accent={palette.accent}
          />
        )}
      </div>

      {/* Live-preview badge so reviewers know this is the actual template */}
      <span
        className="pointer-events-none absolute right-2 top-2 rounded-full bg-zinc-900/80 px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm"
        aria-hidden
      >
        ตัวอย่างจริง
      </span>
    </div>
  );
}
