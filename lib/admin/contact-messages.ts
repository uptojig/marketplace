"use server";

// Vendor-side ContactMessage mutations.
//
// The contact form at /stores/<slug>/contact persists every submission
// as a ContactMessage row (see app/api/stores/[slug]/contact/route.ts).
// Vendors triage them via /dashboard/store/messages. These actions
// flip the read/unread state.
//
// Authorization shape (mirrors lib/orders/server-actions.ts):
//   1. Resolve session → bail if not signed in.
//   2. Load the message + its store relation.
//   3. Permit when EITHER:
//        • the signed-in user is role=ADMIN (platform admin can act
//          across stores via the dashboard picker), OR
//        • store.ownerId === session.user.id (the vendor owns the
//          store this message was sent to).
//      Anything else returns { ok: false, error: 'forbidden' }.
//
// Kept under lib/admin/ alongside enrich-products.ts because the
// authorization model (admin OR store owner) matches that file's
// "ops actions on a single store" pattern more closely than
// lib/orders/server-actions.ts (which is order-specific).

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/transactional-email/send";
import ContactReplyEmail from "@/lib/transactional-email/templates/contact-reply";

export interface ContactMessageActionResult {
  ok: boolean;
  error?: string;
}

/**
 * Reply-action result. Distinguishes between:
 *   • ok=true                         — DB write + email both succeeded
 *   • ok=true, emailDelivered=false   — DB row recorded the attempt but
 *                                       Resend rejected the send. The
 *                                       form should surface the retry
 *                                       affordance.
 *   • ok=false, error                 — auth / validation / DB failure;
 *                                       nothing was persisted.
 */
export interface ReplyMessageActionResult {
  ok: boolean;
  error?: string;
  emailDelivered?: boolean;
  /** Reason from sendEmail() — only set when emailDelivered is false. */
  emailError?: string;
}

/**
 * Authorize the current session against the target message and return
 * a minimal record the caller can act on. Returns the userId so the
 * caller can stamp readById on the row.
 *
 * Two valid identities:
 *   • ADMIN — operates cross-store via the dashboard picker.
 *   • The store owner — historic vendor case (Store.ownerId).
 *
 * 'forbidden' covers BOTH "message not found" and "you don't own this
 * store" so we never reveal the existence of cross-tenant messages.
 */
async function authorizeForMessage(messageId: string): Promise<
  | {
      ok: true;
      userId: string;
      message: {
        id: string;
        storeId: string;
        readAt: Date | null;
      };
    }
  | { ok: false; error: "unauthorized" | "forbidden" }
> {
  const session = await getServerSession(authOptions);
  const sessionUser = session?.user;
  const userId = sessionUser?.id;
  if (!userId) {
    return { ok: false, error: "unauthorized" };
  }

  const message = await prisma.contactMessage.findUnique({
    where: { id: messageId },
    select: {
      id: true,
      storeId: true,
      readAt: true,
      store: { select: { id: true, ownerId: true, slug: true } },
    },
  });
  // Same 'forbidden' surface whether the message is missing OR owned
  // by a different store — don't leak existence.
  if (!message || !message.store) {
    return { ok: false, error: "forbidden" };
  }

  const isOwner = message.store.ownerId === userId;
  // JWT may be stale (admin role granted after sign-in). Re-check the
  // role from the DB only when the session doesn't already claim
  // ADMIN — covers the "promoted while signed in" edge case without
  // paying a query for every owner-action call.
  let isAdmin = sessionUser?.role === "ADMIN";
  if (!isOwner && !isAdmin) {
    const me = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    isAdmin = me?.role === "ADMIN";
  }

  if (!isOwner && !isAdmin) {
    return { ok: false, error: "forbidden" };
  }

  return {
    ok: true,
    userId,
    message: {
      id: message.id,
      storeId: message.storeId,
      readAt: message.readAt,
    },
  };
}

function revalidateMessageRoutes(messageId: string) {
  revalidatePath("/dashboard/store/messages");
  revalidatePath(`/dashboard/store/messages/${messageId}`);
  // Admin-wide view also lists the row; bump it so unread counts /
  // status badges refresh without a hard reload.
  revalidatePath("/admin/messages");
  // The sidebar unread-count badge lives on the dashboard layout —
  // the layout re-runs on every page transition, so no extra
  // revalidate is needed for the badge itself.
}

/**
 * Mark the message as read. Stamps `readAt = now()` and `readById =
 * caller`. Idempotent — calling on an already-read row updates the
 * timestamp + actor (useful if a different operator re-acks it).
 */
export async function markMessageRead(
  messageId: string,
): Promise<ContactMessageActionResult> {
  const auth = await authorizeForMessage(messageId);
  if (!auth.ok) return { ok: false, error: auth.error };

  await prisma.contactMessage.update({
    where: { id: messageId },
    data: {
      readAt: new Date(),
      readById: auth.userId,
    },
  });

  revalidateMessageRoutes(messageId);
  return { ok: true };
}

/**
 * Mark the message as unread. Clears both readAt + readById so the row
 * is indistinguishable from a brand-new submission for the inbox UI.
 */
export async function markMessageUnread(
  messageId: string,
): Promise<ContactMessageActionResult> {
  const auth = await authorizeForMessage(messageId);
  if (!auth.ok) return { ok: false, error: auth.error };

  await prisma.contactMessage.update({
    where: { id: messageId },
    data: {
      readAt: null,
      readById: null,
    },
  });

  revalidateMessageRoutes(messageId);
  return { ok: true };
}

// Trim + length guard for the reply body. 4000 matches the contact
// form's incoming message cap — vendors don't need a longer surface
// than buyers in practice and we want to bound the DB column.
const REPLY_BODY_MIN = 10;
const REPLY_BODY_MAX = 4000;

/**
 * Send an email reply to a contact-form submission. The vendor types
 * the body in /dashboard/store/messages/<id>; we render a React Email
 * template + send via Resend.
 *
 * Ordering is critical:
 *   1. Authorize (admin OR store owner).
 *   2. Validate body (trim, min/max).
 *   3. Persist replyAt/replyById/replyBody on the row FIRST.
 *      The DB row is the source of truth — if Resend fails after
 *      this, the vendor still sees their reply in the transcript and
 *      can retry without retyping. Also stamp readAt if it wasn't
 *      already set (replying implicitly acknowledges the message).
 *   4. Render + send. Failures return ok:true + emailDelivered:false
 *      so the UI can surface a retry affordance.
 */
export async function replyToMessage(
  messageId: string,
  body: string,
): Promise<ReplyMessageActionResult> {
  // 1. Authorize — same pattern as markMessageRead but load richer
  // data so we can render the email template without a second fetch.
  const session = await getServerSession(authOptions);
  const sessionUser = session?.user;
  const userId = sessionUser?.id;
  if (!userId) return { ok: false, error: "unauthorized" };

  const message = await prisma.contactMessage.findUnique({
    where: { id: messageId },
    select: {
      id: true,
      storeId: true,
      readAt: true,
      name: true,
      email: true,
      message: true,
      store: {
        select: {
          id: true,
          ownerId: true,
          slug: true,
          name: true,
          contactEmail: true,
        },
      },
    },
  });
  if (!message || !message.store) return { ok: false, error: "forbidden" };

  const isOwner = message.store.ownerId === userId;
  let isAdmin = sessionUser?.role === "ADMIN";
  if (!isOwner && !isAdmin) {
    const me = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    isAdmin = me?.role === "ADMIN";
  }
  if (!isOwner && !isAdmin) return { ok: false, error: "forbidden" };

  // 2. Validate body. Reject early if there's no email column to
  // reply TO — the UI hides the form in this case but a stale page
  // could still POST.
  if (!message.email) return { ok: false, error: "no_reply_email" };

  const trimmed = body.trim();
  if (trimmed.length < REPLY_BODY_MIN) {
    return { ok: false, error: "body_too_short" };
  }
  if (trimmed.length > REPLY_BODY_MAX) {
    return { ok: false, error: "body_too_long" };
  }

  // 3. Persist FIRST. Stamp readAt as well if the row wasn't
  // already acknowledged — replying is implicit acknowledgment, no
  // reason to leave the row in "unread" state after a reply.
  const now = new Date();
  await prisma.contactMessage.update({
    where: { id: messageId },
    data: {
      repliedAt: now,
      repliedById: userId,
      replyBody: trimmed,
      readAt: message.readAt ?? now,
      readById: message.readAt ? undefined : userId,
    },
  });

  // 4. Render + send. The vendor's contactEmail (when set) becomes
  // both the From identity (so the buyer sees the store's address,
  // not the platform default) and the Reply-To header. When unset
  // we fall back to sendEmail's default From.
  const result = await sendEmail({
    to: message.email,
    from: message.store.contactEmail || undefined,
    replyTo: message.store.contactEmail || undefined,
    subject: `Re: ข้อความที่คุณส่งถึง ${message.store.name}`,
    react: ContactReplyEmail({
      storeName: message.store.name,
      replyBody: trimmed,
      originalMessage: message.message,
      visitorName: message.name,
      storeContactEmail: message.store.contactEmail,
    }),
  });

  revalidateMessageRoutes(messageId);

  if (!result.ok) {
    console.warn(
      `[contact-reply] sendEmail failed for message ${messageId}: ${result.reason}`,
    );
    // DB row already records the attempt — let the UI surface a
    // retry button without losing the typed body.
    return { ok: true, emailDelivered: false, emailError: result.reason };
  }

  return { ok: true, emailDelivered: true };
}
