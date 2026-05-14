// Admin-wide contact-message inbox — /admin/messages.
//
// Cross-store view of every ContactMessage row on the platform. Lets
// the platform admin spot abuse / unanswered messages without having
// to switch the dashboard picker between stores one at a time.
//
// Authorization: the parent admin layout (app/admin/layout.tsx)
// already gates this surface to role=ADMIN — it returns a 403 page
// for anyone else BEFORE rendering any /admin/* child. So we don't
// re-check here; the layout's role check is the trust boundary.
//
// Each row deep-links to the vendor-side detail page using the
// `?storeSlug=` picker key, so admins land on the same UI vendors
// use (and the "mark read" mutation works through the same server
// action).

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
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type AdminMessagesTabKey = "all" | "unread" | "read";

const ADMIN_TABS: { key: AdminMessagesTabKey; label: string }[] = [
  { key: "all", label: "ทั้งหมด" },
  { key: "unread", label: "ยังไม่อ่าน" },
  { key: "read", label: "อ่านแล้ว" },
];

function parseTab(raw: string | string[] | undefined): AdminMessagesTabKey {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (v === "unread" || v === "read") return v;
  return "all";
}

function previewMessage(message: string, max = 80): string {
  const collapsed = message.replace(/\s+/g, " ").trim();
  if (collapsed.length <= max) return collapsed;
  return `${collapsed.slice(0, max - 1)}…`;
}

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const sp: { tab?: string } = searchParams ? await searchParams : {};
  const tab = parseTab(sp.tab);

  const whereByTab =
    tab === "unread"
      ? { readAt: null }
      : tab === "read"
        ? { readAt: { not: null } }
        : {};

  const [messages, unreadCount, readCount] = await Promise.all([
    prisma.contactMessage.findMany({
      where: whereByTab,
      orderBy: { createdAt: "desc" },
      // Cap at 200 — ample for triage scanning; full audit drilldown
      // belongs in a dedicated /admin/audit-log query, not here.
      take: 200,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        message: true,
        readAt: true,
        repliedAt: true,
        createdAt: true,
        store: { select: { slug: true, name: true } },
      },
    }),
    prisma.contactMessage.count({ where: { readAt: null } }),
    prisma.contactMessage.count({ where: { readAt: { not: null } } }),
  ]);

  const totalCount = unreadCount + readCount;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold">ข้อความจากลูกค้า (ทุกร้าน)</h1>
        <p className="text-sm text-muted-foreground">
          {messages.length} แสดง (จำกัด 200 ล่าสุด)
        </p>
      </header>

      <nav
        aria-label="กรองตามสถานะ"
        className="flex flex-wrap gap-2 border-b pb-px"
      >
        {ADMIN_TABS.map((t) => {
          const isActive = t.key === tab;
          const count =
            t.key === "all"
              ? totalCount
              : t.key === "unread"
                ? unreadCount
                : readCount;
          const href =
            t.key === "all" ? "/admin/messages" : `/admin/messages?tab=${t.key}`;
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
              ? "ไม่มีข้อความที่ยังไม่อ่านในระบบ"
              : tab === "read"
                ? "ยังไม่มีข้อความที่อ่านแล้ว"
                : "ยังไม่มีข้อความในระบบ"}
          </h2>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>ร้าน</TableHead>
                <TableHead>ผู้ส่ง</TableHead>
                <TableHead>วันที่</TableHead>
                <TableHead>ข้อความ</TableHead>
                <TableHead className="text-center">สถานะ</TableHead>
                <TableHead className="text-right" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {messages.map((msg) => {
                const isUnread = msg.readAt === null;
                const isReplied = msg.repliedAt !== null;
                const contact = msg.email ?? msg.phone ?? null;
                // Deep-link straight into the vendor-side detail
                // page with the store picker pinned to this row's
                // store. The admin layout owns auth; the vendor page
                // re-checks via resolveDashboardStore + storeId
                // probe-defence.
                const detailHref = msg.store
                  ? `/dashboard/store/messages/${msg.id}?storeSlug=${encodeURIComponent(msg.store.slug)}`
                  : `/dashboard/store/messages/${msg.id}`;
                return (
                  <TableRow
                    key={msg.id}
                    className={cn(
                      "align-top",
                      isUnread && "bg-blue-50/40",
                    )}
                  >
                    <TableCell className="text-sm">
                      {msg.store ? (
                        <div>
                          <Link
                            href={`/stores/${msg.store.slug}`}
                            target="_blank"
                            className="font-medium hover:underline"
                          >
                            {msg.store.name}
                          </Link>
                          <div className="text-[10px] text-muted-foreground">
                            /{msg.store.slug}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          —
                        </span>
                      )}
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
                        <Link href={detailHref}>ดูข้อความ</Link>
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
