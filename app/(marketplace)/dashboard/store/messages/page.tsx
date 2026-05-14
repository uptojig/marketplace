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
//   /dashboard/store/messages               — all messages (default)
//   /dashboard/store/messages?tab=unread    — readAt IS NULL only
//   /dashboard/store/messages?tab=read      — readAt IS NOT NULL only
//   /dashboard/store/messages?tab=replied   — repliedAt IS NOT NULL
//   /dashboard/store/messages?storeSlug=foo — admin-picker target
//   /dashboard/store/messages?page=N        — offset pagination
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
import {
  DashboardTabs,
  type DashboardTab,
} from "@/components/dashboard/dashboard-tabs";
import {
  DashboardPagination,
  parsePageParam,
} from "@/components/dashboard/dashboard-pagination";
import { prisma } from "@/lib/prisma";
import { resolveDashboardStore } from "@/lib/stores/resolve-dashboard-store";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 100;

type MessagesTabKey = "all" | "unread" | "read" | "replied";

const MESSAGES_TABS: { key: MessagesTabKey; label: string }[] = [
  { key: "all", label: "ทั้งหมด" },
  { key: "unread", label: "ยังไม่อ่าน" },
  { key: "read", label: "อ่านแล้ว" },
  { key: "replied", label: "ตอบแล้ว" },
];

function parseTab(raw: string | string[] | undefined): MessagesTabKey {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (v === "unread" || v === "read" || v === "replied") return v;
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
  searchParams?: Promise<{ tab?: string; storeSlug?: string; page?: string }>;
}) {
  const sp: { tab?: string; storeSlug?: string; page?: string } = searchParams
    ? await searchParams
    : {};

  const { store } = await resolveDashboardStore({
    requestedSlug: sp.storeSlug,
  });

  const tab = parseTab(sp.tab);
  const page = parsePageParam(sp.page);

  // Filter for the WHERE clause:
  //   unread  → readAt IS NULL
  //   read    → readAt IS NOT NULL
  //   replied → repliedAt IS NOT NULL (subset of "read", since the
  //             reply action stamps readAt as well)
  //   all     → no filter
  const whereByTab =
    tab === "unread"
      ? { readAt: null }
      : tab === "read"
        ? { readAt: { not: null } }
        : tab === "replied"
          ? { repliedAt: { not: null } }
          : {};

  const [unreadCount, readCount, repliedCount, totalForTab] = await Promise.all(
    [
      prisma.contactMessage.count({
        where: { storeId: store.id, readAt: null },
      }),
      prisma.contactMessage.count({
        where: { storeId: store.id, readAt: { not: null } },
      }),
      prisma.contactMessage.count({
        where: { storeId: store.id, repliedAt: { not: null } },
      }),
      // Tab-specific total for pagination math; cheap because it
      // shares the storeId+readAt/repliedAt indexes the per-tab
      // counts already hit.
      prisma.contactMessage.count({
        where: { storeId: store.id, ...whereByTab },
      }),
    ],
  );

  const totalPages = Math.max(1, Math.ceil(totalForTab / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const messages = await prisma.contactMessage.findMany({
    where: { storeId: store.id, ...whereByTab },
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE,
    skip: (safePage - 1) * PAGE_SIZE,
  });

  const slugSuffix = sp.storeSlug
    ? `?storeSlug=${encodeURIComponent(sp.storeSlug)}`
    : "";

  // URL builder shared by tab chips + pagination so storeSlug + tab +
  // page move together. Tab clicks always reset to page 1; page 1 is
  // implicit (not serialised) to keep canonical URLs tidy.
  function buildHref({
    tab: tabKey,
    page: pageNum,
  }: {
    tab?: MessagesTabKey;
    page?: number;
  } = {}) {
    const params = new URLSearchParams();
    if (tabKey && tabKey !== "all") params.set("tab", tabKey);
    if (sp.storeSlug) params.set("storeSlug", sp.storeSlug);
    if (pageNum && pageNum > 1) params.set("page", String(pageNum));
    const qs = params.toString();
    return qs ? `/dashboard/store/messages?${qs}` : "/dashboard/store/messages";
  }

  const dashboardTabs: ReadonlyArray<DashboardTab<MessagesTabKey>> =
    MESSAGES_TABS.map((t) => ({
      key: t.key,
      label: t.label,
      href: buildHref({ tab: t.key }),
      active: t.key === tab,
      count:
        t.key === "all"
          ? unreadCount + readCount
          : t.key === "unread"
            ? unreadCount
            : t.key === "read"
              ? readCount
              : repliedCount,
    }));

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

      <DashboardTabs tabs={dashboardTabs} />

      {messages.length === 0 ? (
        <div className="flex flex-col items-center rounded-lg border-2 border-dashed bg-gray-50 px-6 py-16 text-center">
          <Inbox className="h-12 w-12 text-muted-foreground" />
          <h2 className="mt-3 text-lg font-semibold text-gray-700">
            {tab === "unread"
              ? "ไม่มีข้อความที่ยังไม่อ่าน"
              : tab === "read"
                ? "ยังไม่มีข้อความที่อ่านแล้ว"
                : tab === "replied"
                  ? "ยังไม่ได้ตอบกลับข้อความใด ๆ"
                  : "ยังไม่มีข้อความจากลูกค้า"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            เมื่อมีลูกค้าส่งข้อความผ่านหน้าติดต่อ ข้อความจะปรากฏที่นี่
          </p>
        </div>
      ) : (
        <>
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
                  const isReplied = msg.repliedAt !== null;
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
                        {isReplied ? (
                          <Badge className="bg-green-600 text-white hover:bg-green-600/90">
                            อ่าน + ตอบแล้ว
                          </Badge>
                        ) : isUnread ? (
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

          <DashboardPagination
            currentPage={safePage}
            totalPages={totalPages}
            totalItems={totalForTab}
            pageSize={PAGE_SIZE}
            hrefFor={(p) => buildHref({ tab, page: p })}
          />
        </>
      )}
    </div>
  );
}
