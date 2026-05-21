import { prisma } from "@/lib/prisma";
import { formatTHB } from "@/lib/utils";
import {
  OperatorEmptyState,
  OperatorPageHeader,
  OperatorStatCard,
  OperatorStatusBadge,
  OperatorTable,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/operator/operator-primitives";

export const dynamic = "force-dynamic";

export default async function VendorDashboard() {
  const [recentPayments, recentItems, productCount, paidOrderCount] =
    await Promise.all([
      prisma.payment.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { order: true },
      }),
      prisma.orderItem.findMany({
        orderBy: { id: "desc" },
        take: 10,
        include: { product: true, store: true, order: true },
      }),
      prisma.product.count({ where: { active: true } }),
      prisma.payment.count({ where: { status: "PAID" } }),
    ]);

  const paidTotalTHB = recentPayments
    .filter((p) => p.status === "PAID")
    .reduce((acc, p) => acc + Number(p.amountTHB), 0);

  return (
    <div className="flex flex-col gap-8">
      <OperatorPageHeader
        title="ภาพรวมร้านค้า"
        description="ยอดล่าสุด จำนวนสินค้า และสถานะการจัดส่ง"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <OperatorStatCard label="สินค้าที่กำลังขาย" value={productCount.toLocaleString()} />
        <OperatorStatCard
          label="ออเดอร์ที่ชำระแล้ว"
          value={paidOrderCount.toLocaleString()}
        />
        <OperatorStatCard
          label="ยอดชำระล่าสุด (10 รายการ)"
          value={formatTHB(paidTotalTHB)}
        />
      </div>

      <OperatorTable title="การชำระเงินล่าสุด">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>คำสั่งซื้อ</TableHead>
              <TableHead>ช่องทาง</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead>เลขอ้างอิง</TableHead>
              <TableHead className="text-right">ยอดชำระ</TableHead>
              <TableHead>เวลาชำระ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentPayments.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-mono text-xs">{p.orderId.slice(0, 10)}...</TableCell>
                <TableCell>{p.provider}</TableCell>
                <TableCell>
                  <OperatorStatusBadge tone={p.status === "PAID" ? "success" : "neutral"}>
                    {p.status}
                  </OperatorStatusBadge>
                </TableCell>
                <TableCell className="font-mono text-xs">{p.anypayTransactionId ?? "-"}</TableCell>
                <TableCell className="text-right tabular-nums font-semibold">{formatTHB(Number(p.amountTHB))}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{p.paidAt ? p.paidAt.toLocaleString("th-TH") : "-"}</TableCell>
              </TableRow>
            ))}
            {recentPayments.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>
                  <OperatorEmptyState title="ยังไม่มีการชำระเงิน" />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </OperatorTable>

      <OperatorTable title="สถานะการจัดส่งล่าสุด">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>คำสั่งซื้อ</TableHead>
              <TableHead>ร้าน</TableHead>
              <TableHead>สินค้า</TableHead>
              <TableHead>ซัพพลายเออร์</TableHead>
              <TableHead>เลขที่อ้างอิง</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead>เลขพัสดุ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentItems.map((it) => (
              <TableRow key={it.id}>
                <TableCell className="font-mono text-xs">{it.orderId.slice(0, 8)}...</TableCell>
                <TableCell>{it.store.name}</TableCell>
                <TableCell>{it.product.title}</TableCell>
                <TableCell>{it.supplier}</TableCell>
                <TableCell className="font-mono text-xs">{it.externalOrderId ?? "-"}</TableCell>
                <TableCell>{it.supplierStatus ?? "-"}</TableCell>
                <TableCell className="font-mono text-xs">{it.externalTrackingNo ?? "-"}</TableCell>
              </TableRow>
            ))}
            {recentItems.length === 0 && (
              <TableRow>
                <TableCell colSpan={7}>
                  <OperatorEmptyState title="ยังไม่มีรายการจัดส่ง" />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </OperatorTable>
    </div>
  );
}
