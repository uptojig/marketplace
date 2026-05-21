import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import WhitelistActions from "./WhitelistActions";
import DeploymentActions from "./DeploymentActions";
import type { ProvisioningJobType } from "@prisma/client";
import {
  OperatorCard,
  OperatorDescriptionList,
  OperatorTable,
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
  jobStatusTone,
} from "@/components/operator/operator-primitives";

export const dynamic = "force-dynamic";

const JOB_STATUS_LABEL: Record<string, string> = {
  QUEUED: "Queued",
  RUNNING: "Running",
  SUCCEEDED: "OK",
  FAILED: "Failed",
  CANCELLED: "Cancelled",
};

export default async function ProvisioningDetailPage({
  params,
}: {
  params: { deploymentId: string };
}) {
  const deployment = await prisma.shopDeployment.findUnique({
    where: { id: params.deploymentId },
    include: {
      store: { select: { id: true, slug: true, name: true, customDomain: true } },
      jobs: { orderBy: { createdAt: "desc" }, take: 50 },
    },
  });

  if (!deployment) return notFound();

  const platformDomain = process.env.MAIN_DOMAIN ?? "basketplace.co";
  const subdomain = `${deployment.store.slug}.${platformDomain}`;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <Link
          href="/admin/provisioning"
          className="text-xs text-muted-foreground hover:underline"
        >
          ← กลับไปยังรายการ
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
          {deployment.store.name}
        </h1>
        <p className="text-sm text-muted-foreground">
          Deployment: <code>{deployment.id}</code>
        </p>
      </div>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <OperatorCard title="ข้อมูล Droplet">
          <OperatorDescriptionList
            items={[
              {
                term: "Status",
                description: (
                  <OperatorStatusBadge tone={deploymentStatusTone[deployment.status] ?? "neutral"}>
                    {deployment.status}
                  </OperatorStatusBadge>
                ),
              },
              { term: "Droplet ID", description: deployment.doDropletId ? String(deployment.doDropletId) : "—" },
              { term: "Region", description: deployment.doRegion ?? "—" },
              { term: "Size", description: deployment.doSize ?? "—" },
              { term: "Public IPv4", description: <code>{deployment.publicIpv4 ?? "—"}</code> },
              { term: "Private IPv4", description: <code>{deployment.privateIpv4 ?? "—"}</code> },
              { term: "Snapshot", description: deployment.doImageSnapshotId ?? "(fallback image)" },
            ]}
          />
        </OperatorCard>

        <OperatorCard title="โดเมน + Health">
          <OperatorDescriptionList
            items={[
              {
                term: "Subdomain",
                description: (
                  <a className="text-primary hover:underline" href={`https://${subdomain}`} target="_blank">
                    {subdomain} ↗
                  </a>
                ),
              },
              {
                term: "Custom Domain",
                description: deployment.store.customDomain ? (
                  <a
                    className="text-primary hover:underline"
                    href={`https://${deployment.store.customDomain}`}
                    target="_blank"
                  >
                    {deployment.store.customDomain} ↗
                  </a>
                ) : (
                  "—"
                ),
              },
              {
                term: "Custom Domain Verified",
                description: deployment.customDomainVerified ? (
                  <OperatorStatusBadge tone="success">✓ verified</OperatorStatusBadge>
                ) : deployment.store.customDomain ? (
                  <OperatorStatusBadge tone="warning">รอ DNS</OperatorStatusBadge>
                ) : (
                  "—"
                ),
              },
              {
                term: "Last healthy",
                description: deployment.healthyAt ? deployment.healthyAt.toLocaleString("th-TH") : "—",
              },
              { term: "Missed checks", description: String(deployment.missedHealthChecks) },
              { term: "Running version", description: <code>{deployment.runningVersion ?? "—"}</code> },
            ]}
          />
        </OperatorCard>
      </section>

      <OperatorCard title="Payment Provider Whitelist">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <OperatorDescriptionList
            items={[
              {
                term: "Status",
                description: (
                  <OperatorStatusBadge tone={whitelistStatusTone[deployment.paymentWhitelistStatus] ?? "neutral"}>
                    {deployment.paymentWhitelistStatus}
                  </OperatorStatusBadge>
                ),
              },
              {
                term: "Requested at",
                description: deployment.paymentWhitelistRequestedAt
                  ? deployment.paymentWhitelistRequestedAt.toLocaleString("th-TH")
                  : "—",
              },
              {
                term: "Confirmed at",
                description: deployment.paymentWhitelistConfirmedAt
                  ? deployment.paymentWhitelistConfirmedAt.toLocaleString("th-TH")
                  : "—",
              },
              ...(deployment.paymentWhitelistNote
                ? [{ term: "Note", description: deployment.paymentWhitelistNote }]
                : []),
            ]}
          />
          <WhitelistActions
            deploymentId={deployment.id}
            currentStatus={deployment.paymentWhitelistStatus}
            publicIp={deployment.publicIpv4}
          />
        </div>
      </OperatorCard>

      <OperatorCard title="การจัดการ Deployment">
        <DeploymentActions
          storeId={deployment.storeId}
          storeSlug={deployment.store.slug}
          status={deployment.status}
        />
      </OperatorCard>

      <OperatorTable title="Provisioning Jobs">
        {deployment.jobs.length === 0 ? (
          <OperatorEmptyState title="ยังไม่มี job" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Attempt</TableHead>
                <TableHead>Scheduled</TableHead>
                <TableHead>Finished</TableHead>
                <TableHead>Error</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deployment.jobs.map((j) => (
                <TableRow key={j.id}>
                  <TableCell>
                    <code className="text-xs">{j.type as ProvisioningJobType}</code>
                  </TableCell>
                  <TableCell>
                    <OperatorStatusBadge tone={jobStatusTone[j.status] ?? "neutral"}>
                      {JOB_STATUS_LABEL[j.status] ?? j.status}
                    </OperatorStatusBadge>
                  </TableCell>
                  <TableCell className="text-xs">
                    {j.attempt}/{j.maxAttempts}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {j.scheduledFor.toLocaleString("th-TH", { dateStyle: "short", timeStyle: "medium" })}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {j.finishedAt
                      ? j.finishedAt.toLocaleString("th-TH", { dateStyle: "short", timeStyle: "medium" })
                      : "—"}
                  </TableCell>
                  <TableCell
                    className="max-w-xs truncate text-xs text-destructive"
                    title={j.errorMessage ?? ""}
                  >
                    {j.errorMessage ?? ""}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </OperatorTable>
    </div>
  );
}
