"use client";

import { useState } from "react";
import { Loader2, Wand2 } from "lucide-react";

import type { Block } from "./types";

/** Pre-baked instructions operators reach for most often. Clicking a
 *  chip both fills the textarea AND submits — single-click iteration. */
const QUICK_PROMPTS: ReadonlyArray<string> = [
  "ทำให้หัวข้อสั้นและกระตุก emotion",
  "เปลี่ยนโทนเป็นกันเองและน่ารัก",
  "ใส่ตัวเลขและสถิติให้น่าเชื่อถือ",
  "เน้นประโยชน์สำหรับลูกค้า ไม่ใช่ feature",
  "ลด jargon — ภาษาเรียบง่ายขึ้น",
];

export function AiFixPanel({
  block,
  busy,
  onSubmit,
}: {
  block: Block;
  busy: boolean;
  onSubmit: (instruction: string) => Promise<void> | void;
}) {
  const [instruction, setInstruction] = useState("");

  async function submit(raw: string) {
    const trimmed = raw.trim();
    if (!trimmed) return;
    await onSubmit(trimmed);
    setInstruction("");
  }

  return (
    <div className="space-y-3">
      <div className="rounded bg-gray-50 border p-3 max-h-40 overflow-y-auto">
        <pre className="text-[10px] text-gray-600 whitespace-pre-wrap">
          {JSON.stringify(block.content, null, 2).slice(0, 1000)}
        </pre>
      </div>

      <div>
        <p className="mb-1.5 text-[11px] font-medium text-stone-600">
          คำสั่งด่วน:
        </p>
        <div className="flex flex-wrap gap-1">
          {QUICK_PROMPTS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => void submit(p)}
              disabled={busy}
              className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] text-amber-800 hover:bg-amber-100 disabled:opacity-50"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <textarea
        value={instruction}
        onChange={(e) => setInstruction(e.target.value)}
        rows={3}
        placeholder='เช่น: "เปลี่ยน headline เป็น สินค้าลดราคา 50%"'
        className="w-full rounded border px-3 py-2 text-sm"
        disabled={busy}
        aria-label="AI fix instruction"
      />
      <button
        type="button"
        onClick={() => void submit(instruction)}
        disabled={busy || !instruction.trim()}
        className="inline-flex items-center gap-1.5 rounded bg-amber-500 px-4 py-2 text-xs font-bold text-white hover:bg-amber-600 disabled:opacity-50"
      >
        {busy ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Wand2 className="h-3 w-3" />
        )}
        AI แก้ให้
      </button>
    </div>
  );
}
