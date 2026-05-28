/**
 * In-app inbox delivery — the Phase-1 substitute for an inbound mail
 * provider. When sendEmail() detects a recipient on the synthetic
 * @inbox.basketplace.co domain, it routes here instead of Resend: the
 * already-rendered HTML is written to an InboxMessage row that the
 * buyer reads at /account/inbox.
 *
 * Never throws — mirrors sendEmail's never-fail-an-order contract.
 */
import { prisma } from "@/lib/prisma";
import { merchantSlugFromInboxAddress } from "./synth-email";

export interface DeliverToInboxOptions {
  to: string;
  from: string;
  subject: string;
  html: string;
  text?: string;
}

export type DeliverResult =
  | { ok: true; id?: string }
  | { ok: false; reason: string };

export async function deliverToInbox(
  opts: DeliverToInboxOptions,
): Promise<DeliverResult> {
  try {
    const toAddr = opts.to.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: toAddr },
      select: { id: true },
    });
    if (!user) {
      // Synthetic address with no matching user — drop it. Return ok so
      // a stray send never fails an order transition.
      console.warn("[inbox] no user for synthetic address:", toAddr);
      return { ok: false, reason: "inbox_user_not_found" };
    }

    // Attribute the message to its store via the slug prefix in the
    // local part. Null when the slug doesn't resolve (store renamed /
    // deleted) — the message still lands, just unattributed.
    const slug = merchantSlugFromInboxAddress(toAddr);
    const store = slug
      ? await prisma.store.findUnique({
          where: { slug },
          select: { id: true },
        })
      : null;

    const msg = await prisma.inboxMessage.create({
      data: {
        userId: user.id,
        storeId: store?.id ?? null,
        fromAddr: opts.from,
        toAddr,
        subject: opts.subject,
        htmlBody: opts.html,
        textBody: opts.text ?? null,
        fromOurSystem: true,
      },
      select: { id: true },
    });
    return { ok: true, id: msg.id };
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    console.warn("[inbox] deliver failed:", reason);
    return { ok: false, reason };
  }
}
