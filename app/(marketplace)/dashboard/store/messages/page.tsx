// Vendor-side contact-message inbox — /dashboard/store/messages.
//
// Lists every ContactMessage row scoped to the active store. Multi-
// store admins / multi-owner users switch via the dashboard picker
// (resolveDashboardStore reads ?storeSlug=…). Owners are scoped to
// their own store; admins see whichever store the picker is on.
//
// Source rows are persisted by app/api/stores/[slug]/contact/route.ts
// — the public contact form's POST handler. Email send via Resend is
// best-effort + secondary; the ContactMessage row IS the inbox.
//
// URL shape:
//   /dashboard/store/messages              — all messages (default)
//   /dashboard/store/messages?tab=unread   — readAt IS NULL only
//   /dashboard/store/messages?tab=read     — readAt IS NOT NULL only
//   /dashboard/store/messages?storeSlug=foo — admin-picker target
//
// Sort order is always createdAt DESC — newest at the top, matching
// every other operator inbox in the dashboard.

import Link from "next/link";
import { Inbox } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { prisma } from "@/lib/prisma";
import { resolveDashboardStore } from "@/lib/stores/resolve-dashboard-store";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type MessagesTabKey = "all" | "unread" | "read";

const MESSAGES_TABS: { key: MessagesTabKey; label: string }[] = [
  { key: "all", label: "ทั้งหมด" },
  { key: "unread", label: "ยังไม่อ่าน" },
  { key: "read", label: "อ่านแล้ว" },
];

function parseTab(raw: string | string[] | undefined): MessagesTabKey {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (v === "unread" || v === "read") return v;
  return "all";
}

// Cap at 80 chars per spec — collapse whitespace first so newlines in
// the original message don't waste preview real estate.
function previewMessage(message: string, max = 80): string {
  const collapsed = message.replace(/\s+/g, " ").trim();
  if (collapsed.length <= max) return collapsed;
  return `${collapsed.slice(0, max - 1)}…`;
}

export default async function VendorMessagesPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string; storeSlug?: string }>;
}) {
  const sp: { tab?: string; storeSlug?: string } = searchParams
    ? await searchParams
    : {};

  const { store } = await resolveDashboardStore({
    requestedSlug: sp.storeSlug,
  });

  const tab = parseTab(sp.tab);

  // readAt filter for the WHERE clause:
  //   unread → readAt IS NULL
  //   read   → readAt IS NOT NULL
  //   all    → no filter
  const whereByTab =
    tab === "unread"
      ? { readAt: null }
      : tab === "read"
        ? { readAt: { not: null } }
        : {};

  const [messages, unreadCount, readCount] = await Promise.all([
    prisma.contactMessage.findMany({
      where: { storeId: store.id, ...whereByTab },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.contactMessage.count({
      where: { storeId: store.id, readAt: null },
    }),
    prisma.contactMessage.count({
      where: { storeId: store.id, readAt: { not: null } },
    }),
  ]);

  // Preserve the active store across tab navigation. Empty when no
  // explicit slug is needed (default owned store).
  const slugQs = sp.storeSlug
    ? `&storeSlug=${encodeURIComponent(sp.storeSlug)}`
    : "";
  const slugSuffix = sp.storeSlug
    ? `?storeSlug=${encodeURIComponent(sp.storeSlug)}`
    : "";

  const totalCount = unreadCount + readCount;

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">ข้อความจากลูกค้า</h1>
          <p className="text-sm text-muted-foreground">
            ข้อความที่ส่งผ่านหน้าติดต่อ — ตอบกลับโดยตรงทางอีเมลหรือโทรศัพท์
          </p>
        </div>
      </header>

      <nav
        aria-label="กรองตามสถานะ"
        className="flex flex-wrap gap-2 border-b pb-px"
      >
        {MESSAGES_TABS.map((t) => {
          const isActive = t.key === tab;
          const count =
            t.key === "all"
              ? totalCount
              : t.key === "unread"
                ? unreadCount
                : readCount;
          const href =
            t.key === "all"
              ? sp.storeSlug
                ? `/dashboard/store/messages?storeSlug=${encodeURIComponent(sp.storeSlug)}`
                : "/dashboard/store/messages"
              : `/dashboard/store/messages?tab=${t.key}${slugQs}`;
          return (
            <Link
              key={t.key}
              href={href}
              className={cn(
                "shrink-0 rounded-md border px-3 py-1.5 text-sm transition",
                isActive
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input bg-background hover:bg-accent",
              )}
            >
              {t.label}
              {count > 0 && (
                <span
                  className={cn(
                    "ml-1.5 text-xs",
                    isActive ? "opacity-80" : "text-muted-foreground",
                  )}
                >
                  ({count})
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {messages.length === 0 ? (
        <div className="flex flex-col items-center rounded-lg border-2 border-dashed bg-gray-50 px-6 py-16 text-center">
          <Inbox className="h-12 w-12 text-muted-foreground" />
          <h2 className="mt-3 text-lg font-semibold text-gray-700">
            {tab === "unread"
              ? "ไม่มีข้อความที่ยังไม่อ่าน"
              : tab === "read"
                ? "ยังไม่มีข้อความที่อ่านแล้ว"
                : "ยังไม่มีข้อความจากลูกค้า"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            เมื่อมีลูกค้าส่งข้อความผ่านหน้าติดต่อ ข้อความจะปรากฏที่นี่
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>วันที่</TableHead>
                <TableHead>ผู้ส่ง</TableHead>
                <TableHead>ข้อความ</TableHead>
                <TableHead className="text-center">สถานะ</TableHead>
                <TableHead className="text-right" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {messages.map((msg) => {
                const isUnread = msg.readAt === null;
                // Visible "from" is name + best contact channel —
                // email preferred, then phone, then nothing if neither
                // was provided.
                const contact = msg.email ?? msg.phone ?? null;
                return (
                  <TableRow
                    key={msg.id}
                    className={cn(
                      "align-top",
                      // Unread rows pop with a subtle background so
                      // operators can scan the "todo" pile at a glance.
                      isUnread && "bg-blue-50/40",
                    )}
                  >
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(msg.createdAt).toLocaleDateString("th-TH", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                      <div className="text-[10px] opacity-70">
                        {new Date(msg.createdAt).toLocaleTimeString("th-TH", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div
                        className={cn(
                          "text-sm",
                          isUnread && "font-semibold",
                        )}
                      >
                        {msg.name}
                      </div>
                      {contact && (
                        <div className="text-xs text-muted-foreground">
                          {contact}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="max-w-md text-sm">
                      <span
                        className={cn(
                          "block truncate",
                          isUnread
                            ? "text-foreground"
                            : "text-muted-foreground",
                        )}
                      >
                        {previewMessage(msg.message)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      {isUnread ? (
                        <Badge variant="default">ยังไม่อ่าน</Badge>
                      ) : (
                        <Badge variant="outline">อ่านแล้ว</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="outline" size="sm">
                        <Link
                          href={`/dashboard/store/messages/${msg.id}${slugSuffix}`}
                        >
                          ดูข้อความ
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
