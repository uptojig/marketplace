/**
 * Presentational cells shared by the list page columns and the KPI
 * strip. Extracted out so both can import the same Thai labels +
 * tone-class table without duplicating literals.
 *
 * Server-component friendly — no event handlers in here.
 */

import type { StoreApprovalStatus } from "@prisma/client";
import {
  OperatorStatusBadge,
  type StatusTone,
} from "@/components/operator/operator-primitives";

const STATUS_LABEL_TONE: Record<
  StoreApprovalStatus,
  { label: string; tone: StatusTone }
> = {
  PENDING: { label: "รอตรวจ", tone: "warning" },
  APPROVED: { label: "อนุมัติ", tone: "success" },
  REJECTED: { label: "ปฏิเสธ", tone: "danger" },
  SUSPENDED: { label: "ระงับ", tone: "neutral" },
};

export function ApprovalBadge({ status }: { status: StoreApprovalStatus }) {
  const { label, tone } = STATUS_LABEL_TONE[status];
  return <OperatorStatusBadge tone={tone}>{label}</OperatorStatusBadge>;
}

export function QualityPill({
  icon: Icon,
  label,
  done,
  total,
  invertColors,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  done: number;
  total: number;
  /** Used by the "low-image" pill: ok=0, bad=>0 (inverse of done/total) */
  invertColors?: boolean;
}) {
  const ok = invertColors ? done === 0 : done >= total && total > 0;
  const cls = ok
    ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
    : "bg-amber-50 text-amber-700 ring-amber-200";
  const text = invertColors ? `${done}` : `${done}/${total}`;
  return (
    <span
      title={label}
      className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold ring-1 ring-inset tabular-nums ${cls}`}
    >
      <Icon className="h-3 w-3" />
      {text}
    </span>
  );
}
