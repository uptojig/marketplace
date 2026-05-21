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
  Mail,
  Shield,
  ShieldCheck,
  LogOut,
  Server,
  Award,
} from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const NAV = [
  { href: "/admin", label: "ภาพรวม", icon: LayoutDashboard, exact: true },
  { href: "/admin/stores", label: "ร้านค้า", icon: Store },
  { href: "/admin/provisioning", label: "Provisioning", icon: Server },
  { href: "/admin/kyc", label: "KYC", icon: ShieldCheck },
  { href: "/admin/agents", label: "ตัวแทน (Agents)", icon: Award },
  { href: "/admin/users", label: "ผู้ใช้", icon: Users },
  { href: "/admin/orders", label: "คำสั่งซื้อ", icon: ShoppingCart },
  { href: "/admin/messages", label: "ข้อความ", icon: Mail },
  { href: "/admin/products", label: "สินค้า", icon: Package },
  { href: "/admin/audit-log", label: "Audit log", icon: Shield },
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
      <div className="theme-marketplace min-h-screen bg-mp-cream flex items-center justify-center p-6 text-mp-ink">
        <div className="container mx-auto max-w-2xl px-6 py-12 text-center bg-mp-surface border border-mp-border rounded-2xl shadow-sm">
          <h1 className="text-2xl font-bold text-mp-ink" style={{ fontFamily: "var(--mp-font-display)" }}>403 — ไม่มีสิทธิ์เข้าถึง</h1>
          <p className="mt-3 text-sm text-mp-ink-muted">
            หน้านี้สำหรับผู้ดูแลระบบ (ADMIN) เท่านั้น
          </p>
          <p className="mt-2 text-xs text-mp-ink-muted">
            คุณ login เป็น <code className="bg-mp-cream-alt px-1.5 py-0.5 rounded border border-mp-border font-semibold text-mp-ink">{session.user.email}</code> (role: {user?.role ?? "unknown"})
          </p>
          <div className="mt-6 flex items-center justify-center gap-4 text-sm font-semibold">
            <Link href="/dashboard" className="text-mp-coral hover:text-mp-coral-dark hover:underline transition">
              ← กลับไป Dashboard
            </Link>
            <span className="text-mp-border">|</span>
            <Link
              href="/api/auth/signout?callbackUrl=/signin"
              className="text-red-600 hover:text-red-700 hover:underline transition"
            >
              ออกจากระบบ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="theme-marketplace flex min-h-screen bg-mp-cream text-mp-ink">
      {/* Sidebar */}
      <aside className="hidden w-60 shrink-0 border-r border-mp-border bg-mp-surface lg:block">
        <div className="border-b border-mp-border px-5 py-4">
          <Link href="/admin" className="block text-lg font-bold text-mp-ink" style={{ fontFamily: "var(--mp-font-display)" }}>
            BackOffice
          </Link>
          <p className="mt-1 text-xs text-mp-ink-muted">Marketplace Admin</p>
        </div>
        <nav className="space-y-1 p-3">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-mp-ink-muted hover:bg-mp-cream-alt hover:text-mp-ink transition"
            >
              <item.icon className="h-4 w-4 animate-duration-300" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-mp-border p-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-mp-ink-muted hover:bg-mp-cream-alt hover:text-mp-ink transition"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Vendor Dashboard
          </Link>
          <div className="mt-3 px-3 text-xs text-mp-ink-muted">
            <p className="truncate font-semibold text-mp-ink">{user.name ?? user.email}</p>
            <p className="text-[10px] uppercase font-bold tracking-wide text-mp-ink-muted">
              {user.role}
            </p>
          </div>
          <Link
            href="/api/auth/signout?callbackUrl=/signin"
            className="mt-2 flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50/50 transition"
          >
            <LogOut className="h-3.5 w-3.5" />
            ออกจากระบบ
          </Link>
        </div>
      </aside>

      {/* Mobile top nav */}
      <nav className="fixed inset-x-0 top-0 z-40 flex items-center gap-1 overflow-x-auto border-b border-mp-border bg-mp-surface px-2 py-2 lg:hidden">
        <span className="px-2 text-xs font-bold text-mp-ink">BO</span>
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="shrink-0 rounded-lg px-3 py-1 text-xs font-semibold text-mp-ink-muted hover:bg-mp-cream-alt hover:text-mp-ink transition"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <main className="flex-1 px-4 pb-10 pt-16 lg:pt-6 lg:px-8">{children}</main>
    </div>
  );
}
