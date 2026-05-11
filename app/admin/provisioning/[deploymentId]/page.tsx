import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import WhitelistActions from "./WhitelistActions";
import DeploymentActions from "./DeploymentActions";
import type { ProvisioningJobStatus, ProvisioningJobType } from "@prisma/client";

export const dynamic = "force-dynamic";

const JOB_STATUS: Record<ProvisioningJobStatus, { label: string; cls: string }> = {
  QUEUED: { label: "Queued", cls: "bg-gray-100 text-gray-700" },
  RUNNING: { label: "Running", cls: "bg-blue-100 text-blue-800" },
  SUCCEEDED: { label: "OK", cls: "bg-green-100 text-green-800" },
  FAILED: { label: "Failed", cls: "bg-red-100 text-red-800" },
  CANCELLED: { label: "Cancelled", cls: "bg-gray-200 text-gray-500" },
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
        <h1 className="mt-2 text-2xl font-bold">{deployment.store.name}</h1>
        <p className="text-sm text-muted-foreground">
          Deployment: <code>{deployment.id}</code>
        </p>
      </div>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card title="ข้อมูล Droplet">
          <Row label="Status" value={<code>{deployment.status}</code>} />
          <Row label="Droplet ID" value={deployment.doDropletId ? String(deployment.doDropletId) : "—"} />
          <Row label="Region" value={deployment.doRegion ?? "—"} />
          <Row label="Size" value={deployment.doSize ?? "—"} />
          <Row label="Public IPv4" value={<code>{deployment.publicIpv4 ?? "—"}</code>} />
          <Row label="Private IPv4" value={<code>{deployment.privateIpv4 ?? "—"}</code>} />
          <Row label="Snapshot" value={deployment.doImageSnapshotId ?? "(fallback image)"} />
        </Card>

        <Card title="โดเมน + Health">
          <Row
            label="Subdomain"
            value={
              <a className="text-blue-600 hover:underline" href={`https://${subdomain}`} target="_blank">
                {subdomain} ↗
              </a>
            }
          />
          <Row
            label="Custom Domain"
            value={
              deployment.store.customDomain ? (
                <a
                  className="text-blue-600 hover:underline"
                  href={`https://${deployment.store.customDomain}`}
                  target="_blank"
                >
                  {deployment.store.customDomain} ↗
                </a>
              ) : (
                "—"
              )
            }
          />
          <Row
            label="Custom Domain Verified"
            value={
              deployment.customDomainVerified ? (
                <span className="text-green-700">✓ verified</span>
              ) : deployment.store.customDomain ? (
                <span className="text-amber-700">รอ DNS</span>
              ) : (
                "—"
              )
            }
          />
          <Row
            label="Last healthy"
            value={
              deployment.healthyAt
                ? deployment.healthyAt.toLocaleString("th-TH")
                : "—"
            }
          />
          <Row
            label="Missed checks"
            value={String(deployment.missedHealthChecks)}
          />
          <Row label="Running version" value={<code>{deployment.runningVersion ?? "—"}</code>} />
        </Card>
      </section>

      <section className="rounded-lg border bg-white p-5">
        <h2 className="mb-3 text-lg font-semibold">Payment Provider Whitelist</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-1 text-sm">
            <Row label="Status" value={<code>{deployment.paymentWhitelistStatus}</code>} />
            <Row
              label="Requested at"
              value={
                deployment.paymentWhitelistRequestedAt
                  ? deployment.paymentWhitelistRequestedAt.toLocaleString("th-TH")
                  : "—"
              }
            />
            <Row
              label="Confirmed at"
              value={
                deployment.paymentWhitelistConfirmedAt
                  ? deployment.paymentWhitelistConfirmedAt.toLocaleString("th-TH")
                  : "—"
              }
            />
            {deployment.paymentWhitelistNote && (
              <Row label="Note" value={deployment.paymentWhitelistNote} />
            )}
          </div>
          <WhitelistActions
            deploymentId={deployment.id}
            currentStatus={deployment.paymentWhitelistStatus}
            publicIp={deployment.publicIpv4}
          />
        </div>
      </section>

      <section className="rounded-lg border bg-white p-5">
        <h2 className="mb-3 text-lg font-semibold">การจัดการ Deployment</h2>
        <DeploymentActions
          storeId={deployment.storeId}
          storeSlug={deployment.store.slug}
          status={deployment.status}
        />
      </section>

      <section className="rounded-lg border bg-white p-5">
        <h2 className="mb-3 text-lg font-semibold">Provisioning Jobs</h2>
        <div className="overflow-hidden rounded-md border">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 text-left text-[10px] uppercase text-gray-500">
              <tr>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Attempt</th>
                <th className="px-3 py-2">Scheduled</th>
                <th className="px-3 py-2">Finished</th>
                <th className="px-3 py-2">Error</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {deployment.jobs.map((j) => (
                <tr key={j.id}>
                  <td className="px-3 py-2"><code>{j.type as ProvisioningJobType}</code></td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ${JOB_STATUS[j.status].cls}`}>
                      {JOB_STATUS[j.status].label}
                    </span>
                  </td>
                  <td className="px-3 py-2">{j.attempt}/{j.maxAttempts}</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {j.scheduledFor.toLocaleString("th-TH", { dateStyle: "short", timeStyle: "medium" })}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {j.finishedAt ? j.finishedAt.toLocaleString("th-TH", { dateStyle: "short", timeStyle: "medium" }) : "—"}
                  </td>
                  <td className="px-3 py-2 max-w-xs truncate text-red-700" title={j.errorMessage ?? ""}>
                    {j.errorMessage ?? ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-white p-5">
      <h2 className="mb-3 text-lg font-semibold">{title}</h2>
      <dl className="space-y-1 text-sm">{children}</dl>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm">{value}</dd>
    </div>
  );
}
