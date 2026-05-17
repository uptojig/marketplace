import { prisma } from "@/lib/prisma";

export class OutlookPoolEmptyError extends Error {
  constructor() {
    super("No available Outlook credential in outlook_pool");
    this.name = "OutlookPoolEmptyError";
  }
}

export async function leaseOutlookCredential(sessionId: string) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.wizardOutlookCredential.findFirst({
      where: { leasedTo: sessionId },
      orderBy: { leasedAt: "desc" },
    });
    if (existing) return existing;

    const available = await tx.wizardOutlookCredential.findFirst({
      where: { status: "available" },
      orderBy: { createdAt: "asc" },
    });
    if (!available) throw new OutlookPoolEmptyError();

    return tx.wizardOutlookCredential.update({
      where: { id: available.id },
      data: {
        status: "leased",
        leasedTo: sessionId,
        leasedAt: new Date(),
      },
    });
  });
}

export async function getLeasedOutlookCredential(sessionId: string) {
  return prisma.wizardOutlookCredential.findFirst({
    where: { leasedTo: sessionId },
    orderBy: { leasedAt: "desc" },
  });
}

export async function markOutlookCredentialUsed(sessionId: string) {
  await prisma.wizardOutlookCredential.updateMany({
    where: { leasedTo: sessionId },
    data: {
      status: "used",
      usedAt: new Date(),
    },
  });
}
