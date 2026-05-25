"use client";

/**
 * New-store wizard — orchestrator.
 *
 * Holds the active step + persists the in-progress draft to localStorage
 * via `useWizardState`, fetches existing stores for the "Copy from
 * existing" picker, and drives the create + generate-landing pipeline
 * via `createStoreAndStream`. Step UIs live under `_steps/`.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { InfoStep, slugify, type ExistingStore } from "./_steps/info-step";
import { BriefStep } from "./_steps/brief-step";
import { GeneratingStep } from "./_steps/generating-step";
import { StepBadge } from "./_steps/step-badge";
import { useWizardState } from "./_steps/_use-wizard-state";
import { createStoreAndStream } from "./_steps/_create-store";

export default function NewStorePage() {
  const router = useRouter();
  const { draft, hydrated, update, updateStyle, reset } = useWizardState();
  const [existingStores, setExistingStores] = useState<ExistingStore[]>([]);
  const [styleSourceLabel, setStyleSourceLabel] = useState<string | null>(null);
  const [createdStoreId, setCreatedStoreId] = useState<string | null>(null);
  const [statusText, setStatusText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load existing stores for the "Copy from existing" picker. Failure
  // is non-fatal — the picker just hides itself when the list is empty.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/stores", { credentials: "same-origin" })
      .then((r) => (r.ok ? r.json() : { stores: [] }))
      .then((d) => {
        if (!cancelled) setExistingStores(d.stores ?? []);
      })
      .catch(() => {
        /* picker simply won't render */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function handleInfoSubmit() {
    if (slugify(draft.name).length < 2) {
      setError("ชื่อร้านต้องมีตัวอักษรอย่างน้อย 2 ตัว");
      return;
    }
    setError(null);
    update({ step: "brief" });
  }

  async function handleBriefSubmit() {
    if (draft.brief.trim().length < 5) {
      setError("ใส่ brief อย่างน้อย 5 ตัวอักษร");
      return;
    }
    setError(null);
    update({ step: "generating" });

    const result = await createStoreAndStream(
      {
        name: draft.name,
        slug: slugify(draft.name),
        description: draft.description,
        brief: draft.brief,
        engine: draft.engine,
        style: draft.style,
      },
      {
        onStatus: setStatusText,
        onCreated: setCreatedStoreId,
      },
    );

    if (!result.ok) {
      setError(result.error);
      update({ step: "info" });
      return;
    }
    reset();
    router.push(`/admin/stores/${result.storeId}`);
    router.refresh();
  }

  function handleResetDraft() {
    reset();
    setStyleSourceLabel(null);
    setError(null);
    setCreatedStoreId(null);
    setStatusText(null);
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-4 flex items-center justify-between gap-2">
        <Link
          href="/admin/stores"
          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
        >
          <ArrowLeft className="h-3 w-3" />
          กลับไปรายการร้าน
        </Link>
        {hydrated && draft.step !== "generating" && (draft.name || draft.brief) && (
          <button
            type="button"
            onClick={handleResetDraft}
            className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-stone-700"
            title="ล้างข้อมูลร่างทั้งหมด"
          >
            <RotateCcw className="h-3 w-3" />
            ล้างฟอร์ม
          </button>
        )}
      </div>

      <h1 className="text-2xl font-bold">สร้างร้านค้าใหม่</h1>

      <ol className="mt-4 mb-6 flex items-center gap-2 text-xs">
        <StepBadge active={draft.step === "info"} done={draft.step !== "info"} num={1}>
          ข้อมูลร้าน
        </StepBadge>
        <span className="h-px w-6 bg-stone-300" aria-hidden="true" />
        <StepBadge
          active={draft.step === "brief"}
          done={draft.step === "generating"}
          num={2}
        >
          บรีฟให้ AI ออกแบบ
        </StepBadge>
      </ol>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {draft.step === "info" && (
        <InfoStep
          name={draft.name}
          description={draft.description}
          existingStores={existingStores}
          hasCopiedStyle={!!styleSourceLabel}
          onChangeName={(v) => update({ name: v })}
          onChangeDescription={(v) => update({ description: v })}
          onCopyStyle={(style, sourceName) => {
            updateStyle(style);
            update({ showStyle: true });
            setStyleSourceLabel(sourceName);
          }}
          onSubmit={handleInfoSubmit}
        />
      )}

      {draft.step === "brief" && (
        <BriefStep
          name={draft.name}
          slug={slugify(draft.name)}
          description={draft.description}
          brief={draft.brief}
          engine={draft.engine}
          style={draft.style}
          showStyle={draft.showStyle}
          styleSourceLabel={styleSourceLabel}
          onChangeBrief={(v) => update({ brief: v })}
          onChangeEngine={(v) => update({ engine: v })}
          onChangeStyle={(patch) => updateStyle(patch)}
          onToggleStyle={() => update({ showStyle: !draft.showStyle })}
          onBack={() => update({ step: "info" })}
          onSubmit={handleBriefSubmit}
        />
      )}

      {draft.step === "generating" && (
        <GeneratingStep statusText={statusText} createdStoreId={createdStoreId} />
      )}
    </div>
  );
}
