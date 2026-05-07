import Link from "next/link";

// Cart + checkout no longer live at marketplace level — they're
// per-store at /stores/[slug]/cart and /stores/[slug]/checkout/*.
// The CartIndicator that used to sit in this nav linked to /cart
// (now deleted), so we removed it. Customers see their cart only
// inside the store context, which matches our "each store is its
// own checkout" model.
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
            {/* "เปิดร้าน" link removed — public self-service /onboarding
                was deprecated; admins now provision stores via
                /admin/stores/new (2-step wizard). Vendors who already
                have a store land on /dashboard from the link below. */}
            <Link href="/dashboard" className="hover:underline">
              จัดการร้าน
            </Link>
            <Link href="/orders" className="hover:underline">
              ออเดอร์ของฉัน
            </Link>
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
