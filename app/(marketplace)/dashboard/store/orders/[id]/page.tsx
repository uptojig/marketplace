// Vendor-side order detail — /dashboard/store/orders/[id].
//
// Mirrors the visual structure of the buyer detail page
// (app/stores/[slug]/account/orders/[id]/page.tsx) but swaps the CTA
// row for vendor-specific actions: mark shipped (with carrier +
// tracking dialog), mark delivered, cancel.
//
// Authorization:
//   1. requireStoreOwner() — resolves the signed-in user's store, or
//      404s anything not owned by them.
//   2. Cross-store probe defence — even after (1), we verify the
//      loaded order's storeId matches our store. If a vendor pasted a
//      sibling store's orderRef into the URL, we 404 here.

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  Mail,
  MapPin,
  Package,
  Phone,
  Truck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  CancelOrderButton,
  MarkDeliveredButton,
  MarkShippedDialog,
} from "@/components/dashboard/order-actions";
import { PAYMENT_METHOD_INFO, toOrderView } from "@/lib/account/order-view";
import { getStoreOrderByRef } from "@/lib/orders/queries";
import {
  ORDER_STATUS_COLOR,
  ORDER_STATUS_LABEL,
  ORDER_TIMELINE,
  isTerminalStatus,
  timelineIndex,
} from "@/lib/orders/status-ui";
import { requireStoreOwner } from "@/lib/stores/require-store-owner";
import { cn, formatTHB } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function VendorOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const store = await requireStoreOwner({
    callbackUrl: `/dashboard/store/orders/${id}`,
  });

  const raw = await getStoreOrderByRef(id);
  if (!raw) notFound();
  // Cross-store probe protection. requireStoreOwner already proved
  // the session owns `store`; this catches the case where someone
  // appends another vendor's orderRef onto their URL.
  if (raw.storeId !== store.id) notFound();

  const order = toOrderView(raw);
  const buyer = raw.user;
  const activeIdx = timelineIndex(order.status);
  const terminal = isTerminalStatus(order.status);
  const payment = order.paymentMethod
    ? PAYMENT_METHOD_INFO[order.paymentMethod]
    : null;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href="/dashboard/store/orders"
            className="text-xs text-muted-foreground hover:underline"
          >
            ← กลับไปคำสั่งซื้อทั้งหมด
          </Link>
          <h1 className="mt-1 font-mono text-lg font-semibold">
            {order.orderRef}
          </h1>
          <p className="text-xs text-muted-foreground">
            สั่งซื้อเมื่อ{" "}
            {new Date(order.placedAt).toLocaleString("th-TH", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <Badge className={ORDER_STATUS_COLOR[order.status]} variant="outline">
          {ORDER_STATUS_LABEL[order.status]}
        </Badge>
      </div>

      {terminal ? (
        <TerminalBanner status={order.status} />
      ) : (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            {ORDER_TIMELINE.map((s, i) => {
              const done = i <= activeIdx;
              const active = i === activeIdx;
              return (
                <div key={s} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full border-2",
                        done && "border-green-600 bg-green-600 text-white",
                        active && !done && "border-primary",
                        !done &&
                          !active &&
                          "border-muted-foreground/30 text-muted-foreground",
                      )}
                    >
                      {done ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <Circle className="h-3 w-3" />
                      )}
                    </div>
                    <span className="mt-1 text-center text-[10px] text-muted-foreground">
                      {ORDER_STATUS_LABEL[s].split(" ")[0]}
                    </span>
                  </div>
                  {i < ORDER_TIMELINE.length - 1 && (
                    <div
                      className={cn(
                        "mb-4 h-px flex-1",
                        i < activeIdx
                          ? "bg-green-600"
                          : "bg-muted-foreground/30",
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {order.trackingNumber && (
            <div className="mt-4 flex items-center gap-2 rounded-md bg-muted/30 p-3 text-sm">
              <Truck className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {order.shippingCarrier ?? "พัสดุ"} · เลขพัสดุ:
              </span>
              <span className="font-mono font-medium">
                {order.trackingNumber}
              </span>
            </div>
          )}
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className="border-b bg-muted/30 px-4 py-2.5 text-sm font-medium">
          รายการสินค้า ({order.items.length})
        </div>
        <div className="divide-y">
          {order.items.map((item) => (
            <div key={item.id} className="flex gap-3 p-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded">
                <Image
                  src={item.thumbnailUrl}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="64px"
                  unoptimized
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="line-clamp-2 text-sm">{item.title}</p>
                {item.variantName && (
                  <p className="text-xs text-muted-foreground">
                    {item.variantName}
                  </p>
                )}
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {formatTHB(item.unitPriceTHB)} × {item.qty}
                </p>
              </div>
              <div className="text-right text-sm font-semibold">
                {formatTHB(item.lineTotalTHB)}
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-1.5 border-t bg-muted/10 p-4 text-sm">
          <Row
            label="ยอดสินค้า"
            value={formatTHB(order.subtotalTHB)}
          />
          <Row
            label="ค่าจัดส่ง"
            value={
              order.shippingTHB === 0
                ? "ฟรี"
                : formatTHB(order.shippingTHB)
            }
          />
          {order.discountTHB > 0 && (
            <Row
              label="ส่วนลด"
              value={`−${formatTHB(order.discountTHB)}`}
              valueClass="text-green-600"
            />
          )}
          <Separator />
          <Row
            label="ยอดรวม"
            value={formatTHB(order.totalTHB)}
            labelClass="font-semibold"
            valueClass="text-base font-bold text-red-600"
          />
        </div>
      </Card>

      <div className="grid gap-3 lg:grid-cols-2">
        <Card className="p-4">
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <Mail className="h-4 w-4" /> ลูกค้า
          </h3>
          <p className="text-sm">
            <span className="font-medium">
              {buyer?.name?.trim() || "ลูกค้า"}
            </span>
          </p>
          {buyer?.email && (
            <p className="mt-1 text-sm text-muted-foreground">
              <Mail className="mr-1 inline h-3 w-3" />
              <a
                href={`mailto:${buyer.email}?subject=${encodeURIComponent(
                  `เกี่ยวกับคำสั่งซื้อ ${order.orderRef}`,
                )}`}
                className="hover:underline"
              >
                {buyer.email}
              </a>
            </p>
          )}
          {order.shippingAddress?.phone && (
            <p className="mt-1 text-sm text-muted-foreground">
              <Phone className="mr-1 inline h-3 w-3" />
              {order.shippingAddress.phone}
            </p>
          )}
        </Card>

        {order.shippingAddress && (
          <Card className="p-4">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <MapPin className="h-4 w-4" /> ที่อยู่จัดส่ง
            </h3>
            <p className="text-sm">
              <span className="font-medium">
                {order.shippingAddress.recipientName}
              </span>
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {order.shippingAddress.line1}
              {order.shippingAddress.line2 &&
                `, ${order.shippingAddress.line2}`}
              {order.shippingAddress.subdistrict &&
                `, ${order.shippingAddress.subdistrict}`}
              {order.shippingAddress.district &&
                ` ${order.shippingAddress.district}`}{" "}
              {order.shippingAddress.province}{" "}
              {order.shippingAddress.postalCode}
            </p>
          </Card>
        )}
        {payment && (
          <Card className="p-4">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <Package className="h-4 w-4" /> การชำระเงิน
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{payment.icon}</span>
              <div>
                <p className="text-sm font-medium">{payment.label}</p>
                <p className="text-xs text-muted-foreground">
                  {payment.description}
                </p>
              </div>
            </div>
          </Card>
        )}
        {raw.noteToStore && (
          <Card className="p-4 lg:col-span-2">
            <h3 className="mb-2 text-sm font-semibold">หมายเหตุจากลูกค้า</h3>
            <p className="text-sm text-muted-foreground">{raw.noteToStore}</p>
          </Card>
        )}
      </div>

      <div className="flex flex-wrap gap-2 pt-2">
        {(order.status === "PAID" || order.status === "SUPPLIER_PLACED") && (
          <MarkShippedDialog orderId={order.id} />
        )}
        {order.status === "SHIPPED" && (
          <MarkDeliveredButton orderId={order.id} />
        )}
        {(order.status === "PENDING_PAYMENT" ||
          order.status === "PAID" ||
          order.status === "SUPPLIER_PLACED") && (
          <CancelOrderButton orderId={order.id} />
        )}
        {buyer?.email && (
          <Button variant="ghost" asChild>
            <a
              href={`mailto:${buyer.email}?subject=${encodeURIComponent(
                `เกี่ยวกับคำสั่งซื้อ ${order.orderRef}`,
              )}`}
            >
              <Mail className="mr-1.5 h-4 w-4" />
              ติดต่อลูกค้า
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}

function TerminalBanner({ status }: { status: string }) {
  const tone =
    status === "FAILED"
      ? "bg-red-50 border-red-200 text-red-900 dark:bg-red-950/30"
      : "bg-zinc-50 border-zinc-200 text-zinc-700 dark:bg-zinc-900/50";
  const headline =
    status === "CANCELLED"
      ? "คำสั่งซื้อถูกยกเลิก"
      : status === "RETURNED"
        ? "คืนสินค้าแล้ว"
        : "การชำระเงินล้มเหลว";
  const sub =
    status === "CANCELLED"
      ? "หากชำระเงินแล้ว เงินจะคืนภายใน 3-5 วันทำการ"
      : status === "RETURNED"
        ? "ดำเนินการคืนเงินเรียบร้อย"
        : "ลูกค้าควรชำระใหม่หรือเลือกช่องทางอื่น";
  return (
    <Card className={cn("flex items-start gap-3 border p-4", tone)}>
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
      <div>
        <p className="text-sm font-medium">{headline}</p>
        <p className="mt-0.5 text-xs">{sub}</p>
      </div>
    </Card>
  );
}

function Row({
  label,
  value,
  labelClass,
  valueClass,
}: {
  label: string;
  value: string;
  labelClass?: string;
  valueClass?: string;
}) {
  return (
    <div className="flex justify-between">
      <span className={cn("text-muted-foreground", labelClass)}>{label}</span>
      <span className={valueClass}>{value}</span>
    </div>
  );
}
