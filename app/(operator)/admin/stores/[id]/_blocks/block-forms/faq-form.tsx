"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

type FaqItem = { question: string; answer: string };

function coerceItems(raw: unknown): FaqItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((it) => {
    const obj = (typeof it === "object" && it !== null ? it : {}) as Record<
      string,
      unknown
    >;
    return {
      question: typeof obj.question === "string" ? obj.question : "",
      answer: typeof obj.answer === "string" ? obj.answer : "",
    };
  });
}

export function FaqForm({
  content,
  onChange,
  disabled,
}: {
  content: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
  disabled?: boolean;
}) {
  const [items, setItems] = useState<FaqItem[]>(() =>
    coerceItems(content.items),
  );
  const [headline, setHeadline] = useState<string>(
    typeof content.headline === "string" ? content.headline : "",
  );

  function emit(nextItems: FaqItem[], nextHeadline: string) {
    onChange({ ...content, headline: nextHeadline, items: nextItems });
  }

  function updateItem(idx: number, patch: Partial<FaqItem>) {
    const next = items.map((it, i) => (i === idx ? { ...it, ...patch } : it));
    setItems(next);
    emit(next, headline);
  }

  function addItem() {
    const next = [...items, { question: "", answer: "" }];
    setItems(next);
    emit(next, headline);
  }

  function removeItem(idx: number) {
    const next = items.filter((_, i) => i !== idx);
    setItems(next);
    emit(next, headline);
  }

  return (
    <div className="space-y-3" aria-label="FAQ form">
      <label className="block">
        <span className="mb-1 block text-[11px] font-medium text-stone-600">
          Headline
        </span>
        <input
          value={headline}
          onChange={(e) => {
            setHeadline(e.target.value);
            emit(items, e.target.value);
          }}
          disabled={disabled}
          className="w-full rounded border px-3 py-1.5 text-sm"
        />
      </label>
      <div className="space-y-2">
        {items.map((it, i) => (
          <div
            key={i}
            className="rounded-md border border-stone-200 bg-stone-50/50 p-2 space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium uppercase text-stone-500">
                Q{i + 1}
              </span>
              <button
                type="button"
                onClick={() => removeItem(i)}
                disabled={disabled}
                className="text-red-500 hover:text-red-700 disabled:opacity-30"
                aria-label={`Remove question ${i + 1}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <input
              value={it.question}
              onChange={(e) => updateItem(i, { question: e.target.value })}
              disabled={disabled}
              placeholder="คำถาม"
              className="w-full rounded border px-2 py-1 text-xs"
              aria-label={`Question ${i + 1}`}
            />
            <textarea
              value={it.answer}
              onChange={(e) => updateItem(i, { answer: e.target.value })}
              disabled={disabled}
              placeholder="คำตอบ"
              rows={2}
              className="w-full rounded border px-2 py-1 text-xs"
              aria-label={`Answer ${i + 1}`}
            />
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addItem}
        disabled={disabled}
        className="inline-flex items-center gap-1 rounded border border-dashed border-stone-300 px-3 py-1.5 text-xs text-stone-600 hover:border-stone-400 disabled:opacity-50"
      >
        <Plus className="h-3 w-3" /> เพิ่มคำถาม
      </button>
    </div>
  );
}
