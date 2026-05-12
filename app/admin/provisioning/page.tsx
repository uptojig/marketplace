import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { ShopDeploymentStatus, PaymentWhitelistStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

const DEPLOY_BADGE: Record<ShopDeploymentStatus, { label: string; cls: string }> = {
  PENDING: { label: "รอเริ่ม", cls: "bg-gray-100 text-gray-700" },
  CREATING_DROPLET: { label: "สร้าง Droplet", cls: "bg-blue-100 text-blue-800" },
  CONFIGURING_DNS: { label: "ตั้ง DNS", cls: "bg-blue-100 text-blue-800" },
  DEPLOYING_APP: { label: "ติดตั้งแอป", cls: "bg-blue-100 text-blue-800" },
  READY_FOR_WHITELIST: { label: "พร้อม whitelist", cls: "bg-amber-100 text-amber-800" },
  WHITELIST_REQUESTED: { label: "รอ PG confirm", cls: "bg-amber-100 text-amber-800" },
  ACTIVE: { label: "Active", cls: "bg-green-100 text-green-800" },
  SUSPENDED: { label: "ระงับ", cls: "bg-gray-200 text-gray-700" },
  FAILED: { label: "ล้มเหลว", cls: "bg-red-100 text-red-800" },
  ARCHIVED: { label: "ลบแล้ว", cls: "bg-gray-100 text-gray-500" },
};

const WHITELIST_BADGE: Record<PaymentWhitelistStatus, { label: string; cls: string }> = {
  NOT_REQUESTED: { label: "—", cls: "text-gray-400" },
  REQUESTED: { label: "ส่งคำขอแล้ว", cls: "text-amber-700 font-medium" },
  CONFIRMED: { label: "✓ confirmed", cls: "text-green-700 font-medium" },
  REJECTED: { label: "✗ rejected", cls: "text-red-700 font-medium" },
};

export default async function AdminProvisioningPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const status = searchParams.status as ShopDeploymentStatus | undefined;

  const deployments = await prisma.shopDeployment.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      store: { select: { id: true, slug: true, name: true, customDomain: true } },
      _count: { select: { jobs: true } },
    },
  });

  const counts = await prisma.shopDeployment.groupBy({
    by: ["status"],
    _count: { _all: true },
  });
  const countByStatus = Object.fromEntries(counts.map((c) => [c.status, c._count._all]));

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">การจัดเตรียมร้านค้า (Multi-tenant Provisioning)</h1>
          <p className="text-sm text-muted-foreground">
            {deployments.length} deployment ทั้งหมด — แต่ละร้านมี Droplet + IP ของตัวเอง
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        <FilterChip href="/admin/provisioning" active={!status} label="ทั้งหมด" />
        {(
          [
            "READY_FOR_WHITELIST",
            "WHITELIST_REQUESTED",
            "ACTIVE",
            "FAILED",
            "PENDING",
            "ARCHIVED",
          ] as ShopDeploymentStatus[]
        ).map((s) => (
          <FilterChip
            key={s}
            href={`/admin/provisioning?status=${s}`}
            active={status === s}
            label={`${DEPLOY_BADGE[s].label} (${countByStatus[s] ?? 0})`}
          />
        ))}
      </div>

      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">ร้าน</th>
              <th className="px-4 py-3">สถานะ deployment</th>
              <th className="px-4 py-3">IP</th>
              <th className="px-4 py-3">PG whitelist</th>
              <th className="px-4 py-3">Health</th>
              <th className="px-4 py-3">สร้างเมื่อ</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {deployments.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                  ยังไม่มี deployment
                </td>
              </tr>
            ) : (
              deployments.map((d) => {
                const badge = DEPLOY_BADGE[d.status];
                const wlBadge = WHITELIST_BADGE[d.paymentWhitelistStatus];
                const ageMin = d.healthyAt
                  ? Math.floor((Date.now() - d.healthyAt.getTime()) / 60000)
                  : null;
                return (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium">{d.store.name}</p>
                      <p className="text-xs text-muted-foreground">/{d.store.slug}</p>
                      {d.store.customDomain && (
                        <code className="text-[10px] text-muted-foreground">{d.store.customDomain}</code>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded px-2 py-0.5 text-[11px] font-medium ${badge.cls}`}>
                        {badge.label}
                      </span>
                      {d.lastError && (
                        <p className="mt-1 max-w-xs truncate text-[11px] text-red-700" title={d.lastError}>
                          {d.lastError}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {d.publicIpv4 ? (
                        <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">{d.publicIpv4}</code>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className={`px-4 py-3 text-xs ${wlBadge.cls}`}>{wlBadge.label}</td>
                    <td className="px-4 py-3 text-xs">
                      {ageMin === null ? (
                        <span className="text-muted-foreground">—</span>
                      ) : ageMin < 5 ? (
                        <span className="text-green-700">✓ {ageMin}m ago</span>
                      ) : (
                        <span className="text-amber-700">{ageMin}m ago</span>
                      )}
                      {d.missedHealthChecks > 0 && (
                        <span className="ml-2 text-red-700">({d.missedHealthChecks} miss)</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {d.createdAt.toLocaleString("th-TH", { dateStyle: "short", timeStyle: "short" })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/provisioning/${d.id}`}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        ดูรายละเอียด →
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FilterChip({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      className={
        active
          ? "rounded-full bg-black px-3 py-1 text-white"
          : "rounded-full border bg-white px-3 py-1 hover:bg-gray-50"
      }
    >
      {label}
    </Link>
  );
}
