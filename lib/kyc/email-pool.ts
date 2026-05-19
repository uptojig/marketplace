import { prisma } from "@/lib/prisma";

export const EMAIL_LEASE_TTL_MS = 25 * 60 * 1000;

const AVAILABLE_STATUSES = ["available", "AVAILABLE"] as const;
const PENDING_STATUSES = ["pending", "PENDING", "leased", "LEASED"] as const;
const USED_STATUSES = ["used", "USED"] as const;

export interface LeasedKycEmail {
  id: string;
  email: string;
  leasedAt: Date;
  expiresAt: Date;
  status: string;
}

export class EmailPoolEmptyError extends Error {
  constructor() {
    super("No available KYC email in pool");
    this.name = "EmailPoolEmptyError";
  }
}

export class EmailLeaseExpiredError extends Error {
  constructor() {
    super("KYC email lease expired");
    this.name = "EmailLeaseExpiredError";
  }
}

function getExpiryFromLeasedAt(leasedAt: Date): Date {
  return new Date(leasedAt.getTime() + EMAIL_LEASE_TTL_MS);
}

function isExpired(leasedAt: Date, now = new Date()): boolean {
  return getExpiryFromLeasedAt(leasedAt).getTime() <= now.getTime();
}

function toLeasedEmail(row: { id: string; email: string; leasedAt: Date | null; status: string }): LeasedKycEmail {
  const leasedAt = row.leasedAt ?? new Date();
  return {
    id: row.id,
    email: row.email,
    leasedAt,
    expiresAt: getExpiryFromLeasedAt(leasedAt),
    status: row.status,
  };
}

export async function leaseKycEmailForSession(sessionId: string): Promise<LeasedKycEmail> {
  return prisma.$transaction(async (tx) => {
    const now = new Date();
    const cutoff = new Date(now.getTime() - EMAIL_LEASE_TTL_MS);

    // Self-heal stale leases in case cron is delayed or unavailable.
    await tx.wizardOutlookCredential.updateMany({
      where: {
        status: { in: [...PENDING_STATUSES] },
        leasedAt: { lt: cutoff },
      },
      data: {
        status: "available",
        leasedTo: null,
        leasedAt: null,
      },
    });

    const existing = await tx.wizardOutlookCredential.findFirst({
      where: {
        leasedTo: sessionId,
        status: { in: [...PENDING_STATUSES, ...USED_STATUSES] },
      },
      orderBy: { leasedAt: "desc" },
    });

    if (existing) {
      if (USED_STATUSES.includes(existing.status as (typeof USED_STATUSES)[number])) {
        throw new Error("KYC email for this session is already marked as used");
      }
      if (existing.leasedAt && !isExpired(existing.leasedAt, now)) {
        return toLeasedEmail(existing);
      }
      await tx.wizardOutlookCredential.update({
        where: { id: existing.id },
        data: {
          status: "available",
          leasedTo: null,
          leasedAt: null,
        },
      });
    }

    const candidates = await tx.wizardOutlookCredential.findMany({
      where: { status: { in: [...AVAILABLE_STATUSES] } },
      select: { id: true },
      orderBy: { createdAt: "asc" },
      take: 20,
    });

    for (const candidate of candidates) {
      const claimed = await tx.wizardOutlookCredential.updateMany({
        where: {
          id: candidate.id,
          status: { in: [...AVAILABLE_STATUSES] },
        },
        data: {
          status: "pending",
          leasedTo: sessionId,
          leasedAt: now,
          usedAt: null,
        },
      });
      if (claimed.count === 1) {
        const row = await tx.wizardOutlookCredential.findUnique({
          where: { id: candidate.id },
          select: { id: true, email: true, leasedAt: true, status: true },
        });
        if (!row || !row.leasedAt) throw new Error("Failed to load claimed email lease");
        return toLeasedEmail(row);
      }
    }

    throw new EmailPoolEmptyError();
  });
}

export async function getPendingKycEmailLease(sessionId: string): Promise<LeasedKycEmail | null> {
  const row = await prisma.wizardOutlookCredential.findFirst({
    where: {
      leasedTo: sessionId,
      status: { in: [...PENDING_STATUSES] },
    },
    orderBy: { leasedAt: "desc" },
    select: { id: true, email: true, leasedAt: true, status: true },
  });
  if (!row || !row.leasedAt) return null;
  if (isExpired(row.leasedAt)) return null;
  return toLeasedEmail(row);
}

export async function requirePendingKycEmailLease(sessionId: string): Promise<LeasedKycEmail> {
  const lease = await getPendingKycEmailLease(sessionId);
  if (!lease) throw new EmailLeaseExpiredError();
  return lease;
}

export async function markKycEmailUsed(sessionId: string): Promise<number> {
  const result = await prisma.wizardOutlookCredential.updateMany({
    where: {
      leasedTo: sessionId,
      status: { in: [...PENDING_STATUSES] },
    },
    data: {
      status: "used",
      usedAt: new Date(),
    },
  });
  return result.count;
}

export async function recycleExpiredKycEmailLeases(): Promise<number> {
  const cutoff = new Date(Date.now() - EMAIL_LEASE_TTL_MS);
  const result = await prisma.wizardOutlookCredential.updateMany({
    where: {
      status: { in: [...PENDING_STATUSES] },
      leasedAt: { lt: cutoff },
    },
    data: {
      status: "available",
      leasedTo: null,
      leasedAt: null,
    },
  });
  return result.count;
}
