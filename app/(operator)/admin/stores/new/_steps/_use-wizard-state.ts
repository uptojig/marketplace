"use client";

/**
 * useWizardState
 *
 * localStorage-backed draft persistence for the new-store wizard. Saves a
 * snapshot of every step's inputs under a versioned key so the operator
 * can refresh / accidentally navigate away without losing 2 minutes of
 * brief typing.
 *
 * SSR-safety:
 *   - The hook itself is a `"use client"` module — the wizard page that
 *     consumes it should be loaded via `next/dynamic` with `ssr: false`
 *     to avoid hydration mismatches between the server-rendered "empty"
 *     state and the client-rehydrated "restored" state.
 *   - Reads/writes are guarded by `typeof window !== "undefined"` so
 *     accidental SSR consumption degrades to in-memory state.
 *
 * Versioning:
 *   - Bump `WIZARD_STATE_VERSION` whenever the persisted shape changes;
 *     mismatched versions are dropped on load (no migration needed).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { TemplateStyleValues } from "@/components/store/template-style-picker";

const STORAGE_KEY = "admin:new-store-wizard:v1";
const WIZARD_STATE_VERSION = 1;

export type WizardStep = "info" | "brief" | "generating";

export type WizardEngine = "local" | "managed";

export type WizardDraft = {
  version: number;
  step: WizardStep;
  name: string;
  description: string;
  brief: string;
  engine: WizardEngine;
  style: TemplateStyleValues;
  showStyle: boolean;
};

export const EMPTY_STYLE: TemplateStyleValues = {
  templateId: "",
  paletteId: "",
  niche: "",
  brandVoice: "casual",
  landingThemeVariant: "",
};

export const EMPTY_DRAFT: WizardDraft = {
  version: WIZARD_STATE_VERSION,
  step: "info",
  name: "",
  description: "",
  brief: "",
  engine: "managed",
  style: EMPTY_STYLE,
  showStyle: false,
};

function readDraft(): WizardDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<WizardDraft> | null;
    if (!parsed || parsed.version !== WIZARD_STATE_VERSION) return null;
    // Never restore the "generating" step — it represents an in-flight
    // network operation that cannot be resumed after a page reload.
    const step: WizardStep =
      parsed.step === "brief" || parsed.step === "info" ? parsed.step : "info";
    return {
      ...EMPTY_DRAFT,
      ...parsed,
      step,
      style: { ...EMPTY_STYLE, ...(parsed.style ?? {}) },
    };
  } catch {
    return null;
  }
}

function writeDraft(draft: WizardDraft) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    /* quota / private-mode — silently drop */
  }
}

function clearDraft() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function useWizardState() {
  // Start with EMPTY_DRAFT on both server + first client render so the
  // markup matches. Restore on mount.
  const [draft, setDraft] = useState<WizardDraft>(EMPTY_DRAFT);
  const [hydrated, setHydrated] = useState(false);
  const skipFirstWrite = useRef(true);

  useEffect(() => {
    const restored = readDraft();
    if (restored) setDraft(restored);
    setHydrated(true);
  }, []);

  // Persist after hydration completes — skip the very first write so we
  // don't immediately overwrite a restored draft with EMPTY_DRAFT.
  useEffect(() => {
    if (!hydrated) return;
    if (skipFirstWrite.current) {
      skipFirstWrite.current = false;
      return;
    }
    writeDraft(draft);
  }, [draft, hydrated]);

  const update = useCallback((patch: Partial<WizardDraft>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  }, []);

  const updateStyle = useCallback(
    (patch: Partial<TemplateStyleValues>) => {
      setDraft((prev) => ({ ...prev, style: { ...prev.style, ...patch } }));
    },
    [],
  );

  const reset = useCallback(() => {
    clearDraft();
    setDraft(EMPTY_DRAFT);
  }, []);

  return {
    draft,
    hydrated,
    update,
    updateStyle,
    reset,
  };
}
