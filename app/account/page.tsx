import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Heart, MapPin, Package, Wallet } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  getOrders,
  mockUser,
  ORDER_STATUS_COLOR,
  ORDER_STATUS_LABEL,
} from '@/lib/account/mock-data';
import { getAddresses } from '@/lib/checkout/mock-data';

export default function AccountDashboard() {
  const user = mockUser;
  const recentOrders = getOrders().slice(0, 3);
  const addresses = getAddresses();
  const activeOrders = getOrders().filter(
    (o) => o.status === 'pending_payment' || o.status === 'paid' || o.status === 'shipping',
  ).length;

  return (
    <div className="space-y-6">
      <Card className="flex items-center gap-4 p-4">
        <Avatar className="h-14 w-14">
          <AvatarImage src={user.avatarUrl} alt={user.fullName} />
          <AvatarFallback>{user.fullName.slice(0, 2)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold">สวัสดี, {user.fullName}</h1>
          <p className="text-xs text-muted-foreground">
            สมาชิกตั้งแต่ {new Date(user.joinedAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'long' })}
          </p>
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Package}
          label="คำสั่งซื้อที่ใช้งาน"
          value={activeOrders.toString()}
          href="/account/orders"
        />
        <StatCard
          icon={MapPin}
          label="ที่อยู่บันทึกไว้"
          value={addresses.length.toString()}
          href="/account/addresses"
        />
        <StatCard icon={Wallet} label="ยอด Anypay" value="฿0" href="/account/wallet" muted />
        <StatCard icon={Heart} label="รายการโปรด" value="0" href="/account/favorites" muted />
      </div>

      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="font-semibold">คำสั่งซื้อล่าสุด</h2>
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            ดูทั้งหมด <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="space-y-2">
          {recentOrders.map((o) => (
            <Card key={o.id} className="p-3">
              <Link
                href={`/account/orders/${o.orderRef}`}
                className="flex items-center gap-3"
              >
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded">
                  <Image
                    src={o.items[0].thumbnailUrl}
                    alt={o.items[0].title}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium">{o.storeName}</span>
                    <Badge className={ORDER_STATUS_COLOR[o.status]} variant="outline">
                      {ORDER_STATUS_LABEL[o.status]}
                    </Badge>
                  </div>
                  <p className="line-clamp-1 text-xs text-muted-foreground">
                    {o.items[0].title}
                    {o.items.length > 1 && ` + อีก ${o.items.length - 1} รายการ`}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-red-600">
                    ฿{o.total.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {new Date(o.placedAt).toLocaleDateString('th-TH')}
                  </div>
                </div>
              </Link>
            </Card>
          ))}
        </div>
      </section>

      <section className="rounded-lg border bg-muted/30 p-4">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h3 className="font-medium">ต้องการความช่วยเหลือ?</h3>
            <p className="text-sm text-muted-foreground">
              ดูวิธีสั่งซื้อ ชำระเงิน หรือคืนสินค้าใน Help Center
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/help">ไปที่ Help Center</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  href,
  muted = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  href: string;
  muted?: boolean;
}) {
  return (
    <Link href={href}>
      <Card className="p-3 transition hover:shadow-md">
        <div className="flex items-center gap-3">
          <div className="rounded-md bg-primary/10 p-2 text-primary">
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className={`text-lg font-semibold ${muted ? 'text-muted-foreground' : ''}`}>
              {value}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
