// GET /api/provisioner/status?storeId=...
// GET /api/provisioner/status?deploymentId=...
//
// Returns deployment row + last 10 jobs so admin UI can render progress.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/provisioner/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json(
      { error: auth.reason },
      { status: auth.reason === "unauthenticated" ? 401 : 403 },
    );
  }

  const { searchParams } = new URL(req.url);
  const storeId = searchParams.get("storeId");
  const deploymentId = searchParams.get("deploymentId");
  if (!storeId && !deploymentId) {
    return NextResponse.json({ error: "storeId or deploymentId required" }, { status: 400 });
  }

  const deployment = await prisma.shopDeployment.findFirst({
    where: deploymentId ? { id: deploymentId } : { storeId: storeId! },
    include: {
      store: { select: { id: true, slug: true, name: true, customDomain: true } },
      jobs: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });

  if (!deployment) {
    return NextResponse.json({ deployment: null });
  }

  return NextResponse.json({
    deployment: {
      ...deployment,
      doDropletId: deployment.doDropletId ? String(deployment.doDropletId) : null, // serialize BigInt
    },
  });
}
