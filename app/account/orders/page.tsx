'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Package, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  getOrders,
  ORDER_STATUS_COLOR,
  ORDER_STATUS_LABEL,
  type Order,
  type OrderStatus,
} from '@/lib/account/mock-data';

const TABS: { key: OrderStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'ทั้งหมด' },
  { key: 'pending_payment', label: 'รอชำระ' },
  { key: 'paid', label: 'รอจัดส่ง' },
  { key: 'shipping', label: 'กำลังจัดส่ง' },
  { key: 'delivered', label: 'สำเร็จ' },
  { key: 'cancelled', label: 'ยกเลิก' },
];

export default function OrdersListPage() {
  const [tab, setTab] = useState<OrderStatus | 'all'>('all');
  const [query, setQuery] = useState('');
  const orders = getOrders();

  const filtered = orders
    .filter((o) => tab === 'all' || o.status === tab)
    .filter(
      (o) =>
        !query ||
        o.orderRef.toLowerCase().includes(query.toLowerCase()) ||
        o.storeName.toLowerCase().includes(query.toLowerCase()) ||
        o.items.some((i) => i.title.toLowerCase().includes(query.toLowerCase())),
    );

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold lg:text-2xl">คำสั่งซื้อของฉัน</h1>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="ค้นหาด้วยเลขคำสั่งซื้อ ร้านค้า หรือชื่อสินค้า..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex gap-1 overflow-x-auto border-b pb-px">
        {TABS.map((t) => {
          const count = t.key === 'all' ? orders.length : orders.filter((o) => o.status === t.key).length;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                'shrink-0 border-b-2 px-3 py-2 text-sm transition',
                tab === t.key
                  ? 'border-primary font-medium text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              {t.label}
              {count > 0 && <span className="ml-1 text-xs">({count})</span>}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center py-12 text-center">
          <Package className="h-12 w-12 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">ไม่พบคำสั่งซื้อในหมวดนี้</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-2.5">
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            {new Date(order.placedAt).toLocaleDateString('th-TH', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </span>
          <span className="font-mono text-xs">{order.orderRef}</span>
        </div>
        <Badge className={ORDER_STATUS_COLOR[order.status]} variant="outline">
          {ORDER_STATUS_LABEL[order.status]}
        </Badge>
      </div>

      <Link href={`/account/orders/${order.orderRef}`} className="block">
        <div className="px-4 py-3">
          <p className="mb-2 text-sm font-medium">{order.storeName}</p>
          <div className="space-y-2">
            {order.items.slice(0, 2).map((item, i) => (
              <div key={i} className="flex gap-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded">
                  <Image
                    src={item.thumbnailUrl}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="line-clamp-2 text-sm">{item.title}</p>
                  {item.variantName && (
                    <p className="text-xs text-muted-foreground">{item.variantName}</p>
                  )}
                  <p className="text-xs text-muted-foreground">x{item.qty}</p>
                </div>
                <div className="text-right text-sm">฿{(item.price * item.qty).toLocaleString()}</div>
              </div>
            ))}
            {order.items.length > 2 && (
              <p className="text-xs text-muted-foreground">+ อีก {order.items.length - 2} รายการ</p>
            )}
          </div>
        </div>
      </Link>

      <div className="flex items-center justify-between border-t bg-muted/10 px-4 py-3">
        <div className="text-xs text-muted-foreground">
          ยอดรวม:{' '}
          <span className="text-base font-semibold text-red-600">
            ฿{order.total.toLocaleString()}
          </span>
        </div>
        <div className="flex gap-2">
          {order.status === 'shipping' && order.trackingNumber && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/account/orders/${order.orderRef}`}>ติดตามพัสดุ</Link>
            </Button>
          )}
          {order.status === 'delivered' && (
            <Button variant="outline" size="sm">
              ซื้อซ้ำ
            </Button>
          )}
          <Button size="sm" asChild>
            <Link href={`/account/orders/${order.orderRef}`}>ดูรายละเอียด</Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
