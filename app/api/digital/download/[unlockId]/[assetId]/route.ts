/**
 * GET /api/digital/download/[unlockId]/[assetId]
 *
 * Buyer-facing signed-URL gateway.
 *
 * Flow:
 *   1. Verify the requesting user owns the DigitalUnlock (joins through
 *      orderItem → order.userId).
 *   2. Verify the requested asset belongs to the unlock's product.
 *   3. Refuse if the unlock is revoked / expired.
 *   4. Generate a short-lived (10 min) presigned Spaces URL.
 *   5. Increment downloadCount (soft rate-limit / analytics).
 *   6. 302-redirect the browser to the presigned URL.
 *
 * The buyer NEVER sees the raw storageKey — only the temporary URL.
 * If they share the URL it dies in 10 min.
 */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  presignDownload,
  isSpacesConfigured,
} from "@/lib/storage/spaces";
import { incrementDownloadCount } from "@/lib/digital/unlocks";

export const runtime = "nodejs";

const PRESIGN_TTL_SECONDS = 10 * 60;
// Soft cap so a leaked credential / hostile script can't drain a file
// in a single afternoon. Real abuse triggers manual revoke via admin.
const DAILY_DOWNLOAD_LIMIT = 20;

export async function GET(
  _req: Request,
  { params }: { params: { unlockId: string; assetId: string } },
) {
  if (!isSpacesConfigured()) {
    return NextResponse.json(
      { error: "Object storage not configured" },
      { status: 503 },
    );
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) {
    return NextResponse.json({ error: "Account not found" }, { status: 401 });
  }

  const unlock = await prisma.digitalUnlock.findUnique({
    where: { id: params.unlockId },
    select: {
      id: true,
      userId: true,
      productId: true,
      revokedAt: true,
      expiresAt: true,
      downloadCount: true,
    },
  });
  if (!unlock || unlock.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (unlock.revokedAt) {
    return NextResponse.json({ error: "Unlock revoked" }, { status: 410 });
  }
  if (unlock.expiresAt && unlock.expiresAt < new Date()) {
    return NextResponse.json({ error: "Unlock expired" }, { status: 410 });
  }
  if (unlock.downloadCount >= DAILY_DOWNLOAD_LIMIT) {
    return NextResponse.json(
      { error: "Daily download limit reached — try again tomorrow" },
      { status: 429 },
    );
  }

  const asset = await prisma.digitalAsset.findUnique({
    where: { id: params.assetId },
    select: {
      id: true,
      productId: true,
      storageKey: true,
      fileName: true,
    },
  });
  if (!asset || asset.productId !== unlock.productId) {
    return NextResponse.json({ error: "Asset not found" }, { status: 404 });
  }

  // Generate presigned URL + bump counter atomically-ish (counter is
  // not security-critical so a race here just means a 21st download
  // slips through; the next call hits the cap).
  const url = await presignDownload({
    key: asset.storageKey,
    expiresIn: PRESIGN_TTL_SECONDS,
  });
  await incrementDownloadCount(unlock.id).catch(() => {
    /* counter failure shouldn't block the legit download */
  });

  // 302 to the presigned URL so the browser triggers its own download
  // dialog (with the original fileName from the Spaces Content-
  // Disposition, if set) instead of streaming through Next.js.
  return NextResponse.redirect(url, { status: 302 });
}
