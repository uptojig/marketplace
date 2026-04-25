import Link from "next/link";
import { CartIndicator } from "@/components/cart/CartIndicator";

export default function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="border-b">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/" className="font-semibold">
            Marketplace
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/" className="hover:underline">
              ค้นพบร้านค้า
            </Link>
            <Link href="/onboarding" className="hover:underline">
              เปิดร้าน
            </Link>
            <Link href="/dashboard" className="hover:underline">
              จัดการร้าน
            </Link>
            <Link href="/orders" className="hover:underline">
              ออเดอร์ของฉัน
            </Link>
            <CartIndicator />
          </nav>
        </div>
      </header>
      <main className="container py-8">{children}</main>
      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        Marketplace MVP — AnyPay (mock) · CJ + AliExpress
      </footer>
    </>
  );
}
