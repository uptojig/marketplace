/**
 * /stores/[slug]/account/inbox/[id] — single inbox message.
 *
 * Marks the message read on load. Renders the stored HTML body ONLY for
 * messages our own system generated (fromOurSystem=true) — that HTML
 * comes from our React Email templates and is trusted. Any future
 * external/inbound message (fromOurSystem=false) renders as plain text
 * until an HTML sanitizer is added, so we never inject untrusted markup.
 */
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { ChevronLeft, Store as StoreIcon } from 'lucide-react';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getInboxMessage, markInboxRead } from '@/lib/inbox/queries';

export const dynamic = 'force-dynamic';

interface Attachment {
  fileName?: string;
  url?: string;
  sizeBytes?: number;
  contentType?: string;
}

export default async function InboxMessagePage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  const base = `/stores/${slug}/account`;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect(`/signin?callbackUrl=${encodeURIComponent(`${base}/inbox/${id}`)}`);
  }
  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { id: true },
  });
  if (!user) {
    redirect(`/signin?callbackUrl=${base}/inbox`);
  }

  const msg = await getInboxMessage(user.id, id);
  if (!msg) notFound();

  // Mark read on open (fire-and-forget — no need to block render).
  if (msg.readAt === null) {
    await markInboxRead(user.id, id);
  }

  const attachments = Array.isArray(msg.attachmentsJson)
    ? (msg.attachmentsJson as Attachment[])
    : [];

  return (
    <div className="space-y-4">
      <Link
        href={`${base}/inbox`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        กล่องข้อความ
      </Link>

      <article className="rounded-xl border bg-white overflow-hidden">
        <header className="border-b p-5">
          <h1 className="text-lg font-semibold">{msg.subject}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {msg.store?.name && (
              <span className="inline-flex items-center gap-1">
                <StoreIcon className="h-3 w-3" />
                {msg.store.name}
              </span>
            )}
            <span>{msg.fromAddr}</span>
            <span>
              {msg.receivedAt.toLocaleString('th-TH', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </span>
          </div>
        </header>

        <div className="p-5">
          {msg.fromOurSystem && msg.htmlBody ? (
            // Trusted: rendered from our own React Email templates.
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: msg.htmlBody }}
            />
          ) : msg.textBody ? (
            <pre className="whitespace-pre-wrap font-[family:var(--font-prompt)] text-sm leading-relaxed">
              {msg.textBody}
            </pre>
          ) : (
            <p className="text-sm text-muted-foreground">
              (ข้อความนี้ไม่มีเนื้อหาที่แสดงได้)
            </p>
          )}
        </div>

        {attachments.length > 0 && (
          <div className="border-t p-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              ไฟล์แนบ
            </p>
            <ul className="space-y-2">
              {attachments.map((a, i) => (
                <li key={i}>
                  {a.url ? (
                    <a
                      href={a.url}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {a.fileName ?? `ไฟล์แนบ ${i + 1}`}
                    </a>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      {a.fileName ?? `ไฟล์แนบ ${i + 1}`}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </article>
    </div>
  );
}
