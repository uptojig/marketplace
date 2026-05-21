import Link from "next/link";
import { Server } from "lucide-react";
import { prisma } from "@/lib/prisma";
import type { ShopDeploymentStatus, PaymentWhitelistStatus } from "@prisma/client";
import {
  OperatorPageHeader,
  OperatorTable,
  OperatorFilterChips,
  OperatorStatusBadge,
  OperatorEmptyState,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  deploymentStatusTone,
  whitelistStatusTone,
} from "@/components/operator/operator-primitives";

export const dynamic = "force-dynamic";

const DEPLOY_LABEL: Record<ShopDeploymentStatus, string> = {
  PENDING: "รอเริ่ม",
  CREATING_DROPLET: "สร้าง Droplet",
  CONFIGURING_DNS: "ตั้ง DNS",
  DEPLOYING_APP: "ติดตั้งแอป",
  READY_FOR_WHITELIST: "พร้อม whitelist",
  WHITELIST_REQUESTED: "รอ PG confirm",
  ACTIVE: "Active",
  SUSPENDED: "ระงับ",
  FAILED: "ล้มเหลว",
  ARCHIVED: "ลบแล้ว",
};

const WHITELIST_LABEL: Record<PaymentWhitelistStatus, string> = {
  NOT_REQUESTED: "—",
  REQUESTED: "ส่งคำขอแล้ว",
  CONFIRMED: "✓ confirmed",
  REJECTED: "✗ rejected",
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

  const filterStatuses: ShopDeploymentStatus[] = [
    "READY_FOR_WHITELIST",
    "WHITELIST_REQUESTED",
    "ACTIVE",
    "FAILED",
    "PENDING",
    "ARCHIVED",
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <OperatorPageHeader
        title={
          <span className="flex items-center gap-2">
            <Server className="size-6 text-primary" />
            การจัดเตรียมร้านค้า (Multi-tenant Provisioning)
          </span>
        }
        description={`${deployments.length} deployment ทั้งหมด — แต่ละร้านมี Droplet + IP ของตัวเอง`}
      />

      <OperatorFilterChips
        items={[
          { label: "ทั้งหมด", href: "/admin/provisioning", active: !status },
          ...filterStatuses.map((s) => ({
            label: `${DEPLOY_LABEL[s]} (${countByStatus[s] ?? 0})`,
            href: `/admin/provisioning?status=${s}`,
            active: status === s,
          })),
        ]}
      />

      {deployments.length === 0 ? (
        <OperatorTable>
          <OperatorEmptyState
            icon={Server}
            title="ยังไม่มี deployment"
            description="เมื่อมีร้านเริ่มจัดเตรียม จะแสดงรายการที่นี่"
          />
        </OperatorTable>
      ) : (
        <OperatorTable>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ร้าน</TableHead>
                <TableHead>สถานะ deployment</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>PG whitelist</TableHead>
                <TableHead>Health</TableHead>
                <TableHead>สร้างเมื่อ</TableHead>
                <TableHead className="text-right" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {deployments.map((d) => {
                const ageMin = d.healthyAt
                  ? Math.floor((Date.now() - d.healthyAt.getTime()) / 60000)
                  : null;
                return (
                  <TableRow key={d.id}>
                    <TableCell>
                      <p className="font-medium text-foreground">{d.store.name}</p>
                      <p className="text-xs text-muted-foreground">/{d.store.slug}</p>
                      {d.store.customDomain && (
                        <code className="text-[10px] text-muted-foreground">{d.store.customDomain}</code>
                      )}
                    </TableCell>
                    <TableCell>
                      <OperatorStatusBadge tone={deploymentStatusTone[d.status] ?? "neutral"}>
                        {DEPLOY_LABEL[d.status]}
                      </OperatorStatusBadge>
                      {d.lastError && (
                        <p className="mt-1 max-w-xs truncate text-[11px] text-destructive" title={d.lastError}>
                          {d.lastError}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      {d.publicIpv4 ? (
                        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{d.publicIpv4}</code>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {d.paymentWhitelistStatus === "NOT_REQUESTED" ? (
                        <span className="text-xs text-muted-foreground">—</span>
                      ) : (
                        <OperatorStatusBadge tone={whitelistStatusTone[d.paymentWhitelistStatus] ?? "neutral"}>
                          {WHITELIST_LABEL[d.paymentWhitelistStatus]}
                        </OperatorStatusBadge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs">
                      {ageMin === null ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        <OperatorStatusBadge tone={ageMin < 5 ? "success" : "warning"}>
                          {ageMin < 5 ? `✓ ${ageMin}m ago` : `${ageMin}m ago`}
                        </OperatorStatusBadge>
                      )}
                      {d.missedHealthChecks > 0 && (
                        <OperatorStatusBadge tone="danger" className="ml-1">
                          {d.missedHealthChecks} miss
                        </OperatorStatusBadge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {d.createdAt.toLocaleString("th-TH", { dateStyle: "short", timeStyle: "short" })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/admin/provisioning/${d.id}`}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        ดูรายละเอียด →
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </OperatorTable>
      )}
    </div>
  );
}
