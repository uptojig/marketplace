import Link from "next/link";
import { CartIconButton } from "@/components/layout/cart-icon-button";

// Global cart now lives at /cart (vendor templates flow) and contains
// items from any store the user has added from. Per-store checkout is
// still reachable at /stores/[slug] but the multi-store cart icon in
// the header is the canonical entry point.
export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
            <Link href="/dashboard" className="hover:underline">
              จัดการร้าน
            </Link>
            <Link href="/account/orders" className="hover:underline">
              ออเดอร์ของฉัน
            </Link>
            <CartIconButton />
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
