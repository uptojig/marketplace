// Provisioning orchestrator — public surface that callers (admin UI, API
// routes, the worker) use. The state machine lives in lib/provisioner/jobs.

import {
  ProvisioningJobStatus,
  ProvisioningJobType,
  ShopDeploymentStatus,
  PaymentWhitelistStatus,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { runJob, RetriableError, type JobResult } from "./jobs";

// ─────────────────────────────────────────────────────────────────────────
// Public: kick off a fresh provisioning chain for a store
// ─────────────────────────────────────────────────────────────────────────
export async function provisionStore(storeId: string): Promise<{
  deploymentId: string;
  resumed: boolean;
}> {
  const store = await prisma.store.findUniqueOrThrow({ where: { id: storeId } });

  let deployment = await prisma.shopDeployment.findUnique({ where: { storeId } });
  let resumed = false;

  if (!deployment) {
    deployment = await prisma.shopDeployment.create({
      data: { storeId, status: ShopDeploymentStatus.PENDING },
    });
  } else if (deployment.status === ShopDeploymentStatus.ACTIVE) {
    // Already running — nothing to do.
    return { deploymentId: deployment.id, resumed: true };
  } else {
    resumed = true;
  }

  // Cancel any half-finished jobs and queue a fresh chain start.
  await prisma.provisioningJob.updateMany({
    where: {
      deploymentId: deployment.id,
      status: { in: [ProvisioningJobStatus.QUEUED, ProvisioningJobStatus.RUNNING] },
    },
    data: { status: ProvisioningJobStatus.CANCELLED, finishedAt: new Date() },
  });

  // Decide entry point — re-resume from current state, don't always restart.
  const entry = resumeEntryPoint(deployment.status);
  await enqueueJob({ deploymentId: deployment.id, type: entry });

  // Touch store so admin UI re-renders with the new deployment id.
  void store; // referenced to ensure we error out on missing store earlier.

  return { deploymentId: deployment.id, resumed };
}

// Decide which job to enqueue when retrying / resuming. Always safe because
// every job is idempotent.
function resumeEntryPoint(status: ShopDeploymentStatus): ProvisioningJobType {
  switch (status) {
    case "PENDING":
    case "FAILED":
      return "CREATE_DROPLET";
    case "CREATING_DROPLET":
      return "WAIT_FOR_DROPLET_ACTIVE";
    case "CONFIGURING_DNS":
      return "CONFIGURE_DNS";
    case "DEPLOYING_APP":
      return "WAIT_FOR_APP_READY";
    case "READY_FOR_WHITELIST":
      return "REQUEST_PAYMENT_WHITELIST";
    default:
      return "HEALTH_CHECK";
  }
}

// ─────────────────────────────────────────────────────────────────────────
// Public: admin confirms the PG has whitelisted the IP → flip to ACTIVE
// ─────────────────────────────────────────────────────────────────────────
export async function confirmPaymentWhitelist(opts: {
  deploymentId: string;
  adminUserId: string;
  note?: string;
}): Promise<void> {
  const now = new Date();
  await prisma.shopDeployment.update({
    where: { id: opts.deploymentId },
    data: {
      paymentWhitelistStatus: PaymentWhitelistStatus.CONFIRMED,
      paymentWhitelistConfirmedAt: now,
      paymentWhitelistConfirmedBy: opts.adminUserId,
      paymentWhitelistNote: opts.note ?? null,
      status: ShopDeploymentStatus.ACTIVE,
    },
  });
}

export async function rejectPaymentWhitelist(opts: {
  deploymentId: string;
  adminUserId: string;
  reason: string;
}): Promise<void> {
  await prisma.shopDeployment.update({
    where: { id: opts.deploymentId },
    data: {
      paymentWhitelistStatus: PaymentWhitelistStatus.REJECTED,
      paymentWhitelistConfirmedBy: opts.adminUserId,
      paymentWhitelistNote: opts.reason,
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────
// Public: tear down completely (admin "delete shop")
// ─────────────────────────────────────────────────────────────────────────
// Synchronous variant — runs the teardown inline so the caller can then
// safely delete the Store row (which cascades into ShopDeployment). The
// async-job variant below is for the slow lane (orchestrator drain).
export async function tearDownDeploymentNow(storeId: string): Promise<void> {
  const deployment = await prisma.shopDeployment.findUnique({ where: { storeId } });
  if (!deployment) return;
  await runJob("DESTROY_DROPLET", {
    deploymentId: deployment.id,
    inputJson: null,
    attempt: 1,
  });
}

export async function deprovisionStore(storeId: string): Promise<void> {
  const deployment = await prisma.shopDeployment.findUnique({ where: { storeId } });
  if (!deployment) return;
  await enqueueJob({ deploymentId: deployment.id, type: "DESTROY_DROPLET" });
}

// ─────────────────────────────────────────────────────────────────────────
// Enqueue + worker primitives
// ─────────────────────────────────────────────────────────────────────────
export async function enqueueJob(opts: {
  deploymentId: string;
  type: ProvisioningJobType;
  inputJson?: Record<string, unknown>;
  delayMs?: number;
  maxAttempts?: number;
}) {
  return prisma.provisioningJob.create({
    data: {
      deploymentId: opts.deploymentId,
      type: opts.type,
      inputJson: (opts.inputJson ?? {}) as object,
      scheduledFor: opts.delayMs ? new Date(Date.now() + opts.delayMs) : new Date(),
      maxAttempts: opts.maxAttempts ?? 5,
    },
  });
}

// Claim + execute one job. Returns true if a job was processed, false if queue empty.
// Safe to call from a single-process loop or a cron poke endpoint.
export async function processNextJob(): Promise<boolean> {
  const now = new Date();

  // Claim the oldest queued job whose scheduledFor has passed. Use a
  // transaction + status check so two workers don't grab the same row.
  const job = await prisma.$transaction(async (tx) => {
    const candidate = await tx.provisioningJob.findFirst({
      where: { status: ProvisioningJobStatus.QUEUED, scheduledFor: { lte: now } },
      orderBy: { scheduledFor: "asc" },
    });
    if (!candidate) return null;

    // Compare-and-swap: only claim if still QUEUED.
    const updated = await tx.provisioningJob.updateMany({
      where: { id: candidate.id, status: ProvisioningJobStatus.QUEUED },
      data: { status: ProvisioningJobStatus.RUNNING, startedAt: now },
    });
    if (updated.count === 0) return null;
    return candidate;
  });

  if (!job) return false;

  try {
    const result: JobResult = await runJob(job.type, {
      deploymentId: job.deploymentId,
      inputJson: (job.inputJson ?? null) as Record<string, unknown> | null,
      attempt: job.attempt,
    });

    let nextJobId: string | null = null;
    if ("nextType" in result && result.nextType) {
      const next = await enqueueJob({
        deploymentId: job.deploymentId,
        type: result.nextType,
        inputJson: result.nextInput,
        delayMs: result.delayMs,
        maxAttempts: result.maxAttempts,
      });
      nextJobId = next.id;
    }

    await prisma.provisioningJob.update({
      where: { id: job.id },
      data: {
        status: ProvisioningJobStatus.SUCCEEDED,
        finishedAt: new Date(),
        nextJobId,
      },
    });
    return true;
  } catch (err) {
    const isRetriable = err instanceof RetriableError;
    const nextAttempt = job.attempt + 1;
    const errorMessage = err instanceof Error ? err.message : String(err);

    if (nextAttempt <= job.maxAttempts) {
      // Re-queue same job with exponential backoff (capped at 5 min).
      const backoffMs = Math.min(1000 * 2 ** job.attempt, 5 * 60 * 1000);
      await prisma.provisioningJob.update({
        where: { id: job.id },
        data: {
          status: ProvisioningJobStatus.QUEUED,
          attempt: nextAttempt,
          scheduledFor: new Date(Date.now() + backoffMs),
          errorMessage,
        },
      });
    } else {
      await prisma.provisioningJob.update({
        where: { id: job.id },
        data: {
          status: ProvisioningJobStatus.FAILED,
          finishedAt: new Date(),
          errorMessage,
        },
      });
      await prisma.shopDeployment.update({
        where: { id: job.deploymentId },
        data: {
          status: isRetriable ? undefined : ShopDeploymentStatus.FAILED,
          lastError: errorMessage,
          lastErrorAt: new Date(),
        },
      });
    }
    return true;
  }
}

// Drain — call from a long-running worker loop or a `/api/cron/provisioner-tick`
// endpoint. Returns when no more work is ready RIGHT NOW (delayed jobs left alone).
export async function drainQueue(opts: { maxJobs?: number } = {}): Promise<number> {
  const max = opts.maxJobs ?? 20;
  let processed = 0;
  for (let i = 0; i < max; i++) {
    const did = await processNextJob();
    if (!did) break;
    processed++;
  }
  return processed;
}
