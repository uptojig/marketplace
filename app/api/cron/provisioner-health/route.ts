// GET /api/cron/provisioner-health
//
// Triggered every 5 minutes. Enqueues a HEALTH_CHECK job per ACTIVE deployment
// so the worker drains them. Spreading the work across the queue avoids
// running all 200+ /health probes inside one cron invocation.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { enqueueJob } from "@/lib/provisioner/orchestrator";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const header = req.headers.get("authorization") ?? "";
    const token = header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : "";
    if (token !== cronSecret) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const deployments = await prisma.shopDeployment.findMany({
    where: { status: { in: ["ACTIVE", "WHITELIST_REQUESTED", "READY_FOR_WHITELIST"] } },
    select: { id: true },
  });

  for (const d of deployments) {
    await enqueueJob({ deploymentId: d.id, type: "HEALTH_CHECK" });
  }

  return NextResponse.json({ ok: true, scheduled: deployments.length });
}
