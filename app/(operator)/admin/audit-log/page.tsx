import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { Shield, ExternalLink } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  OperatorPageHeader,
  OperatorTable,
  OperatorStatusBadge,
  OperatorEmptyState,
  Button,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  type StatusTone,
} from "@/components/operator/operator-primitives";

export const dynamic = "force-dynamic";

const ACTION_LABELS: Record<string, string> = {
  "store.approve": "อนุมัติร้าน",
  "store.reject": "ปฏิเสธร้าน",
  "store.suspend": "ระงับร้าน",
  "store.reset_to_pending": "ย้อนเป็นรอตรวจ",
  "store.delete": "ลบร้าน",
  "product.approve": "อนุมัติสินค้า",
  "product.reject": "ปฏิเสธสินค้า",
  "product.delete": "ลบสินค้า",
  "user.create": "สร้างผู้ใช้",
  "user.role_change": "เปลี่ยน role",
  "user.delete": "ลบผู้ใช้",
  "landing.regenerate": "Generate landing ใหม่",
  "landing.clear": "ลบ landing",
};

function actionTone(action: string): StatusTone {
  if (action.endsWith(".approve")) return "success";
  if (action.endsWith(".reject")) return "danger";
  if (action.endsWith(".suspend")) return "warning";
  if (action.endsWith(".delete")) return "danger";
  if (action.endsWith(".create")) return "info";
  if (action.endsWith(".role_change")) return "processing";
  return "neutral";
}

export default async function AdminAuditLogPage({
  searchParams,
}: {
  searchParams: { actor?: string; action?: string; target?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/signin");
  const me = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });
  if (me?.role !== "ADMIN") redirect("/");

  const where: Record<string, unknown> = {};
  if (searchParams.actor)
    where.actorEmail = { contains: searchParams.actor, mode: "insensitive" };
  if (searchParams.action) where.action = { startsWith: searchParams.action };
  if (searchParams.target) where.targetId = searchParams.target;

  const logs = await prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const hasFilter = Boolean(searchParams.actor || searchParams.action || searchParams.target);

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <OperatorPageHeader
        title={
          <span className="flex items-center gap-2">
            <Shield className="size-6 text-primary" />
            Audit log
          </span>
        }
        description={`บันทึกทุกการกระทำของ admin — ใครทำอะไรเมื่อไหร่ (${logs.length} รายการล่าสุด)`}
      />

      <form className="flex flex-wrap gap-2">
        <Input
          name="actor"
          defaultValue={searchParams.actor ?? ""}
          placeholder="อีเมลของ admin ที่ทำ"
          className="flex-1"
        />
        <Input
          name="action"
          defaultValue={searchParams.action ?? ""}
          placeholder="action prefix เช่น store, product, user"
          className="flex-1"
        />
        <Input
          name="target"
          defaultValue={searchParams.target ?? ""}
          placeholder="target id (cuid)"
          className="flex-1"
        />
        <Button type="submit" variant="outline">
          กรอง
        </Button>
        {hasFilter && (
          <Button asChild variant="ghost">
            <Link href="/admin/audit-log">ล้าง</Link>
          </Button>
        )}
      </form>

      {logs.length === 0 ? (
        <OperatorTable>
          <OperatorEmptyState title="ไม่พบ audit log ที่ตรงกับเงื่อนไข" />
        </OperatorTable>
      ) : (
        <OperatorTable>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>เวลา</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>ผู้ทำ</TableHead>
                <TableHead>เป้าหมาย</TableHead>
                <TableHead>รายละเอียด</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((l) => {
                const meta =
                  l.metadata && typeof l.metadata === "object"
                    ? (l.metadata as Record<string, unknown>)
                    : null;
                const note =
                  meta && typeof meta === "object"
                    ? typeof (meta.after as Record<string, unknown>)?.note === "string"
                      ? ((meta.after as Record<string, unknown>).note as string)
                      : null
                    : null;

                return (
                  <TableRow key={l.id} className="align-top">
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(l.createdAt).toLocaleString("th-TH", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </TableCell>
                    <TableCell>
                      <OperatorStatusBadge tone={actionTone(l.action)}>
                        {ACTION_LABELS[l.action] ?? l.action}
                      </OperatorStatusBadge>
                      <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                        {l.action}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-xs">{l.actorEmail}</p>
                      <p className="text-[10px] text-muted-foreground">{l.actorRole}</p>
                    </TableCell>
                    <TableCell>
                      {l.targetType && l.targetId ? (
                        <>
                          <p className="text-xs">{l.targetType}</p>
                          <p className="font-mono text-[10px] text-muted-foreground">
                            {l.targetId.slice(0, 14)}…
                          </p>
                          {l.targetType === "Store" && (
                            <Link
                              href={`/admin/stores/${l.targetId}`}
                              className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline"
                            >
                              ดู <ExternalLink className="h-2.5 w-2.5" />
                            </Link>
                          )}
                          {l.targetType === "User" && (
                            <Link
                              href="/admin/users"
                              className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline"
                            >
                              ดู <ExternalLink className="h-2.5 w-2.5" />
                            </Link>
                          )}
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs">
                      {note && (
                        <p className="line-clamp-2 italic text-muted-foreground">“{note}”</p>
                      )}
                      {meta?.slug ? (
                        <p className="text-[11px] text-muted-foreground">
                          slug: {String(meta.slug)}
                        </p>
                      ) : null}
                      {meta?.name ? (
                        <p className="text-[11px] text-muted-foreground">{String(meta.name)}</p>
                      ) : null}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </OperatorTable>
      )}
    </div>
  );
}
