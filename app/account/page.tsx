// /account — buyer dashboard (Server Component).
//
// Wiring:
//  - getServerSession → user.id; redirect to /signin if missing.
//  - Recent orders + active-order count come from Prisma via
//    lib/orders/queries + toOrderViews. Status filter uses the
//    real OrderStatus enum.
//  - Address count comes from Prisma directly (the active
//    /api/addresses route uses the same model).
//  - User name / avatar / joinedAt come from session + the User
//    row.
//
// TODOs flagged inline:
//  - Anypay wallet balance (no model yet — stub at ฿0).
//  - Favorites count (no Favorite model — stub at 0).

import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { ArrowRight, Heart, MapPin, Package, Wallet } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getUserOrders } from '@/lib/orders/queries';
import { toOrderViews } from '@/lib/account/order-view';
import {
  ORDER_STATUS_COLOR,
  ORDER_STATUS_LABEL,
} from '@/lib/orders/status-ui';

export const dynamic = 'force-dynamic';

// Statuses that count as "active" in the dashboard stat card. Mirrors
// the orders-list "in-flight" grouping (rough buyer mental model:
// "anything I'm still waiting on").
const ACTIVE_ORDER_STATUSES = [
  'PENDING_PAYMENT',
  'PAID',
  'SUPPLIER_PLACED',
  'SHIPPED',
] as const;

export default async function AccountDashboard() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;

  if (!userId) {
    redirect('/signin?callbackUrl=/account');
  }

  // Pull everything in parallel — the page is force-dynamic anyway.
  const [user, recentOrdersRaw, activeOrders, addressCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, image: true, createdAt: true },
    }),
    getUserOrders(userId, { limit: 3 }),
    prisma.order.count({
      where: {
        userId,
        status: { in: [...ACTIVE_ORDER_STATUSES] },
      },
    }),
    prisma.address.count({ where: { userId } }),
  ]);

  const recentOrders = toOrderViews(recentOrdersRaw);
  const displayName = user?.name ?? user?.email ?? 'ผู้ใช้';
  const initials = displayName.slice(0, 2);

  return (
    <div className="space-y-6">
      <Card className="flex items-center gap-4 p-4">
        <Avatar className="h-14 w-14">
          {user?.image && <AvatarImage src={user.image} alt={displayName} />}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold">สวัสดี, {displayName}</h1>
          {user?.createdAt && (
            <p className="text-xs text-muted-foreground">
              สมาชิกตั้งแต่{" "}
              {user.createdAt.toLocaleDateString("th-TH", {
                year: "numeric",
                month: "long",
              })}
            </p>
          )}
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
          value={addressCount.toString()}
          href="/account/addresses"
        />
        {/* TODO(anypay): replace ฿0 with real wallet balance once the
            wallet model lands. Kept muted to signal "coming soon". */}
        <StatCard icon={Wallet} label="ยอด Anypay" value="฿0" href="/account/wallet" muted />
        {/* TODO(favorites): wire Favorite model count when added. */}
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
        {recentOrders.length === 0 ? (
          <Card className="p-6 text-center">
            <Package className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              ยังไม่มีคำสั่งซื้อ — เริ่มช้อปได้เลย
            </p>
            <Button asChild className="mt-4">
              <Link href="/">ไปหน้าแรก</Link>
            </Button>
          </Card>
        ) : (
          <div className="space-y-2">
            {recentOrders.map((o) => (
              <Card key={o.id} className="p-3">
                <Link
                  href={`/account/orders/${o.orderRef}`}
                  className="flex items-center gap-3"
                >
                  {o.items[0] && (
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded">
                      <Image
                        src={o.items[0].thumbnailUrl}
                        alt={o.items[0].title}
                        fill
                        className="object-cover"
                        sizes="56px"
                        unoptimized
                      />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium">{o.storeName}</span>
                      <Badge className={ORDER_STATUS_COLOR[o.status]} variant="outline">
                        {ORDER_STATUS_LABEL[o.status]}
                      </Badge>
                    </div>
                    {o.items[0] && (
                      <p className="line-clamp-1 text-xs text-muted-foreground">
                        {o.items[0].title}
                        {o.items.length > 1 && ` + อีก ${o.items.length - 1} รายการ`}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-red-600">
                      ฿{o.totalTHB.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {new Date(o.placedAt).toLocaleDateString("th-TH")}
                    </div>
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        )}
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
            <div className={`text-lg font-semibold ${muted ? "text-muted-foreground" : ""}`}>
              {value}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
