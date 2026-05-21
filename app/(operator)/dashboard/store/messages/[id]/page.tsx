// Vendor-side contact-message detail — /dashboard/store/messages/[id].
//
// Shows the full message body + visitor info + "Mark as read" toggle
// + an INLINE Resend-powered reply composer. The mailto/tel quick-
// links remain for the rare case where the vendor wants to use their
// own mail client, but the primary reply path is the in-dashboard
// composer (components/dashboard/message-reply-form.tsx) backed by
// the replyToMessage server action.
//
// Authorization (multi-store):
//   1. resolveDashboardStore({ requestedSlug }) — picks the active
//      store. Admins can be on any store; owners are limited to
//      their own. Anyone else lands on their default or is bounced.
//   2. Cross-store probe defence — even after (1), we verify the
//      loaded message's storeId matches the picked store. If a vendor
//      pasted a sibling store's message id into the URL, we 404 here.
//      (Pure UX guard — the server actions in
//      lib/admin/contact-messages.ts ALSO verify ownership server-side
//      before any state mutation.)

import Link from "next/link";
import { notFound } from "next/navigation";
import { Mail, Phone, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MarkReadToggle } from "@/components/dashboard/message-actions";
import { MessageReplyForm } from "@/components/dashboard/message-reply-form";
import { prisma } from "@/lib/prisma";
import { resolveDashboardStore } from "@/lib/stores/resolve-dashboard-store";

export const dynamic = "force-dynamic";

export default async function VendorMessageDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ storeSlug?: string }>;
}) {
  const { id } = await params;
  const sp: { storeSlug?: string } = searchParams ? await searchParams : {};

  const { store } = await resolveDashboardStore({
    requestedSlug: sp.storeSlug,
    noStoreRedirect: `/signin?next=/dashboard/store/messages/${id}`,
  });

  const msg = await prisma.contactMessage.findUnique({
    where: { id },
  });
  if (!msg) notFound();
  // Cross-store probe protection. resolveDashboardStore already
  // proved the session can act on `store`; this catches the case
  // where someone appends another vendor's message id onto their
  // URL while on store A. Same 404 surface as "row missing" so the
  // existence of cross-tenant rows isn't leaked.
  if (msg.storeId !== store.id) notFound();

  const isUnread = msg.readAt === null;
  const isReplied = msg.repliedAt !== null;

  // Preserve the active store across the back-link.
  const slugSuffix = sp.storeSlug
    ? `?storeSlug=${encodeURIComponent(sp.storeSlug)}`
    : "";

  // Pre-build the mailto / tel hrefs so the JSX stays terse. The
  // mailto subject prepends "Re:" + the store name so the buyer's
  // inbox threads match what the StoreContactEmail template would
  // have produced (vendor's existing email-thread continuity).
  const mailtoHref = msg.email
    ? `mailto:${msg.email}?subject=${encodeURIComponent(
        `Re: [${store.name}] ข้อความจากหน้าติดต่อ`,
      )}`
    : null;
  const telHref = msg.phone ? `tel:${msg.phone.replace(/\s+/g, "")}` : null;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href={`/dashboard/store/messages${slugSuffix}`}
            className="text-xs text-muted-foreground hover:underline"
          >
            ← กลับไปข้อความทั้งหมด
          </Link>
          <h1 className="mt-1 text-lg font-semibold">ข้อความจากลูกค้า</h1>
          <p className="text-xs text-muted-foreground">
            ส่งเมื่อ{" "}
            {new Date(msg.createdAt).toLocaleString("th-TH", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        {isReplied ? (
          <Badge className="bg-green-600 text-white hover:bg-green-600/90">
            อ่าน + ตอบแล้ว
          </Badge>
        ) : isUnread ? (
          <Badge variant="default">ยังไม่อ่าน</Badge>
        ) : (
          <Badge variant="outline">อ่านแล้ว</Badge>
        )}
      </div>

      <Card className="overflow-hidden">
        <div className="border-b bg-muted/30 px-4 py-2.5 text-sm font-medium">
          เนื้อหาข้อความ
        </div>
        <div className="p-4">
          {/* whitespace-pre-wrap preserves the buyer's line breaks
              without letting one mega-paragraph overflow the card. */}
          <p className="whitespace-pre-wrap break-words text-sm">
            {msg.message}
          </p>
        </div>
      </Card>

      {/* Reply composer — primary reply path. The component handles
          three states internally:
            • no customer email → disabled hint with phone fallback
            • not yet replied → empty composer
            • already replied → transcript + "ตอบกลับเพิ่ม" trigger */}
      <MessageReplyForm
        messageId={msg.id}
        customerEmail={msg.email}
        customerName={msg.name}
        customerPhone={msg.phone}
        existingReply={
          msg.repliedAt && msg.replyBody
            ? { body: msg.replyBody, repliedAt: msg.repliedAt }
            : null
        }
      />

      <div className="grid gap-3 lg:grid-cols-2">
        <Card className="p-4">
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <User className="h-4 w-4" /> ข้อมูลผู้ส่ง
          </h3>
          <p className="text-sm">
            <span className="font-medium">{msg.name}</span>
          </p>
          {msg.email && (
            <p className="mt-1 text-sm text-muted-foreground">
              <Mail className="mr-1 inline h-3 w-3" />
              <a href={mailtoHref ?? undefined} className="hover:underline">
                {msg.email}
              </a>
            </p>
          )}
          {msg.phone && (
            <p className="mt-1 text-sm text-muted-foreground">
              <Phone className="mr-1 inline h-3 w-3" />
              <a href={telHref ?? undefined} className="hover:underline">
                {msg.phone}
              </a>
            </p>
          )}
          {!msg.email && !msg.phone && (
            <p className="mt-1 text-xs text-muted-foreground">
              ผู้ส่งไม่ได้ระบุช่องทางติดต่อกลับ
            </p>
          )}
        </Card>

        <Card className="p-4">
          <h3 className="mb-2 text-sm font-semibold">ติดต่อกลับ (ทางอื่น)</h3>
          {mailtoHref || telHref ? (
            <>
              <p className="text-xs text-muted-foreground">
                หากต้องการใช้แอปอีเมลของคุณเองหรือโทรหาลูกค้า
              </p>
              <Separator className="my-3" />
              <div className="flex flex-wrap gap-2">
                {mailtoHref && (
                  <a
                    href={mailtoHref}
                    className="inline-flex h-8 items-center gap-1.5 rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-accent"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    ส่งอีเมล
                  </a>
                )}
                {telHref && (
                  <a
                    href={telHref}
                    className="inline-flex h-8 items-center gap-1.5 rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-accent"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    โทร
                  </a>
                )}
              </div>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">
              ผู้ส่งไม่ได้ระบุอีเมลหรือเบอร์โทร — ไม่สามารถตอบกลับได้
            </p>
          )}
        </Card>
      </div>

      <div className="flex flex-wrap gap-2 pt-2">
        <MarkReadToggle messageId={msg.id} isRead={!isUnread} />
      </div>
    </div>
  );
}
