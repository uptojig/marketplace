"use client";

/**
 * Real-component template preview.
 *
 * Renders the ACTUAL chrome (Header/Footer) + page component from
 * lib/templates/registry.ts at storefront size (1280px), scaled down with
 * transform: scale + pointer-events: none so it fits the wizard preview
 * pane and clicks don't mutate the user's real cart store.
 *
 * Supports ALL page keys (home, catalog, pdp, cart, checkout, about, help,
 * lookbook). Tabs are dynamically generated from the template's pages object.
 */

import { useMemo, useRef, useState, useEffect } from "react";
import { templates } from "@/lib/templates/registry";
import type { TemplateId } from "@/lib/templates/types";
import type { Palette } from "@/lib/store/wizard-data";

/** All possible page keys from TemplatePages */
export type RealPageKey =
  | "home"
  | "catalog"
  | "pdp"
  | "cart"
  | "checkout"
  | "lookbook"
  | "about"
  | "help";

const PAGE_LABELS: Record<RealPageKey, string> = {
  home: "หน้าแรก",
  catalog: "สินค้า",
  pdp: "รายละเอียด",
  cart: "ตะกร้า",
  checkout: "ชำระเงิน",
  lookbook: "Lookbook",
  about: "เกี่ยวกับ",
  help: "ช่วยเหลือ",
};

type Props = {
  templateId: string;
  displayName: string;
  slug: string;
  palette: Palette;
  page: RealPageKey;
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

/** Returns true if the template has chrome + at least one page registered. */
export function isBespokeTemplate(templateId: string | null | undefined): boolean {
  if (!templateId) return false;
  const tpl = templates[templateId as TemplateId];
  return Boolean(tpl?.chrome?.Header && tpl?.pages);
}

/** Returns the available page keys for a given template. */
export function getAvailablePages(templateId: string | null | undefined): RealPageKey[] {
  if (!templateId) return [];
  const tpl = templates[templateId as TemplateId];
  if (!tpl?.pages) return [];
  const keys: RealPageKey[] = [];
  const pages = tpl.pages as Record<string, unknown>;
  for (const k of Object.keys(pages)) {
    if (pages[k]) keys.push(k as RealPageKey);
  }
  return keys;
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

  useEffect(() => {
    const compute = () => {
      const w = wrapperRef.current?.clientWidth ?? 540;
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

  // Resolve the page component dynamically
  const PageComp = tpl.pages?.[page as keyof typeof tpl.pages] as
    | React.ComponentType<Record<string, unknown>>
    | undefined;

  // Build page-specific props matching actual interfaces
  const pageProps = useMemo(() => {
    const base = {
      store: mockStore,
      products: MOCK_PRODUCTS,
      categories: MOCK_CATEGORIES,
    };
    switch (page) {
      case "home":
      case "lookbook":
        return base;
      case "catalog":
        // CatalogProps shape
        return {
          store: mockStore,
          pageProducts: MOCK_PRODUCTS,
          categoryNames: MOCK_CATEGORIES,
          categoryCounts: Object.fromEntries(
            MOCK_CATEGORIES.map((c) => [
              c,
              MOCK_PRODUCTS.filter((p) => p.categoryName === c).length,
            ]),
          ),
          selectedCats: [],
          sortKey: "newest",
          currentPage: 1,
          totalPages: 1,
          filteredCount: MOCK_PRODUCTS.length,
        };
      case "pdp":
        // ProductDetailProps shape
        return {
          store: mockStore,
          product: {
            id: MOCK_PRODUCTS[0].id,
            title: MOCK_PRODUCTS[0].title,
            description: "สินค้าตัวอย่าง คุณภาพดี จัดส่งไวทั่วไทย",
            priceTHB: MOCK_PRODUCTS[0].priceTHB,
            originalPriceTHB: MOCK_PRODUCTS[0].compareAtPriceTHB,
            imageUrl: MOCK_PRODUCTS[0].imageUrl,
            images: [MOCK_PRODUCTS[0].imageUrl, MOCK_PRODUCTS[1].imageUrl],
            variants: [
              { id: "v1", attributes: {}, colorLabel: "ดำ", sizeLabel: "M", materialLabel: null, priceTHB: MOCK_PRODUCTS[0].priceTHB, imageUrl: null },
              { id: "v2", attributes: {}, colorLabel: "ขาว", sizeLabel: "L", materialLabel: null, priceTHB: MOCK_PRODUCTS[0].priceTHB, imageUrl: null },
            ],
            categoryName: MOCK_PRODUCTS[0].categoryName,
          },
          relatedProducts: MOCK_PRODUCTS.slice(1, 4),
        };
      case "cart":
        return {
          ...base,
          items: MOCK_PRODUCTS.slice(0, 2).map((p) => ({
            ...p,
            quantity: 1,
          })),
        };
      case "checkout":
        return {
          ...base,
          items: MOCK_PRODUCTS.slice(0, 2).map((p) => ({
            ...p,
            quantity: 1,
          })),
        };
      case "about":
      case "help":
        return { store: mockStore };
      default:
        return base;
    }
  }, [page, mockStore]);

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
        {PageComp ? (
          <PageComp {...pageProps} />
        ) : (
          <div className="flex h-96 items-center justify-center text-zinc-400">
            หน้า &ldquo;{PAGE_LABELS[page]}&rdquo; ยังไม่มีในเทมเพลตนี้
          </div>
        )}
        {FooterComp && (
          <FooterComp
            store={mockStore}
            categories={MOCK_CATEGORIES}
            accent={palette.accent}
          />
        )}
      </div>

      <span
        className="pointer-events-none absolute right-2 top-2 rounded-full bg-zinc-900/80 px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm"
        aria-hidden
      >
        ตัวอย่างจริง · {PAGE_LABELS[page]}
      </span>
    </div>
  );
}
