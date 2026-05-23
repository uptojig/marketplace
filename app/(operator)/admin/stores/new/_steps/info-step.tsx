"use client";

/**
 * InfoStep — Step 1 of the new-store wizard.
 *
 * Captures the store name + description and shows the auto-derived URL
 * slug. Adds a "Copy from existing store" quick-pick (Popover + search
 * input) that lets the operator clone the template / palette / niche /
 * brand-voice from any existing store — saves a lot of click-fatigue
 * when bootstrapping a batch of similar shops.
 */

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Copy, Search } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { TemplateStyleValues } from "@/components/store/template-style-picker";

export type ExistingStore = {
  id: string;
  name: string;
  slug: string;
  templateId: string | null;
  paletteId: string | null;
  niche: string | null;
  brandVoice: string | null;
  landingThemeVariant: string | null;
};

export function slugify(value: string): string {
  // keep Thai chars (฀-๿) along with a-z0-9-
  return value
    .toLowerCase()
    .replace(/[^a-z0-9฀-๿-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

type InfoStepProps = {
  name: string;
  description: string;
  existingStores: ExistingStore[];
  hasCopiedStyle: boolean;
  onChangeName: (v: string) => void;
  onChangeDescription: (v: string) => void;
  onCopyStyle: (style: TemplateStyleValues, sourceName: string) => void;
  onSubmit: () => void;
};

export function InfoStep({
  name,
  description,
  existingStores,
  hasCopiedStyle,
  onChangeName,
  onChangeDescription,
  onCopyStyle,
  onSubmit,
}: InfoStepProps) {
  const slug = slugify(name);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="space-y-4"
    >
      <div>
        <label htmlFor="store-name" className="mb-1 block text-sm font-medium">
          ชื่อร้าน <span className="text-red-500" aria-hidden="true">*</span>
          <span className="sr-only">(จำเป็น)</span>
        </label>
        <input
          id="store-name"
          value={name}
          onChange={(e) => onChangeName(e.target.value)}
          placeholder="ร้านขนมไทย หรือ My Awesome Shop"
          required
          autoFocus
          aria-describedby="store-name-help"
          className="w-full rounded-md border px-3 py-2 text-sm"
        />
        <p
          id="store-name-help"
          className="mt-1 text-xs text-muted-foreground"
        >
          URL ของร้าน:{" "}
          <code className="rounded bg-stone-100 px-1.5 py-0.5 font-mono text-xs">
            /stores/{slug || "<slug>"}
          </code>
          <span className="ml-2 text-stone-400">— สร้างจากชื่ออัตโนมัติ</span>
        </p>
      </div>

      <div>
        <label
          htmlFor="store-description"
          className="mb-1 block text-sm font-medium"
        >
          คำอธิบายร้าน{" "}
          <span className="text-stone-400">(optional)</span>
        </label>
        <textarea
          id="store-description"
          value={description}
          onChange={(e) => onChangeDescription(e.target.value)}
          rows={3}
          placeholder="ขายอะไร เน้นกลุ่มลูกค้าไหน..."
          maxLength={500}
          className="w-full rounded-md border px-3 py-2 text-sm"
        />
      </div>

      {existingStores.length > 0 && (
        <CopyFromExistingPicker
          stores={existingStores}
          hasCopiedStyle={hasCopiedStyle}
          onCopy={onCopyStyle}
        />
      )}

      <div className="flex justify-end gap-2">
        <Link
          href="/admin/stores"
          className="inline-flex items-center gap-1.5 rounded-md border bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
          ยกเลิก
        </Link>
        <button
          type="submit"
          disabled={!slug}
          className="inline-flex items-center gap-1.5 rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          ถัดไป
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}

// ─── Copy-from-existing picker ────────────────────────────────────────
// Lightweight Popover + filterable list (no cmdk dep — the picker only
// needs name-prefix search across <200 stores). Picks template + palette
// + niche + brand voice + variant from the chosen source row.

function CopyFromExistingPicker({
  stores,
  hasCopiedStyle,
  onCopy,
}: {
  stores: ExistingStore[];
  hasCopiedStyle: boolean;
  onCopy: (style: TemplateStyleValues, sourceName: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return stores.slice(0, 50);
    return stores
      .filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.slug.toLowerCase().includes(q) ||
          (s.templateId ?? "").toLowerCase().includes(q),
      )
      .slice(0, 50);
  }, [stores, query]);

  function handlePick(source: ExistingStore) {
    onCopy(
      {
        templateId: source.templateId ?? "",
        paletteId: source.paletteId ?? "",
        niche: source.niche ?? "",
        brandVoice: source.brandVoice ?? "casual",
        landingThemeVariant: source.landingThemeVariant ?? "",
      },
      source.name,
    );
    setOpen(false);
    setQuery("");
  }

  return (
    <div className="rounded-md border bg-stone-50 px-3 py-2.5">
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs text-stone-600">
          <p className="font-medium text-stone-800">Copy template &amp; style</p>
          <p className="mt-0.5">
            {hasCopiedStyle
              ? "นำ template + palette + niche มาจากร้านที่มีอยู่แล้ว ✓"
              : "ลอก template + palette + niche จากร้านที่มีอยู่ — เร็วกว่าตั้งใหม่"}
          </p>
        </div>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-md border bg-white px-3 py-1.5 text-xs font-medium hover:bg-gray-50"
            >
              <Copy className="h-3.5 w-3.5" />
              เลือกร้าน
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="w-80 p-0"
          >
            <div className="border-b px-2.5 py-2">
              <div className="flex items-center gap-2 rounded-md border bg-white px-2 py-1">
                <Search className="h-3.5 w-3.5 text-stone-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="ค้นหาร้าน, slug, หรือ template..."
                  autoFocus
                  className="w-full bg-transparent text-xs outline-none placeholder:text-stone-400"
                  aria-label="ค้นหาร้านที่มีอยู่"
                />
              </div>
            </div>
            <ul
              role="listbox"
              aria-label="รายการร้านที่มีอยู่"
              className="max-h-64 overflow-y-auto py-1"
            >
              {filtered.length === 0 ? (
                <li className="px-3 py-4 text-center text-xs text-stone-400">
                  ไม่พบร้านที่ตรงกับ &ldquo;{query}&rdquo;
                </li>
              ) : (
                filtered.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => handlePick(s)}
                      role="option"
                      aria-selected="false"
                      className="flex w-full flex-col gap-0.5 px-3 py-1.5 text-left hover:bg-stone-100"
                    >
                      <span className="text-xs font-medium text-stone-800">
                        {s.name}
                      </span>
                      <span className="text-[10px] text-stone-500">
                        {s.templateId || "no-template"}
                        {s.niche ? ` · ${s.niche}` : ""}
                        {s.paletteId ? ` · ${s.paletteId}` : ""}
                      </span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
