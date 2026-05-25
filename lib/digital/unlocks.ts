/**
 * Digital-unlock helpers — single source of truth for "does this user
 * have access to this digital product's gated content?"
 *
 * Used by:
 *   - PDP / PromptViewer (decides whether to show full promptText or
 *     the public sample)
 *   - /api/digital/unlock/:productId (returns full content for AJAX)
 *   - /api/digital/download/:assetId (gates signed-URL generation)
 *   - /account/downloads page (lists all of a user's unlocks)
 *
 * Notes:
 *   - A revoked unlock (refund / chargeback) is treated as no-access.
 *   - Guests (no userId) NEVER have access. The unlock model requires
 *     a real userId on creation.
 */
import { prisma } from '@/lib/prisma';

export type UnlockStatus =
  | 'no-access' // not bought (or revoked, or expired, or guest)
  | 'unlocked'; // active unlock found

export interface UnlockInfo {
  status: UnlockStatus;
  unlockId?: string;
  licenseKey?: string;
  expiresAt?: Date | null;
  /** True when status='unlocked' AND not revoked AND not past expiresAt. */
  active: boolean;
}

/**
 * Look up whether the given user already owns an active unlock for
 * the product. Returns `{ status: 'no-access', active: false }` for
 * guests (`userId` null/undefined) so callers can always render the
 * "buy to unlock" state safely.
 */
export async function checkProductUnlock(
  userId: string | null | undefined,
  productId: string,
): Promise<UnlockInfo> {
  if (!userId) return { status: 'no-access', active: false };

  // Pick the most recent unlock so a buyer who purchased twice (e.g.
  // refunded once, bought again) still sees the live one. Order by
  // createdAt desc — revokedAt is honored regardless of order.
  const unlock = await prisma.digitalUnlock.findFirst({
    where: { userId, productId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      licenseKey: true,
      expiresAt: true,
      revokedAt: true,
    },
  });

  if (!unlock) return { status: 'no-access', active: false };

  const now = new Date();
  const revoked = unlock.revokedAt !== null;
  const expired = unlock.expiresAt !== null && unlock.expiresAt < now;
  const active = !revoked && !expired;

  return {
    status: active ? 'unlocked' : 'no-access',
    unlockId: unlock.id,
    licenseKey: unlock.licenseKey,
    expiresAt: unlock.expiresAt,
    active,
  };
}

/**
 * Bulk variant for /account/downloads — given a userId, return every
 * active unlock with the joined Product so the UI can list titles +
 * thumbnails without an N+1 query.
 */
export async function listUserUnlocks(userId: string) {
  return prisma.digitalUnlock.findMany({
    where: {
      userId,
      revokedAt: null,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    orderBy: { createdAt: 'desc' },
    include: {
      product: {
        select: {
          id: true,
          title: true,
          titleTh: true,
          imageUrl: true,
          productType: true,
          digitalKind: true,
          promptText: true,
          promptSample: true,
          storeId: true,
          store: {
            select: { slug: true, name: true },
          },
          digitalAssets: {
            select: {
              id: true,
              fileName: true,
              fileFormat: true,
              fileSizeMB: true,
              isPreview: true,
            },
          },
        },
      },
    },
  });
}

/**
 * Increment the download counter atomically. Use INSIDE the
 * `/api/digital/download` handler AFTER you've signed the URL —
 * counter is for soft rate-limiting / analytics, not security.
 */
export async function incrementDownloadCount(unlockId: string) {
  return prisma.digitalUnlock.update({
    where: { id: unlockId },
    data: { downloadCount: { increment: 1 } },
    select: { downloadCount: true },
  });
}
