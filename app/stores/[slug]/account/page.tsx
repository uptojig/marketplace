// /stores/[slug]/account — per-store buyer dashboard (Server Component).
//
// Per Shopify-like architecture, each store has its own customer view.
// Orders are filtered to this store via getUserOrders(userId, { storeSlug }).
// Wallet + favorites stubs remain placeholders until those models land.

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
import { isFashionBeautyStore } from '@/lib/landing/fashion-beauty';
import { isSpecialtyStore } from '@/lib/landing/specialty';

const FB_DISPLAY_FONT =
  'var(--font-fashion-display, "Cormorant Garamond"), "Playfair Display", Georgia, "Noto Serif Thai", serif';

const SPECIALTY_DISPLAY_FONT =
  'var(--font-specialty-display, "Fraunces"), Georgia, "Noto Serif Thai", serif';
const SPECIALTY_HAND_FONT =
  'var(--font-specialty-hand, "Caveat"), "Permanent Marker", cursive';

export const dynamic = 'force-dynamic';

const ACTIVE_ORDER_STATUSES = [
  'PENDING_PAYMENT',
  'PAID',
  'SUPPLIER_PLACED',
  'SHIPPED',
] as const;

export default async function AccountDashboard({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;

  if (!userId) {
    redirect(`/stores/${slug}/signin?callbackUrl=/stores/${slug}/account`);
  }

  const base = `/stores/${slug}/account`;

  const [user, recentOrdersRaw, activeOrders, addressCount, store] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, image: true, createdAt: true },
    }),
    // Per-store scope: only orders placed at this store show up.
    getUserOrders(userId, { limit: 3, storeSlug: slug }),
    prisma.order.count({
      where: {
        userId,
        status: { in: [...ACTIVE_ORDER_STATUSES] },
        store: { slug },
      },
    }),
    // TODO(phase-1c): scope by Address.storeId once the migration lands.
    prisma.address.count({ where: { userId } }),
    prisma.store.findUnique({
      where: { slug },
      select: { templateId: true, landingThemeVariant: true },
    }),
  ]);

  const isFB = store
    ? isFashionBeautyStore({
        templateId: store.templateId,
        landingThemeVariant: store.landingThemeVariant,
      })
    : false;

  const isSpecialty = !isFB && (store
    ? isSpecialtyStore({
        templateId: store.templateId,
        landingThemeVariant: store.landingThemeVariant,
      })
    : false);

  const memberSince = user?.createdAt
    ? user.createdAt.getFullYear()
    : new Date().getFullYear();

  const recentOrders = toOrderViews(recentOrdersRaw);
  const displayName = user?.name ?? user?.email ?? 'ผู้ใช้';
  const initials = displayName.slice(0, 2);

  return (
    <div className="space-y-6">
      <Card
        {...(isSpecialty ? { 'data-specialty-kraft': 'true' } : {})}
        className={
          isFB
            ? "flex items-center gap-4 rounded-2xl border bg-white p-6 shadow-sm"
            : isSpecialty
              ? "flex items-center gap-4 rounded-md border p-6 shadow-sm"
              : "flex items-center gap-4 p-4"
        }
        style={
          isSpecialty
            ? { borderColor: 'var(--shop-border)' }
            : undefined
        }
      >
        <Avatar
          className={
            isSpecialty
              ? "h-16 w-16 rounded-md"
              : isFB
                ? "h-16 w-16"
                : "h-14 w-14"
          }
        >
          {user?.image && <AvatarImage src={user.image} alt={displayName} />}
          <AvatarFallback className={isSpecialty ? "rounded-md" : undefined}>
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          {isFB && (
            <p
              className="text-xs uppercase tracking-[0.22em]"
              style={{ color: 'var(--shop-ink-muted)' }}
            >
              Welcome back
            </p>
          )}
          {isSpecialty && (
            <p
              className="text-lg italic"
              style={{
                color: 'var(--shop-accent)',
                fontFamily: SPECIALTY_HAND_FONT,
              }}
            >
              welcome back
            </p>
          )}
          <h1
            className={
              isFB || isSpecialty ? "text-3xl" : "text-lg font-semibold"
            }
            style={
              isFB
                ? {
                    fontFamily: FB_DISPLAY_FONT,
                    fontWeight: 500,
                    color: 'var(--shop-ink)',
                    letterSpacing: '-0.005em',
                  }
                : isSpecialty
                  ? {
                      fontFamily: SPECIALTY_DISPLAY_FONT,
                      fontWeight: 500,
                      color: 'var(--shop-ink)',
                      letterSpacing: '-0.005em',
                    }
                  : undefined
            }
          >
            {isFB
              ? displayName
              : isSpecialty
                ? `Welcome back, ${displayName}`
                : `สวัสดี, ${displayName}`}
          </h1>
          {isSpecialty ? (
            <p
              className="text-sm italic mt-1"
              style={{
                color: 'var(--shop-ink-muted)',
                fontFamily: SPECIALTY_HAND_FONT,
              }}
            >
              Member of our maker community since {memberSince}
            </p>
          ) : (
            user?.createdAt && (
              <p className="text-xs text-muted-foreground">
                สมาชิกตั้งแต่{" "}
                {user.createdAt.toLocaleDateString("th-TH", {
                  year: "numeric",
                  month: "long",
                })}
              </p>
            )
          )}
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Package}
          label="คำสั่งซื้อที่ใช้งาน"
          value={activeOrders.toString()}
          href={`${base}/orders`}
          isSpecialty={isSpecialty}
        />
        <StatCard
          icon={MapPin}
          label="ที่อยู่บันทึกไว้"
          value={addressCount.toString()}
          href={`${base}/addresses`}
          isSpecialty={isSpecialty}
        />
        <StatCard
          icon={Wallet}
          label="ยอด Anypay"
          value="฿0"
          href={`${base}/wallet`}
          muted
          isSpecialty={isSpecialty}
        />
        <StatCard
          icon={Heart}
          label="รายการโปรด"
          value="0"
          href={`${base}/favorites`}
          muted
          isSpecialty={isSpecialty}
        />
      </div>

      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2
            className={
              isFB || isSpecialty ? "text-2xl" : "font-semibold"
            }
            style={
              isFB
                ? {
                    fontFamily: FB_DISPLAY_FONT,
                    fontWeight: 500,
                    color: 'var(--shop-ink)',
                  }
                : isSpecialty
                  ? {
                      fontFamily: SPECIALTY_DISPLAY_FONT,
                      fontWeight: 500,
                      color: 'var(--shop-ink)',
                    }
                  : undefined
            }
          >
            {isFB
              ? "Recent orders"
              : isSpecialty
                ? "Recent pieces"
                : "คำสั่งซื้อล่าสุด"}
          </h2>
          <Link
            href={`${base}/orders`}
            className="inline-flex items-center gap-1 text-sm hover:underline"
            style={{
              color: isFB || isSpecialty ? 'var(--shop-primary)' : undefined,
            }}
          >
            ดูทั้งหมด <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <Card className="p-6 text-center">
            <Package className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              ยังไม่มีคำสั่งซื้อที่ร้านนี้ — เริ่มช้อปได้เลย
            </p>
            <Button asChild className="mt-4">
              <Link href={`/stores/${slug}`}>ไปหน้าร้าน</Link>
            </Button>
          </Card>
        ) : (
          <div className="space-y-2">
            {recentOrders.map((o) => (
              <Card key={o.id} className="p-3">
                <Link
                  href={`${base}/orders/${o.orderRef}`}
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
  isSpecialty = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  href: string;
  muted?: boolean;
  isSpecialty?: boolean;
}) {
  return (
    <Link href={href}>
      <Card
        {...(isSpecialty ? { 'data-specialty-kraft': 'true' } : {})}
        className={
          isSpecialty
            ? "rounded-md border p-4 transition hover:shadow-md"
            : "p-3 transition hover:shadow-md"
        }
        style={
          isSpecialty
            ? { borderColor: 'var(--shop-border)' }
            : undefined
        }
      >
        <div className="flex items-center gap-3">
          <div
            className={
              isSpecialty
                ? "rounded-md p-2"
                : "rounded-md bg-primary/10 p-2 text-primary"
            }
            style={
              isSpecialty
                ? {
                    background:
                      "color-mix(in srgb, var(--shop-primary) 12%, transparent)",
                    color: 'var(--shop-primary)',
                  }
                : undefined
            }
          >
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div
              className={
                isSpecialty
                  ? "text-xs uppercase tracking-[0.14em]"
                  : "text-xs text-muted-foreground"
              }
              style={
                isSpecialty
                  ? { color: 'var(--shop-ink-muted)' }
                  : undefined
              }
            >
              {label}
            </div>
            <div
              className={`text-lg font-semibold ${muted ? "text-muted-foreground" : ""}`}
              style={
                isSpecialty && !muted
                  ? { color: 'var(--shop-ink)' }
                  : undefined
              }
            >
              {value}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
