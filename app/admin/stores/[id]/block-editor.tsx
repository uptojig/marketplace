"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronUp,
  ChevronDown,
  Trash2,
  Pencil,
  Wand2,
  Plus,
  Loader2,
  Eye,
  X,
} from "lucide-react";

type Block = { blockType: string; content: Record<string, unknown> };
type Page = { slug: string; isHomepage?: boolean; blocks: Block[] };

interface Props {
  storeId: string;
  storeSlug: string;
  schema: {
    schemaVersion?: string;
    designFamily?: string;
    pages?: Page[];
  };
}

const BLOCK_TYPES = [
  "HeroBanner", "CategoryBanner", "ProductHero", "OfferGrid",
  "Gallery", "Bundle", "Stats", "Features", "Testimonial",
  "Reviews", "FAQ", "CTA", "Countdown",
];

function blockSummary(block: Block): string {
  const c = block.content ?? {};
  const arr = (v: unknown) => (Array.isArray(v) ? v : []);
  const str = (v: unknown) => (typeof v === "string" ? v : "");
  switch (block.blockType) {
    case "HeroBanner": return truncate(str(c.headline) || str(c.subheadline) || "Hero", 40);
    case "OfferGrid": return `${arr(c.items).length} สินค้า`;
    case "Stats": return `${arr(c.items).length} สถิติ`;
    case "Features": return `${arr(c.items).length} features`;
    case "FAQ": return `${arr(c.items).length} คำถาม`;
    case "Testimonial": return `${arr(c.quotes ?? c.items).length} รีวิว`;
    case "Reviews": return `${arr(c.items ?? c.reviews).length} รีวิว`;
    case "CTA": return truncate(str(c.headline) || str(c.buttonText) || "CTA", 40);
    case "ProductHero": return truncate(str(c.headline) || str(c.title) || "Product", 40);
    case "CategoryBanner": return `${arr(c.items ?? c.categories).length} หมวด`;
    case "Gallery": return `${arr(c.items ?? c.images).length} รูป`;
    case "Bundle": return truncate(str(c.title) || "Bundle", 40);
    case "Countdown": return truncate(str(c.headline) || "Countdown", 40);
    default: return block.blockType;
  }
}

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n) + "…" : s;
}

export function BlockEditor({ storeId, storeSlug, schema }: Props) {
  const router = useRouter();
  const pages = schema.pages ?? [];
  const [pageIdx, setPageIdx] = useState(0);
  const [selectedBlock, setSelectedBlock] = useState<number | null>(null);
  const [editMode, setEditMode] = useState<"manual" | "ai">("manual");
  const [editJson, setEditJson] = useState("");
  const [aiInstruction, setAiInstruction] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [addingBlock, setAddingBlock] = useState(false);
  // Local copy of pages for optimistic updates
  const [localPages, setLocalPages] = useState<Page[]>(pages);

  const page = localPages[pageIdx];
  const blocks = page?.blocks ?? [];

  async function callApi(body: Record<string, unknown>) {
    setMsg(null);
    setBusy(body.action as string);
    try {
      const res = await fetch(
        `/api/admin/stores/${storeId}/landing/blocks`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg({ ok: false, text: data.error ?? data.detail ?? `Error ${res.status}` });
        return null;
      }
      // Update local state with server response
      if (data.page?.blocks) {
        setLocalPages((prev) => {
          const next = [...prev];
          next[pageIdx] = { ...next[pageIdx], blocks: data.page.blocks };
          return next;
        });
      }
      setMsg({ ok: true, text: `${body.action} สำเร็จ` });
      router.refresh();
      return data;
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Network error" });
      return null;
    } finally {
      setBusy(null);
    }
  }

  function selectBlock(idx: number) {
    setSelectedBlock(idx);
    setEditJson(JSON.stringify(blocks[idx]?.content ?? {}, null, 2));
    setAiInstruction("");
    setMsg(null);
  }

  async function handleMove(blockIndex: number, direction: "up" | "down") {
    await callApi({ action: "moveBlock", pageIndex: pageIdx, blockIndex, direction });
  }

  async function handleDelete(blockIndex: number) {
    if (!confirm(`ลบ block "${blocks[blockIndex]?.blockType}"?`)) return;
    await callApi({ action: "deleteBlock", pageIndex: pageIdx, blockIndex });
    if (selectedBlock === blockIndex) setSelectedBlock(null);
  }

  async function handleSaveManual() {
    if (selectedBlock === null) return;
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(editJson);
    } catch {
      setMsg({ ok: false, text: "JSON ไม่ถูกต้อง" });
      return;
    }
    await callApi({
      action: "updateBlock",
      pageIndex: pageIdx,
      blockIndex: selectedBlock,
      block: { blockType: blocks[selectedBlock].blockType, content: parsed },
    });
  }

  async function handleAiFix() {
    if (selectedBlock === null || !aiInstruction.trim()) return;
    await callApi({
      action: "aiFix",
      pageIndex: pageIdx,
      blockIndex: selectedBlock,
      instruction: aiInstruction.trim(),
    });
    // Refresh the edit panel with new content
    const updated = localPages[pageIdx]?.blocks[selectedBlock];
    if (updated) {
      setEditJson(JSON.stringify(updated.content, null, 2));
    }
  }

  async function handleAddBlock(blockType: string) {
    await callApi({
      action: "addBlock",
      pageIndex: pageIdx,
      position: blocks.length,
      block: { blockType, content: {} },
    });
    setAddingBlock(false);
  }

  if (localPages.length === 0) return null;

  return (
    <div className="rounded-lg border bg-white p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-semibold">
          <Pencil className="h-4 w-4 text-blue-500" />
          Block Editor
        </h2>
        <a
          href={`/stores/${storeSlug}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
        >
          <Eye className="h-3 w-3" /> ดูหน้าร้าน
        </a>
      </div>

      {/* Page tabs */}
      <div className="flex flex-wrap gap-1 border-b pb-2">
        {localPages.map((p, i) => (
          <button
            key={p.slug}
            type="button"
            onClick={() => { setPageIdx(i); setSelectedBlock(null); }}
            className={`px-3 py-1.5 text-xs font-medium rounded-t ${
              i === pageIdx
                ? "bg-blue-50 text-blue-700 border border-b-0 border-blue-200"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {p.slug} {p.isHomepage ? "🏠" : ""} ({p.blocks.length})
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Block list — left */}
        <div className="lg:col-span-2 space-y-1">
          {blocks.map((block, i) => (
            <div
              key={i}
              onClick={() => selectBlock(i)}
              className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer transition ${
                selectedBlock === i
                  ? "border-blue-400 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <span className="flex-shrink-0 w-5 text-xs text-gray-400 font-mono">
                {i}
              </span>
              <div className="flex-1 min-w-0">
                <span className="font-medium text-xs text-blue-700">
                  {block.blockType}
                </span>
                <span className="ml-2 text-xs text-gray-500 truncate">
                  {blockSummary(block)}
                </span>
              </div>
              <div className="flex items-center gap-0.5 flex-shrink-0">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleMove(i, "up"); }}
                  disabled={i === 0 || busy !== null}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  title="ย้ายขึ้น"
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleMove(i, "down"); }}
                  disabled={i === blocks.length - 1 || busy !== null}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  title="ย้ายลง"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleDelete(i); }}
                  disabled={busy !== null}
                  className="p-1 text-red-400 hover:text-red-600 disabled:opacity-30"
                  title="ลบ"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}

          {/* Add block */}
          {addingBlock ? (
            <div className="rounded-md border border-dashed border-gray-300 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">เลือก block type:</span>
                <button type="button" onClick={() => setAddingBlock(false)} className="p-1">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1">
                {BLOCK_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => handleAddBlock(t)}
                    disabled={busy !== null}
                    className="px-2 py-1 text-xs bg-gray-100 hover:bg-blue-100 rounded"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAddingBlock(true)}
              className="w-full flex items-center justify-center gap-1 rounded-md border border-dashed border-gray-300 px-3 py-2 text-xs text-gray-500 hover:text-gray-700 hover:border-gray-400"
            >
              <Plus className="h-3.5 w-3.5" /> เพิ่ม Block
            </button>
          )}
        </div>

        {/* Edit panel — right */}
        <div className="lg:col-span-3">
          {selectedBlock !== null && blocks[selectedBlock] ? (
            <div className="rounded-md border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">
                  #{selectedBlock} — {blocks[selectedBlock].blockType}
                </h3>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setEditMode("manual")}
                    className={`px-3 py-1 text-xs rounded ${
                      editMode === "manual" ? "bg-gray-900 text-white" : "bg-gray-100"
                    }`}
                  >
                    Manual
                  </button>
                  <button
                    type="button"
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
                  <textarea
                    value={editJson}
                    onChange={(e) => setEditJson(e.target.value)}
                    rows={12}
                    className="w-full rounded border px-3 py-2 font-mono text-xs"
                    disabled={busy !== null}
                  />
                  <button
                    type="button"
                    onClick={handleSaveManual}
                    disabled={busy !== null}
                    className="inline-flex items-center gap-1.5 rounded bg-gray-900 px-4 py-2 text-xs font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                  >
                    {busy === "updateBlock" && <Loader2 className="h-3 w-3 animate-spin" />}
                    บันทึก
                  </button>
                </>
              ) : (
                <>
                  <div className="rounded bg-gray-50 border p-3 max-h-40 overflow-y-auto">
                    <pre className="text-[10px] text-gray-600 whitespace-pre-wrap">
                      {JSON.stringify(blocks[selectedBlock].content, null, 2).slice(0, 1000)}
                    </pre>
                  </div>
                  <textarea
                    value={aiInstruction}
                    onChange={(e) => setAiInstruction(e.target.value)}
                    rows={3}
                    placeholder='เช่น: "เปลี่ยน headline เป็น สินค้าลดราคา 50%"'
                    className="w-full rounded border px-3 py-2 text-sm"
                    disabled={busy !== null}
                  />
                  <button
                    type="button"
                    onClick={handleAiFix}
                    disabled={busy !== null || !aiInstruction.trim()}
                    className="inline-flex items-center gap-1.5 rounded bg-amber-500 px-4 py-2 text-xs font-bold text-white hover:bg-amber-600 disabled:opacity-50"
                  >
                    {busy === "aiFix" ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Wand2 className="h-3 w-3" />
                    )}
                    AI แก้ให้
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center rounded-md border border-dashed border-gray-200 p-8 text-sm text-gray-400">
              เลือก block จากรายการด้านซ้ายเพื่อแก้ไข
            </div>
          )}

          {msg && (
            <p
              className={`mt-2 rounded-md px-3 py-2 text-xs ${
                msg.ok
                  ? "border border-green-200 bg-green-50 text-green-700"
                  : "border border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {msg.text}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
