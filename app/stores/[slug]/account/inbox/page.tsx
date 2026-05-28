/**
 * /stores/[slug]/account/inbox — in-app inbox for phone-only customers.
 *
 * Lists every InboxMessage for the signed-in user (receipts, digital
 * unlock links, order updates that our system "sent" to their synthetic
 * @inbox.basketplace.co address). Phase 1 all messages originate from
 * our own pipeline (fromOurSystem=true); external inbound lands later.
 */
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { ChevronLeft, Mail, MailOpen, Store as StoreIcon } from 'lucide-react';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { listInboxMessages } from '@/lib/inbox/queries';

export const dynamic = 'force-dynamic';

function timeAgo(d: Date): string {
  const diff = Date.now() - d.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'เมื่อสักครู่';
  if (min < 60) return `${min} นาทีที่แล้ว`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} ชม.ที่แล้ว`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day} วันที่แล้ว`;
  return d.toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default async function InboxPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const base = `/stores/${slug}/account`;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect(`/signin?callbackUrl=${encodeURIComponent(`${base}/inbox`)}`);
  }
  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { id: true },
  });
  if (!user) {
    redirect(`/signin?callbackUrl=${base}/inbox`);
  }

  const messages = await listInboxMessages(user.id);

  return (
    <div className="space-y-4">
      <Link
        href={base}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        กลับสู่บัญชี
      </Link>

      <div className="flex items-center gap-2">
        <Mail className="h-5 w-5" />
        <h1 className="text-xl font-semibold lg:text-2xl">กล่องข้อความ</h1>
      </div>

      {messages.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center">
          <Mail className="mx-auto h-8 w-8 text-muted-foreground/50" />
          <p className="mt-3 text-sm text-muted-foreground">
            ยังไม่มีข้อความ — ใบเสร็จและลิงก์ดาวน์โหลดจะส่งมาที่นี่
          </p>
        </div>
      ) : (
        <ul className="divide-y rounded-xl border bg-white overflow-hidden">
          {messages.map((m) => {
            const unread = m.readAt === null;
            return (
              <li key={m.id}>
                <Link
                  href={`${base}/inbox/${m.id}`}
                  className={`flex items-start gap-3 p-4 transition hover:bg-muted/40 ${
                    unread ? 'bg-blue-50/40' : ''
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {unread ? (
                      <Mail className="h-5 w-5 text-blue-600" />
                    ) : (
                      <MailOpen className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p
                        className={`truncate text-sm ${
                          unread ? 'font-bold' : 'font-medium'
                        }`}
                      >
                        {m.subject}
                      </p>
                      {unread && (
                        <span className="shrink-0 inline-block h-2 w-2 rounded-full bg-blue-600" />
                      )}
                    </div>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                      {m.store?.name ? (
                        <>
                          <StoreIcon className="h-3 w-3" />
                          {m.store.name}
                        </>
                      ) : (
                        m.fromAddr
                      )}
                    </p>
                  </div>
                  <time className="shrink-0 text-xs text-muted-foreground">
                    {timeAgo(m.receivedAt)}
                  </time>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
