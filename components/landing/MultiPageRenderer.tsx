/**
 * MultiPageRenderer
 *
 * Renders a v12 multi-page shop schema.
 * Reads URL slug → finds matching page → renders globalHeader + page blocks + globalFooter
 *
 * Usage:
 *   <MultiPageRenderer schema={shopSchema} pageSlug="products" storeSlug="my-store" />
 *
 * For homepage, pass pageSlug="" or "home"
 */

import type { MultiPageShopSchema } from "@/types/multi-page-schema";
import type { ThemeVariant } from "@/lib/landing/families";
import { isValidThemeVariant } from "@/lib/landing/families";
import { findPageBySlug } from "@/lib/multi-page-migration";

// Reuse existing block renderer (which has all 21 block components + theme tokens)
import { LandingPage, type Block } from "@/components/landing/BlockRenderer";

// New global components for v12
import { GlobalHeader } from "./GlobalHeader";
import { GlobalFooter } from "./GlobalFooter";

interface MultiPageRendererProps {
  schema: MultiPageShopSchema;
  pageSlug?: string;
  storeSlug: string;
}

export function MultiPageRenderer({ schema, pageSlug = "", storeSlug }: MultiPageRendererProps) {
  // Resolve design family to a ThemeVariant the existing renderer understands
  const raw = schema.designFamily ?? "A";
  const theme: ThemeVariant = isValidThemeVariant(raw) ? raw : "A";

  // Find the matching page
  const page = findPageBySlug(schema, pageSlug);

  if (!page) {
    return (
      <div className="min-h-screen flex flex-col">
        <GlobalHeader content={schema.globalHeader} theme={theme} storeSlug={storeSlug} />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-lg">
            <h1 className="text-6xl font-bold text-stone-900 mb-4">404</h1>
            <p className="text-xl text-stone-500 mb-8">ไม่พบหน้านี้</p>
            <a
              href={`/stores/${storeSlug}`}
              className="inline-block px-6 py-3 bg-stone-900 text-white rounded hover:bg-stone-800 transition"
            >
              กลับหน้าแรก
            </a>
          </div>
        </main>
        <GlobalFooter content={schema.globalFooter} theme={theme} storeSlug={storeSlug} />
      </div>
    );
  }

  // Normalize blocks: ensure blockType is set (v12 agent may use `type` instead)
  const blocks: Block[] = page.blocks.map((b) => ({
    ...b,
    blockType: b.blockType ?? b.type ?? "",
    content: b.content ?? {},
  }));

  return (
    <div className="min-h-screen flex flex-col">
      <GlobalHeader content={schema.globalHeader} theme={theme} storeSlug={storeSlug} />
      <main className="flex-1">
        <LandingPage blocks={blocks} theme={theme} storeSlug={storeSlug} />
      </main>
      <GlobalFooter content={schema.globalFooter} theme={theme} storeSlug={storeSlug} />
    </div>
  );
}
