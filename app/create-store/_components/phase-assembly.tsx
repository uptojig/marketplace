"use client";

import { getTemplate, type WizardState } from "@/lib/store/wizard-data";

type Props = {
  state: WizardState;
};

export function PhaseAssembly({ state }: Props) {
  const template = state.layout.templateId
    ? getTemplate(state.layout.templateId)
    : null;

  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <p className="text-[11px] font-medium uppercase tracking-wide text-mp-ink-muted">
          ขั้นที่ 4 · ประกอบหน้าร้าน
        </p>
        <h2 className="text-xl font-semibold tracking-tight">
          ระบบจะประกอบทุกอย่างให้คุณ
        </h2>
        <p className="text-sm text-mp-ink-muted">
          ตรวจสอบสรุปด้านล่าง ถ้าครบแล้วกด &ldquo;สร้างร้านค้า&rdquo;
        </p>
      </header>

      <ul className="space-y-2 rounded-lg border border-mp-border bg-white p-4 text-sm">
        <SummaryRow
          label="ชื่อร้าน"
          value={state.identity.name || "—"}
          ok={Boolean(state.identity.name)}
        />
        <SummaryRow
          label="หมวดสินค้า"
          value={state.identity.niche ?? "—"}
          ok={Boolean(state.identity.niche)}
        />
        <SummaryRow
          label="เลย์เอาต์"
          value={template?.name ?? "—"}
          ok={Boolean(template)}
        />
        <SummaryRow
          label="โลโก้"
          value={state.identity.logoDataUrl ? "อัปโหลดแล้ว" : "ใช้ text logo จากชื่อร้าน"}
          ok={true}
        />
        <SummaryRow
          label="แบนเนอร์"
          value={state.identity.bannerDataUrl ? "อัปโหลดแล้ว" : "ใช้ gradient อัตโนมัติ"}
          ok={true}
        />
        <SummaryRow
          label="สินค้าชุดแรก"
          value={state.products.starterPack ? `${state.products.starterPack} ชิ้น` : "—"}
          ok={Boolean(state.products.starterPack)}
        />
      </ul>

      <div className="rounded-lg border border-dashed border-mp-border bg-mp-cream-alt/40 p-6 text-center">
        <p className="text-sm font-medium text-mp-ink">
          🪄 พร้อมเสกหน้าร้านอัตโนมัติ
        </p>
        <p className="mt-1 text-[11px] text-mp-ink-muted">
          ระบบจะใช้เวลา ~10 วินาทีในการประกอบทุกอย่าง
        </p>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  ok,
}: {
  label: string;
  value: string;
  ok: boolean;
}) {
  return (
    <li className="flex items-center justify-between gap-2 border-b border-mp-border pb-1.5 last:border-0 last:pb-0">
      <span className="text-mp-ink-muted">{label}</span>
      <span className="flex items-center gap-1.5 text-mp-ink">
        <span className={ok ? "text-emerald-600" : "text-amber-600"}>
          {ok ? "✓" : "•"}
        </span>
        {value}
      </span>
    </li>
  );
}
