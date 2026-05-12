"use client";

import { getNiche, type WizardState } from "@/lib/store/wizard-data";

type Props = {
  state: WizardState;
  onChange: (patch: Partial<WizardState["products"]>) => void;
};

const STARTER_PACKS = [
  { id: "10" as const, label: "10 สินค้าเริ่มต้น", hint: "เหมาะกับร้านที่อยากเริ่มเล็กๆ" },
  { id: "20" as const, label: "20 สินค้าขายดี", hint: "ค่าแนะนำ ส่วนใหญ่ใช้แพ็คนี้" },
  { id: "50" as const, label: "50 สินค้าครบไลน์", hint: "เหมาะกับร้านที่ต้องการสินค้าหลากหลาย" },
];

export function PhaseProducts({ state, onChange }: Props) {
  const niche = getNiche(state.identity.niche);

  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
          ขั้นที่ 3 · เลือกสินค้า
        </p>
        <h2 className="text-xl font-semibold tracking-tight">
          เลือกสินค้าชุดแรกจากคลัง
        </h2>
        <p className="text-sm text-zinc-600">
          ระบบเตรียมสินค้าแปลภาษาไทย ตรวจ IP filter และจัดหมวดเรียบร้อยแล้ว
          แค่เลือกแพ็คที่ใช่
        </p>
      </header>

      {niche ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
          <p className="text-xs text-emerald-800">
            <span aria-hidden>{niche.emoji}</span> กรองสำหรับหมวด{" "}
            <span className="font-semibold">{niche.label}</span> จากคลังกว่า
            12,400 รายการ
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
          ยังไม่ได้เลือกหมวดสินค้าใน Phase 1 — ระบบจะใช้สินค้าทั่วไป
        </div>
      )}

      <div className="space-y-2">
        {STARTER_PACKS.map((p) => {
          const active = state.products.starterPack === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onChange({ starterPack: p.id })}
              className={`flex w-full items-center justify-between gap-3 rounded-lg border p-3 text-left transition ${
                active
                  ? "border-zinc-900 bg-white ring-2 ring-zinc-900/10"
                  : "border-zinc-200 bg-white hover:border-zinc-400"
              }`}
            >
              <div>
                <p className="text-sm font-medium">{p.label}</p>
                <p className="text-[11px] text-zinc-500">{p.hint}</p>
              </div>
              <span className="text-xs font-semibold text-emerald-700">
                ฟรี
              </span>
            </button>
          );
        })}
      </div>

      <p className="text-[11px] text-zinc-500">
        เพิ่มสินค้าหรือลบสินค้าเองได้ใน Dashboard หลังจากเปิดร้าน
      </p>
    </div>
  );
}
