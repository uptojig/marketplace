// GET /api/provisioner/agent/desired?shopId=...
//
// Called by the on-droplet update-agent every 5 minutes. Returns the image
// the droplet SHOULD be running. If different from what's running, the
// agent pulls + restarts.
//
// Authentication: shared secret bearer token (set by cloud-init).

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireInternalBearer } from "@/lib/provisioner/auth";

export const dynamic = "force-dynamic";

const DEFAULT_IMAGE = process.env.SHOP_IMAGE ?? "registry.digitalocean.com/marketplace/shop-app:latest";

export async function GET(req: Request) {
  if (!requireInternalBearer(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const shopId = searchParams.get("shopId");
  if (!shopId) return NextResponse.json({ error: "shopId required" }, { status: 400 });

  const deployment = await prisma.shopDeployment.findUnique({
    where: { storeId: shopId },
    select: { runningVersion: true, snapshotVersion: true, status: true },
  });
  if (!deployment) return NextResponse.json({ error: "unknown shop" }, { status: 404 });

  // Stub policy: every droplet runs the latest tag unless the deployment is
  // SUSPENDED (in which case agent should not auto-update). Future: per-shop
  // canary tags read from a `runningVersion` field updated by admin.
  if (deployment.status === "SUSPENDED" || deployment.status === "ARCHIVED") {
    return NextResponse.json({ image: deployment.runningVersion ?? DEFAULT_IMAGE, hold: true });
  }
  return NextResponse.json({ image: DEFAULT_IMAGE });
}
