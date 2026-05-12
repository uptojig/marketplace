// POST /api/provisioner/agent/heartbeat
//   form-urlencoded body: shopId=...&running=<image-tag>
//
// Update-agent on each droplet POSTs every 5 minutes. Updates last-seen +
// the actually-running image so admin UI shows drift.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireInternalBearer } from "@/lib/provisioner/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!requireInternalBearer(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const text = await req.text();
  const params = new URLSearchParams(text);
  const shopId = params.get("shopId");
  const running = params.get("running");
  if (!shopId) return NextResponse.json({ error: "shopId required" }, { status: 400 });

  await prisma.shopDeployment.updateMany({
    where: { storeId: shopId },
    data: {
      runningVersion: running || undefined,
      healthyAt: new Date(),
      missedHealthChecks: 0,
    },
  });

  return NextResponse.json({ ok: true });
}
