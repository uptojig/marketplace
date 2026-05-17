"use client";

import Link from "next/link";
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
    : "ดำเนินการต่อ →";

  // Primary CTA color: forest for "draft" choice on phase 5, coral elsewhere
  const isDraftCta = state.phase === 5 && state.launch.status !== "live";

  return (
    <div className="theme-marketplace flex min-h-dvh flex-col bg-mp-cream">
      <BrandBar />
      <ProgressBar current={state.phase} />

      <div className="grid flex-1 grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <section className="flex flex-col border-mp-border bg-white p-6 lg:border-r">
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
            <div className="mx-auto mt-4 w-full max-w-md rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mx-auto mt-8 flex w-full max-w-md items-center justify-between gap-3 border-t border-mp-border pt-4">
            <button
              type="button"
              onClick={goBack}
              disabled={state.phase === 1 || pending}
              className="rounded-xl px-3 py-2 text-sm font-medium text-mp-ink-muted transition hover:bg-mp-cream-alt/50 hover:text-mp-ink disabled:opacity-40"
            >
              ← ย้อนกลับ
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={!canAdvance}
              className={`inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:transform-none ${
                isDraftCta
                  ? "bg-mp-forest hover:bg-mp-forest/90"
                  : "bg-mp-coral hover:bg-mp-coral-dark"
              }`}
            >
              {ctaLabel}
            </button>
          </div>
        </section>

        <section className="bg-mp-cream-alt/60 p-4 sm:p-6 lg:p-8">
          <LivePreview state={state} />
        </section>
      </div>
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

function BrandBar() {
  return (
    <div className="border-b border-mp-border bg-white">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="text-[15px] font-bold text-mp-coral-dark hover:opacity-80 transition-opacity"
          style={{ fontFamily: "var(--mp-font-display)" }}
        >
          Basketplace
          <span className="ml-2 text-[12px] font-medium uppercase tracking-[0.12em] text-mp-ink-muted">
            สร้างร้านใหม่
          </span>
        </Link>
        <Link
          href="/dashboard"
          className="text-[13px] text-mp-ink-muted hover:text-mp-coral transition-colors"
        >
          บันทึกแบบร่าง · ออก
        </Link>
      </div>
    </div>
  );
}

function ProgressBar({ current }: { current: PhaseId }) {
  return (
    <div className="border-b border-mp-border bg-white px-4 py-4">
      <div className="mx-auto flex w-full max-w-5xl items-center gap-2">
        {PHASES.map((s, i) => {
          const isActive = s.id === current;
          const isDone = s.id < current;
          return (
            <div key={s.id} className="flex flex-1 items-center gap-2">
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold transition ${
                  isActive
                    ? "bg-mp-coral text-white shadow-sm"
                    : isDone
                    ? "bg-mp-forest text-white"
                    : "bg-mp-cream-alt text-mp-ink-muted"
                }`}
              >
                {isDone ? "✓" : s.id}
              </div>
              <span
                className={`hidden truncate text-[13px] sm:inline ${
                  isActive
                    ? "font-semibold text-mp-ink"
                    : isDone
                    ? "text-mp-forest font-medium"
                    : "text-mp-ink-muted"
                }`}
              >
                {s.title}
              </span>
              {i < PHASES.length - 1 && (
                <div
                  className={`ml-1 h-px flex-1 ${
                    isDone ? "bg-mp-forest" : "bg-mp-border"
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
