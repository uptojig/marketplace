"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Eye } from "lucide-react";

import { type Block, type Page } from "./_blocks/types";
import { BlockList } from "./_blocks/block-list";
import { BlockEditorPanel } from "./_blocks/block-editor-panel";

interface Props {
  storeId: string;
  storeSlug: string;
  schema: {
    schemaVersion?: string;
    designFamily?: string;
    pages?: Page[];
  };
}

/**
 * Orchestrator for the admin landing-page block editor.
 *
 * Lives next to `landing-form.tsx`; once a landing schema exists,
 * this surface lets operators reorder (via @dnd-kit/sortable),
 * edit (typed forms for the 4 most-common block types + JSON
 * fallback), add and delete blocks per page.
 *
 * All mutations are sent to `/api/admin/stores/[id]/landing/blocks`
 * which echoes the new page back so we can update local state
 * optimistically.
 */
export function BlockEditor({ storeId, storeSlug, schema }: Props) {
  const router = useRouter();
  const pages = schema.pages ?? [];
  const [pageIdx, setPageIdx] = useState(0);
  const [selectedBlock, setSelectedBlock] = useState<number | null>(null);
  const [addingBlock, setAddingBlock] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
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
        setMsg({
          ok: false,
          text: data.error ?? data.detail ?? `Error ${res.status}`,
        });
        return null;
      }
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
      setMsg({
        ok: false,
        text: e instanceof Error ? e.message : "Network error",
      });
      return null;
    } finally {
      setBusy(null);
    }
  }

  async function handleReorder(from: number, to: number) {
    if (from === to) return;
    // Optimistic local move so the list doesn't flicker waiting for
    // the round-trip — server response will sync if anything diverges.
    setLocalPages((prev) => {
      const next = [...prev];
      const curr = next[pageIdx];
      if (!curr) return prev;
      const moved = [...curr.blocks];
      const [item] = moved.splice(from, 1);
      moved.splice(to, 0, item);
      next[pageIdx] = { ...curr, blocks: moved };
      return next;
    });
    // The server-side endpoint expects `direction: up | down` per the
    // existing API contract — we translate any reorder into a sequence
    // of moves so we don't need a server change.
    const step = to > from ? "down" : "up";
    const distance = Math.abs(to - from);
    for (let i = 0; i < distance; i++) {
      const currentIdx = step === "down" ? from + i : from - i;
      await callApi({
        action: "moveBlock",
        pageIndex: pageIdx,
        blockIndex: currentIdx,
        direction: step,
      });
    }
  }

  async function handleDelete(blockIndex: number) {
    if (!confirm(`ลบ block "${blocks[blockIndex]?.blockType}"?`)) return;
    await callApi({ action: "deleteBlock", pageIndex: pageIdx, blockIndex });
    if (selectedBlock === blockIndex) setSelectedBlock(null);
  }

  async function handleSaveManual(nextContent: Record<string, unknown>) {
    if (selectedBlock === null) return;
    await callApi({
      action: "updateBlock",
      pageIndex: pageIdx,
      blockIndex: selectedBlock,
      block: {
        blockType: blocks[selectedBlock].blockType,
        content: nextContent,
      },
    });
  }

  async function handleAiFix(instruction: string) {
    if (selectedBlock === null) return;
    await callApi({
      action: "aiFix",
      pageIndex: pageIdx,
      blockIndex: selectedBlock,
      instruction,
    });
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

  const selected: Block | null =
    selectedBlock !== null ? (blocks[selectedBlock] ?? null) : null;

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

      <div
        className="flex flex-wrap gap-1 border-b pb-2"
        role="tablist"
        aria-label="Pages"
      >
        {localPages.map((p, i) => (
          <button
            key={p.slug}
            type="button"
            role="tab"
            aria-selected={i === pageIdx}
            onClick={() => {
              setPageIdx(i);
              setSelectedBlock(null);
            }}
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
        <div className="lg:col-span-2">
          <BlockList
            blocks={blocks}
            selectedIndex={selectedBlock}
            busy={busy !== null}
            addingBlock={addingBlock}
            onSelect={setSelectedBlock}
            onDelete={handleDelete}
            onReorder={handleReorder}
            onSetAdding={setAddingBlock}
            onAddBlock={handleAddBlock}
          />
        </div>

        <div className="lg:col-span-3">
          {selected ? (
            <BlockEditorPanel
              block={selected}
              blockIndex={selectedBlock!}
              busy={busy}
              onSaveManual={handleSaveManual}
              onAiFix={handleAiFix}
            />
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
              role={msg.ok ? "status" : "alert"}
            >
              {msg.text}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
