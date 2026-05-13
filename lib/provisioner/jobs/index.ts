// Provisioning job handlers — one function per ProvisioningJobType.
//
// Each handler:
//   - is idempotent (re-runnable without harming state)
//   - returns { nextType, nextInput } to chain into the next job, OR
//     { done: true } to terminate, OR throws to fail (worker handles retries)
//   - touches `ShopDeployment` for visible state transitions

import { ProvisioningJobType, ShopDeploymentStatus, PaymentWhitelistStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  createDroplet,
  destroyDroplet,
  getDroplet,
  publicIpv4,
  publicIpv6,
  privateIpv4,
  waitForDropletActive,
} from "../digitalocean";
import { upsertARecord, deleteRecord, resolveARecord } from "../cloudflare";
import { renderCloudInit } from "../cloud-init";
import { getConfig } from "../config";
import { notifyAdmin } from "../notifier";
import { randomBytes } from "crypto";

export type JobResult =
  | { done: true }
  | { nextType: ProvisioningJobType; nextInput?: Record<string, unknown>; delayMs?: number };

export type JobContext = {
  deploymentId: string;
  inputJson: Record<string, unknown> | null;
  attempt: number;
};

// ─────────────────────────────────────────────────────────────────────────
// CREATE_DROPLET
// ─────────────────────────────────────────────────────────────────────────
async function createDropletJob(ctx: JobContext): Promise<JobResult> {
  const cfg = getConfig();
  const deployment = await prisma.shopDeployment.findUniqueOrThrow({
    where: { id: ctx.deploymentId },
    include: { store: true },
  });

  // Idempotent: if droplet already exists, skip to wait.
  if (deployment.doDropletId) {
    return { nextType: "WAIT_FOR_DROPLET_ACTIVE" };
  }

  await prisma.shopDeployment.update({
    where: { id: ctx.deploymentId },
    data: { status: ShopDeploymentStatus.CREATING_DROPLET },
  });

  // Build the database connection string the shop will use. We pass the
  // master URL + per-shop schema name; the shop app sets search_path on
  // connect. (Defined in shop droplet image's prisma config — the schema
  // already exists thanks to provisionShopSchema below.)
  const schemaName = `shop_${deployment.store.slug.replace(/[^a-z0-9_]/g, "_")}`;
  await provisionShopSchema(schemaName);

  const databaseUrl = process.env.SHOP_DATABASE_URL ?? process.env.DATABASE_URL ?? "";
  if (!databaseUrl) throw new Error("SHOP_DATABASE_URL or DATABASE_URL must be set");

  const userData = renderCloudInit({
    shopId: deployment.storeId,
    shopSlug: deployment.store.slug,
    shopDomains: [
      `${deployment.store.slug}.${cfg.cfPlatformDomain}`,
      ...(deployment.store.customDomain ? [deployment.store.customDomain] : []),
    ],
    databaseUrl,
    databaseSchema: schemaName,
    internalApiSecret: cfg.internalApiSecret,
    controlPlaneBaseUrl: cfg.controlPlaneBaseUrl,
    useSnapshot: Boolean(cfg.doImageSnapshotId),
  });

  const droplet = await createDroplet({
    name: `shop-${deployment.store.slug}-${randomBytes(2).toString("hex")}`,
    userData,
    tags: ["marketplace", "shop", `shop:${deployment.store.slug}`],
    vpcUuid: cfg.doVpcUuid || undefined,
  });

  await prisma.shopDeployment.update({
    where: { id: ctx.deploymentId },
    data: {
      doDropletId: BigInt(droplet.id),
      doRegion: droplet.region.slug,
      doSize: droplet.size_slug,
      doImageSnapshotId: cfg.doImageSnapshotId || null,
    },
  });

  return { nextType: "WAIT_FOR_DROPLET_ACTIVE", delayMs: 10000 };
}

// ─────────────────────────────────────────────────────────────────────────
// WAIT_FOR_DROPLET_ACTIVE — poll DO until status=active + has public IP
// ─────────────────────────────────────────────────────────────────────────
async function waitForDropletActiveJob(ctx: JobContext): Promise<JobResult> {
  const d = await prisma.shopDeployment.findUniqueOrThrow({ where: { id: ctx.deploymentId } });
  if (!d.doDropletId) throw new Error("Deployment has no droplet id");

  // Per-job poll budget — we use this for each attempt so the worker
  // doesn't block the entire queue. If the droplet isn't ready in 60s,
  // we throw + retry the job (visibility timeout reschedules).
  const droplet = await getDroplet(Number(d.doDropletId));
  const ip = publicIpv4(droplet);
  if (droplet.status !== "active" || !ip) {
    // Schedule retry in 10s — counts toward attempt budget.
    throw new RetriableError(`Droplet ${d.doDropletId} not active yet (status=${droplet.status})`);
  }

  await prisma.shopDeployment.update({
    where: { id: ctx.deploymentId },
    data: {
      publicIpv4: ip,
      publicIpv6: publicIpv6(droplet),
      privateIpv4: privateIpv4(droplet),
      status: ShopDeploymentStatus.CONFIGURING_DNS,
    },
  });

  return { nextType: "CONFIGURE_DNS" };
}

// ─────────────────────────────────────────────────────────────────────────
// CONFIGURE_DNS — write A records for slug subdomain + (optional) custom domain
// ─────────────────────────────────────────────────────────────────────────
async function configureDnsJob(ctx: JobContext): Promise<JobResult> {
  const cfg = getConfig();
  const d = await prisma.shopDeployment.findUniqueOrThrow({
    where: { id: ctx.deploymentId },
    include: { store: true },
  });
  if (!d.publicIpv4) throw new Error("No public IP yet");

  // Subdomain: {slug}.{platform}
  const subdomain = `${d.store.slug}.${cfg.cfPlatformDomain}`;
  const sub = await upsertARecord({ name: subdomain, content: d.publicIpv4 });

  let apex: { id: string } | null = null;
  let www: { id: string } | null = null;
  if (d.store.customDomain && isInPlatformZone(d.store.customDomain, cfg.cfPlatformDomain)) {
    // Edge case: vendor's "custom domain" is actually a subdomain of our
    // platform zone — we own DNS, so write the records ourselves.
    apex = await upsertARecord({ name: d.store.customDomain, content: d.publicIpv4 });
  }
  // For truly third-party domains the vendor adds A records themselves —
  // we just verify later in WAIT_FOR_APP_READY.

  await prisma.shopDeployment.update({
    where: { id: ctx.deploymentId },
    data: {
      cfRecordIdSubdomain: sub.id,
      cfRecordIdApex: apex?.id ?? null,
      cfRecordIdWww: www?.id ?? null,
      status: ShopDeploymentStatus.DEPLOYING_APP,
    },
  });

  // Cloud-init takes ~60-90s on snapshot, ~5min on fresh image. Give it time.
  return { nextType: "WAIT_FOR_APP_READY", delayMs: 60_000 };
}

// ─────────────────────────────────────────────────────────────────────────
// WAIT_FOR_APP_READY — poll the slug subdomain's /api/health until 200
// ─────────────────────────────────────────────────────────────────────────
async function waitForAppReadyJob(ctx: JobContext): Promise<JobResult> {
  const cfg = getConfig();
  const d = await prisma.shopDeployment.findUniqueOrThrow({
    where: { id: ctx.deploymentId },
    include: { store: true },
  });

  // Probe via the slug subdomain (CF DNS only, not proxied), not the
  // raw IP — exercises the full DNS+TLS path Caddy will serve.
  const url = `https://${d.store.slug}.${cfg.cfPlatformDomain}/api/health`;
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(10_000),
      headers: { "user-agent": "marketplace-provisioner/1.0" },
    });
    if (!res.ok) {
      throw new RetriableError(`/api/health returned ${res.status}`);
    }
  } catch (err) {
    if (err instanceof RetriableError) throw err;
    throw new RetriableError(`Health check failed: ${err instanceof Error ? err.message : String(err)}`);
  }

  // If custom domain set, verify DNS lookup matches
  let customDomainVerified = d.customDomainVerified;
  if (d.store.customDomain && !isInPlatformZone(d.store.customDomain, cfg.cfPlatformDomain)) {
    const ips = await resolveARecord(d.store.customDomain);
    customDomainVerified = ips.includes(d.publicIpv4 ?? "");
  } else if (d.store.customDomain) {
    customDomainVerified = true;
  }

  await prisma.shopDeployment.update({
    where: { id: ctx.deploymentId },
    data: {
      status: ShopDeploymentStatus.READY_FOR_WHITELIST,
      customDomainVerified,
      customDomainVerifiedAt: customDomainVerified ? new Date() : null,
      customDomainLastChecked: new Date(),
      healthyAt: new Date(),
      missedHealthChecks: 0,
    },
  });

  return { nextType: "REQUEST_PAYMENT_WHITELIST" };
}

// ─────────────────────────────────────────────────────────────────────────
// REQUEST_PAYMENT_WHITELIST — emit admin notification; admin confirms manually
// ─────────────────────────────────────────────────────────────────────────
async function requestPaymentWhitelistJob(ctx: JobContext): Promise<JobResult> {
  const d = await prisma.shopDeployment.findUniqueOrThrow({
    where: { id: ctx.deploymentId },
    include: { store: true },
  });

  await prisma.shopDeployment.update({
    where: { id: ctx.deploymentId },
    data: {
      status: ShopDeploymentStatus.WHITELIST_REQUESTED,
      paymentWhitelistStatus: PaymentWhitelistStatus.REQUESTED,
      paymentWhitelistRequestedAt: new Date(),
    },
  });

  const cfg = getConfig();
  await notifyAdmin({
    level: "info",
    title: "🆕 ร้านใหม่รอ whitelist IP กับ Payment Provider",
    body: `ร้าน "${d.store.name}" (slug: ${d.store.slug}) deploy เสร็จแล้ว — กรุณาติดต่อ PG เพื่อ whitelist IP`,
    fields: {
      "Shop ID": d.storeId,
      "Public IP": d.publicIpv4 ?? "—",
      Subdomain: `${d.store.slug}.${cfg.cfPlatformDomain}`,
      "Custom Domain": d.store.customDomain ?? "—",
      "Confirm URL": `${cfg.controlPlaneBaseUrl}/admin/provisioning/${d.id}`,
    },
  });

  // Done — control plane stays in WHITELIST_REQUESTED until admin confirms via API.
  return { done: true };
}

// ─────────────────────────────────────────────────────────────────────────
// HEALTH_CHECK — periodic uptime poll; updates healthyAt / missedHealthChecks
// ─────────────────────────────────────────────────────────────────────────
async function healthCheckJob(ctx: JobContext): Promise<JobResult> {
  const cfg = getConfig();
  const d = await prisma.shopDeployment.findUniqueOrThrow({
    where: { id: ctx.deploymentId },
    include: { store: true },
  });
  if (!d.publicIpv4) return { done: true };

  const url = `https://${d.store.slug}.${cfg.cfPlatformDomain}/api/health`;
  let ok = false;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
    ok = res.ok;
  } catch {
    ok = false;
  }

  await prisma.shopDeployment.update({
    where: { id: ctx.deploymentId },
    data: ok
      ? { healthyAt: new Date(), missedHealthChecks: 0 }
      : { missedHealthChecks: { increment: 1 } },
  });

  if (!ok && (d.missedHealthChecks + 1) % 5 === 0) {
    await notifyAdmin({
      level: "warning",
      title: "⚠️ Shop droplet unhealthy",
      body: `Shop ${d.store.slug} (${d.publicIpv4}) failed ${d.missedHealthChecks + 1} health checks in a row`,
      fields: { URL: url },
    });
  }

  return { done: true };
}

// ─────────────────────────────────────────────────────────────────────────
// DESTROY_DROPLET — full teardown, cleans CF records too
// ─────────────────────────────────────────────────────────────────────────
async function destroyDropletJob(ctx: JobContext): Promise<JobResult> {
  const d = await prisma.shopDeployment.findUniqueOrThrow({ where: { id: ctx.deploymentId } });

  if (d.cfRecordIdSubdomain) await deleteRecord(d.cfRecordIdSubdomain).catch(() => {});
  if (d.cfRecordIdApex) await deleteRecord(d.cfRecordIdApex).catch(() => {});
  if (d.cfRecordIdWww) await deleteRecord(d.cfRecordIdWww).catch(() => {});

  if (d.doDropletId) {
    await destroyDroplet(Number(d.doDropletId)).catch(() => {});
  }

  await prisma.shopDeployment.update({
    where: { id: ctx.deploymentId },
    data: {
      status: ShopDeploymentStatus.ARCHIVED,
      publicIpv4: null,
      publicIpv6: null,
      privateIpv4: null,
      cfRecordIdSubdomain: null,
      cfRecordIdApex: null,
      cfRecordIdWww: null,
    },
  });
  return { done: true };
}

// ─────────────────────────────────────────────────────────────────────────
// dispatcher
// ─────────────────────────────────────────────────────────────────────────
export async function runJob(type: ProvisioningJobType, ctx: JobContext): Promise<JobResult> {
  switch (type) {
    case "CREATE_DROPLET":
      return createDropletJob(ctx);
    case "WAIT_FOR_DROPLET_ACTIVE":
      return waitForDropletActiveJob(ctx);
    case "CONFIGURE_DNS":
      return configureDnsJob(ctx);
    case "WAIT_FOR_APP_READY":
      return waitForAppReadyJob(ctx);
    case "REQUEST_PAYMENT_WHITELIST":
      return requestPaymentWhitelistJob(ctx);
    case "HEALTH_CHECK":
      return healthCheckJob(ctx);
    case "DESTROY_DROPLET":
      return destroyDropletJob(ctx);
    case "DEPLOY_UPDATE":
    case "ROTATE_IP":
      // Stub: image updates handled by on-droplet pull agent; rotate-ip is
      // a manual playbook because PG provider has to re-whitelist.
      return { done: true };
    default:
      throw new Error(`Unknown job type: ${type as string}`);
  }
}

// Marker error class. Worker uses instanceof check to schedule a retry
// instead of bumping failure count past max attempts.
export class RetriableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RetriableError";
  }
}

function isInPlatformZone(domain: string, platform: string): boolean {
  const d = domain.toLowerCase();
  const p = platform.toLowerCase();
  return d === p || d.endsWith(`.${p}`);
}

// Provision a per-shop Postgres schema using the master DATABASE_URL.
// We grant the shop app user permission to use the schema only; the schema
// itself is owned by the master role so we can drop it on archive.
async function provisionShopSchema(schemaName: string): Promise<void> {
  // Use Prisma's $executeRawUnsafe — schemaName comes from a tightly-scrubbed
  // slug ([a-z0-9_]+ only) so injection isn't possible.
  if (!/^[a-z0-9_]+$/.test(schemaName)) {
    throw new Error(`Invalid schema name: ${schemaName}`);
  }
  await prisma.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS "${schemaName}";`);
}
