"use client";

import { useMemo } from "react";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, Plus, X } from "lucide-react";

import { type Block, BLOCK_TYPES, blockSummary } from "./types";

export type BlockListProps = {
  blocks: Block[];
  selectedIndex: number | null;
  busy: boolean;
  addingBlock: boolean;
  onSelect: (idx: number) => void;
  onDelete: (idx: number) => void;
  onReorder: (from: number, to: number) => void;
  onSetAdding: (next: boolean) => void;
  onAddBlock: (blockType: string) => void;
};

/**
 * Sortable list of blocks using `@dnd-kit/sortable`. The drag handle
 * (grip icon) is the only drag activator — clicking anywhere else
 * still selects the block for editing. Reordering calls
 * `onReorder(from, to)` which the parent translates to a
 * `moveBlock` API call.
 *
 * Keyboard accessibility: arrow keys when the grip handle has focus
 * move the block up/down, Space activates drag, Escape cancels.
 */
export function BlockList({
  blocks,
  selectedIndex,
  busy,
  addingBlock,
  onSelect,
  onDelete,
  onReorder,
  onSetAdding,
  onAddBlock,
}: BlockListProps) {
  // dnd-kit identifies items by a stable id — index works because
  // moves are immediately reflected in the parent's local state.
  const ids = useMemo(() => blocks.map((_, i) => `block-${i}`), [blocks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      // 4-px tolerance prevents accidental drags when the user is
      // really trying to click the row to select.
      activationConstraint: { distance: 4 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));
    if (from === -1 || to === -1) return;
    // Compute the new ordering optimistically so we can pass straight
    // indices to the parent (which calls the moveBlock API).
    arrayMove(ids, from, to);
    onReorder(from, to);
  }

  return (
    <div className="space-y-1">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          {blocks.map((block, i) => (
            <SortableBlockRow
              key={ids[i]}
              id={ids[i]}
              index={i}
              block={block}
              selected={selectedIndex === i}
              busy={busy}
              onSelect={() => onSelect(i)}
              onDelete={() => onDelete(i)}
            />
          ))}
        </SortableContext>
      </DndContext>

      {addingBlock ? (
        <div className="rounded-md border border-dashed border-gray-300 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">เลือก block type:</span>
            <button
              type="button"
              onClick={() => onSetAdding(false)}
              className="p-1"
              aria-label="Cancel add block"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex flex-wrap gap-1">
            {BLOCK_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => onAddBlock(t)}
                disabled={busy}
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
          onClick={() => onSetAdding(true)}
          className="w-full flex items-center justify-center gap-1 rounded-md border border-dashed border-gray-300 px-3 py-2 text-xs text-gray-500 hover:text-gray-700 hover:border-gray-400"
        >
          <Plus className="h-3.5 w-3.5" /> เพิ่ม Block
        </button>
      )}
    </div>
  );
}

function SortableBlockRow({
  id,
  index,
  block,
  selected,
  busy,
  onSelect,
  onDelete,
}: {
  id: string;
  index: number;
  block: Block;
  selected: boolean;
  busy: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer transition ${
        selected
          ? "border-blue-400 bg-blue-50"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        className="cursor-grab touch-none p-0.5 text-gray-400 hover:text-gray-600 active:cursor-grabbing"
        aria-label={`Drag to reorder block ${index}`}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <span className="flex-shrink-0 w-5 text-xs text-gray-400 font-mono">
        {index}
      </span>
      <div className="flex-1 min-w-0">
        <span className="font-medium text-xs text-blue-700">
          {block.blockType}
        </span>
        <span className="ml-2 text-xs text-gray-500 truncate">
          {blockSummary(block)}
        </span>
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        disabled={busy}
        className="p-1 text-red-400 hover:text-red-600 disabled:opacity-30"
        title="ลบ"
        aria-label={`Delete block ${index}`}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
