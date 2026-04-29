import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import {
  LayoutDashboard,
  Store,
  Users,
  ShoppingCart,
  Package,
  ExternalLink,
  FlaskConical,
} from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const NAV = [
  { href: "/admin", label: "ภาพรวม", icon: LayoutDashboard, exact: true },
  { href: "/admin/stores", label: "ร้านค้า", icon: Store },
  { href: "/admin/users", label: "ผู้ใช้", icon: Users },
  { href: "/admin/orders", label: "คำสั่งซื้อ", icon: ShoppingCart },
  { href: "/admin/products", label: "สินค้า", icon: Package },
  { href: "/admin/demo-orders", label: "Demo Orders", icon: FlaskConical },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/signin?callbackUrl=/admin");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true, name: true, email: true },
  });

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="container mx-auto max-w-2xl px-6 py-20 text-center">
        <h1 className="text-2xl font-bold">403 — ไม่มีสิทธิ์เข้าถึง</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          หน้านี้สำหรับผู้ดูแลระบบ (ADMIN) เท่านั้น
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          คุณ login เป็น <code>{session.user.email}</code> (role: {user?.role ?? "unknown"})
        </p>
        <Link href="/dashboard" className="mt-6 inline-block text-sm text-blue-600 hover:underline">
          ← กลับไป Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="hidden w-60 shrink-0 border-r bg-white lg:block">
        <div className="border-b px-5 py-4">
          <Link href="/admin" className="block text-lg font-semibold">
            BackOffice
          </Link>
          <p className="mt-1 text-xs text-muted-foreground">Marketplace Admin</p>
        </div>
        <nav className="space-y-1 p-3">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t p-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-xs text-gray-500 hover:bg-gray-100"
          >
            <ExternalLink className="h-3 w-3" />
            Vendor Dashboard
          </Link>
          <div className="mt-3 px-3 text-xs text-gray-500">
            <p className="truncate">{user.name ?? user.email}</p>
            <p className="text-[10px] uppercase tracking-wide text-gray-400">
              {user.role}
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile top nav */}
      <nav className="fixed inset-x-0 top-0 z-40 flex items-center gap-1 overflow-x-auto border-b bg-white px-2 py-2 lg:hidden">
        <span className="px-2 text-xs font-bold">BO</span>
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="shrink-0 rounded px-3 py-1 text-xs hover:bg-gray-100"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <main className="flex-1 px-4 pb-10 pt-16 lg:pt-6 lg:px-8">{children}</main>
    </div>
  );
}
