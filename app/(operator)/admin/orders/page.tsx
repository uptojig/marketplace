import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatTHB } from "@/lib/utils";
import {
  OperatorPageHeader,
  OperatorTable,
  OperatorFilterChips,
  OperatorStatusBadge,
  OperatorEmptyState,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  orderStatusTone,
} from "@/components/operator/operator-primitives";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const status = searchParams.status as OrderStatus | undefined;
  const validStatus =
    status && Object.values(OrderStatus).includes(status) ? status : undefined;

  const orders = await prisma.order.findMany({
    where: validStatus ? { status: validStatus } : undefined,
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      totalTHB: true,
      status: true,
      createdAt: true,
      user: { select: { email: true } },
      items: {
        select: {
          qty: true,
          store: { select: { name: true, slug: true } },
        },
      },
    },
  });

  const statusCounts = await prisma.order.groupBy({
    by: ["status"],
    _count: { _all: true },
  });

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <OperatorPageHeader
        title="คำสั่งซื้อทั้งหมด"
        description={`${orders.length} แสดง (จำกัด 100 ล่าสุด)`}
      />

      <OperatorFilterChips
        items={[
          {
            label: `ทั้งหมด (${statusCounts.reduce((s, x) => s + x._count._all, 0)})`,
            href: "/admin/orders",
            active: !validStatus,
          },
          ...statusCounts.map((sc) => ({
            label: `${sc.status} (${sc._count._all})`,
            href: `/admin/orders?status=${sc.status}`,
            active: validStatus === sc.status,
          })),
        ]}
      />

      {orders.length === 0 ? (
        <OperatorTable>
          <OperatorEmptyState title="ไม่พบคำสั่งซื้อ" />
        </OperatorTable>
      ) : (
        <OperatorTable>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>ลูกค้า</TableHead>
                <TableHead>ร้าน</TableHead>
                <TableHead className="text-right">ยอด</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>เวลา</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((o) => {
                const stores = Array.from(
                  new Set(o.items.map((i) => i.store?.name).filter(Boolean)),
                );
                const totalQty = o.items.reduce((s, i) => s + i.qty, 0);
                return (
                  <TableRow key={o.id}>
                    <TableCell>
                      <p className="font-mono text-xs font-semibold text-foreground">
                        {o.id.slice(-8)}
                      </p>
                      <p className="text-xs text-muted-foreground">{totalQty} ชิ้น</p>
                    </TableCell>
                    <TableCell className="text-xs font-medium">
                      {o.user?.email ?? "guest"}
                    </TableCell>
                    <TableCell className="text-xs">
                      {stores.length === 0 ? "—" : stores.join(", ")}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-foreground">
                      {formatTHB(Number(o.totalTHB ?? 0))}
                    </TableCell>
                    <TableCell>
                      <OperatorStatusBadge tone={orderStatusTone[o.status] ?? "neutral"}>
                        {o.status}
                      </OperatorStatusBadge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {o.createdAt.toLocaleString("th-TH")}
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
