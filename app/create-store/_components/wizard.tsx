"use client";

import { useState, useTransition } from "react";
import {
  INITIAL_STATE,
  PHASES,
  type PhaseId,
  type WizardState,
} from "@/lib/store/wizard-data";
import { LivePreview } from "./live-preview";
import { PhaseAssembly } from "./phase-assembly";
import { PhaseIdentity } from "./phase-identity";
import { PhaseLaunch } from "./phase-launch";
import { PhaseLayout } from "./phase-layout";
import { PhaseProducts } from "./phase-products";
import { SubmitOverlay } from "./submit-overlay";

type WizardProps = {
  onSubmit?: (state: WizardState) => Promise<void>;
};

export function Wizard({ onSubmit }: WizardProps) {
  const [state, setState] = useState<WizardState>(INITIAL_STATE);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const patchIdentity = (p: Partial<WizardState["identity"]>) =>
    setState((s) => ({ ...s, identity: { ...s.identity, ...p } }));
  const patchLayout = (p: Partial<WizardState["layout"]>) =>
    setState((s) => ({ ...s, layout: { ...s.layout, ...p } }));
  const patchProducts = (p: Partial<WizardState["products"]>) =>
    setState((s) => ({ ...s, products: { ...s.products, ...p } }));
  const patchLaunch = (p: Partial<WizardState["launch"]>) =>
    setState((s) => ({ ...s, launch: { ...s.launch, ...p } }));

  const canAdvance = validate(state) && !pending;
  const goNext = () => {
    if (!canAdvance) return;
    if (state.phase < 5) {
      setState((s) => ({ ...s, phase: (s.phase + 1) as PhaseId }));
      return;
    }
    if (state.phase === 5 && onSubmit) {
      setError(null);
      startTransition(async () => {
        try {
          await onSubmit(state);
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการสร้างร้าน",
          );
        }
      });
    }
  };
  const goBack = () => {
    if (state.phase > 1)
      setState((s) => ({ ...s, phase: (s.phase - 1) as PhaseId }));
  };

  const ctaLabel = pending
    ? "กำลังสร้าง..."
    : state.phase === 4
    ? "🪄 สร้างร้านค้า"
    : state.phase === 5
    ? state.launch.status === "live"
      ? "🚀 เปิดร้าน"
      : "📝 บันทึกแบบร่าง"
    : "ถัดไป →";

  return (
    <div className="flex min-h-dvh flex-col bg-zinc-50">
      <ProgressBar current={state.phase} />

      <div className="grid flex-1 grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <section className="flex flex-col border-zinc-200 bg-white p-6 lg:border-r">
          <div className="mx-auto w-full max-w-md flex-1">
            <PhaseContent
              state={state}
              patchIdentity={patchIdentity}
              patchLayout={patchLayout}
              patchProducts={patchProducts}
              patchLaunch={patchLaunch}
            />
          </div>

          {error && (
            <div className="mx-auto mt-4 w-full max-w-md rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mx-auto mt-8 flex w-full max-w-md items-center justify-between gap-3 border-t border-zinc-100 pt-4">
            <button
              type="button"
              onClick={goBack}
              disabled={state.phase === 1 || pending}
              className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:opacity-40"
            >
              ← ย้อนกลับ
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={!canAdvance}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {ctaLabel}
            </button>
          </div>
        </section>

        <section className="bg-zinc-100 p-4 sm:p-6 lg:p-8">
          <LivePreview state={state} />
        </section>
      </div>

      {pending && state.phase === 5 && (
        <SubmitOverlay selectedCount={state.products.selectedProducts.length} />
      )}
    </div>
  );
}

function validate(state: WizardState): boolean {
  switch (state.phase) {
    case 1:
      return state.identity.name.trim().length > 0 && Boolean(state.identity.niche);
    case 2:
      return Boolean(state.layout.templateId);
    case 3:
      return Boolean(state.products.starterPack);
    case 4:
      return true;
    case 5:
      return true;
  }
}

function ProgressBar({ current }: { current: PhaseId }) {
  return (
    <div className="border-b border-zinc-200 bg-white px-4 py-3">
      <div className="mx-auto flex w-full max-w-5xl items-center gap-2">
        {PHASES.map((s, i) => {
          const isActive = s.id === current;
          const isDone = s.id < current;
          return (
            <div key={s.id} className="flex flex-1 items-center gap-2">
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold transition ${
                  isActive
                    ? "bg-zinc-900 text-white"
                    : isDone
                    ? "bg-zinc-700 text-white"
                    : "bg-zinc-200 text-zinc-600"
                }`}
              >
                {isDone ? "✓" : s.id}
              </div>
              <span
                className={`hidden truncate text-xs sm:inline ${
                  isActive ? "font-medium text-zinc-900" : "text-zinc-500"
                }`}
              >
                {s.title}
              </span>
              {i < PHASES.length - 1 && (
                <div
                  className={`ml-1 h-px flex-1 ${
                    isDone ? "bg-zinc-700" : "bg-zinc-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PhaseContent({
  state,
  patchIdentity,
  patchLayout,
  patchProducts,
  patchLaunch,
}: {
  state: WizardState;
  patchIdentity: (p: Partial<WizardState["identity"]>) => void;
  patchLayout: (p: Partial<WizardState["layout"]>) => void;
  patchProducts: (p: Partial<WizardState["products"]>) => void;
  patchLaunch: (p: Partial<WizardState["launch"]>) => void;
}) {
  switch (state.phase) {
    case 1:
      return <PhaseIdentity state={state} onChange={patchIdentity} />;
    case 2:
      return <PhaseLayout state={state} onChange={patchLayout} />;
    case 3:
      return <PhaseProducts state={state} onChange={patchProducts} />;
    case 4:
      return <PhaseAssembly state={state} />;
    case 5:
      return <PhaseLaunch state={state} onChange={patchLaunch} />;
  }
}
