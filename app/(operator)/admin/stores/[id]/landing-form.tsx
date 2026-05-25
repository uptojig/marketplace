"use client";

import { useState } from "react";
import { Sparkles, ExternalLink } from "lucide-react";

import { useLandingStatus } from "@/hooks/use-landing-status";

import { GenerateCard } from "./_landing/generate-card";
import { StatusCard } from "./_landing/status-card";
import { AdvancedPanel } from "./_landing/advanced-panel";

// DESIGN_FAMILIES picker removed from the form on operator request —
// the agent now picks the family automatically from brief content
// (per v3 design-family decision tree). The store row still records
// whatever family the agent settled on so the storefront layout's
// color cascade keeps working.

export interface LandingFormProps {
  storeId: string;
  storeSlug: string;
  hasLandingPage: boolean;
  landingTitle: string | null;
  landingThemeVariant: string | null;
  landingGeneratedAt: string | null;
  blockCount: number;
  /** Number of active (active=true) products in the store. Drives
   *  the marketing-mode Generate gate — the agent's OfferGrids look
   *  empty/repetitive below MIN_PRODUCTS_FOR_LANDING. */
  activeProductCount: number;
}

/**
 * Orchestrator for the admin landing-page panel. Owns the single
 * polling instance via `useLandingStatus` so the live status snapshot
 * can drive both the StatusCard variants and the disabled state of
 * the generate / advanced cards.
 *
 * Three sub-cards (all in `./_landing/*`):
 *   1. StatusCard      — generating / failed / has-blocks / empty
 *   2. GenerateCard    — primary "AI Generate" UI
 *   3. AdvancedPanel   — accordion with paste-JSON + recover-from-session
 */
export function LandingForm(props: LandingFormProps) {
  const [generating, setGenerating] = useState(false);
  const { status, consumeStream } = useLandingStatus(props.storeId, generating);

  const isGenerating = generating || status?.status === "generating";

  return (
    <div className="rounded-lg border bg-white p-5 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 font-semibold">
            <Sparkles className="h-4 w-4 text-amber-500" />
            🦆 Landing page (เป็ด)
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            หน้าเว็บ unique จาก agent — render ที่{" "}
            <code>/stores/{props.storeSlug}</code>
          </p>
        </div>
        <a
          href={`/stores/${props.storeSlug}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
        >
          ดูหน้าร้าน <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      <StatusCard
        status={status}
        fallback={{
          storeId: props.storeId,
          blockCount: props.blockCount,
          landingThemeVariant: props.landingThemeVariant,
          landingGeneratedAt: props.landingGeneratedAt,
          landingTitle: props.landingTitle,
        }}
      />
      <GenerateCard
        storeId={props.storeId}
        storeSlug={props.storeSlug}
        hasLandingPage={props.hasLandingPage}
        activeProductCount={props.activeProductCount}
        isGenerating={isGenerating}
        onGeneratingChange={setGenerating}
        consumeStream={consumeStream}
      />
      <AdvancedPanel
        storeId={props.storeId}
        landingTitle={props.landingTitle}
        isGenerating={isGenerating}
      />
    </div>
  );
}
