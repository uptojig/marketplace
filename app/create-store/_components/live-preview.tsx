/**
 * Wizard right-side preview pane.
 *
 * Thin wrapper around MultiPagePreview which renders 8 page mockups
 * (Home / Category / PDP / Cart / Checkout / Order Success / Contact /
 * Policy) for the picked template's family. Replaces the previous
 * single-homepage preview that only mocked one page and used
 * behavior-flag tweaks for "variation" — the new preview communicates
 * the FULL design system the merchant is buying.
 */

import {
  getTemplate,
  slugify,
  type WizardState,
} from "@/lib/store/wizard-data";
import { MultiPagePreview } from "./preview-pages";

type Props = {
  state: WizardState;
};

export function LivePreview({ state }: Props) {
  const template = state.layout.templateId
    ? getTemplate(state.layout.templateId)
    : null;
  const displayName = state.identity.name.trim() || "ชื่อร้านของคุณ";
  const slug = slugify(state.identity.name) || "your-store";

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-between text-[11px] text-zinc-500">
        <span className="font-mono">{slug}.basketplace.co</span>
        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-zinc-600">
          {template ? template.name : "ยังไม่เลือกเลย์เอาต์"} ·{" "}
          {template ? `Pattern ${template.desktopPattern}` : "default"}
        </span>
      </div>

      <MultiPagePreview
        template={template}
        displayName={displayName}
        slug={slug}
      />

      <p className="text-[11px] text-zinc-500">
        คลิกแท็บเพื่อพรีวิว 8 หน้าจริงของเทมเพลตนี้ — สี ตัวอักษร และ layout
        ตรงกับธีมของแต่ละ family ที่จะรันจริงบนหน้าร้าน
      </p>
    </div>
  );
}
