import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { ExternalLink } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { resolveDashboardStore } from "@/lib/stores/resolve-dashboard-store";
import { OperatorShell } from "@/components/operator/operator-shell";

export const dynamic = "force-dynamic";

const VENDOR_ACTION_REQUIRED_STATUS = "PAID" as const;

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerList = headers();
  const search = headerList.get("x-search") ?? "";
  const requestedSlug =
    new URLSearchParams(search).get("storeSlug") ?? undefined;

  const { store, availableStores, isAdmin, userId } =
    await resolveDashboardStore({
      requestedSlug,
      noStoreRedirect: "/signin?next=/dashboard",
    });

  const displayUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true, role: true },
  });
  if (!displayUser) redirect("/signin?next=/dashboard");

  const [pendingOrdersCount, unreadMessagesCount] = await Promise.all([
    prisma.order.count({
      where: {
        storeId: store.id,
        status: VENDOR_ACTION_REQUIRED_STATUS,
      },
    }),
    prisma.contactMessage.count({
      where: {
        storeId: store.id,
        readAt: null,
      },
    }),
  ]);

  const suffix = store.slug ? `?storeSlug=${encodeURIComponent(store.slug)}` : "";

  const NAV = [
    { href: "/dashboard", label: "ภาพรวม", icon: "LayoutDashboard", group: "ทั่วไป", exact: true },
    { href: `/dashboard/store/products${suffix}`, label: "สินค้าของร้าน", icon: "Package", group: "สินค้า" },
    { href: `/dashboard/store/categories${suffix}`, label: "หมวดหมู่", icon: "Tags", group: "สินค้า" },
    { href: "/dashboard/catalog", label: "Browse catalog", icon: "PlusSquare", group: "สินค้า" },
    { href: "/dashboard/products/import", label: "นำเข้าจาก URL", icon: "PlusSquare", group: "สินค้า" },
    { href: `/dashboard/store/orders${suffix}`, label: "ออเดอร์", icon: "ShoppingBag", group: "จัดการร้านค้า", badge: pendingOrdersCount },
    { href: `/dashboard/store/messages${suffix}`, label: "ข้อความ", icon: "Mail", group: "จัดการร้านค้า", badge: unreadMessagesCount },
    { href: `/dashboard/store/landing-content${suffix}`, label: "หน้าร้าน", icon: "Palette", group: "จัดการร้านค้า" },
    { href: `/dashboard/store/settings${suffix}`, label: "ตั้งค่าร้าน", icon: "Settings", group: "จัดการร้านค้า" },
  ];

  return (
    <OperatorShell
      user={{
        name: displayUser.name ?? "",
        email: displayUser.email ?? "",
        role: displayUser.role as "ADMIN" | "VENDOR" | "AGENT",
      }}
      navigation={NAV}
      storeContext={{
        currentStore: {
          id: store.id,
          name: store.name,
          slug: store.slug,
          logoUrl: store.logoUrl ?? null,
        },
        availableStores: availableStores.map((s) => ({
          id: s.id,
          name: s.name,
          slug: s.slug,
          logoUrl: s.logoUrl ?? null,
        })),
        isAdmin,
      }}
      topbarActions={
        store.slug ? (
          <a
            href={`/stores/${store.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="ดูหน้าร้าน"
            className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border border-input bg-background px-2 text-sm font-medium hover:bg-accent sm:px-3 text-foreground"
          >
            <span className="hidden sm:inline">ดูหน้าร้าน</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        ) : null
      }
      brandTitle="Basketplace"
      brandSubtitle="Vendor Dashboard"
    >
      {children}
    </OperatorShell>
  );
}
