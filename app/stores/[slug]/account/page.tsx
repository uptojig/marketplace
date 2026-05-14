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
import { isTrustStore } from '@/lib/landing/trust';
import { isBusinessModelStore } from '@/lib/landing/business-model';
import { isLifestyleStore } from '@/lib/landing/lifestyle';
import { isElectronicsTechStore } from '@/lib/landing/electronics-tech';
import { isSpecialtyStore } from '@/lib/landing/specialty';

const FB_DISPLAY_FONT =
  'var(--font-fashion-display, "Cormorant Garamond"), "Playfair Display", Georgia, "Noto Serif Thai", serif';

const TRUST_DISPLAY_FONT =
  'var(--font-trust-display, "Playfair Display"), Georgia, "Noto Serif Thai", serif';

const BM_MONO_FONT =
  'var(--font-bm-mono, "JetBrains Mono"), ui-monospace, "Cascadia Mono", "Source Code Pro", monospace';

const LIFESTYLE_DISPLAY_FONT =
  'var(--font-lifestyle-display, "Outfit"), "Plus Jakarta Sans", "DM Sans", "Prompt", system-ui, sans-serif';

const TECH_DISPLAY_FONT =
  'var(--font-tech-display, "Inter Tight"), "Inter", "IBM Plex Sans Thai", system-ui, sans-serif';

const TECH_MONO_FONT =
  'var(--font-tech-mono, "JetBrains Mono"), ui-monospace, "SFMono-Regular", Menlo, monospace';

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
    prisma.address.count({ where: { userId, store: { slug } } }),
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

  const isTrust = !isFB && store
    ? isTrustStore({
        templateId: store.templateId,
        landingThemeVariant: store.landingThemeVariant,
      })
    : false;
  // business-model — only checked when FB and trust both miss.
  // Renders the dashboard-style welcome with mono stat values + tier
  // badge + active-subscriptions count.
  const isBM = !isFB && !isTrust && store
    ? isBusinessModelStore({
        templateId: store.templateId,
        landingThemeVariant: store.landingThemeVariant,
      })
    : false;
  const isLifestyle = !isFB && !isTrust && !isBM && store
    ? isLifestyleStore({
        templateId: store.templateId,
        landingThemeVariant: store.landingThemeVariant,
      })
    : false;
  const isElectronicsTech = !isFB && !isTrust && !isBM && !isLifestyle && store
    ? isElectronicsTechStore({
        templateId: store.templateId,
        landingThemeVariant: store.landingThemeVariant,
      })
    : false;

  const isSpecialty = !isFB && !isTrust && (store
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
  // Heritage member-since year — used in the trust eyebrow above
  // the welcome name. Falls back to the current year for accounts
  // without a createdAt (legacy seeds).
  const memberYear = user?.createdAt
    ? user.createdAt.getFullYear()
    : new Date().getFullYear();
  // Electronics-tech member ID — last 6 chars of the userId, mono
  // styled. Looks like "USR-7A4F12" in the spec-sheet eyebrow.
  const memberId = userId
    ? `USR-${userId.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(-6).padStart(6, '0')}`
    : 'USR-000000';

  // Business-model dashboard stats — total orders count + total
  // spent across all orders + a static "tier" classification driven
  // by spend. Only computed when this family is active.
  let bmTotalOrders = 0;
  let bmTotalSpent = 0;
  let bmTier = 'Bronze';
  if (isBM) {
    const allOrders = await prisma.order.findMany({
      where: { userId, store: { slug } },
      select: { totalTHB: true },
    });
    bmTotalOrders = allOrders.length;
    bmTotalSpent = allOrders.reduce((acc, o) => acc + Number(o.totalTHB), 0);
    if (bmTotalSpent >= 100000) bmTier = 'Platinum';
    else if (bmTotalSpent >= 30000) bmTier = 'Gold';
    else if (bmTotalSpent >= 10000) bmTier = 'Silver';
  }

  return (
    <div className="space-y-6">
      <Card
        {...(isSpecialty ? { 'data-specialty-kraft': 'true' } : {})}
        className={
          isFB
            ? "flex items-center gap-4 rounded-2xl border bg-white p-6 shadow-sm"
            : isTrust
              ? "flex items-center gap-4 rounded-sm border bg-white p-6 shadow-sm"
              : isBM
                ? "flex items-center gap-4 rounded-md border bg-white p-5 shadow-sm"
                : isLifestyle
                  ? "flex items-center gap-4 rounded-3xl border p-6 shadow-sm"
                  : isElectronicsTech
                    ? "flex items-center gap-4 rounded-md border bg-white p-6"
                    : isSpecialty
                      ? "flex items-center gap-4 rounded-md border p-6 shadow-sm"
                      : "flex items-center gap-4 p-4"
        }
        style={
          isTrust
            ? { borderColor: "var(--shop-accent)" }
            : isBM
              ? { borderColor: "var(--shop-border)" }
              : isLifestyle
                ? {
                    background: "var(--shop-muted)",
                    borderColor: "var(--shop-border)",
                  }
                : isElectronicsTech
                  ? { borderColor: "var(--shop-border)" }
                  : isSpecialty
                    ? { borderColor: 'var(--shop-border)' }
                    : undefined
        }
      >
        <Avatar
          className={
            isFB
              ? "h-16 w-16"
              : isTrust
                ? "h-16 w-16 rounded-sm"
                : isBM
                  ? "h-14 w-14 rounded-md"
                  : isLifestyle
                    ? "h-16 w-16 rounded-2xl"
                    : isElectronicsTech
                      ? "h-16 w-16 rounded-md"
                      : isSpecialty
                        ? "h-16 w-16 rounded-md"
                        : "h-14 w-14"
          }
        >
          {user?.image && <AvatarImage src={user.image} alt={displayName} />}
          <AvatarFallback
            className={
              isTrust
                ? "rounded-sm"
                : isBM
                  ? "rounded-md"
                  : isLifestyle
                    ? "rounded-2xl"
                    : isElectronicsTech
                      ? "rounded-md"
                      : isSpecialty
                        ? "rounded-md"
                        : undefined
            }
          >
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
          {isTrust && (
            <p
              className="text-xs uppercase"
              style={{
                color: 'var(--shop-accent)',
                letterSpacing: '0.28em',
                fontWeight: 600,
              }}
            >
              Est. member since {memberYear}
            </p>
          )}
          {isBM && (
            <p
              className="text-xs font-semibold uppercase"
              style={{
                color: 'var(--shop-primary)',
                letterSpacing: '0.12em',
              }}
            >
              B2B Account · Tier {bmTier}
            </p>
          )}
          {isLifestyle && (
            <p
              className="text-xs uppercase inline-flex items-center gap-1.5"
              style={{
                color: 'var(--shop-accent)',
                letterSpacing: '0.18em',
                fontWeight: 600,
              }}
            >
              <span aria-hidden role="img">👋</span>
              Welcome back
            </p>
          )}
          {isElectronicsTech && (
            <p
              data-tech-mono="true"
              className="text-[11px] uppercase"
              style={{
                color: 'var(--shop-ink-muted)',
                fontFamily: TECH_MONO_FONT,
                letterSpacing: '0.16em',
                fontWeight: 600,
              }}
            >
              {memberId} · Joined {memberYear}
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
              isFB
                ? "text-3xl"
                : isTrust
                  ? "text-3xl"
                  : isBM
                    ? "text-2xl font-bold"
                    : isLifestyle
                      ? "text-3xl"
                      : isElectronicsTech
                        ? "text-2xl sm:text-3xl"
                        : isSpecialty
                          ? "text-3xl"
                          : "text-lg font-semibold"
            }
            style={
              isFB
                ? {
                    fontFamily: FB_DISPLAY_FONT,
                    fontWeight: 500,
                    color: 'var(--shop-ink)',
                    letterSpacing: '-0.005em',
                  }
                : isTrust
                  ? {
                      fontFamily: TRUST_DISPLAY_FONT,
                      fontWeight: 600,
                      color: 'var(--shop-ink)',
                      letterSpacing: '-0.01em',
                    }
                  : isBM
                    ? {
                        fontWeight: 700,
                        color: 'var(--shop-ink)',
                        letterSpacing: '-0.015em',
                      }
                    : isLifestyle
                      ? {
                          fontFamily: LIFESTYLE_DISPLAY_FONT,
                          fontWeight: 700,
                          color: 'var(--shop-ink)',
                          letterSpacing: '-0.01em',
                        }
                      : isElectronicsTech
                        ? {
                            fontFamily: TECH_DISPLAY_FONT,
                            fontWeight: 700,
                            color: 'var(--shop-ink)',
                            letterSpacing: '-0.015em',
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
              : isTrust
                ? `Welcome back, ${displayName}`
                : isBM
                  ? `Welcome back, ${displayName}`
                  : isLifestyle
                    ? `Hey ${displayName}!`
                    : isElectronicsTech
                      ? `Hi, ${displayName}`
                      : isSpecialty
                        ? `Welcome back, ${displayName}`
                        : `สวัสดี, ${displayName}`}
          </h1>
          {isTrust && (
            <div
              aria-hidden
              className="mt-2 h-px w-12"
              style={{ background: 'var(--shop-accent)' }}
            />
          )}
          {user?.createdAt && !isTrust && !isLifestyle && !isElectronicsTech && !isSpecialty && (
            <p className="text-xs text-muted-foreground">
              สมาชิกตั้งแต่{" "}
              {user.createdAt.toLocaleDateString("th-TH", {
                year: "numeric",
                month: "long",
              })}
            </p>
          )}
          {user?.createdAt && isTrust && (
            <p
              className="mt-3 text-xs"
              style={{ color: 'var(--shop-ink-muted)' }}
            >
              สมาชิกตั้งแต่{" "}
              {user.createdAt.toLocaleDateString("th-TH", {
                year: "numeric",
                month: "long",
              })}
            </p>
          )}
          {user?.createdAt && isLifestyle && (
            <p
              className="mt-2 text-xs"
              style={{ color: 'var(--shop-ink-muted)' }}
            >
              เป็นสมาชิกตั้งแต่{" "}
              {user.createdAt.toLocaleDateString("th-TH", {
                year: "numeric",
                month: "long",
              })}
            </p>
          )}
          {user?.createdAt && isElectronicsTech && (
            <p
              data-tech-mono="true"
              className="mt-1.5 text-[11px]"
              style={{
                color: 'var(--shop-ink-muted)',
                fontFamily: TECH_MONO_FONT,
                letterSpacing: '-0.005em',
              }}
            >
              สมาชิกตั้งแต่{" "}
              {user.createdAt.toLocaleDateString("th-TH", {
                year: "numeric",
                month: "long",
              })}
            </p>
          )}
          {isSpecialty && (
            <p
              className="text-sm italic mt-1"
              style={{
                color: 'var(--shop-ink-muted)',
                fontFamily: SPECIALTY_HAND_FONT,
              }}
            >
              Member of our maker community since {memberSince}
            </p>
          )}
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {isBM ? (
          <>
            {/* Dashboard stat row — total orders / total spent /
                active subscriptions / tier. Mono numerics + tight
                caps labels. Wholesale buyers want spreadsheet data
                up top, not a wallet placeholder. */}
            <StatCard
              icon={Package}
              label="Total orders"
              value={bmTotalOrders.toString()}
              href={`${base}/orders`}
              isBM
            />
            <StatCard
              icon={Wallet}
              label="Total spent"
              value={`฿${bmTotalSpent.toLocaleString('th-TH')}`}
              href={`${base}/orders`}
              isBM
            />
            <StatCard
              icon={Heart}
              label="Active subs"
              value="0"
              href={`${base}/orders`}
              muted
              isBM
            />
            <StatCard
              icon={MapPin}
              label="Tier"
              value={bmTier}
              href={`${base}/orders`}
              isBM
            />
          </>
        ) : (
          <>
            <StatCard
              icon={Package}
              label={
                isTrust
                  ? "Active orders"
                  : isLifestyle
                    ? "Active orders"
                    : isElectronicsTech
                      ? "Active orders"
                      : isSpecialty
                        ? "Active orders"
                        : "คำสั่งซื้อที่ใช้งาน"
              }
              value={activeOrders.toString()}
              href={`${base}/orders`}
              isTrust={isTrust}
              isLifestyle={isLifestyle}
              isElectronicsTech={isElectronicsTech}
              isSpecialty={isSpecialty}
            />
            <StatCard
              icon={MapPin}
              label={
                isTrust
                  ? "Saved addresses"
                  : isLifestyle
                    ? "Addresses"
                    : isElectronicsTech
                      ? "Addresses"
                      : isSpecialty
                        ? "Saved addresses"
                        : "ที่อยู่บันทึกไว้"
              }
              value={addressCount.toString()}
              href={`${base}/addresses`}
              isTrust={isTrust}
              isLifestyle={isLifestyle}
              isElectronicsTech={isElectronicsTech}
              isSpecialty={isSpecialty}
            />
            <StatCard
              icon={Wallet}
              label={
                isTrust
                  ? "Wallet balance"
                  : isLifestyle
                    ? "Wallet"
                    : isElectronicsTech
                      ? "Wallet"
                      : isSpecialty
                        ? "Wallet balance"
                        : "ยอด Anypay"
              }
              value="฿0"
              /* Wallet view doesn't exist yet (Phase 1D) — bounce back
                 to the account home rather than 404. */
              href={`${base}`}
              muted
              isTrust={isTrust}
              isLifestyle={isLifestyle}
              isElectronicsTech={isElectronicsTech}
              isSpecialty={isSpecialty}
            />
            <StatCard
              icon={Heart}
              label={
                isTrust
                  ? "Favorites"
                  : isLifestyle
                    ? "Favorites"
                    : isElectronicsTech
                      ? "Wishlist"
                      : isSpecialty
                        ? "Favorites"
                        : "รายการโปรด"
              }
              value="0"
              /* No per-account favorites view yet — point at the
                 existing per-store wishlist page. */
              href={`/stores/${slug}/wishlist`}
              muted
              isTrust={isTrust}
              isLifestyle={isLifestyle}
              isElectronicsTech={isElectronicsTech}
              isSpecialty={isSpecialty}
            />
          </>
        )}
      </div>

      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2
            className={
              isFB || isTrust || isLifestyle || isSpecialty
                ? "text-2xl"
                : isElectronicsTech
                  ? "text-xl"
                  : "font-semibold"
            }
            style={
              isFB
                ? {
                    fontFamily: FB_DISPLAY_FONT,
                    fontWeight: 500,
                    color: 'var(--shop-ink)',
                  }
                : isTrust
                  ? {
                      fontFamily: TRUST_DISPLAY_FONT,
                      fontWeight: 600,
                      color: 'var(--shop-ink)',
                    }
                  : isLifestyle
                    ? {
                        fontFamily: LIFESTYLE_DISPLAY_FONT,
                        fontWeight: 700,
                        color: 'var(--shop-ink)',
                      }
                    : isElectronicsTech
                      ? {
                          fontFamily: TECH_DISPLAY_FONT,
                          fontWeight: 700,
                          color: 'var(--shop-ink)',
                          letterSpacing: '-0.015em',
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
              : isTrust
                ? "Recent orders"
                : isLifestyle
                  ? "Recent orders"
                  : isElectronicsTech
                    ? "Recent orders"
                    : isSpecialty
                      ? "Recent pieces"
                      : "คำสั่งซื้อล่าสุด"}
          </h2>
          <Link
            href={`${base}/orders`}
            className="inline-flex items-center gap-1 text-sm hover:underline"
            style={{
              color: isFB
                ? 'var(--shop-primary)'
                : isTrust
                  ? 'var(--shop-accent)'
                  : isLifestyle
                    ? 'var(--shop-primary)'
                    : isElectronicsTech
                      ? 'var(--shop-primary)'
                      : isSpecialty
                        ? 'var(--shop-primary)'
                        : undefined,
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
  isTrust = false,
  isBM = false,
  isLifestyle = false,
  isElectronicsTech = false,
  isSpecialty = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  href: string;
  muted?: boolean;
  isTrust?: boolean;
  isBM?: boolean;
  isLifestyle?: boolean;
  isElectronicsTech?: boolean;
  isSpecialty?: boolean;
}) {
  return (
    <Link href={href}>
      <Card
        {...(isSpecialty ? { 'data-specialty-kraft': 'true' } : {})}
        className={
          isTrust
            ? "rounded-sm p-4 transition hover:shadow-md"
            : isBM
              ? "rounded-md p-4 transition hover:shadow-md"
              : isLifestyle
                ? "rounded-3xl p-4 transition hover:shadow-md"
                : isElectronicsTech
                  ? "rounded-md p-4 transition hover:shadow-md"
                  : isSpecialty
                    ? "rounded-md border p-4 transition hover:shadow-md"
                    : "p-3 transition hover:shadow-md"
        }
        style={
          isTrust
            ? { borderColor: "var(--shop-accent)" }
            : isBM
              ? {
                  borderColor: "var(--shop-border)",
                  background: "#fafafa",
                }
              : isLifestyle
                ? {
                    borderColor: "var(--shop-border)",
                    background: "var(--shop-card)",
                  }
                : isElectronicsTech
                  ? { borderColor: "var(--shop-border)" }
                  : isSpecialty
                    ? { borderColor: 'var(--shop-border)' }
                    : undefined
        }
      >
        <div className="flex items-center gap-3">
          <div
            className={
              isTrust
                ? "rounded-sm border bg-[var(--shop-muted)] p-2"
                : isBM
                  ? "rounded-md border bg-white p-2"
                  : isLifestyle
                    ? "rounded-full p-2 text-white"
                    : isElectronicsTech
                      ? "rounded-md border bg-[var(--shop-muted)] p-2"
                      : isSpecialty
                        ? "rounded-md p-2"
                        : "rounded-md bg-primary/10 p-2 text-primary"
            }
            style={
              isTrust
                ? {
                    borderColor: "var(--shop-accent)",
                    color: "var(--shop-ink)",
                  }
                : isBM
                  ? {
                      borderColor: "var(--shop-border)",
                      color: "var(--shop-primary)",
                    }
                  : isLifestyle
                    ? {
                        background: "var(--shop-accent)",
                        color: "#ffffff",
                      }
                    : isElectronicsTech
                      ? {
                          borderColor: "var(--shop-border)",
                          color: "var(--shop-primary)",
                        }
                      : isSpecialty
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
              data-tech-mono={isElectronicsTech ? "true" : undefined}
              className={
                isTrust
                  ? "text-[10px] uppercase"
                  : isBM
                    ? "text-[10px] font-semibold uppercase"
                    : isLifestyle
                      ? "text-[10px] uppercase"
                      : isElectronicsTech
                        ? "text-[10px] uppercase"
                        : isSpecialty
                          ? "text-xs uppercase tracking-[0.14em]"
                          : "text-xs text-muted-foreground"
              }
              style={
                isTrust
                  ? {
                      color: "var(--shop-ink-muted)",
                      letterSpacing: "0.22em",
                      fontWeight: 600,
                    }
                  : isBM
                    ? {
                        color: "var(--shop-ink-muted)",
                        letterSpacing: "0.12em",
                      }
                    : isLifestyle
                      ? {
                          color: "var(--shop-ink-muted)",
                          letterSpacing: "0.18em",
                          fontWeight: 600,
                        }
                      : isElectronicsTech
                        ? {
                            color: "var(--shop-ink-muted)",
                            fontFamily:
                              'var(--font-tech-mono, "JetBrains Mono"), ui-monospace, "SFMono-Regular", Menlo, monospace',
                            letterSpacing: "0.16em",
                            fontWeight: 600,
                          }
                        : isSpecialty
                          ? { color: 'var(--shop-ink-muted)' }
                          : undefined
              }
            >
              {label}
            </div>
            <div
              data-bm-mono={isBM ? "true" : undefined}
              data-tech-mono={isElectronicsTech ? "true" : undefined}
              className={
                isTrust
                  ? `text-xl ${muted ? "text-muted-foreground" : ""}`
                  : isBM
                    ? `text-lg font-bold ${muted ? "text-muted-foreground" : ""}`
                    : isLifestyle
                      ? `text-xl ${muted ? "text-muted-foreground" : ""}`
                      : isElectronicsTech
                        ? `text-xl font-bold ${muted ? "text-muted-foreground" : ""}`
                        : `text-lg font-semibold ${muted ? "text-muted-foreground" : ""}`
              }
              style={
                isTrust && !muted
                  ? {
                      color: "var(--shop-ink)",
                      fontFamily:
                        'var(--font-trust-display, "Playfair Display"), Georgia, "Noto Serif Thai", serif',
                      fontWeight: 600,
                    }
                  : isBM && !muted
                    ? {
                        color: "var(--shop-ink)",
                        fontFamily:
                          'var(--font-bm-mono, "JetBrains Mono"), ui-monospace, "Cascadia Mono", "Source Code Pro", monospace',
                        fontVariantNumeric: "tabular-nums",
                        fontWeight: 700,
                        letterSpacing: "-0.01em",
                      }
                    : isLifestyle && !muted
                      ? {
                          color: "var(--shop-ink)",
                          fontFamily:
                            'var(--font-lifestyle-display, "Outfit"), "Plus Jakarta Sans", "DM Sans", "Prompt", system-ui, sans-serif',
                          fontWeight: 700,
                        }
                      : isElectronicsTech && !muted
                        ? {
                            color: "var(--shop-ink)",
                            fontFamily:
                              'var(--font-tech-mono, "JetBrains Mono"), ui-monospace, "SFMono-Regular", Menlo, monospace',
                            letterSpacing: "-0.01em",
                          }
                        : isSpecialty && !muted
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
