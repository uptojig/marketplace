/**
 * Inbox read/update helpers. All scoped by userId so a buyer can only
 * ever see their own messages — callers pass the session user id.
 */
import { prisma } from "@/lib/prisma";

export async function listInboxMessages(userId: string, limit = 50) {
  return prisma.inboxMessage.findMany({
    where: { userId },
    orderBy: { receivedAt: "desc" },
    take: limit,
    select: {
      id: true,
      fromAddr: true,
      subject: true,
      fromOurSystem: true,
      readAt: true,
      receivedAt: true,
      store: { select: { name: true, slug: true, logoUrl: true } },
    },
  });
}

export async function getInboxMessage(userId: string, id: string) {
  const msg = await prisma.inboxMessage.findFirst({
    where: { id, userId },
    select: {
      id: true,
      fromAddr: true,
      toAddr: true,
      subject: true,
      htmlBody: true,
      textBody: true,
      attachmentsJson: true,
      fromOurSystem: true,
      readAt: true,
      receivedAt: true,
      store: { select: { name: true, slug: true, logoUrl: true } },
    },
  });
  return msg;
}

export async function unreadInboxCount(userId: string): Promise<number> {
  return prisma.inboxMessage.count({
    where: { userId, readAt: null },
  });
}

/** Mark a single message read. Scoped by userId so a hostile id can't
 *  flip someone else's message. Idempotent. */
export async function markInboxRead(userId: string, id: string) {
  await prisma.inboxMessage.updateMany({
    where: { id, userId, readAt: null },
    data: { readAt: new Date() },
  });
}
