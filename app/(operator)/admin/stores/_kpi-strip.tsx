/**
 * KPI strip at the top of /admin/stores.
 *
 * Four at-a-glance widgets:
 *   1. Total stores
 *   2. Stores pending approval (clickable → ?status=PENDING)
 *   3. Stores with low-image quality issues (clickable → ?quality=low)
 *   4. Total products across the marketplace
 *
 * Server-component friendly — pure markup, no event handlers.
 */

import Link from "next/link";
import { Store, ShieldAlert, ImageOff, Package } from "lucide-react";

import {
  OperatorStatCard,
  type StatusTone,
} from "@/components/operator/operator-primitives";

interface KpiStripProps {
  total: number;
  pending: number;
  lowQuality: number;
  totalProducts: number;
}

interface KpiCellProps {
  label: React.ReactNode;
  value: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  tone?: StatusTone;
}

/**
 * Wraps OperatorStatCard in an optional <Link> so KPI tiles can act as
 * one-click filter shortcuts without leaking link styling into the
 * shared primitive.
 */
function KpiCell({ label, value, icon, href, tone }: KpiCellProps) {
  const card = (
    <OperatorStatCard
      label={label}
      value={value}
      icon={icon as any}
      tone={tone}
    />
  );
  if (!href) return card;
  return (
    <Link
      href={href}
      className="block rounded-xl transition hover:ring-1 hover:ring-primary/40"
    >
      {card}
    </Link>
  );
}

export function KpiStrip({
  total,
  pending,
  lowQuality,
  totalProducts,
}: KpiStripProps) {
  const fmt = (n: number) => n.toLocaleString("th-TH");
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <KpiCell
        label="ร้านค้าทั้งหมด"
        value={fmt(total)}
        icon={Store}
        href="/admin/stores"
        tone="neutral"
      />
      <KpiCell
        label="รออนุมัติ"
        value={fmt(pending)}
        icon={ShieldAlert}
        href="/admin/stores?status=PENDING"
        tone={pending > 0 ? "warning" : "neutral"}
      />
      <KpiCell
        label="คุณภาพต่ำ"
        value={fmt(lowQuality)}
        icon={ImageOff}
        href="/admin/stores?quality=low"
        tone={lowQuality > 0 ? "danger" : "neutral"}
      />
      <KpiCell
        label="สินค้าทั้งระบบ"
        value={fmt(totalProducts)}
        icon={Package}
        tone="info"
      />
    </div>
  );
}
