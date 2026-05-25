"use client";

import { useEffect, useState } from "react";
import { Loader2, Wand2 } from "lucide-react";

import { type Block, TYPED_FORM_BLOCK_TYPES } from "./types";
import { HeroBannerForm } from "./block-forms/hero-banner-form";
import { OfferGridForm } from "./block-forms/offer-grid-form";
import { FaqForm } from "./block-forms/faq-form";
import { CtaForm } from "./block-forms/cta-form";
import { AiFixPanel } from "./ai-fix-panel";

export type BlockEditorPanelProps = {
  block: Block;
  blockIndex: number;
  busy: string | null;
  /** Saves manual edits — caller patches `block.content`. */
  onSaveManual: (nextContent: Record<string, unknown>) => Promise<void> | void;
  /** Forwards an AI instruction up to the parent's `aiFix` API call. */
  onAiFix: (instruction: string) => Promise<void> | void;
};

type EditMode = "manual" | "ai";

/**
 * Right-pane editor for the selected block. Two modes:
 *   - "manual" — typed form for the 4 most common block types, raw
 *     JSON textarea fallback for everything else
 *   - "ai" — quick-prompt chips + free-text instruction → server-side
 *     AI fix
 *
 * When the block changes (different selection or successful AI fix),
 * the typed-form sub-components reset their local state via key.
 */
export function BlockEditorPanel({
  block,
  blockIndex,
  busy,
  onSaveManual,
  onAiFix,
}: BlockEditorPanelProps) {
  const [editMode, setEditMode] = useState<EditMode>("manual");
  // Draft content holds in-progress edits for typed-form mode AND
  // JSON-mode (kept in sync). Reset on block change.
  const [draftContent, setDraftContent] = useState<Record<string, unknown>>(
    block.content,
  );
  const [editJson, setEditJson] = useState<string>(() =>
    JSON.stringify(block.content ?? {}, null, 2),
  );
  const [localMsg, setLocalMsg] = useState<string | null>(null);

  // Reset state when the selected block changes (different index or
  // content updated by AI fix). blockType changes are rare but also
  // handled.
  useEffect(() => {
    setDraftContent(block.content);
    setEditJson(JSON.stringify(block.content ?? {}, null, 2));
    setLocalMsg(null);
  }, [block, blockIndex]);

  const hasTypedForm = TYPED_FORM_BLOCK_TYPES.includes(block.blockType);

  async function handleSaveTyped() {
    setLocalMsg(null);
    await onSaveManual(draftContent);
  }

  async function handleSaveJson() {
    setLocalMsg(null);
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(editJson);
    } catch {
      setLocalMsg("JSON ไม่ถูกต้อง");
      return;
    }
    await onSaveManual(parsed);
  }

  function handleFormChange(next: Record<string, unknown>) {
    setDraftContent(next);
    // Keep the JSON view in sync for users who toggle between modes.
    setEditJson(JSON.stringify(next, null, 2));
  }

  return (
    <div className="rounded-md border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">
          #{blockIndex} — {block.blockType}
        </h3>
        <div className="flex gap-1" role="tablist" aria-label="Edit mode">
          <button
            type="button"
            role="tab"
            aria-selected={editMode === "manual"}
            onClick={() => setEditMode("manual")}
            className={`px-3 py-1 text-xs rounded ${
              editMode === "manual" ? "bg-gray-900 text-white" : "bg-gray-100"
            }`}
          >
            Manual
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={editMode === "ai"}
            onClick={() => setEditMode("ai")}
            className={`px-3 py-1 text-xs rounded ${
              editMode === "ai" ? "bg-amber-500 text-white" : "bg-gray-100"
            }`}
          >
            <Wand2 className="h-3 w-3 inline mr-1" />
            AI Fix
          </button>
        </div>
      </div>

      {editMode === "manual" ? (
        <>
          {hasTypedForm ? (
            <>
              <TypedForm
                block={block}
                content={draftContent}
                onChange={handleFormChange}
                disabled={busy !== null}
              />
              <button
                type="button"
                onClick={handleSaveTyped}
                disabled={busy !== null}
                className="inline-flex items-center gap-1.5 rounded bg-gray-900 px-4 py-2 text-xs font-medium text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {busy === "updateBlock" && (
                  <Loader2 className="h-3 w-3 animate-spin" />
                )}
                บันทึก
              </button>
            </>
          ) : (
            <>
              <textarea
                value={editJson}
                onChange={(e) => setEditJson(e.target.value)}
                rows={12}
                className="w-full rounded border px-3 py-2 font-mono text-xs"
                disabled={busy !== null}
                aria-label={`${block.blockType} JSON`}
              />
              <button
                type="button"
                onClick={handleSaveJson}
                disabled={busy !== null}
                className="inline-flex items-center gap-1.5 rounded bg-gray-900 px-4 py-2 text-xs font-medium text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {busy === "updateBlock" && (
                  <Loader2 className="h-3 w-3 animate-spin" />
                )}
                บันทึก
              </button>
            </>
          )}
        </>
      ) : (
        <AiFixPanel block={block} busy={busy !== null} onSubmit={onAiFix} />
      )}

      {localMsg && (
        <p
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
          role="alert"
        >
          {localMsg}
        </p>
      )}
    </div>
  );
}

function TypedForm({
  block,
  content,
  onChange,
  disabled,
}: {
  block: Block;
  content: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
  disabled: boolean;
}) {
  switch (block.blockType) {
    case "HeroBanner":
      return (
        <HeroBannerForm
          content={content}
          onChange={onChange}
          disabled={disabled}
        />
      );
    case "OfferGrid":
      return (
        <OfferGridForm
          content={content}
          onChange={onChange}
          disabled={disabled}
        />
      );
    case "FAQ":
      return (
        <FaqForm content={content} onChange={onChange} disabled={disabled} />
      );
    case "CTA":
      return (
        <CtaForm content={content} onChange={onChange} disabled={disabled} />
      );
    default:
      // Should be unreachable — guard rendered upstream via
      // TYPED_FORM_BLOCK_TYPES, but if a new typed block is added
      // without a form we silently fall through to nothing instead
      // of crashing.
      return null;
  }
}
