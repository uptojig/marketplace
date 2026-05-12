"use client";

import { slugify, type WizardState } from "@/lib/store/wizard-data";

type Props = {
  state: WizardState;
  onChange: (patch: Partial<WizardState["launch"]>) => void;
};

export function PhaseLaunch({ state, onChange }: Props) {
  const slug = slugify(state.identity.name);
  const url = `${slug}.basketplace.co`;

  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
          ขั้นที่ 5 · เผยแพร่
        </p>
        <h2 className="text-xl font-semibold tracking-tight">
          🎉 ร้านค้าของคุณพร้อมเปิดแล้ว
        </h2>
        <p className="text-sm text-zinc-600">
          เลือกสถานะที่ต้องการ ผูกโดเมนส่วนตัวทำทีหลังได้ใน Dashboard
        </p>
      </header>

      <div className="rounded-lg border border-zinc-200 bg-white p-4">
        <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
          URL ของร้านคุณ
        </p>
        <p className="mt-1 font-mono text-sm">{url}</p>
      </div>

      <div className="space-y-2">
        <StatusOption
          id="draft"
          title="บันทึกเป็นแบบร่าง"
          desc="แค่คุณเห็น ปรับแต่งให้ลงตัวก่อนเปิดให้คนอื่นดู"
          icon="📝"
          active={state.launch.status === "draft"}
          onClick={() => onChange({ status: "draft" })}
        />
        <StatusOption
          id="live"
          title="เปิดร้านเลย"
          desc="ทุกคนเข้าดูและซื้อสินค้าได้ทันที"
          icon="🚀"
          active={state.launch.status === "live"}
          onClick={() => onChange({ status: "live" })}
        />
      </div>

      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-[11px] text-zinc-600">
        <p className="font-medium text-zinc-800">หลังเปิดร้าน:</p>
        <ul className="mt-1 space-y-0.5">
          <li>• ตั้งค่าช่องทางชำระเงิน (PromptPay / บัตรเครดิต)</li>
          <li>• ตั้งค่าจัดส่ง / ส่งฟรีขั้นต่ำ</li>
          <li>• ผูกโดเมนเนม (.com / .co.th) — แพ็คเกจมืออาชีพ</li>
        </ul>
      </div>
    </div>
  );
}

function StatusOption({
  title,
  desc,
  icon,
  active,
  onClick,
}: {
  id: string;
  title: string;
  desc: string;
  icon: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-start gap-3 rounded-lg border p-3 text-left transition ${
        active
          ? "border-zinc-900 bg-white ring-2 ring-zinc-900/10"
          : "border-zinc-200 bg-white hover:border-zinc-400"
      }`}
    >
      <span className="text-xl" aria-hidden>
        {icon}
      </span>
      <div className="flex-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-[11px] text-zinc-500">{desc}</p>
      </div>
    </button>
  );
}
