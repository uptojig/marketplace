"use client";

/**
 * BriefStep — Step 2 of the new-store wizard.
 *
 * The operator describes (in plain Thai/English) what the AI should
 * design. Also exposes an optional Template/Style override panel so
 * power-users can lock in a template BEFORE the AI runs, plus the
 * managed-vs-local engine toggle.
 */

import * as React from "react";
import { ArrowLeft, Wand2 } from "lucide-react";
import {
  TemplateStylePicker,
  type TemplateStyleValues,
} from "@/components/store/template-style-picker";

type BriefStepProps = {
  name: string;
  slug: string;
  description: string;
  brief: string;
  engine: "local" | "managed";
  style: TemplateStyleValues;
  showStyle: boolean;
  styleSourceLabel: string | null;
  onChangeBrief: (v: string) => void;
  onChangeEngine: (v: "local" | "managed") => void;
  onChangeStyle: (patch: Partial<TemplateStyleValues>) => void;
  onToggleStyle: () => void;
  onBack: () => void;
  onSubmit: () => void;
};

export function BriefStep({
  name,
  slug,
  description,
  brief,
  engine,
  style,
  showStyle,
  styleSourceLabel,
  onChangeBrief,
  onChangeEngine,
  onChangeStyle,
  onToggleStyle,
  onBack,
  onSubmit,
}: BriefStepProps) {
  const briefTooShort = brief.trim().length < 5;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!briefTooShort) onSubmit();
      }}
      className="space-y-4"
    >
      <div className="rounded-md border bg-stone-50 px-4 py-3 text-sm">
        <p className="font-medium">{name}</p>
        <p className="mt-0.5 text-xs text-stone-500">
          <code>/stores/{slug}</code>
          {description ? ` — ${description}` : ""}
        </p>
        {styleSourceLabel && (
          <p className="mt-1 text-xs text-emerald-700">
            ✓ ใช้ style จาก &ldquo;{styleSourceLabel}&rdquo;
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="ai-brief"
          className="mb-1 block text-sm font-medium"
        >
          บรีฟให้ AI ออกแบบหน้าเว็บ{" "}
          <span className="text-red-500" aria-hidden="true">*</span>
          <span className="sr-only">(จำเป็น)</span>
        </label>
        <textarea
          id="ai-brief"
          value={brief}
          onChange={(e) => onChangeBrief(e.target.value)}
          rows={5}
          autoFocus
          placeholder='เช่น: "ขายเคสมือถือพรีเมียม iPhone 15 Pro เน้นคุณภาพสูง ดีไซน์ minimal" หรือ "ขายขนมไทยสูตรโบราณ เน้นลูกค้าวัยทำงาน"'
          maxLength={4000}
          aria-describedby="ai-brief-help"
          className="w-full rounded-md border px-3 py-2 text-sm"
        />
        <div
          id="ai-brief-help"
          className="mt-2 flex flex-wrap items-center gap-3 text-xs"
        >
          <span className="text-stone-600">
            🎨 Design family — เป็ดเลือกอัตโนมัติจาก brief
          </span>
          <label className="flex items-center gap-1.5 text-stone-700">
            <input
              type="checkbox"
              checked={engine === "managed"}
              onChange={(e) =>
                onChangeEngine(e.target.checked ? "managed" : "local")
              }
              className="h-3.5 w-3.5 rounded border-stone-300"
            />
            <span title="Anthropic Managed Agent (v3 landing-builder) — single-shot, prompt updated centrally">
              🤖 ใช้ Managed Agent
            </span>
          </label>
        </div>
      </div>

      {/* Optional template / style override — collapsed by default so
          the AI-from-brief path stays the fast happy path. */}
      <div className="rounded-md border bg-white">
        <button
          type="button"
          onClick={onToggleStyle}
          aria-expanded={showStyle}
          aria-controls="template-style-panel"
          className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm font-medium hover:bg-stone-50"
        >
          <span>
            Template &amp; Style{" "}
            <span className="text-xs font-normal text-stone-500">
              (optional — บังคับ template ก่อน AI ทำงาน)
            </span>
          </span>
          <span className="text-xs text-stone-500" aria-hidden="true">
            {showStyle ? "▲" : "▼"}
          </span>
        </button>
        {showStyle && (
          <div id="template-style-panel" className="border-t px-4 py-3">
            <TemplateStylePicker
              embedded
              values={style}
              onChange={onChangeStyle}
            />
          </div>
        )}
      </div>

      <div className="flex justify-between gap-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-md border bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
          ย้อนกลับ
        </button>
        <button
          type="submit"
          disabled={briefTooShort}
          className="inline-flex items-center gap-1.5 rounded-md bg-amber-500 px-5 py-2 text-sm font-bold text-white shadow-md hover:bg-amber-600 disabled:opacity-50"
        >
          <Wand2 className="h-4 w-4" />
          สร้างร้านพร้อมออกแบบ
        </button>
      </div>
    </form>
  );
}
