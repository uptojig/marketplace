"use client";

/**
 * Wizard right-side preview pane.
 *
 * Dynamically renders tabs for every page the selected template has.
 * If a template has pages.home + pages.catalog + pages.cart, the user
 * sees 3 tabs with the REAL bespoke components. Templates without
 * bespoke pages fall back to MultiPagePreview (family-level mockups).
 */

import { useState } from "react";
import {
  getPalette,
  getTemplate,
  type WizardState,
  slugify,
} from "@/lib/store/wizard-data";
import { MultiPagePreview } from "./preview-pages";
import {
  TemplatePreviewReal,
  isBespokeTemplate,
  getAvailablePages,
  type RealPageKey,
} from "./template-preview-real";

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
  state: WizardState;
};

export function LivePreview({ state }: Props) {
  const template = state.layout.templateId
    ? getTemplate(state.layout.templateId)
    : null;
  const displayName = state.identity.name.trim() || "ชื่อร้านของคุณ";
  const slug = slugify(state.identity.name) || "your-store";
  const palette = getPalette(state.identity.paletteId);
  const bespoke = isBespokeTemplate(state.layout.templateId);
  const allPages = getAvailablePages(state.layout.templateId);
  const availablePages = allPages.slice(0, 4); // max 4 tabs

  const [active, setActive] = useState<RealPageKey>("home");

  // Reset to "home" if the current tab isn't available in the new template
  const safePage = availablePages.includes(active) ? active : availablePages[0] ?? "home";

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-between text-[11px] text-zinc-500">
        <span className="font-mono">{slug}.basketplace.co</span>
        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-zinc-600">
          {template ? template.name : "ยังไม่เลือกเลย์เอาต์"}
          {availablePages.length > 0 && (
            <> · {availablePages.length} หน้า</>
          )}
        </span>
      </div>

      {bespoke && state.layout.templateId ? (
        <div className="space-y-2">
          {/* Dynamic tabs — only show pages the template has */}
          <div className="flex gap-1 overflow-x-auto rounded-lg bg-zinc-100 p-1">
            {availablePages.map((key) => (
              <button
                key={key}
                onClick={() => setActive(key)}
                className={`whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                  safePage === key
                    ? "bg-white text-zinc-900 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-700"
                }`}
              >
                {PAGE_LABELS[key]}
              </button>
            ))}
          </div>

          <TemplatePreviewReal
            templateId={state.layout.templateId}
            displayName={displayName}
            slug={slug}
            palette={palette}
            page={safePage}
          />
          <p className="text-[11px] text-zinc-500">
            ทุกแท็บแสดงดีไซน์จริงของเทมเพลตที่จะรันบนหน้าร้าน
          </p>
        </div>
      ) : (
        <>
          <MultiPagePreview
            template={template}
            displayName={displayName}
            slug={slug}
          />
          <p className="text-[11px] text-zinc-500">
            คลิกแท็บเพื่อพรีวิว 8 หน้าจริงของเทมเพลตนี้ — สี ตัวอักษร และ layout
            ตรงกับธีมของแต่ละ family ที่จะรันจริงบนหน้าร้าน
          </p>
        </>
      )}
    </div>
  );
}
