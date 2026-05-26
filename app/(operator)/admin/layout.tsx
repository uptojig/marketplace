import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/current-user";
import { OperatorShell } from "@/components/operator/operator-shell";

export const dynamic = "force-dynamic";

const NAV = [
  { href: "/admin", label: "ภาพรวม", icon: "LayoutDashboard", group: "Admin Console", exact: true },
  { href: "/admin/stores", label: "ร้านค้า", icon: "Store", group: "จัดการ Marketplace" },
  { href: "/admin/provisioning", label: "Provisioning", icon: "Server", group: "จัดการ Marketplace" },
  { href: "/admin/kyc", label: "KYC", icon: "ShieldCheck", group: "ตรวจสอบและอนุมัติ" },
  { href: "/admin/agents", label: "ตัวแทน (Agents)", icon: "Award", group: "ตรวจสอบและอนุมัติ" },
  { href: "/admin/users", label: "ผู้ใช้", icon: "Users", group: "ผู้ใช้และระบบ" },
  { href: "/admin/orders", label: "คำสั่งซื้อ", icon: "ShoppingCart", group: "จัดการ Marketplace" },
  { href: "/admin/credit-topups", label: "เติมเครดิต", icon: "Wallet", group: "จัดการ Marketplace" },
  { href: "/admin/messages", label: "ข้อความ", icon: "Mail", group: "จัดการ Marketplace" },
  { href: "/admin/products", label: "สินค้า", icon: "Package", group: "จัดการ Marketplace" },
  { href: "/admin/audit-log", label: "Audit log", icon: "Shield", group: "ผู้ใช้และระบบ" },
  { href: "/admin/demo-orders", label: "Demo Orders", icon: "FlaskConical", group: "ผู้ใช้และระบบ" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/signin?callbackUrl=/admin");

  if (user.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 text-foreground">
        <div className="container mx-auto max-w-2xl px-6 py-12 text-center bg-card border border-border rounded-2xl shadow-sm">
          <h1 className="text-2xl font-bold text-foreground">403 — ไม่มีสิทธิ์เข้าถึง</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            หน้านี้สำหรับผู้ดูแลระบบ (ADMIN) เท่านั้น
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            คุณ login เป็น <code className="bg-muted px-1.5 py-0.5 rounded border border-border font-semibold text-foreground">{user.email}</code> (role: {user.role})
          </p>
          <div className="mt-6 flex items-center justify-center gap-4 text-sm font-semibold">
            <Link href="/dashboard" className="text-primary hover:text-primary/80 hover:underline transition">
              ← กลับไป Dashboard
            </Link>
            <span className="text-border">|</span>
            <Link
              href="/signout"
              className="text-destructive hover:text-destructive/80 hover:underline transition"
            >
              ออกจากระบบ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <OperatorShell
      user={{
        name: user.name ?? "",
        email: user.email ?? "",
        role: "ADMIN",
      }}
      navigation={NAV}
      brandTitle="BackOffice"
      brandSubtitle="Marketplace Admin"
    >
      {children}
    </OperatorShell>
  );
}
