import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CheckCircle2, Circle, Copy, MapPin, Package, Phone, Truck } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  getOrderById,
  ORDER_STATUS_COLOR,
  ORDER_STATUS_LABEL,
  type OrderStatus,
} from '@/lib/account/mock-data';
import { getAddresses, paymentMethods } from '@/lib/checkout/mock-data';

interface OrderDetailProps {
  params: Promise<{ id: string }>;
}

const TIMELINE: OrderStatus[] = ['pending_payment', 'paid', 'shipping', 'delivered'];

export default async function OrderDetailPage({ params }: OrderDetailProps) {
  const { id } = await params;
  const order = getOrderById(id);
  if (!order) notFound();

  const address = getAddresses().find((a) => a.id === order.addressId);
  const payment = paymentMethods.find((p) => p.id === order.paymentMethod);
  const activeIdx = TIMELINE.indexOf(order.status);
  const isTerminal = order.status === 'cancelled' || order.status === 'returned';

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

      {!isTerminal && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            {TIMELINE.map((s, i) => {
              const done = i <= activeIdx;
              const active = i === activeIdx;
              return (
                <div key={s} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-full border-2',
                        done && 'border-green-600 bg-green-600 text-white',
                        active && !done && 'border-primary',
                        !done && !active && 'border-muted-foreground/30 text-muted-foreground',
                      )}
                    >
                      {done ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-3 w-3" />}
                    </div>
                    <span className="mt-1 text-[10px] text-center text-muted-foreground">
                      {ORDER_STATUS_LABEL[s].split(' ')[0]}
                    </span>
                  </div>
                  {i < TIMELINE.length - 1 && (
                    <div
                      className={cn(
                        'mb-4 h-px flex-1',
                        i < activeIdx ? 'bg-green-600' : 'bg-muted-foreground/30',
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
                {order.carrier} · เลขพัสดุ:
              </span>
              <span className="font-mono font-medium">{order.trackingNumber}</span>
              <Button variant="ghost" size="icon" className="ml-auto h-7 w-7">
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
          {order.estimatedDelivery && (
            <p className="mt-2 text-xs text-muted-foreground">
              คาดว่าจะส่งถึงในวันที่{' '}
              {new Date(order.estimatedDelivery).toLocaleDateString('th-TH', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          )}
        </Card>
      )}

      <Card className="overflow-hidden">
        <Link
          href={`/stores/${order.storeSlug}`}
          className="flex items-center gap-2 border-b bg-muted/30 px-4 py-2.5 hover:bg-muted/50"
        >
          <Avatar className="h-6 w-6">
            <AvatarImage src={order.storeLogo} />
            <AvatarFallback className="text-[10px]">
              {order.storeName.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{order.storeName}</span>
        </Link>
        <div className="divide-y">
          {order.items.map((item, i) => (
            <Link
              key={i}
              href={`/stores/${order.storeSlug}/products/${item.productId}`}
              className="flex gap-3 p-4 hover:bg-muted/30"
            >
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded">
                <Image
                  src={item.thumbnailUrl}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="64px"
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
                ฿{(item.price * item.qty).toLocaleString()}
              </div>
            </Link>
          ))}
        </div>
        <div className="space-y-1.5 border-t bg-muted/10 p-4 text-sm">
          <Row label="ยอดสินค้า" value={`฿${order.subtotal.toLocaleString()}`} />
          <Row
            label="ค่าจัดส่ง"
            value={order.shipping === 0 ? 'ฟรี' : `฿${order.shipping.toLocaleString()}`}
          />
          {order.discount > 0 && (
            <Row
              label="ส่วนลด"
              value={`−฿${order.discount.toLocaleString()}`}
              valueClass="text-green-600"
            />
          )}
          <Separator />
          <Row
            label="ยอดรวม"
            value={`฿${order.total.toLocaleString()}`}
            labelClass="font-semibold"
            valueClass="text-base font-bold text-red-600"
          />
        </div>
      </Card>

      <div className="grid gap-3 lg:grid-cols-2">
        {address && (
          <Card className="p-4">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <MapPin className="h-4 w-4" /> ที่อยู่จัดส่ง
            </h3>
            <p className="text-sm">
              <span className="font-medium">{address.fullName}</span>{' '}
              <Phone className="ml-1 inline h-3 w-3 text-muted-foreground" />{' '}
              <span className="text-muted-foreground">{address.phone}</span>
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {address.line1}
              {address.line2 && `, ${address.line2}`}, {address.subDistrict} {address.district}{' '}
              {address.province} {address.postalCode}
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
        {order.status === 'pending_payment' && (
          <Button>ชำระเงินตอนนี้</Button>
        )}
        {order.status === 'delivered' && (
          <>
            <Button variant="outline">ซื้อซ้ำ</Button>
            <Button variant="outline">เขียนรีวิว</Button>
            <Button variant="outline">ขอคืนสินค้า</Button>
          </>
        )}
        {(order.status === 'paid' || order.status === 'pending_payment') && (
          <Button variant="outline" className="text-destructive hover:text-destructive">
            ยกเลิกคำสั่งซื้อ
          </Button>
        )}
        <Button variant="ghost">ติดต่อร้าน</Button>
      </div>
    </div>
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
      <span className={cn('text-muted-foreground', labelClass)}>{label}</span>
      <span className={valueClass}>{value}</span>
    </div>
  );
}
