import { prisma } from "@/lib/prisma";
import { formatTHB } from "@/lib/utils";

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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-mp-ink" style={{ fontFamily: "var(--mp-font-display)" }}>ภาพรวมร้านค้า</h1>
        <p className="text-sm text-mp-ink-muted">
          ยอดล่าสุด จำนวนสินค้า และสถานะการจัดส่ง
        </p>
      </div>

      {/* Stat cards — shadcn-studio dashboard pattern */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="สินค้าที่กำลังขาย" value={productCount.toLocaleString()} />
        <StatCard
          label="ออเดอร์ที่ชำระแล้ว"
          value={paidOrderCount.toLocaleString()}
        />
        <StatCard
          label="ยอดชำระล่าสุด (10 รายการ)"
          value={formatTHB(paidTotalTHB)}
        />
      </div>

      <section>
        <h2 className="mb-3 text-base font-semibold text-mp-ink" style={{ fontFamily: "var(--mp-font-display)" }}>การชำระเงินล่าสุด</h2>
        <div className="overflow-hidden rounded-lg border border-mp-border bg-mp-surface">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-mp-ink">
              <thead className="border-b border-mp-border bg-mp-cream-alt text-left text-xs uppercase tracking-wider text-mp-ink-muted">
                <tr>
                  <th className="px-4 py-3">คำสั่งซื้อ</th>
                  <th className="px-4 py-3">ช่องทาง</th>
                  <th className="px-4 py-3">สถานะ</th>
                  <th className="px-4 py-3">เลขอ้างอิง</th>
                  <th className="px-4 py-3 text-right">ยอดชำระ</th>
                  <th className="px-4 py-3">เวลาชำระ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mp-border">
                {recentPayments.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3 font-mono text-xs">{p.orderId.slice(0, 10)}…</td>
                    <td className="px-4 py-3">{p.provider}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        p.status === "PAID" ? "bg-mp-forest/10 text-mp-forest" : "bg-mp-ink-muted/10 text-mp-ink-muted"
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{p.anypayTransactionId ?? "—"}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-semibold">{formatTHB(Number(p.amountTHB))}</td>
                    <td className="px-4 py-3 text-xs text-mp-ink-muted">{p.paidAt ? p.paidAt.toLocaleString("th-TH") : "—"}</td>
                  </tr>
                ))}
                {recentPayments.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-mp-ink-muted">
                      ยังไม่มีการชำระเงิน
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-base font-semibold text-mp-ink" style={{ fontFamily: "var(--mp-font-display)" }}>สถานะการจัดส่งล่าสุด</h2>
        <div className="overflow-hidden rounded-lg border border-mp-border bg-mp-surface">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-mp-ink">
              <thead className="border-b border-mp-border bg-mp-cream-alt text-left text-xs uppercase tracking-wider text-mp-ink-muted">
                <tr>
                  <th className="px-4 py-3">คำสั่งซื้อ</th>
                  <th className="px-4 py-3">ร้าน</th>
                  <th className="px-4 py-3">สินค้า</th>
                  <th className="px-4 py-3">ซัพพลายเออร์</th>
                  <th className="px-4 py-3">เลขที่อ้างอิง</th>
                  <th className="px-4 py-3">สถานะ</th>
                  <th className="px-4 py-3">เลขพัสดุ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mp-border">
                {recentItems.map((it) => (
                  <tr key={it.id}>
                    <td className="px-4 py-3 font-mono text-xs">{it.orderId.slice(0, 8)}…</td>
                    <td className="px-4 py-3">{it.store.name}</td>
                    <td className="px-4 py-3">{it.product.title}</td>
                    <td className="px-4 py-3">{it.supplier}</td>
                    <td className="px-4 py-3 font-mono text-xs">{it.externalOrderId ?? "—"}</td>
                    <td className="px-4 py-3">{it.supplierStatus ?? "—"}</td>
                    <td className="px-4 py-3 font-mono text-xs">{it.externalTrackingNo ?? "—"}</td>
                  </tr>
                ))}
                {recentItems.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-mp-ink-muted">
                      ยังไม่มีรายการจัดส่ง
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-mp-border bg-mp-surface p-4 shadow-sm mp-card-lift">
      <p className="text-xs uppercase tracking-wider text-mp-ink-muted">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold tracking-tight text-mp-ink" style={{ fontFamily: "var(--mp-font-display)" }}>{value}</p>
    </div>
  );
}
