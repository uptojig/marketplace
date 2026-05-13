// /account/orders/[id] — order detail page.
//
// Server-rendered. Reads the URL :id segment as the user-facing
// orderRef (ORD-...), looks it up via getOrderByRef, maps through
// toOrderView, and renders the scaffold timeline + items + summary.
//
// Auth: must be the buyer who placed the order. Other authenticated
// users (even ADMIN) get the same 404 as anonymous — we don't reveal
// the existence of someone else's order. Admins use /admin/orders
// for cross-tenant lookup.
//
// Lifecycle UI:
//  - Linear stepper for the happy-path: PENDING_PAYMENT → PAID →
//    SHIPPED → DELIVERED. SUPPLIER_PLACED collapses into PAID via
//    lib/orders/status-ui::timelineIndex.
//  - Terminal statuses (CANCELLED / RETURNED / FAILED) skip the
//    stepper entirely — those are handled in a callout banner.
//
// Address / payment:
//  - Shipping address comes from the JSON snapshot baked into the
//    Order row at placement (survives address edits/deletes).
//  - Payment method label comes from the real Prisma PaymentMethod
//    enum via PAYMENT_METHOD_INFO. Null when unknown — we still
//    render the card with a placeholder so the layout is stable.

import Image from 'next/image';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  Copy,
  MapPin,
  Package,
  Phone,
  Truck,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { authOptions } from '@/lib/auth';
import { getOrderByRef } from '@/lib/orders/queries';
import { PAYMENT_METHOD_INFO, toOrderView } from '@/lib/account/order-view';
import {
  ORDER_STATUS_COLOR,
  ORDER_STATUS_LABEL,
  ORDER_TIMELINE,
  isTerminalStatus,
  timelineIndex,
} from '@/lib/orders/status-ui';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

interface OrderDetailProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: OrderDetailProps) {
  const { id } = await params;

  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    redirect(`/signin?callbackUrl=/account/orders/${encodeURIComponent(id)}`);
  }

  const raw = await getOrderByRef(id);
  if (!raw) notFound();

  // Authorisation — only the buyer can view this. Treat
  // non-owner as 404 to avoid disclosing existence.
  if (raw.userId !== userId) notFound();

  const order = toOrderView(raw);
  const activeIdx = timelineIndex(order.status);
  const terminal = isTerminalStatus(order.status);
  const payment = order.paymentMethod
    ? PAYMENT_METHOD_INFO[order.paymentMethod]
    : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/account/orders"
            className="text-xs text-muted-foreground hover:underline"
          >
            ← กลับไปคำสั่งซื้อ
          </Link>
          <h1 className="mt-1 font-mono text-lg font-semibold">{order.orderRef}</h1>
        </div>
        <Badge className={ORDER_STATUS_COLOR[order.status]} variant="outline">
          {ORDER_STATUS_LABEL[order.status]}
        </Badge>
      </div>

      {terminal ? (
        <TerminalBanner order={order} />
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
                        !done && !active && "border-muted-foreground/30 text-muted-foreground",
                      )}
                    >
                      {done ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <Circle className="h-3 w-3" />
                      )}
                    </div>
                    <span className="mt-1 text-center text-[10px] text-muted-foreground">
                      {/* Pull just the headline word out of the label so
                          the stepper labels stay compact. */}
                      {ORDER_STATUS_LABEL[s].split(" ")[0]}
                    </span>
                  </div>
                  {i < ORDER_TIMELINE.length - 1 && (
                    <div
                      className={cn(
                        "mb-4 h-px flex-1",
                        i < activeIdx ? "bg-green-600" : "bg-muted-foreground/30",
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
              <span className="font-mono font-medium">{order.trackingNumber}</span>
              {/* TODO(tracking-copy): make the copy button actually copy
                  on click. It needs a Client Component wrapper since
                  this page is a Server Component. Leaving as a visual
                  placeholder for now — buyers can still select + copy. */}
              <Button
                variant="ghost"
                size="icon"
                className="ml-auto h-7 w-7"
                aria-label="คัดลอกเลขพัสดุ"
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}

          {order.estimatedDelivery && (
            <p className="mt-2 text-xs text-muted-foreground">
              คาดว่าจะส่งถึงในวันที่{" "}
              {new Date(order.estimatedDelivery).toLocaleDateString("th-TH", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          )}
        </Card>
      )}

      <Card className="overflow-hidden">
        {order.storeSlug ? (
          <Link
            href={`/stores/${order.storeSlug}`}
            className="flex items-center gap-2 border-b bg-muted/30 px-4 py-2.5 hover:bg-muted/50"
          >
            <Avatar className="h-6 w-6">
              {order.storeLogoUrl && <AvatarImage src={order.storeLogoUrl} />}
              <AvatarFallback className="text-[10px]">
                {order.storeName.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{order.storeName}</span>
          </Link>
        ) : (
          <div className="flex items-center gap-2 border-b bg-muted/30 px-4 py-2.5">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-[10px]">
                {order.storeName.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{order.storeName}</span>
          </div>
        )}
        <div className="divide-y">
          {order.items.map((item) => {
            const productHref = order.storeSlug
              ? `/stores/${order.storeSlug}/products/${item.productId}`
              : null;
            const Inner = (
              <>
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
                    <p className="text-xs text-muted-foreground">{item.variantName}</p>
                  )}
                  <p className="mt-0.5 text-xs text-muted-foreground">x{item.qty}</p>
                </div>
                <div className="text-right text-sm font-semibold">
                  ฿{item.lineTotalTHB.toLocaleString()}
                </div>
              </>
            );
            return productHref ? (
              <Link
                key={item.id}
                href={productHref}
                className="flex gap-3 p-4 hover:bg-muted/30"
              >
                {Inner}
              </Link>
            ) : (
              <div key={item.id} className="flex gap-3 p-4">
                {Inner}
              </div>
            );
          })}
        </div>
        <div className="space-y-1.5 border-t bg-muted/10 p-4 text-sm">
          <Row label="ยอดสินค้า" value={`฿${order.subtotalTHB.toLocaleString()}`} />
          <Row
            label="ค่าจัดส่ง"
            value={order.shippingTHB === 0 ? "ฟรี" : `฿${order.shippingTHB.toLocaleString()}`}
          />
          {order.discountTHB > 0 && (
            <Row
              label="ส่วนลด"
              value={`−฿${order.discountTHB.toLocaleString()}`}
              valueClass="text-green-600"
            />
          )}
          <Separator />
          <Row
            label="ยอดรวม"
            value={`฿${order.totalTHB.toLocaleString()}`}
            labelClass="font-semibold"
            valueClass="text-base font-bold text-red-600"
          />
        </div>
      </Card>

      <div className="grid gap-3 lg:grid-cols-2">
        {order.shippingAddress && (
          <Card className="p-4">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <MapPin className="h-4 w-4" /> ที่อยู่จัดส่ง
            </h3>
            <p className="text-sm">
              <span className="font-medium">{order.shippingAddress.recipientName}</span>{" "}
              <Phone className="ml-1 inline h-3 w-3 text-muted-foreground" />{" "}
              <span className="text-muted-foreground">{order.shippingAddress.phone}</span>
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {order.shippingAddress.line1}
              {order.shippingAddress.line2 && `, ${order.shippingAddress.line2}`}
              {order.shippingAddress.subdistrict && `, ${order.shippingAddress.subdistrict}`}
              {order.shippingAddress.district && ` ${order.shippingAddress.district}`}{" "}
              {order.shippingAddress.province} {order.shippingAddress.postalCode}
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
                <p className="text-xs text-muted-foreground">{payment.description}</p>
              </div>
            </div>
          </Card>
        )}
      </div>

      <div className="flex flex-wrap gap-2 pt-2">
        {/* TODO(actions): wire these to server actions — currently
            visual-only buttons matching the scaffold design. Once
            we have:
              - lib/orders/actions.ts → cancelOrder + reorder
              - Review model → "เขียนรีวิว" link to /reviews/new
              - Refund model → "ขอคืนสินค้า" link to refund form
            these should become real Form/Link elements. */}
        {order.status === "PENDING_PAYMENT" && (
          <Button>ชำระเงินตอนนี้</Button>
        )}
        {order.status === "DELIVERED" && (
          <>
            <Button variant="outline">ซื้อซ้ำ</Button>
            <Button variant="outline">เขียนรีวิว</Button>
            <Button variant="outline">ขอคืนสินค้า</Button>
          </>
        )}
        {(order.status === "PAID" || order.status === "PENDING_PAYMENT") && (
          <Button variant="outline" className="text-destructive hover:text-destructive">
            ยกเลิกคำสั่งซื้อ
          </Button>
        )}
        <Button variant="ghost">ติดต่อร้าน</Button>
      </div>
    </div>
  );
}

/**
 * Banner shown in lieu of the stepper for terminal statuses. Different
 * tone per branch — cancellation is informational, RETURNED is a
 * success-after-failure state, FAILED is an error.
 */
function TerminalBanner({
  order,
}: {
  order: ReturnType<typeof toOrderView>;
}) {
  const tone =
    order.status === "FAILED"
      ? "bg-red-50 border-red-200 text-red-900 dark:bg-red-950/30"
      : "bg-zinc-50 border-zinc-200 text-zinc-700 dark:bg-zinc-900/50";
  const headline =
    order.status === "CANCELLED"
      ? "คำสั่งซื้อถูกยกเลิก"
      : order.status === "RETURNED"
      ? "คืนสินค้าแล้ว"
      : "การชำระเงินล้มเหลว";
  const sub =
    order.status === "CANCELLED"
      ? "หากชำระเงินแล้ว เงินจะคืนภายใน 3-5 วันทำการ"
      : order.status === "RETURNED"
      ? "เงินคืนเรียบร้อย"
      : "กรุณาลองชำระเงินอีกครั้งหรือเปลี่ยนช่องทางการชำระเงิน";
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
