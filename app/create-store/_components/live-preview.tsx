"use client";

/**
 * Wizard right-side preview pane.
 *
 * Two-mode preview:
 *
 *   1) Bespoke template (≈30/53 — those with chrome+pages.home in
 *      lib/templates/registry.ts) → render the REAL chrome + Homepage
 *      component at storefront size, scaled to fit the pane, with
 *      pointer-events:none so the user's cart isn't mutated. This is
 *      what the user sees when the published store loads, so picking
 *      `talad-see-sod` finally shows the red brutalist Thai chrome
 *      instead of a generic "everyday" abstract sketch.
 *
 *   2) Skin-only / no-template → fall back to MultiPagePreview which
 *      paints the family-level abstract mockups (8 page tabs).
 *
 * Home tab uses the real component for bespoke templates. Other tabs
 * (cart/category/pdp/checkout/success/contact/policy) stay on the
 * family-level abstract because templates without bespoke pages share
 * those routes with the family fallback anyway — the abstract IS the
 * truth for them.
 */

import { useState } from "react";
import {
  getPalette,
  getTemplate,
  type WizardState,
  slugify,
} from "@/lib/store/wizard-data";
import {
  MultiPagePreview,
  PreviewPagesTabs,
  PageMockup,
  type PageKey,
} from "./preview-pages";
import {
  TemplatePreviewReal,
  isBespokeTemplate,
} from "./template-preview-real";

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

  const [active, setActive] = useState<PageKey>("home");

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-between text-[11px] text-zinc-500">
        <span className="font-mono">{slug}.basketplace.co</span>
        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-zinc-600">
          {template ? template.name : "ยังไม่เลือกเลย์เอาต์"}
        </span>
      </div>

      {bespoke && state.layout.templateId ? (
        <div className="space-y-2">
          <PreviewPagesTabs active={active} onChange={setActive} />
          {active === "home" ? (
            <TemplatePreviewReal
              templateId={state.layout.templateId}
              displayName={displayName}
              slug={slug}
              palette={palette}
              page="home"
            />
          ) : (
            <div className="overflow-hidden rounded-md border border-zinc-200 shadow-sm" style={{ minHeight: 400 }}>
              <PageMockup
                template={template}
                displayName={displayName}
                slug={slug}
                page={active}
              />
            </div>
          )}
          <p className="text-[11px] text-zinc-500">
            แท็บ &ldquo;หน้าแรก&rdquo; แสดงดีไซน์จริงของเทมเพลตที่จะรันบนหน้าร้าน · แท็บอื่นแสดง mockup ของ family
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
